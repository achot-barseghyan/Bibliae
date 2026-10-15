import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useNavigate } from 'react-router-dom';
import { EVENTS, TESTAMENT_SPLIT_X, eventImageUrl, eventPath, setEventCardRect, type BibleEvent } from '../data/events';
import { FEAST_LABELS, daysUntilFeast, feastCountdownLabel, type FeastId } from '../services/liturgicalFeasts';
import { useAccessibility } from '../hooks/useAccessibility';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { tapHaptic } from '../utils/haptics';
import './Evenements.css';

/** Gabarit de la carte à taille pleine ; sur un petit écran, tout est
 * réduit du même facteur pour que la frise reste visible. */
const CARD_W = 272;
const CARD_H = 404;
const GAP = 14;
/** Place laissée dans la scène autour de la carte (décalage et rotation
 * des voisines, ombre). */
const STAGE_MARGIN = 44;
const MIN_SCALE = 0.55;
/** Un geste plus court et plus long que ces seuils avance d'une carte. */
const FAST_SWIPE_MS = 300;
const FAST_SWIPE_PX = 30;
/** Déplacement à partir duquel un appui devient un glissement. */
const DRAG_SLOP_PX = 6;
/** Un geste compte comme horizontal tant que |dy| < |dx| / ce rapport
 * (≈ 55° depuis l'horizontale) : un glissement un peu en diagonale, naturel
 * au pouce, change quand même d'événement. */
const HORIZONTAL_BIAS = 0.7;
const FRISE_SWIPE_PX = 24;
/** Au-delà, une carte est hors champ : on ne la calcule plus. */
const VISIBLE_RANGE = 2.5;

// Mémoire de session : dernière carte centrée (retour sur l'onglet) et
// entrée animée déjà jouée.
let sessionIndex: number | null = null;
let entrancePlayed = false;

/** Événement dont la fête est la plus proche. */
function nearestFeastIndex(): number {
  let best = 0;
  let bestDays = Infinity;
  EVENTS.forEach((event, i) => {
    if (!event.feast) return;
    const days = daysUntilFeast(event.feast);
    if (days < bestDays) {
      bestDays = days;
      best = i;
    }
  });
  return best;
}

const clampIndex = (i: number) => Math.min(EVENTS.length - 1, Math.max(0, i));
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

/** Générateur pseudo-aléatoire déterministe : étoiles placées au hasard,
 * mais toujours aux mêmes endroits pour un même événement. */
function seededRandom(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

const Stars: React.FC<{ seed: string }> = ({ seed }) => {
  const stars = useMemo(() => {
    const random = seededRandom(seed);
    return Array.from({ length: 16 }, () => ({
      left: 6 + random() * 88,
      top: 3 + random() * 34,
      size: 1 + random() * 1.6,
      duration: 2 + random() * 3,
      delay: random() * 4
    }));
  }, [seed]);

  return (
    <div className="ev-card-stars" aria-hidden="true">
      {stars.map((s, i) => (
        <span
          key={i}
          className="ev-card-star"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`
          }}
        />
      ))}
    </div>
  );
};

/** « Noël » + « dans 75 jours » : deux morceaux insécables, pour que le
 * retour à la ligne tombe entre la fête et la date. */
const FeastCountdown: React.FC<{ feast: FeastId }> = ({ feast }) => {
  const label = FEAST_LABELS[feast];
  const rest = feastCountdownLabel(feast).slice(label.length).trim();
  return (
    <span className="ev-card-feast-text">
      <span>{label}</span>
      <span>{rest}</span>
    </span>
  );
};

interface EventCardProps {
  event: BibleEvent;
  index: number;
  enterDelay: number | null;
  slotRef: (el: HTMLDivElement | null) => void;
  artRef: (el: HTMLDivElement | null) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, index, enterDelay, slotRef, artRef }) => {
  const { card } = event;
  const image = eventImageUrl(card.image);
  const style = {
    background: card.bg,
    '--ev-glow': card.glow,
    '--ev-ink': card.ink,
    '--ev-kicker': card.kicker,
    '--ev-fade': card.fade
  } as React.CSSProperties;

  return (
    <div className="ev-card-slot" ref={slotRef} data-index={index}>
      <div
        className={`ev-card-enter${enterDelay !== null ? ' is-entering' : ''}`}
        style={enterDelay !== null ? { animationDelay: `${enterDelay}ms` } : undefined}
      >
        <div className="ev-card" style={style} aria-label={event.title}>
          <div className="ev-card-art" ref={artRef}>
            {image ? (
              // Fond CSS plutôt qu'<img> : pas d'enregistrement ni de partage
              // de l'illustration par appui long (licence de l'artiste).
              <div className="ev-card-image" style={{ backgroundImage: `url(${image})` }} />
            ) : (
              <>
                <div className="ev-card-rays" aria-hidden="true" />
                <div className="ev-card-glow" aria-hidden="true" />
                <span className="ev-card-numeral" aria-hidden="true">
                  {card.numeral}
                </span>
              </>
            )}
          </div>
          {image && <Stars seed={event.id} />}

          {event.feast && (
            <div className="ev-card-feast">
              <span className="ev-card-feast-dot" aria-hidden="true" />
              <FeastCountdown feast={event.feast} />
            </div>
          )}

          <div className="ev-card-caption">
            <p className="ev-card-period">{event.period}</p>
            <h2 className="ev-card-title">{event.title}</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

interface Gesture {
  pointerId: number;
  startX: number;
  startY: number;
  startPos: number;
  startTime: number;
  startScroll: number;
  dragging: boolean;
  /** Geste vertical : on fait défiler la page nous-mêmes (touch-action: none). */
  scrolling: boolean;
}

const Evenements: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useAccessibility();
  const prefersReduced = usePrefersReducedMotion();
  const reduceMotion = settings.reduceMotion || prefersReduced;

  const [active, setActive] = useState(() => sessionIndex ?? nearestFeastIndex());
  const [entering] = useState(() => !entrancePlayed && !reduceMotion);
  const [entryIndex] = useState(active);
  const stageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLIonContentElement>(null);
  const scrollElRef = useRef<HTMLElement | null>(null);
  const [stage, setStage] = useState({ width: 360, height: CARD_H + STAGE_MARGIN });
  const scale = Math.min(1, Math.max(MIN_SCALE, (stage.height - STAGE_MARGIN) / CARD_H));

  const posRef = useRef(active);
  const activeRef = useRef(active);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const artRefs = useRef<(HTMLDivElement | null)[]>([]);
  const frameRef = useRef<number | null>(null);
  const animRef = useRef<number | null>(null);
  const gestureRef = useRef<Gesture | null>(null);
  const reduceRef = useRef(reduceMotion);
  reduceRef.current = reduceMotion;
  const widthRef = useRef(stage.width);
  widthRef.current = stage.width;
  const scaleRef = useRef(scale);
  scaleRef.current = scale;

  // La scène prend la hauteur laissée par l'en-tête, le panneau d'info et
  // la frise : la carte s'y ajuste.
  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const update = () => {
      const { clientWidth: width, clientHeight: height } = el;
      if (width && height) setStage((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    entrancePlayed = true;
    contentRef.current?.getScrollElement().then((el) => {
      scrollElRef.current = el;
    });
  }, []);

  /** Place chaque carte selon sa distance d au centre (en pas de carte). */
  const layout = useCallback(() => {
    frameRef.current = null;
    const pos = posRef.current;
    const s = scaleRef.current;
    const pitch = (CARD_W + GAP) * s;
    const left = widthRef.current / 2 - (CARD_W * s) / 2;
    const parallax = !reduceRef.current;
    slotRefs.current.forEach((slot, i) => {
      if (!slot) return;
      const d = i - pos;
      const ad = Math.abs(d);
      if (ad > VISIBLE_RANGE) {
        slot.style.visibility = 'hidden';
        return;
      }
      slot.style.visibility = '';
      slot.style.transform = `translate3d(${left + d * pitch}px, ${ad * 26 * s}px, 0) rotate(${d * 2.5}deg) scale(${1 - ad * 0.1})`;
      slot.style.opacity = String(1 - Math.min(ad, 1) * 0.38);
      const art = artRefs.current[i];
      if (art) art.style.transform = parallax ? `translate3d(${-d * 34 * s}px, 0, 0)` : '';
    });
  }, []);

  const scheduleLayout = useCallback(() => {
    if (frameRef.current === null) frameRef.current = requestAnimationFrame(layout);
  }, [layout]);

  const syncActive = useCallback((haptic: boolean) => {
    const index = clampIndex(Math.round(posRef.current));
    if (index === activeRef.current) return;
    activeRef.current = index;
    sessionIndex = index;
    setActive(index);
    if (haptic) tapHaptic();
  }, []);

  const stopAnimation = () => {
    if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    animRef.current = null;
  };

  /** Amène la carte `target` au centre (aimantation). */
  const goTo = useCallback(
    (target: number) => {
      stopAnimation();
      const to = clampIndex(target);
      if (to !== activeRef.current) tapHaptic();
      const from = posRef.current;
      const duration = reduceRef.current ? 0 : 460;
      const start = performance.now();
      const step = (now: number) => {
        const t = duration > 0 ? Math.min(1, (now - start) / duration) : 1;
        posRef.current = from + (to - from) * easeOutCubic(t);
        layout();
        syncActive(false);
        animRef.current = t < 1 ? requestAnimationFrame(step) : null;
      };
      animRef.current = requestAnimationFrame(step);
    },
    [layout, syncActive]
  );

  useLayoutEffect(layout, [layout, stage, scale, reduceMotion]);

  useEffect(
    () => () => {
      stopAnimation();
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    },
    []
  );

  // --- Gestes sur le carrousel ---

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    stopAnimation();
    gestureRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startPos: posRef.current,
      startTime: performance.now(),
      startScroll: scrollElRef.current?.scrollTop ?? 0,
      dragging: false,
      scrolling: false
    };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const g = gestureRef.current;
    if (!g || g.pointerId !== e.pointerId) return;
    const dx = e.clientX - g.startX;
    const dy = e.clientY - g.startY;
    // La scène est en touch-action: none (sur iOS, pan-y laissait le
    // défilement natif voler les glissements un peu en diagonale, annulés
    // par un pointercancel) : on tranche nous-mêmes la direction.
    if (g.scrolling) {
      if (scrollElRef.current) scrollElRef.current.scrollTop = g.startScroll - dy;
      return;
    }
    if (!g.dragging) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) <= DRAG_SLOP_PX) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      if (Math.abs(dy) * HORIZONTAL_BIAS > Math.abs(dx)) {
        g.scrolling = true;
        return;
      }
      g.dragging = true;
      e.currentTarget.classList.add('is-dragging');
    }
    let pos = g.startPos - dx / ((CARD_W + GAP) * scaleRef.current);
    // Résistance au-delà des extrémités.
    const max = EVENTS.length - 1;
    if (pos < 0) pos *= 0.35;
    else if (pos > max) pos = max + (pos - max) * 0.35;
    posRef.current = pos;
    scheduleLayout();
    syncActive(true);
  };

  const endGesture = (e: React.PointerEvent<HTMLDivElement>, cancelled: boolean) => {
    const g = gestureRef.current;
    if (!g || g.pointerId !== e.pointerId) return;
    gestureRef.current = null;
    e.currentTarget.classList.remove('is-dragging');

    if (g.scrolling) return;
    if (g.dragging) {
      const dx = e.clientX - g.startX;
      const fast = !cancelled && performance.now() - g.startTime < FAST_SWIPE_MS && Math.abs(dx) > FAST_SWIPE_PX;
      goTo(fast ? Math.round(g.startPos) - Math.sign(dx) : Math.round(posRef.current));
      return;
    }
    if (cancelled) {
      goTo(Math.round(posRef.current));
      return;
    }
    // Simple toucher : une carte voisine vient au centre ; la carte
    // centrée ouvre sa fiche si elle existe.
    const slot = (e.target as HTMLElement).closest<HTMLElement>('[data-index]');
    const index = slot ? Number(slot.dataset.index) : NaN;
    if (Number.isFinite(index) && index !== activeRef.current) goTo(index);
    else if (Number.isFinite(index) && Math.abs(posRef.current - index) < 0.05) openEvent(index);
    else goTo(Math.round(posRef.current));
  };

  /** Ouvre la fiche : la carte s'agrandit en en-tête (voir EvenementDetail),
   * sans l'animation de page d'Ionic. */
  const openEvent = (index: number) => {
    const ev = EVENTS[index];
    if (!ev.published) return;
    tapHaptic();
    const card = slotRefs.current[index]?.querySelector('.ev-card');
    if (card) setEventCardRect(ev.id, card.getBoundingClientRect());
    navigate(eventPath(ev.id), { state: { direction: 'none' } });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') goTo(activeRef.current + 1);
    else if (e.key === 'ArrowLeft') goTo(activeRef.current - 1);
    else return;
    e.preventDefault();
  };

  // --- Gestes sur la frise ---

  const friseSwipedRef = useRef(false);

  // Fin du geste écoutée sur la fenêtre : un glissement peut se terminer
  // hors de la frise (pas de capture du pointeur, qui détournerait le
  // toucher des points).
  const onFriseDown = (e: React.PointerEvent) => {
    const start = { x: e.clientX, y: e.clientY, id: e.pointerId };
    friseSwipedRef.current = false;
    const onUp = (up: PointerEvent) => {
      if (up.pointerId !== start.id) return;
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      if (up.type === 'pointercancel') return;
      const dx = up.clientX - start.x;
      if (Math.abs(dx) > FRISE_SWIPE_PX && Math.abs(up.clientY - start.y) * HORIZONTAL_BIAS < Math.abs(dx)) {
        friseSwipedRef.current = true;
        goTo(activeRef.current - Math.sign(dx));
      }
    };
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  };

  const onDotClick = (index: number) => {
    if (friseSwipedRef.current) {
      friseSwipedRef.current = false;
      return;
    }
    goTo(index);
  };

  const event = EVENTS[active];
  const x = event.timelineX;

  return (
    <IonPage>
      <IonContent ref={contentRef} fullscreen className="ev-content">
        <div className={`ev-page${entering ? ' is-entering' : ''}${reduceMotion ? ' is-reduced' : ''}`}>
          <header className="ev-header">
            <div>
              <p className="ev-kicker ev-enter" style={{ animationDelay: '0ms' }}>
                Histoire du salut
              </p>
              <h1 className="ev-title ev-enter" style={{ animationDelay: '120ms' }}>
                Événements
              </h1>
            </div>
            <p className="ev-counter ev-enter" style={{ animationDelay: '240ms' }} aria-live="polite">
              <span className="ev-counter-current">{active + 1}</span>
              <span className="ev-counter-sep">/</span>
              {EVENTS.length}
            </p>
          </header>

          <div
            ref={stageRef}
            className="ev-stage"
            style={{ '--ev-s': scale } as React.CSSProperties}
            role="region"
            aria-roledescription="carrousel"
            aria-label="Événements de l'histoire du salut"
            tabIndex={0}
            onKeyDown={onKeyDown}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={(e) => endGesture(e, false)}
            onPointerCancel={(e) => endGesture(e, true)}
            onContextMenu={(e) => e.preventDefault()}
          >
            {EVENTS.map((ev, i) => (
              <EventCard
                key={ev.id}
                event={ev}
                index={i}
                enterDelay={entering ? Math.abs(i - entryIndex) * 140 : null}
                slotRef={(el) => {
                  slotRefs.current[i] = el;
                }}
                artRef={(el) => {
                  artRefs.current[i] = el;
                }}
              />
            ))}
          </div>

          <div className="ev-info" key={active}>
            <p className="ev-info-refs">{event.refs}</p>
            {event.published ? (
              <button
                type="button"
                className="ev-open"
                onClick={() => openEvent(active)}
              >
                Ouvrir le récit
                {event.tableaux !== null && (
                  <>
                    <span className="ev-open-sep" aria-hidden="true" />
                    <span className="ev-open-count">{event.tableaux} tableaux</span>
                  </>
                )}
              </button>
            ) : (
              <span className="ev-soon" aria-disabled="true">
                Bientôt illustré
              </span>
            )}
          </div>

          <div className="ev-frise" onPointerDown={onFriseDown}>
            <div className="ev-frise-ends">
              <span>Ancien Testament</span>
              <span>Nouveau Testament</span>
            </div>
            <div className="ev-frise-track">
              <span className="ev-frise-line" aria-hidden="true" />
              <span className="ev-frise-split" style={{ left: `${TESTAMENT_SPLIT_X}%` }} aria-hidden="true" />
              <div className="ev-frise-rail" style={{ transform: `translateX(${x}%)` }} aria-hidden="true">
                <span className="ev-frise-ring" />
              </div>
              {EVENTS.map((ev, i) => (
                <button
                  key={ev.id}
                  type="button"
                  className={`ev-frise-dot${i === active ? ' is-active' : ''}`}
                  style={{ left: `${ev.timelineX}%` }}
                  onClick={() => onDotClick(i)}
                  aria-label={ev.title}
                  aria-current={i === active ? 'true' : undefined}
                />
              ))}
            </div>
            <div className="ev-frise-labels" aria-hidden="true">
              <div className="ev-frise-rail" style={{ transform: `translateX(${x}%)` }}>
                {/* Décalé de x % de sa propre largeur : centré au milieu de
                    la frise, aligné sur le bord près des extrémités. */}
                <span className="ev-frise-label" style={{ transform: `translateX(-${x}%)` }}>
                  {event.short}
                </span>
              </div>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Evenements;
