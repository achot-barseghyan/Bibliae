import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { IonContent, IonPage } from '@ionic/react';
import { PhotoSlider } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import { useFigures } from '../../hooks/useFigures';
import { useBookmarks } from '../../hooks/useBookmarks';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useRemoteFigureDetails } from '../../hooks/content/useRemoteFigureDetails';
import { useRemoteCouncils } from '../../hooks/content/useRemoteCouncils';
import type { FigurePlace, ScriptureRef, TimelineEntry } from '../../data/figureDetails';
import type { Council } from '../../data/councils';
import {
  ChevronLeftIcon,
  SearchIcon,
  TreeIcon,
  CompassIcon,
  ZoomIcon,
  LatinCrossIcon,
  ExternalArrowIcon
} from '../../components/nav/icons';
import { hasGenealogy } from '../../data/genealogy';
import FamilyTree from './FamilyTree';
import VersePreviewSheet from './VersePreviewSheet';
import CouncilPreviewSheet from './CouncilPreviewSheet';
import { useOpenSearch } from '../accueil/searchContext';
import { tapHaptic } from '../../utils/haptics';
import './FigureDetail.css';
import WorldButton from '../../components/nav/WorldButton';
import { ARTIST_NAME, ARTIST_SHOP_URL } from '../../data/credits';
import { isReducedMotion } from '../../services/reducedMotion';

const EASE = 'cubic-bezier(.2,.7,.2,1)';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

const TESTAMENT_LABELS: Record<'ancien' | 'nouveau', string> = {
  ancien: 'Ancien Testament',
  nouveau: 'Nouveau Testament'
};

/** Fonds des vignettes « Figures liées », attribués à tour de rôle. */
const RELATED_BACKGROUNDS = [
  'linear-gradient(180deg,#24406B,#1B2640)',
  'linear-gradient(180deg,#5A4A2A,#23201A)',
  'linear-gradient(180deg,#8A2A2F,#3A1014)',
  'linear-gradient(180deg,#2E4A72,#141C30)'
];

/** Hauteur de la barre compacte (titre + onglets), pour viser les sections. */
const NAV_OFFSET = 96;

/** Ciel étoilé du bandeau : positions pseudo-aléatoires mais stables. */
const STARS = (() => {
  let seed = 41;
  const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  return Array.from({ length: 30 }, () => ({
    left: `${(rnd() * 100).toFixed(1)}%`,
    top: `${(rnd() * 100).toFixed(1)}%`,
    duration: `${(2 + rnd() * 3).toFixed(2)}s`,
    delay: `${(-rnd() * 4).toFixed(2)}s`
  }));
})();

/** Écriture d'un nom, déduite de ses caractères (hébreu, grec) — sinon rien. */
function scriptLabel(name: string): string {
  if (/[֐-׿]/.test(name)) return 'Hébreu';
  if (/[Ͱ-Ͽἀ-῿]/.test(name)) return 'Grec';
  return '';
}

/** Année courte de la colonne de gauche : « Entre 7 et 4 av. J.-C. » → « 7 av. ». */
function shortYear(entry: TimelineEntry): string {
  const n = entry.dateLabel.match(/\d+/)?.[0];
  if (!n) return '';
  return /av\./.test(entry.dateLabel) ? `${n} av.` : n;
}

/** Habillage d'une carte de lieu selon le moment de vie qu'il évoque. */
interface PlaceTheme {
  background: string;
  ink: string;
  motif: string;
}

const PLACE_THEMES: Record<string, PlaceTheme> = {
  naissance: {
    background: 'linear-gradient(180deg,#1B2A55,#0B1024)',
    ink: '#F0D58E',
    motif:
      'radial-gradient(circle at 50% 13%,#FFF6DA 0 2px,rgba(255,240,200,0.5) 3px,transparent 26px),repeating-conic-gradient(from 0deg at 50% 13%,rgba(240,213,142,0.16) 0 1deg,transparent 1deg 10deg),radial-gradient(1px 1px at 20% 30%,#fff,transparent),radial-gradient(1px 1px at 78% 22%,#fff,transparent),radial-gradient(1px 1px at 68% 48%,rgba(255,255,255,0.7),transparent),radial-gradient(1px 1px at 30% 60%,rgba(255,255,255,0.6),transparent)'
  },
  enfance: {
    background: 'linear-gradient(180deg,#3C2B26,#1C1311)',
    ink: '#F2BC8C',
    motif:
      'radial-gradient(ellipse 120% 60% at 50% 112%,rgba(232,150,92,0.5),transparent 70%),repeating-linear-gradient(0deg,rgba(255,214,170,0.07) 0 1px,transparent 1px 8px)'
  },
  ministere: {
    background: 'linear-gradient(180deg,#14404A,#081A20)',
    ink: '#A6DCD2',
    motif:
      'repeating-radial-gradient(ellipse 160% 90% at 50% 125%,rgba(166,220,210,0.2) 0 1px,transparent 1px 13px),linear-gradient(180deg,rgba(255,255,255,0.05),transparent 40%)'
  },
  bapteme: {
    background: 'linear-gradient(180deg,#24496E,#0D1E31)',
    ink: '#D3E6F6',
    motif:
      'radial-gradient(ellipse 70% 45% at 50% 0%,rgba(255,255,255,0.32),transparent 70%),repeating-linear-gradient(104deg,rgba(180,215,245,0.13) 0 1px,transparent 1px 9px)'
  },
  passion: {
    background: 'linear-gradient(180deg,#5C1F25,#22080B)',
    ink: '#F1C891',
    motif:
      'repeating-linear-gradient(0deg,rgba(0,0,0,0.22) 0 1px,transparent 1px 18px),radial-gradient(ellipse 90% 50% at 50% 100%,rgba(241,200,145,0.18),transparent 70%)'
  }
};

/** Rôles proches d'un habillage existant. */
const PLACE_THEME_ALIASES: Record<string, string> = {
  nativite: 'naissance',
  annonciation: 'enfance',
  visitation: 'bapteme',
  noces: 'ministere',
  croix: 'passion'
};

/** Ordre de repli quand le rôle du lieu n'a pas d'habillage propre. */
const PLACE_THEME_CYCLE = ['naissance', 'ministere', 'enfance', 'bapteme', 'passion'];

function placeTheme(role: string, index: number): PlaceTheme {
  const key = role
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  return (
    PLACE_THEMES[PLACE_THEME_ALIASES[key] ?? key] ??
    PLACE_THEMES[PLACE_THEME_CYCLE[index % PLACE_THEME_CYCLE.length]]
  );
}

/** Distance à vol d'oiseau entre deux lieux, en kilomètres (haversine). */
function distanceKm(a: FigurePlace, b: FigurePlace): number {
  const r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r;
  const dLng = (b.lng - a.lng) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

function coordinates(place: FigurePlace): string {
  const lat = `${Math.abs(place.lat).toFixed(2)}° ${place.lat >= 0 ? 'N' : 'S'}`;
  const lng = `${Math.abs(place.lng).toFixed(2)}° ${place.lng >= 0 ? 'E' : 'O'}`;
  return `${lat} · ${lng}`;
}

/** Espaces insécables de la typographie française devant : ; ! ? » et après «. */
function fr(text: string): string {
  return text.replace(/ ([:;!?»])/g, ' $1').replace(/« /g, '« ');
}

const FigureDetail: React.FC = () => {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const { figureId = '' } = useParams<{ figureId: string }>();
  const { figures } = useFigures();
  const figureDetails = useRemoteFigureDetails();
  const councils = useRemoteCouncils();
  const { isBookmarked, toggle } = useBookmarks();
  const [activeRef, setActiveRef] = useState<ScriptureRef | null>(null);
  const [activeCouncil, setActiveCouncil] = useState<Council | null>(null);
  const openSearch = useOpenSearch();
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [altIndex, setAltIndex] = useState(0);
  const [activeSection, setActiveSection] = useState(0);
  const [ink, setInk] = useState({ left: 10, width: 60 });
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null);

  const contentRef = useRef<HTMLIonContentElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const altRef = useRef<HTMLSpanElement>(null);
  const bookmarkRef = useRef<SVGSVGElement>(null);
  const chronoRef = useRef<HTMLDivElement>(null);
  const chronoLineRef = useRef<HTMLDivElement>(null);
  const placesRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; left: number; moved: boolean; pointerId: number } | null>(null);
  const justDraggedRef = useRef(false);

  const figure = figures.find((f) => f.id === figureId);
  const detail = figure ? figureDetails[figure.id] : undefined;

  const altNames = useMemo(() => {
    const names = (detail?.alternateNames ?? figure?.originalName ?? '')
      .split(' · ')
      .map((n) => n.trim())
      .filter(Boolean);
    return names.length > 0 ? names : [''];
  }, [detail?.alternateNames, figure?.originalName]);

  // Les autres noms défilent un à un sous le nom français.
  useEffect(() => {
    setAltIndex(0);
    if (altNames.length < 2 || reduced) return;
    const timer = window.setInterval(() => {
      setAltIndex((i) => (i + 1) % altNames.length);
      altRef.current?.animate(
        [
          { opacity: 0, transform: 'translateY(8px)', filter: 'blur(4px)' },
          { opacity: 1, transform: 'none', filter: 'blur(0)' }
        ],
        { duration: 700, easing: EASE }
      );
    }, 2800);
    return () => window.clearInterval(timer);
  }, [altNames, reduced]);

  // --- Sections (seules celles dont le contenu existe) ---------------------

  const sectionKeys: string[] = ['bref', 'vie'];
  if (detail?.timeline) sectionKeys.push('chronologie');
  sectionKeys.push('genealogie', 'lieux');
  if (detail?.churchTeaching) sectionKeys.push('doctrine');

  const SECTION_LABELS: Record<string, string> = {
    bref: 'En bref',
    vie: 'Vie',
    chronologie: 'Chronologie',
    genealogie: 'Généalogie',
    lieux: 'Lieux',
    doctrine: 'Doctrine'
  };
  // Numérotation romaine à partir de « Vie » (En bref n'est pas numéroté).
  const numberOf = (key: string) => ROMAN[sectionKeys.indexOf(key) - 1];

  // --- Défilement : apparition, parallaxe, barre compacte, onglet actif ----

  useEffect(() => {
    const root = pageRef.current;
    if (!root) return;
    const pending = [...root.querySelectorAll<HTMLElement>('[data-rv]:not(.is-revealed)')];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          el.style.setProperty('--rv-delay', `${(Number(el.dataset.rv) || 0) * 90}ms`);
          el.classList.add('is-revealed');
          observer.unobserve(el);
        });
      },
      { threshold: 0.15 }
    );
    pending.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [figureId, detail]);

  const moveInk = useCallback((index: number) => {
    const tabs = tabsRef.current;
    const el = tabs?.querySelectorAll<HTMLElement>('[data-tab]')[index];
    if (!tabs || !el) return;
    setInk({ left: el.offsetLeft + 10, width: el.offsetWidth - 20 });
    tabs.scrollTo({ left: el.offsetLeft - 60, behavior: isReducedMotion() ? 'auto' : 'smooth' });
  }, []);

  const activeSectionRef = useRef(0);
  const onScroll = useCallback(
    (scrollTop: number) => {
      const portrait = portraitRef.current;
      if (portrait && !reduced) {
        portrait.style.transform = `translateY(${(scrollTop * 0.3).toFixed(1)}px) scale(${Math.max(0.85, 1 - scrollTop * 0.0004).toFixed(3)})`;
        portrait.style.opacity = Math.max(0, 1 - scrollTop / 420).toFixed(3);
      }
      navRef.current?.classList.toggle('is-visible', scrollTop > 470);

      const line = chronoLineRef.current;
      const chrono = chronoRef.current;
      if (line && chrono) {
        const r = chrono.getBoundingClientRect();
        const mark = window.innerHeight * 0.6;
        line.style.height = `${Math.max(0, Math.min(r.height - 28, mark - r.top - 10))}px`;
      }

      let current = 0;
      pageRef.current?.querySelectorAll<HTMLElement>('[data-sec]').forEach((el) => {
        if (el.getBoundingClientRect().top < NAV_OFFSET + 60) current = Number(el.dataset.sec);
      });
      if (current !== activeSectionRef.current) {
        activeSectionRef.current = current;
        setActiveSection(current);
        moveInk(current);
      }
    },
    [reduced, moveInk]
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
    moveInk(0);
    return () => cancelAnimationFrame(scrollRaf.current);
  }, [onScroll, moveInk, figureId]);

  const goSection = async (index: number) => {
    tapHaptic();
    const content = contentRef.current;
    const el = pageRef.current?.querySelector<HTMLElement>(`[data-sec="${index}"]`);
    if (!content || !el) return;
    const scroller = await content.getScrollElement();
    const top = scroller.scrollTop + el.getBoundingClientRect().top - NAV_OFFSET;
    content.scrollToPoint(0, top, reduced ? 0 : 600);
  };

  const toTop = () => contentRef.current?.scrollToTop(reduced ? 0 : 500);

  // --- Lieux : carrousel des cartes ------------------------------------------

  const PLACES_PADDING = 24;

  const focusPlace = (placeId: string) => {
    const track = placesRef.current;
    const index = detail?.places?.findIndex((pl) => pl.id === placeId) ?? -1;
    const card = track?.querySelectorAll<HTMLElement>('[data-place]')[index];
    if (!track || !card) return;
    track.scrollTo({ left: card.offsetLeft - PLACES_PADDING, behavior: reduced ? 'auto' : 'smooth' });
  };

  /** Étape de la chronologie → section Lieux, carte du lieu mise en avant. */
  const showPlaceOf = (entry: TimelineEntry) => {
    if (!entry.placeId) return;
    setSelectedPlace(entry.placeId);
    void goSection(sectionKeys.indexOf('lieux'));
    window.setTimeout(() => focusPlace(entry.placeId!), 500);
  };

  // Glisser à la souris (cadre bureau) ; le tactile garde le défilement natif.
  const onPlacesPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || !placesRef.current) return;
    dragRef.current = { x: e.clientX, left: placesRef.current.scrollLeft, moved: false, pointerId: e.pointerId };
  };

  const onPlacesPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const track = placesRef.current;
    if (!drag || !track) return;
    const dx = e.clientX - drag.x;
    if (!drag.moved && Math.abs(dx) > 5) {
      drag.moved = true;
      track.classList.add('is-dragging');
      track.setPointerCapture(drag.pointerId);
    }
    if (drag.moved) track.scrollLeft = drag.left - dx;
  };

  const onPlacesPointerUp = () => {
    const drag = dragRef.current;
    const track = placesRef.current;
    dragRef.current = null;
    if (!drag?.moved || !track) return;
    track.classList.remove('is-dragging');
    justDraggedRef.current = true;
    window.setTimeout(() => {
      justDraggedRef.current = false;
    }, 50);
    const cards = [...track.querySelectorAll<HTMLElement>('[data-place]')];
    const nearest = cards.reduce((best, card) =>
      Math.abs(card.offsetLeft - PLACES_PADDING - track.scrollLeft) <
      Math.abs(best.offsetLeft - PLACES_PADDING - track.scrollLeft)
        ? card
        : best
    );
    track.scrollTo({ left: nearest.offsetLeft - PLACES_PADDING, behavior: isReducedMotion() ? 'auto' : 'smooth' });
  };

  if (!figure) {
    return (
      <IonPage>
        <IonContent fullscreen className="figure-detail-content">
          <header className="figure-detail-header">
            <button
              type="button"
              className="figure-detail-header-button"
              onClick={() => {
                tapHaptic();
                navigate(-1);
              }}
              aria-label="Retour"
            >
              <ChevronLeftIcon size={22} />
            </button>
          </header>
          <p className="figure-detail-not-found">Figure introuvable.</p>
          <WorldButton />
        </IonContent>
      </IonPage>
    );
  }

  const figureBookmarkKey = `figure:${figure.id}`;
  const saved = isBookmarked(figureBookmarkKey);
  const altName = altNames[altIndex % altNames.length];

  const reperes =
    detail?.reperes ??
    [
      { label: 'Époque', value: figure.epoque },
      { label: 'Testament', value: TESTAMENT_LABELS[figure.testament] },
      { label: 'Rôle', value: figure.role },
      { label: 'Date', value: figure.date },
      { label: 'Livres', value: figure.books.join(' · ') },
      { label: 'Occurrences', value: `${figure.mentions} mentions` }
    ];

  const pills = [figure.epoque, figure.role, `${figure.mentions} mentions`].filter(Boolean);

  const places = detail?.places ?? [];
  const hasPlaces = places.length > 0;
  const placeById = new Map(places.map((place) => [place.id, place]));

  const toggleSaved = () => {
    tapHaptic();
    toggle(figureBookmarkKey);
    if (!reduced) {
      bookmarkRef.current?.animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(1.5) rotate(-10deg)' }, { transform: 'scale(1)' }],
        { duration: 500, easing: EASE }
      );
    }
  };

  const openFigure = (id: string) => {
    tapHaptic();
    navigate(`/figures/${id}`);
  };

  const sectionHead = (key: string, light = false) => (
    <div className={`ff-section-head${light ? ' is-light' : ''}`}>
      <span className="ff-section-number" data-rv="0">
        {numberOf(key)}.
      </span>
      <h2 className="ff-section-title" data-rv="0">
        {SECTION_LABELS[key]}
      </h2>
    </div>
  );

  // La lettrine reprend la première lettre du premier paragraphe.
  const firstBiographySegment = detail?.biography?.[0]?.[0];
  const dropCap = firstBiographySegment?.type === 'text' ? firstBiographySegment.text.charAt(0) : '';

  return (
    <IonPage>
      {/* --- Barre compacte : nom et onglets des sections --- */}
      <div ref={navRef} className="ff-nav">
        <div className="ff-nav-top">
          <button type="button" className="ff-nav-back" onClick={toTop} aria-label="Remonter en haut de la fiche">
            <ChevronLeftIcon size={18} />
          </button>
          <p className="ff-nav-name">{figure.name}</p>
          <span />
        </div>
        <div ref={tabsRef} className="ff-nav-tabs">
          {sectionKeys.map((key, i) => (
            <button
              key={key}
              type="button"
              data-tab
              className={`ff-nav-tab${i === activeSection ? ' is-active' : ''}`}
              onClick={() => goSection(i)}
            >
              {SECTION_LABELS[key]}
            </button>
          ))}
          <span className="ff-nav-ink" style={{ left: ink.left, width: ink.width }} aria-hidden="true" />
        </div>
      </div>

      <IonContent
        ref={contentRef}
        fullscreen
        className="figure-detail-content"
        scrollEvents
        onIonScroll={handleIonScroll}
      >
        <div ref={pageRef} className={`ff${reduced ? ' is-reduced' : ''}`}>
          {/* --- Bandeau : portrait et noms --- */}
          <header className="ff-hero">
            <div className="ff-stars" aria-hidden="true">
              {STARS.map((s, i) => (
                <span
                  key={i}
                  style={{ left: s.left, top: s.top, animationDuration: s.duration, animationDelay: s.delay }}
                />
              ))}
            </div>

            <div className="ff-topbar">
              <button
                type="button"
                className="ff-round-button"
                onClick={() => {
                  tapHaptic();
                  navigate(-1);
                }}
                aria-label="Retour"
              >
                <ChevronLeftIcon size={18} />
              </button>
              <p className="ff-corpus">{TESTAMENT_LABELS[figure.testament]}</p>
              <div className="ff-topbar-side">
                <button
                  type="button"
                  className="ff-round-button"
                  onClick={() => {
                    tapHaptic();
                    openSearch('figures');
                  }}
                  aria-label="Rechercher"
                >
                  <SearchIcon size={15} />
                </button>
                <button
                  type="button"
                  className={`ff-round-button${saved ? ' is-saved' : ''}`}
                  onClick={toggleSaved}
                  aria-pressed={saved}
                  aria-label="Ajouter aux favoris"
                >
                  <svg ref={bookmarkRef} className="ff-bookmark" width="13" height="16" viewBox="0 0 15 18" fill="none" aria-hidden="true">
                    <path d="M1 1h13v16l-6.5-5L1 17V1z" />
                  </svg>
                </button>
              </div>
            </div>

            <div ref={portraitRef} className="ff-portrait" data-in style={{ '--i': 0 } as CSSProperties}>
              <div className="ff-portrait-glow" aria-hidden="true" />
              <div className="ff-portrait-ticks" aria-hidden="true" />
              <div className="ff-portrait-arch">
                <span className="ff-portrait-initial" aria-hidden="true">
                  {figure.name.charAt(0)}
                </span>
                {figure.image && <img src={figure.image} alt={figure.name} />}
              </div>
              <span className="ff-portrait-rule" aria-hidden="true" />
              {figure.image && (
                <button
                type="button"
                className="ff-portrait-zoom"
                onClick={() => {
                  tapHaptic();
                  setIsZoomOpen(true);
                }}
                aria-label={`Agrandir l'image : ${figure.name}`}
              >
                <ZoomIcon size={17} />
                </button>
              )}
            </div>
            {/* Sans illustration (figure ajoutée avant son portrait) : initiale
                seule, ni zoom ni crédit d'artiste. */}
            {figure.image && (
            <PhotoSlider
              images={[{ key: figure.image, src: figure.image }]}
              visible={isZoomOpen}
              onClose={() => setIsZoomOpen(false)}
              bannerVisible={false}
              maskOpacity={0.92}
            />
            )}

            {figure.image && (
            <div className="ff-credit">
              <span className="ff-credit-rule ff-credit-rule--left" aria-hidden="true" />
              <span className="ff-credit-text">
                <span className="ff-credit-kicker">Artwork by</span>
                <a href={ARTIST_SHOP_URL} target="_blank" rel="noopener noreferrer" className="ff-credit-link">
                  {ARTIST_NAME}
                  <ExternalArrowIcon />
                </a>
              </span>
              <span className="ff-credit-rule ff-credit-rule--right" aria-hidden="true" />
            </div>
            )}

            <div className="ff-identity">
              <h1 className="ff-name" data-in style={{ '--i': 1 } as CSSProperties}>
                {figure.name}
              </h1>
              {altName && (
                <div className="ff-altname" data-in style={{ '--i': 2 } as CSSProperties}>
                  {scriptLabel(altName) && <span className="ff-altname-script">{scriptLabel(altName)}</span>}
                  <span ref={altRef} className="ff-altname-text">
                    {altName}
                  </span>
                </div>
              )}
              <div className="ff-pills" data-in style={{ '--i': 3 } as CSSProperties}>
                {pills.map((p) => (
                  <span key={p} className="ff-pill">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </header>

          {/* --- En bref --- */}
          <section className="ff-brief" data-sec="0">
            <p className="ff-kicker" data-rv="0">
              En bref
            </p>
            <div className="ff-facts">
              {reperes.map((r) => (
                <div className="ff-fact" key={r.label} data-rv="0">
                  <span className="ff-fact-key">{r.label}</span>
                  <span className="ff-fact-value">{fr(r.value)}</span>
                </div>
              ))}
            </div>
          </section>

          {/* --- Vie --- */}
          <section className="ff-section ff-life" data-sec={sectionKeys.indexOf('vie')}>
            {sectionHead('vie')}
            <div className="ff-life-text">
              {detail?.biography ? (
                detail.biography.map((paragraph, i) => (
                  <p className="ff-paragraph" key={i} data-rv="0">
                    {i === 0 && dropCap && <span className="ff-drop-cap">{dropCap}</span>}
                    {paragraph.map((segment, j) =>
                      segment.type === 'text' ? (
                        <span key={j}>{fr(i === 0 && j === 0 && dropCap ? segment.text.slice(1) : segment.text)}</span>
                      ) : (
                        <button
                          key={j}
                          type="button"
                          className="ff-ref-chip"
                          onClick={() => {
                            tapHaptic();
                            setActiveRef(segment.ref);
                          }}
                        >
                          {segment.ref.display} <ExternalArrowIcon />
                        </button>
                      )
                    )}
                  </p>
                ))
              ) : (
                <p className="ff-placeholder-note" data-rv="0">
                  Cette fiche est en cours de rédaction.
                </p>
              )}
            </div>
          </section>

          {/* --- Chronologie --- */}
          {detail?.timeline && (
            <section className="ff-section ff-chrono" data-sec={sectionKeys.indexOf('chronologie')}>
              {sectionHead('chronologie')}
              {hasPlaces && detail.timeline.some((entry) => entry.placeId) && (
                <p className="ff-chrono-hint" data-rv="1">
                  Touche une étape pour voir le lieu.
                </p>
              )}
              <div ref={chronoRef} className="ff-chrono-list">
                <div className="ff-chrono-track" aria-hidden="true" />
                <div ref={chronoLineRef} className="ff-chrono-progress" aria-hidden="true" />
                {detail.timeline.map((entry, i) => {
                  const place = entry.placeId ? placeById.get(entry.placeId) : undefined;
                  const content = (
                    <>
                      <span className="ff-chrono-year">{shortYear(entry)}</span>
                      <span className="ff-chrono-node" aria-hidden="true" />
                      <span className="ff-chrono-date">
                        {entry.dateLabel}
                        {place ? ` · ${place.name}` : ''}
                      </span>
                      <span className="ff-chrono-text">{fr(entry.text)}</span>
                    </>
                  );
                  return place ? (
                    <button
                      type="button"
                      className={`ff-chrono-entry is-linked${selectedPlace === place.id ? ' is-selected' : ''}`}
                      key={i}
                      data-rv="0"
                      onClick={() => showPlaceOf(entry)}
                    >
                      {content}
                    </button>
                  ) : (
                    <div className="ff-chrono-entry" key={i} data-rv="0">
                      {content}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* --- Généalogie (arbre inchangé) --- */}
          <section className="ff-section ff-genealogy" data-sec={sectionKeys.indexOf('genealogie')}>
            {sectionHead('genealogie')}
            <div className="ff-genealogy-body">
              {hasGenealogy(figure.id) ? (
                <FamilyTree figureId={figure.id} figures={figures} />
              ) : (
                <div className="figure-detail-placeholder-box">
                  <TreeIcon />
                  <p className="figure-detail-placeholder-label">L'Écriture ne nomme pas sa famille</p>
                </div>
              )}
            </div>
          </section>

          {/* --- Lieux --- */}
          <section className="ff-section ff-places" data-sec={sectionKeys.indexOf('lieux')}>
            {sectionHead('lieux', true)}
            {detail?.locationsSummary && (
              <p className="ff-places-summary" data-rv="1">
                {fr(detail.locationsSummary)}
              </p>
            )}
            {hasPlaces ? (
              <div
                ref={placesRef}
                className="ff-places-track"
                data-rv="2"
                onPointerDown={onPlacesPointerDown}
                onPointerMove={onPlacesPointerMove}
                onPointerUp={onPlacesPointerUp}
                onPointerCancel={onPlacesPointerUp}
                onClickCapture={(e) => {
                  if (!justDraggedRef.current) return;
                  e.stopPropagation();
                  e.preventDefault();
                }}
              >
                {places.map((place, i) => {
                  const theme = placeTheme(place.role, i);
                  const next = places[i + 1];
                  const isSelected = selectedPlace === place.id;
                  return (
                    <div className="ff-place" key={place.id} data-place style={{ '--i': i } as CSSProperties}>
                      <button
                        type="button"
                        className={`ff-place-card${isSelected ? ' is-selected' : ''}`}
                        style={{ background: theme.background, '--place-ink': theme.ink } as CSSProperties}
                        onClick={() => {
                          tapHaptic();
                          setSelectedPlace(isSelected ? null : place.id);
                        }}
                        aria-pressed={isSelected}
                      >
                        <span className="ff-place-motif" style={{ background: theme.motif }} aria-hidden="true" />
                        <span className="ff-place-body">
                          <span className="ff-place-number">{String(i + 1).padStart(2, '0')}</span>
                          <span className="ff-place-rule" aria-hidden="true" />
                          <span className="ff-place-name">{place.name}</span>
                          <span className="ff-place-region">{place.region}</span>
                          <span className="ff-place-role">{place.role}</span>
                          <span className="ff-place-coords">{coordinates(place)}</span>
                        </span>
                        <span className="ff-place-frame" aria-hidden="true" />
                      </button>
                      {next && (
                        <span className="ff-place-leg" aria-label={`Environ ${Math.round(distanceKm(place, next))} km jusqu'à ${next.name}`}>
                          <span className="ff-place-leg-km">≈ {Math.round(distanceKm(place, next))}</span>
                          <span className="ff-place-leg-arrow" aria-hidden="true" />
                          <span className="ff-place-leg-unit" aria-hidden="true">
                            km
                          </span>
                        </span>
                      )}
                    </div>
                  );
                })}
                <span className="ff-places-end" aria-hidden="true" />
              </div>
            ) : (
              <div className="ff-places-card" data-rv="2">
                <span className="ff-places-card-rule" aria-hidden="true" />
                <CompassIcon className="ff-places-card-icon" />
                <span className="ff-places-card-kicker">Carte · à venir</span>
                <p className="ff-places-card-text">
                  {detail?.regionLabel ? `${detail.regionLabel}. ` : ''}
                  Cette carte n'est pas encore disponible, nous y travaillons.
                </p>
              </div>
            )}
          </section>

          {/* --- Doctrine --- */}
          {detail?.churchTeaching && (
            <section className="ff-section ff-doctrine" data-sec={sectionKeys.indexOf('doctrine')}>
              {sectionHead('doctrine')}
              <div className="ff-doctrine-card" data-rv="1">
                <LatinCrossIcon size={130} outline className="ff-doctrine-watermark" />
                <p className="ff-doctrine-text">{fr(detail.churchTeaching.text)}</p>
                <div className="ff-doctrine-refs">
                  {detail.churchTeaching.councilIds.map((id) => {
                    const council = councils.find((c) => c.id === id);
                    if (!council) return null;
                    return (
                      <button
                        type="button"
                        className="ff-doctrine-ref"
                        key={id}
                        onClick={() => {
                          tapHaptic();
                          setActiveCouncil(council);
                        }}
                      >
                        {council.display} <ExternalArrowIcon />
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* --- Figures liées --- */}
          {detail?.relatedFigures && (
            <section className="ff-related">
              <p className="ff-kicker ff-related-kicker" data-rv="0">
                Figures liées
              </p>
              <div className="ff-related-list">
                {detail.relatedFigures.map((related, i) => {
                  const relatedFigure = figures.find((f) => f.id === related.figureId);
                  if (!relatedFigure) return null;
                  return (
                    <button
                      type="button"
                      className="ff-related-card"
                      key={related.figureId}
                      onClick={() => openFigure(related.figureId)}
                    >
                      <span
                        className="ff-related-arch"
                        style={{ background: RELATED_BACKGROUNDS[i % RELATED_BACKGROUNDS.length] }}
                      >
                        <span className="ff-related-glow" aria-hidden="true" />
                        {relatedFigure.image ? (
                          <img src={relatedFigure.image} alt="" />
                        ) : (
                          <span className="ff-related-initial">{relatedFigure.name.charAt(0)}</span>
                        )}
                      </span>
                      <span className="ff-related-name">{relatedFigure.name}</span>
                      <span className="ff-related-role">{related.relation}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          <footer className="ff-footer">
            <p className="ff-footer-motto">Lux Scripturae · Fides Ecclesiae</p>
            <p className="ff-footer-source">Citations · Bible Crampon, 1923</p>
          </footer>
        </div>

        <AnimatePresence>
          {activeRef && <VersePreviewSheet refData={activeRef} onClose={() => setActiveRef(null)} />}
        </AnimatePresence>
        <AnimatePresence>
          {activeCouncil && (
            <CouncilPreviewSheet council={activeCouncil} onClose={() => setActiveCouncil(null)} />
          )}
        </AnimatePresence>
        <WorldButton />
      </IonContent>
    </IonPage>
  );
};

export default FigureDetail;
