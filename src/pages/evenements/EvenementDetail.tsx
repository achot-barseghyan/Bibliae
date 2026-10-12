import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { IonContent, IonPage } from '@ionic/react';
import { EVENTS, eventImageUrl, getEventDetail, takeEventCardRect, type EventDetail } from '../../data/events';
import { BookmarkIcon, ChevronLeftIcon } from '../../components/nav/icons';
import { useAccessibility } from '../../hooks/useAccessibility';
import { useBookmarks } from '../../hooks/useBookmarks';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { tapHaptic } from '../../utils/haptics';
import { ScrollEngineContext, createScrollEngine, useScrollEngine } from './scrollEngine';
import { Characters, Facts, Footer, Liturgy, RouteMap, SceneView, Stars, Story, TitleBlock } from './EventSections';
import './EvenementDetail.css';

const HERO_HEIGHT = 404;
/** Défilement sur lequel la barre du haut devient opaque. */
const BAR_FROM = 300;
const BAR_TO = 390;
/** Durée de l'agrandissement de la carte en en-tête. */
const MORPH_MS = 650;

// Barre claire sur l'en-tête (#F4EDDC), foncée une fois opaque (#23201A).
const LIGHT = [244, 237, 220];
const DARK = [35, 32, 26];

/** 1. En-tête : illustration plein cadre, zoom lent, halos, étoiles, parallaxe. */
const Hero: React.FC<{
  event: EventDetail;
  morphRef: React.RefObject<HTMLDivElement | null>;
  /** Illustration de la carte, visible pendant l'agrandissement. */
  cardImage: string | null;
}> = ({ event, morphRef, cardImage }) => {
  const { onFrame, reduceMotion } = useScrollEngine();
  const parallaxRef = useRef<HTMLDivElement>(null);
  const src = eventImageUrl(event.hero.asset);

  useEffect(() => {
    const el = parallaxRef.current;
    if (!el || reduceMotion) return;
    return onFrame(({ scrollTop }) => {
      if (scrollTop > HERO_HEIGHT * 1.5) return;
      el.style.transform = `translate3d(0, ${(Math.max(0, scrollTop) * 0.35).toFixed(1)}px, 0)`;
    });
  }, [onFrame, reduceMotion]);

  return (
    <div ref={morphRef} className="evd-hero">
      <div ref={parallaxRef} className="evd-hero-parallax">
        <div className="evd-hero-zoom" style={src ? { backgroundImage: `url(${src})` } : undefined} role="img" aria-label="" />
        <div
          className="evd-hero-glow is-star"
          style={{ left: `${event.hero.star.x}%`, top: `${event.hero.star.y}%` }}
          aria-hidden="true"
        />
        <div
          className="evd-hero-glow is-warm"
          style={{ left: `${event.hero.warm.x}%`, top: `${event.hero.warm.y}%` }}
          aria-hidden="true"
        />
        <Stars seed={`${event.id}-hero`} count={22} maxTop={50} />
      </div>
      <div className="evd-hero-fade" aria-hidden="true" />
      {cardImage && (
        <div
          className="evd-morph-card"
          style={{ backgroundImage: `url(${cardImage})`, transitionDuration: `${MORPH_MS}ms` }}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

/** 2. Barre du haut : transparente sur l'en-tête, opaque entre 300 et 390 px. */
const TopBar: React.FC<{ eventId: string }> = ({ eventId }) => {
  const navigate = useNavigate();
  const { isBookmarked, toggle } = useBookmarks();
  const bookmarkKey = `event:${eventId}`;
  const isFavorite = isBookmarked(bookmarkKey);
  const { onFrame } = useScrollEngine();
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    let last = -1;
    return onFrame(({ scrollTop }) => {
      const p = Math.max(0, Math.min(1, (scrollTop - BAR_FROM) / (BAR_TO - BAR_FROM)));
      if (p === last) return;
      last = p;
      const rgb = LIGHT.map((c, i) => Math.round(c + (DARK[i] - c) * p)).join(', ');
      bar.style.setProperty('--evd-bar-p', String(p));
      bar.style.color = `rgb(${rgb})`;
    });
  }, [onFrame]);

  return (
    <div ref={barRef} className="evd-bar">
      <button
        type="button"
        className="evd-bar-back"
        onClick={() => {
          tapHaptic();
          navigate(-1);
        }}
      >
        <ChevronLeftIcon size={20} />
        Événements
      </button>
      <button
        type="button"
        className={`evd-bar-icon${isFavorite ? ' is-active' : ''}`}
        onClick={() => {
          tapHaptic();
          toggle(bookmarkKey);
        }}
        aria-pressed={isFavorite}
        aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      >
        <BookmarkIcon size={20} filled={isFavorite} />
      </button>
    </div>
  );
};

const EventPage: React.FC<{ event: EventDetail }> = ({ event }) => {
  const { settings } = useAccessibility();
  const prefersReduced = usePrefersReducedMotion();
  const reduceMotion = settings.reduceMotion || prefersReduced;
  const [{ engine, attach }] = useState(() => createScrollEngine(reduceMotion));
  const contentRef = useRef<HTMLIonContentElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  // Transition depuis la liste : la carte touchée s'agrandit jusqu'à
  // devenir l'en-tête, puis le contenu apparaît.
  const [cardRect] = useState(() => takeEventCardRect(event.id));
  const [phase, setPhase] = useState<'morph-start' | 'morphing' | 'done'>(() =>
    cardRect && !reduceMotion ? 'morph-start' : 'done'
  );
  const reduceMotionAtOpen = useRef(reduceMotion);
  const cardImage = eventImageUrl(EVENTS.find((e) => e.id === event.id)?.card.image ?? null);

  // Une seule fois à l'ouverture (ne dépend pas de la phase, sinon le
  // passage à « morphing » annulerait la minuterie de fin).
  useLayoutEffect(() => {
    const hero = heroRef.current;
    if (!hero || !cardRect || reduceMotionAtOpen.current) return;
    const h = hero.getBoundingClientRect();
    const radius = cardRect.width / 2;
    const inset = [cardRect.top - h.top, h.right - cardRect.right, h.bottom - cardRect.bottom, cardRect.left - h.left]
      .map((v) => `${Math.round(v)}px`)
      .join(' ');
    hero.style.clipPath = `inset(${inset} round ${radius}px ${radius}px 16px 16px)`;
    // Deux images : le point de départ est peint avant la transition.
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setPhase('morphing');
        hero.style.clipPath = 'inset(0px 0px 0px 0px round 0px 0px 0px 0px)';
      })
    );
    const timer = window.setTimeout(() => {
      hero.style.clipPath = '';
      setPhase('done');
    }, MORPH_MS + 80);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [cardRect]);

  useEffect(() => {
    let detach: (() => void) | undefined;
    let cancelled = false;
    contentRef.current?.getScrollElement().then((scrollEl) => {
      if (cancelled || !innerRef.current) return;
      detach = attach(scrollEl, innerRef.current);
    });
    return () => {
      cancelled = true;
      detach?.();
    };
  }, [attach]);

  return (
    <IonPage>
      <ScrollEngineContext.Provider value={engine}>
        <TopBar eventId={event.id} />
        <IonContent ref={contentRef} fullscreen className="evd-content">
          <div
            ref={innerRef}
            className={`evd-page is-${phase}${reduceMotion ? ' is-reduced' : ''}`}
            onContextMenu={(e) => {
              // Pas de menu « Enregistrer l'image » (licence de l'artiste).
              if ((e.target as HTMLElement).closest('img, .evd-hero')) e.preventDefault();
            }}
          >
            <Hero event={event} morphRef={heroRef} cardImage={phase !== 'done' ? cardImage : null} />
            <div className="evd-body">
              <TitleBlock event={event} />
              <Facts facts={event.facts} />
              <Story event={event} />
              {event.characters.length > 0 && <Characters characters={event.characters} />}
              {event.route && <RouteMap route={event.route} />}
              {event.scene && <SceneView scene={event.scene} />}
              {event.liturgy.length > 0 && <Liturgy days={event.liturgy} />}
              <Footer />
            </div>
          </div>
        </IonContent>
      </ScrollEngineContext.Provider>
    </IonPage>
  );
};

const EvenementDetail: React.FC = () => {
  const { eventId = '' } = useParams<{ eventId: string }>();
  const event = getEventDetail(eventId);
  if (!event) return <Navigate to="/compendium/evenements" replace />;
  return <EventPage key={event.id} event={event} />;
};

export default EvenementDetail;
