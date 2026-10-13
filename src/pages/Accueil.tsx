import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { IonContent, IonPage } from '@ionic/react';
import { useRemoteAccueil } from '../hooks/content/useRemoteAccueil';
import { useFigures } from '../hooks/useFigures';
import { useReadingProgress } from '../hooks/useReadingProgress';
import { useLiturgicalDay } from '../hooks/useLiturgicalDay';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { BOOKS, getBook } from '../data/bible';
import { MYSTERY_ORDER } from '../data/rosary';
import { LatinCrossIcon, SearchIcon } from '../components/nav/icons';
import { tapHaptic } from '../utils/haptics';
import './Accueil.css';

const EASE = 'cubic-bezier(.2,.7,.2,1)';

/** Exemples tapés dans la barre de recherche, hors portée choisie. */
const PLACEHOLDERS = ['Une figure, un lieu, un verset…', 'Moïse', 'Jérusalem', 'Jn 3, 16', 'Marie', 'Le bon Samaritain'];

interface SearchScope {
  label: string;
  glyph: string;
  path: string;
  examples: string[];
}

const SCOPES: SearchScope[] = [
  { label: 'Figures', glyph: '✦', path: '/compendium/figures', examples: ['Une figure…', 'Abraham', 'Marie-Madeleine', 'Élie', 'Pierre'] },
  { label: 'Versets', glyph: '❡', path: '/bible', examples: ['Un verset…', 'Jn 3, 16', 'Ps 23', 'Mt 5, 3-12', '« Je suis le chemin »'] },
  { label: 'Événements', glyph: '◈', path: '/compendium/evenements', examples: ['Un événement…', 'La Nativité', 'Le passage de la mer Rouge', 'La Pentecôte'] },
  { label: 'Prières', glyph: '❧', path: '/prier/prieres', examples: ['Une prière…', 'Notre Père', 'Je vous salue Marie', 'Angélus', 'Magnificat'] },
  { label: 'Saints', glyph: '✶', path: '/prier/saints', examples: ['Un saint…', 'Thérèse de Lisieux', "François d'Assise", 'Jean-Marie Vianney', "Jeanne d'Arc"] }
];

/** Mots du titre mis en relief (italique doré). */
const HEADLINE_ACCENTS = new Set(['figure,', 'lieu,', 'récit']);

/** Fonds des cartes « Figures en vedette », attribués à tour de rôle. */
const FIGURE_BACKGROUNDS = [
  'linear-gradient(180deg,#2E4A72,#141C30)',
  'linear-gradient(180deg,#24406B,#1B2640)',
  'linear-gradient(180deg,#8A2A2F,#3A1014)',
  'linear-gradient(180deg,#5A4A2A,#23201A)'
];

/** Couleur liturgique (AELF) → pastille et liseré de la carte du jour. */
const LITURGICAL_COLORS: Record<string, { color: string; stripe: string; label: string }> = {
  vert: { color: '#5E6A3A', stripe: '#6E7B46', label: 'vert' },
  violet: { color: '#5B3A6E', stripe: '#6C4A80', label: 'violet' },
  blanc: { color: '#B5892E', stripe: '#E7D9A8', label: 'blanc' },
  or: { color: '#B5892E', stripe: '#E7D9A8', label: 'blanc' },
  rouge: { color: '#9B2A2A', stripe: '#AE3A3A', label: 'rouge' },
  rose: { color: '#C88A9A', stripe: '#D49DAB', label: 'rose' },
  noir: { color: '#23201A', stripe: '#3A352C', label: 'noir' }
};

const RING_CIRCUMFERENCE = 194.8;
const NARROW_NBSP = String.fromCharCode(0x202f);

// Numéro de semaine ISO : détermine, de façon stable et sans backend, quel
// quart des figures en vedette est mis en avant cette semaine.
function isoWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function relativeDayLabel(iso: string): string {
  const diffDays = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (diffDays <= 0) return "aujourd'hui";
  if (diffDays === 1) return 'hier';
  if (diffDays < 7) return `il y a ${diffDays} jours`;
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
}

/** « 27ème » / « 27e » → « 27ᵉ » ; « 1er » reste tel quel. */
function formatOrdinals(text: string): string {
  return text.replace(/(\d+)(ème|eme|e)\b/g, '$1ᵉ');
}

/** 1021 → « 1 021 », séparé par une espace fine insécable. */
function formatCount(n: number): string {
  return n >= 1000 ? `${Math.floor(n / 1000)}${NARROW_NBSP}${String(n % 1000).padStart(3, '0')}` : String(n);
}

/** « XIIIe siècle av. J.-C. » → exposant sur l'ordinal du siècle. */
function renderCategory(category: string) {
  const match = category.match(/^(.*?\b[IVXLC]+)(er|e)(\b.*)$/);
  if (!match) return category;
  return (
    <>
      {match[1]}
      <span className="vedette-meta-sup">{match[2]}</span>
      {match[3]}
    </>
  );
}

/** Ciel étoilé du bandeau : positions pseudo-aléatoires mais stables. */
function makeStars(count: number) {
  let seed = 5;
  const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  return Array.from({ length: count }, () => {
    const size = rnd() > 0.75 ? 3 : 2;
    return {
      left: `${(rnd() * 100).toFixed(1)}%`,
      top: `${(rnd() * 100).toFixed(1)}%`,
      size,
      duration: `${(2 + rnd() * 3).toFixed(2)}s`,
      delay: `${(-rnd() * 4).toFixed(2)}s`
    };
  });
}

/** Texte tapé puis effacé en boucle dans la barre de recherche. */
function useTypedPlaceholder(words: string[], reduced: boolean): string {
  const [typed, setTyped] = useState(reduced ? words[0] : '');

  useEffect(() => {
    if (reduced) {
      setTyped(words[0]);
      return;
    }
    let timer: ReturnType<typeof setTimeout>;
    let k = 0;
    setTyped('');

    const typeWord = (initialDelay: number) => {
      const word = words[k % words.length];
      let i = 0;
      let dir = 1;
      const step = () => {
        i += dir;
        setTyped(word.slice(0, i));
        if (dir > 0 && i >= word.length) {
          dir = -1;
          timer = setTimeout(step, k % words.length === 0 ? 2600 : 1500);
          return;
        }
        if (dir < 0 && i <= 0) {
          k += 1;
          timer = setTimeout(() => typeWord(0), 300);
          return;
        }
        timer = setTimeout(step, dir > 0 ? 55 : 24);
      };
      timer = setTimeout(step, initialDelay);
    };

    typeWord(900);
    return () => clearTimeout(timer);
  }, [words, reduced]);

  return typed;
}

const Accueil: React.FC = () => {
  const navigate = useNavigate();
  const reduced = usePrefersReducedMotion();
  const { hero, featuredFigures } = useRemoteAccueil();
  const { figures } = useFigures();
  const { activeParcours, positionFor, progress } = useReadingProgress();
  const { feast } = useLiturgicalDay();

  const [scope, setScope] = useState(-1);
  const [activeFigure, setActiveFigure] = useState(0);

  const pageRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const heroArtRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLButtonElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLElement>(null);
  const percentRef = useRef(0);

  const stars = useMemo(() => makeStars(32), []);
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    return hour < 5 || hour >= 18 ? 'Bonsoir' : 'Bonjour';
  }, []);

  const typedWords = scope >= 0 ? SCOPES[scope].examples : PLACEHOLDERS;
  const typed = useTypedPlaceholder(typedWords, reduced);

  const weeklyFigures = useMemo(() => {
    if (featuredFigures.length === 0) return [];
    const offset = isoWeek(new Date()) % featuredFigures.length;
    return [0, 1, 2, 3].map((i) => featuredFigures[(offset + i) % featuredFigures.length]);
  }, [featuredFigures]);

  const readingPosition = activeParcours ? positionFor(activeParcours.id) : undefined;
  const readingBook = readingPosition ? getBook(readingPosition.bookId) : undefined;
  const readingPercent = activeParcours ? Math.round(progress(activeParcours).percent) : 0;
  percentRef.current = readingPercent;

  const gospel = feast?.mass.find((m) => m.key === 'gospel');
  const feastColor = feast ? (LITURGICAL_COLORS[feast.color] ?? LITURGICAL_COLORS.blanc) : null;
  const feastDate = feast
    ? new Date(`${feast.date}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
    : '';
  const feastLine = feast ? [feast.commemorationLine, gospel?.ref].filter(Boolean).join(' · ') : '';

  const tiles = [
    { label: 'Compendium', count: figures.length, rest: ' fiches', icon: '✦', glyph: 'C', path: '/compendium/figures', dark: true },
    { label: 'La Bible', count: BOOKS.length, rest: ' livres', icon: <LatinCrossIcon size={17} />, glyph: 'B', path: '/bible' },
    { label: 'Le Rosaire', count: MYSTERY_ORDER.length * 5, rest: ' mystères', icon: '✿', glyph: 'R', path: '/rosaire' },
    { label: 'Prier', count: 0, rest: 'Prières et saints', icon: '❧', glyph: 'P', path: '/prier' }
  ];

  const aboutWords = useMemo(() => hero.bibliaeText.slice(1).split(' '), [hero.bibliaeText]);

  // --- Animations déclenchées à l'apparition -------------------------------

  const countUp = useCallback(
    (el: HTMLElement, delay: number) => {
      const target = Number(el.dataset.count);
      if (!target) return;
      if (reduced) {
        el.textContent = formatCount(target);
        return;
      }
      const t0 = performance.now() + delay;
      const frame = (now: number) => {
        const p = Math.max(0, Math.min(1, (now - t0) / 1400));
        el.textContent = formatCount(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    },
    [reduced]
  );

  const fillRing = useCallback(
    (delay: number) => {
      const ring = ringRef.current;
      const pct = pctRef.current;
      if (!ring) return;
      const target = percentRef.current;
      const offset = RING_CIRCUMFERENCE * (1 - target / 100);
      if (reduced) {
        ring.style.strokeDashoffset = String(offset);
        if (pct) pct.textContent = String(target);
        return;
      }
      ring.animate([{ strokeDashoffset: RING_CIRCUMFERENCE }, { strokeDashoffset: offset }], {
        duration: 1600,
        delay: delay + 200,
        easing: EASE,
        fill: 'forwards'
      });
      const t0 = performance.now() + delay + 200;
      const frame = (now: number) => {
        const q = Math.max(0, Math.min(1, (now - t0) / 1600));
        if (pct) pct.textContent = String(Math.round(target * (1 - Math.pow(1 - q, 3))));
        if (q < 1) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    },
    [reduced]
  );

  // Révélation au défilement : chaque [data-rv] glisse et apparaît une fois.
  // Réobservé quand du contenu asynchrone (reprise, liturgie, figures) arrive.
  const hasResume = Boolean(activeParcours && readingPosition && readingBook);
  const hasFeast = Boolean(feast);
  useEffect(() => {
    const root = pageRef.current;
    if (!root) return;
    const pending = [...root.querySelectorAll<HTMLElement>('[data-rv]:not(.is-revealed)')];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          const delay = (Number(el.dataset.rv) || 0) * 90;
          el.style.setProperty('--rv-delay', `${delay}ms`);
          el.classList.add('is-revealed');
          el.querySelectorAll<HTMLElement>('[data-count]').forEach((c) => countUp(c, delay));
          if (ringRef.current && el.contains(ringRef.current)) fillRing(delay);
          observer.unobserve(el);
        });
      },
      { threshold: 0.2 }
    );
    pending.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [countUp, fillRing, hasResume, hasFeast, weeklyFigures.length, figures.length]);

  // --- Défilement vertical : parallaxe, barre compacte, lecture du texte ---

  const onScroll = useCallback(
    (scrollTop: number) => {
      const art = heroArtRef.current;
      if (art && !reduced) {
        art.style.transform = `translateY(${(scrollTop * 0.4).toFixed(1)}px)`;
        art.style.opacity = Math.max(0, 1 - scrollTop / 480).toFixed(3);
      }
      barRef.current?.classList.toggle('is-visible', scrollTop > 380);

      const about = aboutRef.current;
      if (about) {
        const r = about.getBoundingClientRect();
        const vh = window.innerHeight;
        const q = Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (r.height * 0.9)));
        const words = about.querySelectorAll<HTMLElement>('[data-aw]');
        const n = words.length;
        words.forEach((w, i) => w.classList.toggle('is-read', reduced || i / n < q));
      }
    },
    [reduced]
  );

  const scrollRaf = useRef(0);
  const lastScrollTop = useRef(0);
  const handleIonScroll = (e: CustomEvent<{ scrollTop: number }>) => {
    lastScrollTop.current = e.detail.scrollTop;
    if (scrollRaf.current) return;
    scrollRaf.current = requestAnimationFrame(() => {
      scrollRaf.current = 0;
      onScroll(lastScrollTop.current);
    });
  };

  useEffect(() => {
    onScroll(0);
    return () => cancelAnimationFrame(scrollRaf.current);
  }, [onScroll, aboutWords]);

  const contentRef = useRef<HTMLIonContentElement>(null);
  const toTop = () => contentRef.current?.scrollToTop(reduced ? 0 : 500);

  // --- Carrousel des figures ----------------------------------------------

  const carouselTick = useCallback(() => {
    const car = carouselRef.current;
    if (!car) return;
    const mid = car.scrollLeft + car.clientWidth / 2;
    let best = 0;
    let bestDistance = Infinity;
    car.querySelectorAll<HTMLElement>('[data-fig]').forEach((el, i) => {
      const d = (el.offsetLeft + el.offsetWidth / 2 - mid) / el.offsetWidth;
      const k = Math.min(1, Math.abs(d));
      if (!reduced) {
        el.style.transform = `scale(${(1 - k * 0.12).toFixed(3)}) rotate(${(d * 4).toFixed(2)}deg)`;
        const art = el.querySelector<HTMLElement>('[data-art]');
        if (art) art.style.transform = `translateX(${(-d * 26).toFixed(1)}px) scale(${(1 + (1 - k) * 0.04).toFixed(3)})`;
      }
      el.style.opacity = (1 - k * 0.45).toFixed(3);
      if (Math.abs(d) < bestDistance) {
        bestDistance = Math.abs(d);
        best = i;
      }
    });
    setActiveFigure(best);
  }, [reduced]);

  useEffect(() => {
    carouselTick();
  }, [carouselTick, weeklyFigures]);

  const goFigure = (index: number) => {
    const car = carouselRef.current;
    if (!car) return;
    const els = car.querySelectorAll<HTMLElement>('[data-fig]');
    const el = els[Math.max(0, Math.min(els.length - 1, index))];
    if (!el) return;
    car.scrollTo({ left: el.offsetLeft + el.offsetWidth / 2 - car.clientWidth / 2, behavior: reduced ? 'auto' : 'smooth' });
  };

  // Glisser à la souris (cadre bureau) : le tactile garde le défilement natif.
  const draggedRef = useRef(false);
  const onCarouselPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;
    const car = carouselRef.current;
    if (!car) return;
    const x0 = e.clientX;
    const s0 = car.scrollLeft;
    const base = activeFigure;
    draggedRef.current = false;
    car.style.scrollSnapType = 'none';
    car.classList.add('is-dragging');
    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - x0;
      if (Math.abs(dx) > 4) draggedRef.current = true;
      car.scrollLeft = s0 - dx;
    };
    const up = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      car.classList.remove('is-dragging');
      const dx = ev.clientX - x0;
      const target = dx < -40 ? base + 1 : dx > 40 ? base - 1 : base;
      goFigure(target);
      setTimeout(() => {
        car.style.scrollSnapType = '';
      }, 450);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  // --- Recherche -------------------------------------------------------------

  const pickScope = (index: number) => {
    tapHaptic();
    setScope((current) => (current === index ? -1 : index));
    if (!reduced) {
      searchRef.current?.animate(
        [{ transform: 'scale(.97)', boxShadow: '0 0 0 6px rgba(181,137,46,0.35)' }, { transform: 'none' }],
        { duration: 500, easing: EASE }
      );
    }
  };

  const openSearch = () => {
    tapHaptic();
    navigate(scope >= 0 ? SCOPES[scope].path : '/compendium/figures');
  };

  const go = (path: string) => {
    tapHaptic();
    navigate(path);
  };

  const headlineWords = hero.headline.split(' ');

  return (
    <IonPage>
      <div ref={barRef} className="accueil-bar" aria-hidden="true">
        <div className="accueil-bar-wordmark">
          <LatinCrossIcon size={15} className="accueil-bar-cross" />
          <span>Bibliae</span>
        </div>
        <button type="button" className="accueil-bar-search" onClick={toTop} tabIndex={-1} aria-label="Remonter à la recherche">
          <SearchIcon size={14} />
        </button>
      </div>

      <IonContent
        ref={contentRef}
        fullscreen
        className="accueil-content"
        scrollEvents
        onIonScroll={handleIonScroll}
      >
        <div ref={pageRef} className={`accueil${reduced ? ' is-reduced' : ''}`}>
          {/* --- Bandeau nocturne --- */}
          <header className="accueil-hero">
            <div className="accueil-stars" aria-hidden="true">
              {stars.map((s, i) => (
                <span
                  key={i}
                  style={{
                    left: s.left,
                    top: s.top,
                    width: s.size,
                    height: s.size,
                    animationDuration: s.duration,
                    animationDelay: s.delay
                  }}
                />
              ))}
            </div>
            <div ref={heroArtRef} className="accueil-hero-art" aria-hidden="true">
              <div className="hero-beams" />
              <div className="hero-glow" />
              <div className="hero-rose-ticks" />
              <div className="hero-rose-glass" />
            </div>

            <div className="accueil-hero-text">
              <p className="hero-greeting" data-in style={{ '--i': 0 } as CSSProperties}>
                {greeting}
              </p>
              <h1 className="hero-wordmark" data-in style={{ '--i': 1 } as CSSProperties}>
                <LatinCrossIcon size={30} className="hero-wordmark-cross" />
                <span className="hero-wordmark-name">Bibliae</span>
              </h1>
              <p className="hero-kicker" data-in style={{ '--i': 2 } as CSSProperties}>
                {hero.kicker}
              </p>
              <h2 className="hero-headline">
                {headlineWords.map((word, i) => (
                  <span
                    key={i}
                    className={`hero-word${HEADLINE_ACCENTS.has(word) ? ' is-accent' : ''}`}
                    style={{ '--w': i } as CSSProperties}
                  >
                    {word}
                  </span>
                ))}
              </h2>
            </div>
          </header>

          {/* --- Recherche --- */}
          <section className="accueil-search-wrap">
            <button
              ref={searchRef}
              type="button"
              className="accueil-search"
              data-in
              style={{ '--i': 3 } as CSSProperties}
              onClick={openSearch}
              aria-label={scope >= 0 ? `Rechercher dans : ${SCOPES[scope].label}` : 'Rechercher'}
            >
              <SearchIcon size={16} className="accueil-search-icon" />
              <span className="accueil-search-typed" aria-hidden="true">
                <span>{typed}</span>
                <span className="accueil-search-caret" />
              </span>
              {scope >= 0 && (
                <span
                  role="button"
                  tabIndex={0}
                  className="accueil-search-scope"
                  onClick={(e) => {
                    e.stopPropagation();
                    pickScope(scope);
                  }}
                  aria-label="Retirer le filtre"
                >
                  Dans : {SCOPES[scope].label}
                  <span className="accueil-search-scope-x">×</span>
                </span>
              )}
            </button>
            <div className="accueil-chips" data-in style={{ '--i': 4 } as CSSProperties}>
              {SCOPES.map((s, i) => (
                <button
                  key={s.label}
                  type="button"
                  className={`accueil-chip${i === scope ? ' is-active' : ''}`}
                  aria-pressed={i === scope}
                  onClick={() => pickScope(i)}
                >
                  <span className="accueil-chip-glyph" aria-hidden="true">
                    {s.glyph}
                  </span>
                  {s.label}
                </button>
              ))}
            </div>
          </section>

          {/* --- Reprendre la lecture --- */}
          {activeParcours && readingPosition && readingBook && (
            <section className="accueil-section accueil-section--resume">
              <button
                type="button"
                className="resume-card"
                data-rv="0"
                onClick={() => go(`/bible/${readingBook.id}/${readingPosition.chapter}`)}
              >
                <span className="resume-card-shine" aria-hidden="true" />
                <div className="resume-ring">
                  <svg width="72" height="72" viewBox="0 0 72 72" aria-hidden="true">
                    <circle cx="36" cy="36" r="31" className="resume-ring-track" />
                    <circle
                      ref={ringRef}
                      cx="36"
                      cy="36"
                      r="31"
                      className="resume-ring-fill"
                      strokeDasharray={RING_CIRCUMFERENCE}
                      strokeDashoffset={RING_CIRCUMFERENCE}
                    />
                  </svg>
                  <div className="resume-ring-label">
                    <span ref={pctRef} className="resume-ring-value">
                      0
                    </span>
                    <span className="resume-ring-unit">%</span>
                  </div>
                </div>
                <div className="resume-card-body">
                  <div className="resume-card-head">
                    <span className="resume-card-kicker">Reprendre</span>
                    <span className="resume-card-time">{relativeDayLabel(readingPosition.updatedAt)}</span>
                  </div>
                  <div className="resume-card-title">
                    {readingBook.name} {readingPosition.chapter}
                  </div>
                  <div className="resume-card-name">{activeParcours.name}</div>
                </div>
                <span className="resume-card-chevron" aria-hidden="true">
                  ›
                </span>
              </button>
            </section>
          )}

          {/* --- Parcourir --- */}
          <nav className="accueil-section" aria-label="Parcourir">
            <div className="accueil-rule-head" data-rv="0">
              <span className="accueil-kicker">Parcourir</span>
              <span className="accueil-rule" />
            </div>
            <div className="browse-tiles">
              {tiles.map((t, i) => (
                <button
                  key={t.label}
                  type="button"
                  className={`browse-tile browse-tile--${i}${t.dark ? ' is-dark' : ''}`}
                  data-rv={i % 2}
                  onClick={() => go(t.path)}
                >
                  <span className="browse-tile-glyph" aria-hidden="true">
                    {t.glyph}
                  </span>
                  <span className="browse-tile-icon" aria-hidden="true">
                    {t.icon}
                  </span>
                  <span className="browse-tile-label">{t.label}</span>
                  <span className="browse-tile-meta">
                    {t.count > 0 && <span data-count={t.count}>{reduced ? formatCount(t.count) : '0'}</span>}
                    {t.rest}
                  </span>
                </button>
              ))}
            </div>
          </nav>

          {/* --- Jour liturgique --- */}
          {feast && feastColor && (
            <section className="accueil-section">
              <button
                type="button"
                className="liturgie-card"
                data-rv="0"
                style={{ '--liturgie': feastColor.color, '--liturgie-stripe': feastColor.stripe } as CSSProperties}
                onClick={() => go('/liturgie')}
                aria-label={`Liturgie du jour : ${formatOrdinals(feast.name)}${gospel?.ref ? `, Évangile ${gospel.ref}` : ''}`}
              >
                <span className="liturgie-card-stripe" aria-hidden="true" />
                <span className="liturgie-card-body">
                  <span className="liturgie-card-text">
                    <span className="liturgie-card-date">
                      <span className="liturgie-card-dot" aria-hidden="true" />
                      {feastDate} · {feastColor.label}
                    </span>
                    <span className="liturgie-card-title">{formatOrdinals(feast.name)}</span>
                    {feastLine && <span className="liturgie-card-line">{feastLine}</span>}
                  </span>
                  <span className="liturgie-card-wheel" aria-hidden="true">
                    <span className="liturgie-card-wheel-ring" />
                    <span className="liturgie-card-wheel-chevron">›</span>
                  </span>
                </span>
              </button>
            </section>
          )}

          {/* --- Figures en vedette --- */}
          {weeklyFigures.length > 0 && (
            <section className="vedette">
              <div className="vedette-head">
                <div>
                  <p className="accueil-kicker" data-rv="0">
                    {hero.figuresKicker}
                  </p>
                  <h2 className="vedette-title" data-rv="1">
                    {hero.figuresTitle}
                  </h2>
                </div>
                <button type="button" className="vedette-all" data-rv="1" onClick={() => go('/compendium/figures')}>
                  Tout voir
                </button>
              </div>
              <p className="vedette-subtitle" data-rv="2">
                {hero.figuresSubtitle}
              </p>

              <div
                ref={carouselRef}
                className="vedette-carousel"
                data-rv="3"
                onScroll={() => requestAnimationFrame(carouselTick)}
                onPointerDown={onCarouselPointerDown}
              >
                {weeklyFigures.map((figure, i) => (
                  <button
                    key={figure.id}
                    type="button"
                    className="vedette-card"
                    data-fig
                    onClick={() => {
                      if (draggedRef.current) return;
                      if (i !== activeFigure) {
                        goFigure(i);
                        return;
                      }
                      go(`/figures/${figure.id}`);
                    }}
                  >
                    <span
                      className="vedette-arch"
                      style={{ background: FIGURE_BACKGROUNDS[i % FIGURE_BACKGROUNDS.length] }}
                    >
                      <span className="vedette-glow" aria-hidden="true" />
                      <span className="vedette-ticks" aria-hidden="true" />
                      <span className="vedette-initial" aria-hidden="true">
                        {figure.name.charAt(0)}
                      </span>
                      <span className="vedette-art" data-art>
                        <img src={figure.image} alt="" draggable={false} />
                      </span>
                      <span className="vedette-inner-rule" aria-hidden="true" />
                      <span className="vedette-caption">
                        <span className="vedette-meta">{renderCategory(figure.category)}</span>
                        <span className="vedette-name">{figure.name}</span>
                      </span>
                    </span>
                    <span className="vedette-desc">{figure.description}</span>
                  </button>
                ))}
              </div>

              <div className="vedette-controls">
                <button
                  type="button"
                  className="vedette-arrow"
                  style={{ opacity: activeFigure === 0 ? 0.3 : 1 }}
                  onClick={() => goFigure(activeFigure - 1)}
                  aria-label="Figure précédente"
                >
                  ←
                </button>
                <div className="vedette-dots">
                  {weeklyFigures.map((figure, i) => (
                    <button
                      key={figure.id}
                      type="button"
                      className={`vedette-dot${i === activeFigure ? ' is-active' : ''}`}
                      onClick={() => goFigure(i)}
                      aria-label={figure.name}
                    >
                      <span />
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="vedette-arrow is-dark"
                  style={{ opacity: activeFigure === weeklyFigures.length - 1 ? 0.3 : 1 }}
                  onClick={() => goFigure(activeFigure + 1)}
                  aria-label="Figure suivante"
                >
                  →
                </button>
              </div>
            </section>
          )}

          {/* --- Ce que fait Bibliae --- */}
          <section ref={aboutRef} className="accueil-about">
            <p className="accueil-kicker" data-rv="0">
              Ce que fait Bibliae
            </p>
            <p className="accueil-about-text">
              <span className="drop-cap">{hero.bibliaeText.charAt(0)}</span>
              {aboutWords.map((word, i) => (
                <span key={i} data-aw className="about-word">
                  {word}{' '}
                </span>
              ))}
            </p>
          </section>

          {/* --- Pied de page --- */}
          <footer className="accueil-footer">
            <div className="footer-candle" data-rv="0" aria-hidden="true">
              <span className="footer-candle-halo" />
              <span className="footer-candle-flame" />
              <span className="footer-candle-wick" />
              <span className="footer-candle-body" />
            </div>
            <p className="footer-motto" data-rv="1">
              Lux Scripturae
              <br />
              Fides Ecclesiae
            </p>
            <p className="footer-quote" data-rv="2">
              « Il leur expliqua les Écritures » — Lc 24, 27
            </p>
            <p className="footer-links" data-rv="3">
              <button type="button" onClick={() => go('/a-propos')}>
                à propos
              </button>
              {' · '}
              <button type="button" onClick={() => go('/sources')}>
                sources
              </button>
              {' · '}
              <button type="button" onClick={() => go('/contact')}>
                contact
              </button>
            </p>
          </footer>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Accueil;
