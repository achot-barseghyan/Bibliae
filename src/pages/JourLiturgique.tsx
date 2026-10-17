import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IonContent, IonPage } from '@ionic/react';
import { AnimatePresence } from 'framer-motion';
import { useLiturgicalDay } from '../hooks/useLiturgicalDay';
import { useLiturgicalMonth } from '../hooks/useLiturgicalMonth';
import { useBookmarks } from '../hooks/useBookmarks';
import { useElementWidth } from '../hooks/useElementWidth';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { liturgicalYear } from '../services/liturgicalFeasts';
import { todayIso, shiftIsoDate, type LiturgicalItem, type OrdoData } from '../services/liturgicalCalendar';
import { MYSTERY_SETS, mysterySetForToday } from '../data/rosary';
import {
  ChevronLeftIcon,
  CalendarIcon,
  MusicNoteIcon,
  LatinCrossIcon,
  AirplaneIcon,
  RefreshIcon,
  SparkleIcon,
  AccessibilityIcon
} from '../components/nav/icons';
import AccessibilityQuickSheet from '../components/AccessibilityQuickSheet';
import { tapHaptic } from '../utils/haptics';
import './JourLiturgique.css';
import WorldButton from '../components/nav/WorldButton';
import { HOUR_LABELS, LITURGICAL_COLORS, formatOrdinals, htmlParagraphs, longDateLabel, stripHtml } from './liturgie/liturgyText';

const EASE = 'cubic-bezier(.2,.7,.2,1)';

/** Halo coloré du ciel, selon la couleur du jour. */
const SEASON_TINTS: Record<string, string> = {
  vert: '#3E5A2E',
  blanc: '#8A7A52',
  or: '#8A6A20',
  violet: '#4A3A6B',
  rouge: '#7A2420',
  rose: '#8A5A66',
  noir: '#2A2622'
};

/** Points de la semaine sur fond nuit : un vert plus clair pour rester lisible. */
const WEEK_DOT_COLORS: Record<string, string> = { ...LITURGICAL_COLORS, vert: '#7E8B52' };

const WEEKDAY_SHORT = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'];

/** Cadran des heures : maquette sur 340 × 196, réduite sur les petits écrans. */
const DIAL_WIDTH = 340;
const DIAL_HEIGHT = 196;

const SKELETON = [
  { h: 14, w: '40%' },
  { h: 90, w: '100%' },
  { h: 22, w: '55%' },
  { h: 120, w: '100%' },
  { h: 160, w: '100%' }
];

/** Ciel étoilé : positions pseudo-aléatoires mais stables. */
const STARS = (() => {
  let seed = 31;
  const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  return Array.from({ length: 30 }, () => ({
    left: `${(rnd() * 100).toFixed(1)}%`,
    top: `${(rnd() * 60).toFixed(1)}%`,
    duration: `${(2 + rnd() * 3).toFixed(2)}s`,
    delay: `${(-rnd() * 4).toFixed(2)}s`
  }));
})();

const READING_GLYPH: Record<string, string> = {
  reading: 'I',
  first_reading: 'I',
  second_reading: 'II',
  introit: 'In.',
  gradual: 'Gr.',
  offertory: 'Off.',
  secret: 'Sec.',
  communion: 'Com.',
  postcommunion: 'P.C.',
  collect: '✦'
};

const HOUR_ORDER = ['matins', 'lauds', 'prime', 'terce', 'sext', 'none', 'vespers', 'compline'];
/** Article devant le nom de l'heure (« Prier les laudes », « Prier Tierce »). */
const HOUR_ARTICLES: Record<string, string> = {
  matins: 'les ',
  lauds: 'les ',
  prime: '',
  terce: '',
  sext: '',
  none: '',
  vespers: 'les ',
  compline: 'les '
};
// Plage horaire approximative de chaque heure canoniale, pour repérer
// "l'heure en cours" (indicatif — pas de règle liturgique stricte ici).
const HOUR_TIME_ORDER: string[][] = [
  ['matins', 'lauds'],
  ['lauds', 'prime', 'terce'],
  ['terce', 'sext'],
  ['sext', 'none'],
  ['none', 'vespers'],
  ['vespers', 'compline'],
  ['compline', 'matins']
];

function excerptOf(html: string): string {
  const text = stripHtml(html)
    .replace(/V\/\s?/g, '℣ ')
    .replace(/R\/\s?/g, '℟ ')
    .replace(/^(En ce temps-là|Frères et sœurs|Frères|Lecture[^:]*:)\s*,?\s*/i, '')
    .replace(/[–-]\s*(Acclamons|Parole du Seigneur|Parole de Dieu).*$/i, '')
    .trim();
  const firstSentence = text.match(/^[^.!?»]+[.!?»]?/)?.[0]?.trim() ?? text;
  if (firstSentence.length <= 130) return firstSentence;
  const truncated = firstSentence.slice(0, 130);
  const lastSpace = truncated.lastIndexOf(' ');
  return `${truncated.slice(0, lastSpace > 0 ? lastSpace : 130).trimEnd()}…`;
}

/** Rang du jour pour le point de la bande de semaine : doré pour une
 * fête/solennité (un dimanche compte comme tel, `degreeKey` vaut alors
 * `null`), vert pour une férie ou une mémoire. */
function dayRank(degreeKey: string | null): 'gold' | 'green' {
  return degreeKey === null || degreeKey === 'fete' || degreeKey === 'solennite' ? 'gold' : 'green';
}

/** "relevé aujourd'hui, 19 h 40" / "relevé hier, 19 h 40" / "relevé le 3 sept., 19 h 40" */
function cachedAtLabel(cachedAt: string): string {
  const cached = new Date(cachedAt);
  const time = cached.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', ' h ');
  const diffDays = Math.floor((Date.now() - cached.getTime()) / 86400000);
  if (diffDays <= 0) return `relevé aujourd'hui, ${time}`;
  if (diffDays === 1) return `relevé hier, ${time}`;
  const day = cached.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  return `relevé le ${day}, ${time}`;
}

function weekStart(date: string): Date {
  const d = new Date(`${date}T12:00:00`);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1);
  return d;
}

function toIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function availableHours(offices: Record<string, LiturgicalItem[]>): string[] {
  return HOUR_ORDER.filter((h) => (offices[h]?.length ?? 0) > 0);
}

function currentHourKey(hours: string[]): string | null {
  if (hours.length === 0) return null;
  const slot = HOUR_TIME_ORDER[Math.min(6, Math.floor(new Date().getHours() / 3.5))] ?? [];
  return slot.find((h) => hours.includes(h)) ?? hours[0];
}

const JourLiturgique: React.FC = () => {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  // Le paramètre d'URL ne sert qu'à choisir la date d'ouverture (lien
  // profond depuis un favori) : changer de jour ensuite ne touche plus à
  // l'URL, pour rester sur une seule et même page plutôt que d'empiler des
  // écrans dans l'historique de navigation.
  const { date: dateParam } = useParams<{ date?: string }>();
  const [date, setDate] = useState(() => dateParam ?? todayIso());
  const [ordo, setOrdo] = useState<'nom' | 'vom'>('nom');
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [isA11yOpen, setIsA11yOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState<string | null>(null);
  const { feast, isLoading, isStale, cachedAt, retry } = useLiturgicalDay(date);
  const { isBookmarked, toggle } = useBookmarks();

  const active: OrdoData | null = feast ? (ordo === 'vom' && feast.vom ? feast.vom : feast) : null;

  // La semaine peut chevaucher deux mois : on charge les deux calendriers.
  const weekDates = useMemo(() => {
    const start = weekStart(date);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [date]);
  const firstMonth = useLiturgicalMonth(toIso(weekDates[0]).slice(0, 7));
  const lastMonth = useLiturgicalMonth(toIso(weekDates[6]).slice(0, 7));
  const monthByDate = useMemo(
    () => new Map([...firstMonth, ...lastMonth].map((e) => [e.date, e])),
    [firstMonth, lastMonth]
  );

  const weekDays = weekDates.map((d, i) => {
    const iso = toIso(d);
    const entry = monthByDate.get(iso);
    return {
      iso,
      letter: WEEKDAY_SHORT[i],
      day: d.getDate(),
      color: entry?.color,
      rank: entry ? dayRank(entry.degreeKey) : undefined
    };
  });

  const dayDate = new Date(`${date}T12:00:00`);
  const year = useMemo(() => liturgicalYear(new Date(`${date}T12:00:00`)), [date]);
  const yearDegrees = (year.dayIndex / year.length) * 360;
  const seasonArcs = useMemo(() => {
    let acc = 0;
    return year.seasons.map((s) => {
      const from = acc;
      acc += s.days;
      const start = (from / year.length) * 360;
      const sweep = (s.days / year.length) * 360;
      return { ...s, start, sweep, isCurrent: year.dayIndex >= from && year.dayIndex < acc };
    });
  }, [year]);

  const bookmarkKey = `liturgie:${date}`;
  const saved = isBookmarked(bookmarkKey);
  const mysterySet = mysterySetForToday(dayDate);

  const hours = useMemo(() => (active ? availableHours(active.offices) : []), [active]);
  const nowHour = useMemo(() => (date === todayIso() ? currentHourKey(hours) : null), [hours, date]);
  const hour = selectedHour && hours.includes(selectedHour) ? selectedHour : (nowHour ?? hours[0] ?? null);
  const hourIndex = hour ? hours.indexOf(hour) : 0;
  const hourStep = hours.length > 1 ? 180 / (hours.length - 1) : 0;
  const hourPreview = hour
    ? (active?.offices[hour]?.find((i) => i.key === 'short_reading' || i.key === 'lecture') ?? active?.offices[hour]?.[0])
    : undefined;

  const colorKey = active?.color ?? 'vert';
  const tint = SEASON_TINTS[colorKey] ?? SEASON_TINTS.vert;
  const dayColor = LITURGICAL_COLORS[colorKey] ?? LITURGICAL_COLORS.vert;
  const subtitle = active ? [active.rank, active.line].filter(Boolean).join(' · ') : '';

  const gospelIndex = active ? active.mass.findIndex((m) => m.key === 'gospel') : -1;
  const gospel = gospelIndex >= 0 ? active!.mass[gospelIndex] : null;
  const gospelWords = useMemo(() => (gospel ? `« ${excerptOf(gospel.text)} »`.split(' ') : []), [gospel]);

  const prevDate = shiftIsoDate(date, -1);
  const nextDate = shiftIsoDate(date, 1);
  const shortDayLabel = (iso: string) => {
    const label = new Date(`${iso}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric' });
    return label.charAt(0).toUpperCase() + label.slice(1);
  };

  const changeDate = (iso: string) => {
    if (iso === date) return;
    tapHaptic();
    setDate(iso);
    setIsDescExpanded(false);
    setSelectedHour(null);
  };

  // La messe et chaque heure s'ouvrent comme une page à part entière (avec
  // sa propre adresse) plutôt qu'en surimpression : si le système recharge
  // l'app pendant qu'on est passé dans une autre (musique...), on revient
  // ainsi sur la lecture en cours et pas sur le jour liturgique.
  const openPart = (part: string, index = 0) => {
    tapHaptic();
    const params = new URLSearchParams();
    if (index > 0) params.set('onglet', String(index));
    if (ordo === 'vom') params.set('ordo', 'vom');
    const query = params.toString();
    navigate(`/liturgie/${date}/${part}${query ? `?${query}` : ''}`);
  };

  const openReading = (index: number) => openPart('messe', index);

  const openHour = (hourKey: string | null) => {
    if (!hourKey || (active?.offices[hourKey]?.length ?? 0) === 0) return;
    openPart(hourKey);
  };

  // --- Animations : apparition, frise de la messe, lecture de l'Évangile ---

  const pageRef = useRef<HTMLDivElement>(null);
  const dayNumRef = useRef<HTMLDivElement>(null);
  const idRef = useRef<HTMLDivElement>(null);
  const hourNameRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<SVGSVGElement>(null);
  const massLineRef = useRef<HTMLDivElement>(null);
  const gospelRef = useRef<HTMLDivElement>(null);
  const [dialRef, dialWidth] = useElementWidth<HTMLDivElement>(DIAL_WIDTH);
  const dialScale = Math.min(1, dialWidth / DIAL_WIDTH);

  const hasContent = Boolean(active);
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
    // Sur `active` et non sur `date` : les données du nouveau jour arrivent
    // après le changement de date, avec parfois d'autres parties (2ᵉ lecture
    // le dimanche) qui resteraient sinon invisibles.
  }, [active, hours.length]);

  // Changement de jour : le numéro et le titre se redessinent.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (reduced) return;
    dayNumRef.current?.animate(
      [
        { opacity: 0, transform: 'translateY(20px) scale(.9)', filter: 'blur(6px)' },
        { opacity: 1, transform: 'none', filter: 'blur(0)' }
      ],
      { duration: 800, easing: EASE }
    );
    idRef.current?.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], {
      duration: 700,
      easing: EASE
    });
  }, [date, reduced]);

  const onScroll = useCallback(() => {
    const mark = window.innerHeight * 0.62;
    const line = massLineRef.current;
    if (line?.parentElement) {
      const wrap = line.parentElement.getBoundingClientRect();
      line.style.height = `${Math.max(0, Math.min(wrap.height - 74, mark - wrap.top - 14))}px`;
    }
    const g = gospelRef.current;
    if (g) {
      const r = g.getBoundingClientRect();
      const q = Math.max(0, Math.min(1, (window.innerHeight * 0.8 - r.top) / (r.height * 0.7)));
      const words = g.querySelectorAll<HTMLElement>('[data-gw]');
      words.forEach((w, i) => w.classList.toggle('is-read', reduced || i / words.length < q));
    }
  }, [reduced]);

  const scrollRaf = useRef(0);
  const handleIonScroll = () => {
    if (scrollRaf.current) return;
    scrollRaf.current = requestAnimationFrame(() => {
      scrollRaf.current = 0;
      onScroll();
    });
  };

  useEffect(() => {
    onScroll();
    return () => cancelAnimationFrame(scrollRaf.current);
  }, [onScroll, gospelWords, hasContent]);

  const pickHour = (h: string) => {
    if (h === hour) {
      openHour(h);
      return;
    }
    tapHaptic();
    setSelectedHour(h);
    if (!reduced) {
      hourNameRef.current?.animate(
        [
          { opacity: 0, transform: 'translateY(10px)', filter: 'blur(4px)' },
          { opacity: 1, transform: 'none', filter: 'blur(0)' }
        ],
        { duration: 600, easing: EASE }
      );
    }
  };

  const toggleSaved = () => {
    tapHaptic();
    toggle(bookmarkKey);
    if (!reduced) {
      markRef.current?.animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(1.4) rotate(-8deg)' }, { transform: 'scale(1)' }],
        { duration: 500, easing: EASE }
      );
    }
  };

  const hourArticle = hour ? HOUR_ARTICLES[hour] : '';
  const hourLabel = hour ? (HOUR_LABELS[hour] ?? hour) : '';

  return (
    <IonPage>
      <IonContent fullscreen className="jour-liturgique-content" scrollEvents onIonScroll={handleIonScroll}>
        <div
          ref={pageRef}
          className={`jl${reduced ? ' is-reduced' : ''}`}
          style={{ '--jl-tint': tint, '--jl-day': dayColor } as CSSProperties}
        >
          {/* --- Ciel du jour --- */}
          <header className="jl-sky">
            <div className="jl-sky-tint" aria-hidden="true" />
            <div className="jl-stars" aria-hidden="true">
              {STARS.map((s, i) => (
                <span
                  key={i}
                  style={{ left: s.left, top: s.top, animationDuration: s.duration, animationDelay: s.delay }}
                />
              ))}
            </div>

            <div className="jl-topbar">
              <button
                type="button"
                className="jl-round-button"
                onClick={() => {
                  tapHaptic();
                  navigate(-1);
                }}
                aria-label="Retour"
              >
                <ChevronLeftIcon size={18} />
              </button>
              <p className="jl-topbar-title">Le jour</p>
              <div className="jl-topbar-side">
                <button
                  type="button"
                  className={`jl-round-button${isA11yOpen ? ' is-active' : ''}`}
                  onClick={() => setIsA11yOpen(true)}
                  aria-label="Accessibilité et lecture"
                  aria-haspopup="dialog"
                  aria-expanded={isA11yOpen}
                >
                  <AccessibilityIcon size={17} />
                </button>
                <button
                  type="button"
                  className="jl-round-button"
                  onClick={() => changeDate(todayIso())}
                  aria-label="Revenir à aujourd'hui"
                >
                  <CalendarIcon size={16} />
                </button>
              </div>
            </div>

            <div className="jl-rite" data-in style={{ '--i': 0 } as CSSProperties}>
              <span className={`jl-rite-thumb${ordo === 'vom' ? ' is-right' : ''}`} aria-hidden="true" />
              <button
                type="button"
                className={`jl-rite-option${ordo === 'nom' ? ' is-active' : ''}`}
                aria-pressed={ordo === 'nom'}
                onClick={() => setOrdo('nom')}
              >
                Ordinaire
              </button>
              <button
                type="button"
                className={`jl-rite-option${ordo === 'vom' ? ' is-active' : ''}`}
                aria-pressed={ordo === 'vom'}
                onClick={() => setOrdo('vom')}
                disabled={Boolean(feast) && !feast?.vom}
              >
                Traditionnel
              </button>
            </div>

            {/* Roue de l'année liturgique */}
            <div className="jl-wheel" data-in style={{ '--i': 1 } as CSSProperties}>
              <div className="jl-wheel-glow" aria-hidden="true" />
              <svg width="280" height="280" viewBox="0 0 280 280" className="jl-wheel-svg" aria-hidden="true">
                <circle cx="140" cy="140" r="128" className="jl-wheel-guide" />
                <circle cx="140" cy="140" r="98" className="jl-wheel-guide" />
                {seasonArcs.map((s, i) => (
                  <circle
                    key={s.key}
                    cx="140"
                    cy="140"
                    r="113"
                    className="jl-wheel-arc"
                    stroke={LITURGICAL_COLORS[s.color]}
                    strokeWidth={s.isCurrent ? 7 : 3.5}
                    pathLength={360}
                    strokeDasharray={`${Math.max(0, s.sweep - 1.2).toFixed(2)} 360`}
                    strokeDashoffset={(-s.start).toFixed(2)}
                    transform="rotate(-90 140 140)"
                    style={{ '--i': i } as CSSProperties}
                  />
                ))}
              </svg>
              {seasonArcs
                .filter((s) => s.key !== 'noel' && s.key !== 'ordinaire-1')
                .map((s) => {
                  const a = ((s.start + s.sweep / 2 - 90) * Math.PI) / 180;
                  return (
                    <span
                      key={s.key}
                      className="jl-wheel-label"
                      style={{ left: 140 + 138 * Math.cos(a), top: 140 + 138 * Math.sin(a) }}
                      aria-hidden="true"
                    >
                      {s.label}
                    </span>
                  );
                })}
              <div className="jl-wheel-marker" style={{ transform: `rotate(${yearDegrees.toFixed(1)}deg)` }} aria-hidden="true">
                <span className="jl-wheel-marker-ray" />
                <span className="jl-wheel-marker-dot" />
              </div>
              <div className="jl-wheel-center">
                <div ref={dayNumRef} className="jl-wheel-day">
                  {dayDate.getDate()}
                </div>
                <div className="jl-wheel-month">{dayDate.toLocaleDateString('fr-FR', { month: 'long' })}</div>
                <div className="jl-wheel-year">
                  Année {year.sundayCycle} · {year.weekdayCycle}
                </div>
              </div>
            </div>

            <div ref={idRef} className="jl-identity">
              <p className="jl-date-line">
                <span className="jl-date-dot" aria-hidden="true" />
                {longDateLabel(date)}
                {active ? ` · ${active.color}` : ''}
              </p>
              <h1 className="jl-title">{active ? formatOrdinals(active.name) : isLoading ? ' ' : 'Jour liturgique'}</h1>
              {subtitle && <p className="jl-subtitle">{subtitle}</p>}
            </div>

            {/* Semaine */}
            <div className="jl-week">
              <div className="jl-week-bars">
                {weekDays.map((d) => {
                  const isActive = d.iso === date;
                  return (
                    <button
                      key={d.iso}
                      type="button"
                      className={`jl-week-day${isActive ? ' is-active' : ''}`}
                      onClick={() => changeDate(d.iso)}
                      aria-pressed={isActive}
                      aria-label={longDateLabel(d.iso)}
                    >
                      <span
                        className={`jl-week-dot${d.rank === 'gold' ? ' is-feast' : ''}`}
                        style={
                          d.rank === 'green' && d.color
                            ? { background: isActive ? LITURGICAL_COLORS[d.color] : WEEK_DOT_COLORS[d.color] }
                            : d.rank ? undefined : { visibility: 'hidden' }
                        }
                        aria-hidden="true"
                      />
                      <span className="jl-week-number">{d.day}</span>
                      <span className="jl-week-letter">{d.letter}</span>
                    </button>
                  );
                })}
              </div>
              <div className="jl-week-legend">
                <span>
                  <span className="jl-week-dot" style={{ background: WEEK_DOT_COLORS.vert }} aria-hidden="true" />
                  Férie ou mémoire
                </span>
                <span>
                  <span className="jl-week-dot is-feast" aria-hidden="true" />
                  Fête ou solennité
                </span>
              </div>
            </div>
          </header>

          <AnimatePresence>
            {isA11yOpen && <AccessibilityQuickSheet onClose={() => setIsA11yOpen(false)} />}
          </AnimatePresence>

          {isStale && feast && (
            <div className="jour-offline-banner">
              <span className="jour-offline-banner-label">
                <AirplaneIcon size={13} />
                Hors ligne
              </span>
              {cachedAt && <span className="jour-offline-banner-time">{cachedAtLabel(cachedAt)}</span>}
            </div>
          )}

          {isLoading && !feast && (
            <div className="jl-skeleton" aria-busy="true" aria-label="Chargement des lectures du jour">
              {SKELETON.map((s, i) => (
                <span key={i} style={{ height: s.h, width: s.w }} />
              ))}
              <p>Lectures du jour · AELF</p>
            </div>
          )}

          {isStale && !feast && !isLoading && (
            <div className="jour-offline-empty">
              <span className="jour-offline-empty-icon" aria-hidden="true">
                <SparkleIcon size={22} />
              </span>
              <p className="jour-offline-empty-kicker">Hors ligne</p>
              <h2 className="jour-offline-empty-title">Le jour n'a pas pu être relevé</h2>
              <div className="jour-divider" aria-hidden="true" />
              <p className="jour-prose">
                Le calendrier liturgique se charge depuis Internet. Rien n'a encore été conservé sur cet
                appareil pour cette date.
              </p>
              <p className="jour-offline-empty-note">La Bible, les prières et vos notes restent accessibles.</p>
              <div className="jour-offline-empty-actions">
                <button type="button" className="jour-gospel-button" onClick={retry}>
                  <RefreshIcon size={14} />
                  Réessayer
                </button>
                <button type="button" className="jour-offline-empty-secondary" onClick={() => navigate('/bible')}>
                  Ouvrir la Bible
                </button>
              </div>
              <p className="jour-offline-empty-quote">
                « Il est bon d'attendre en silence la délivrance du Seigneur. »
                <span className="jour-offline-empty-quote-ref">Lm 3, 26</span>
              </p>
            </div>
          )}

          {feast && active && (
            <>
              {isStale && (
                <div className="jour-offline-notice">
                  <p className="jour-offline-notice-kicker">Conservé sur l'appareil</p>
                  <p className="jour-offline-notice-text">
                    Le jour, la messe et l'office ont été relevés avant la coupure. Vous pouvez les lire
                    entièrement.
                  </p>
                  <button type="button" className="jour-offline-notice-retry" onClick={retry}>
                    <RefreshIcon size={13} />
                    Réessayer
                  </button>
                </div>
              )}

              {/* --- Ce que l'Église célèbre --- */}
              {(active.description || active.excerpt) && (
                <section className="jl-celebrate">
                  <p className="jl-kicker" data-rv="0">
                    Ce que l'Église célèbre
                  </p>
                  {isDescExpanded && active.description ? (
                    htmlParagraphs(active.description).map((p, i) => (
                      <p className="jl-celebrate-text" key={i}>
                        {p}
                      </p>
                    ))
                  ) : (
                    <p className="jl-celebrate-text jl-celebrate-text--lead" data-rv="1">
                      {active.excerpt && (
                        <>
                          <span className="jl-drop-cap">{active.excerpt.charAt(0)}</span>
                          {active.excerpt.slice(1)}
                        </>
                      )}
                    </p>
                  )}
                  {active.description && active.description !== active.excerpt && (
                    <button
                      type="button"
                      className="jl-more"
                      data-rv="2"
                      onClick={() => setIsDescExpanded((v) => !v)}
                      aria-expanded={isDescExpanded}
                    >
                      {isDescExpanded ? 'Réduire' : 'Lire la suite'}
                      <span className="jl-more-rule" aria-hidden="true" />
                    </button>
                  )}
                </section>
              )}

              {/* --- La messe --- */}
              {active.mass.length > 0 && (
                <section className="jl-mass">
                  <div className="jl-mass-head">
                    <h2 className="jl-section-title" data-rv="0">
                      La messe
                    </h2>
                    <span className="jl-mass-count" data-rv="0">
                      {active.mass.length} parties
                    </span>
                  </div>
                  <div className={`jl-mass-timeline${gospel ? '' : ' no-gospel'}`}>
                    <div className="jl-mass-track" aria-hidden="true" />
                    <div ref={massLineRef} className="jl-mass-progress" aria-hidden="true" />

                    {active.mass.map((reading, index) =>
                      reading.key === 'gospel' ? null : (
                        <button
                          key={reading.key}
                          type="button"
                          className="jl-mass-item"
                          data-rv="0"
                          onClick={() => openReading(index)}
                        >
                          <span className="jl-mass-node" aria-hidden="true">
                            {reading.key === 'psalm' ? (
                              <MusicNoteIcon size={15} />
                            ) : (
                              READING_GLYPH[reading.key] ?? reading.label.slice(0, 2)
                            )}
                          </span>
                          <span className="jl-mass-label-row">
                            <span className="jl-mass-label">{reading.label}</span>
                            {reading.ref && <span className="jl-mass-ref">{reading.ref}</span>}
                          </span>
                          <span className="jl-mass-quote">« {excerptOf(reading.text)} »</span>
                        </button>
                      )
                    )}

                    {gospel ? (
                      <div className="jl-gospel-wrap" data-rv="0">
                        <span className="jl-gospel-node" aria-hidden="true">
                          <LatinCrossIcon size={19} />
                        </span>
                        <div ref={gospelRef} className="jl-gospel">
                          <LatinCrossIcon size={150} outline className="jl-gospel-watermark" />
                          <button type="button" className="jl-gospel-text-button" onClick={() => openReading(gospelIndex)}>
                            <span className="jl-gospel-label-row">
                              <span className="jl-gospel-label">{gospel.label}</span>
                              {gospel.ref && <span className="jl-gospel-ref">{gospel.ref}</span>}
                            </span>
                            <span className="jl-gospel-text">
                              {gospelWords.map((w, i) => (
                                <span key={i} data-gw className="jl-gospel-word">
                                  {w}
                                </span>
                              ))}
                            </span>
                          </button>
                          <button type="button" className="jl-gold-button" onClick={() => openReading(0)}>
                            Lire la messe <span aria-hidden="true">→</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button type="button" className="jl-gold-button jl-gold-button--light" onClick={() => openReading(0)}>
                        Lire la messe <span aria-hidden="true">→</span>
                      </button>
                    )}
                  </div>
                </section>
              )}

              {/* --- Liturgie des heures --- */}
              {hours.length > 0 && hour && (
                <section className="jl-hours">
                  <h2 className="jl-section-title jl-section-title--light" data-rv="0">
                    Liturgie des heures
                  </h2>
                  <p className="jl-hours-subtitle" data-rv="1">
                    Sanctifier chaque moment du jour
                  </p>
                  <div ref={dialRef} className="jl-dial-frame" data-rv="2" style={{ height: DIAL_HEIGHT * dialScale }}>
                    <div className="jl-dial" style={{ transform: `scale(${dialScale})` }}>
                      <svg width={DIAL_WIDTH} height={DIAL_HEIGHT} viewBox={`0 0 ${DIAL_WIDTH} ${DIAL_HEIGHT}`} aria-hidden="true">
                        <path d="M 30 176 A 140 140 0 0 1 310 176" className="jl-dial-path" />
                        <path
                          d="M 30 176 A 140 140 0 0 1 310 176"
                          className="jl-dial-progress"
                          pathLength={180}
                          strokeDasharray="180"
                          strokeDashoffset={(180 - hourIndex * hourStep).toFixed(1)}
                        />
                        <line x1="0" y1="176" x2={DIAL_WIDTH} y2="176" className="jl-dial-horizon" />
                      </svg>
                      {hours.map((h, i) => {
                        const a = ((180 - i * hourStep) * Math.PI) / 180;
                        const isOn = h === hour;
                        const edge = i === 0 || i === hours.length - 1;
                        return (
                          <Fragment key={h}>
                            <button
                              type="button"
                              className="jl-dial-hour"
                              style={{ left: 170 + 140 * Math.cos(a), top: 176 - 140 * Math.sin(a) }}
                              onClick={() => pickHour(h)}
                              aria-pressed={isOn}
                              aria-label={HOUR_LABELS[h] ?? h}
                            >
                              <span className={`jl-dial-dot${isOn ? ' is-on' : ''}${h === nowHour ? ' is-now' : ''}`} />
                            </button>
                            <span
                              className={`jl-dial-label${isOn ? ' is-on' : ''}`}
                              style={{ left: 170 + 162 * Math.cos(a), top: 176 - 162 * Math.sin(a) + (edge ? 14 : 0) }}
                              aria-hidden="true"
                            >
                              {HOUR_LABELS[h] ?? h}
                            </span>
                          </Fragment>
                        );
                      })}
                      <div className="jl-dial-sun-arm" style={{ transform: `rotate(${(hourIndex * hourStep).toFixed(1)}deg)` }} aria-hidden="true">
                        <span className="jl-dial-sun" />
                      </div>
                      <div className="jl-dial-center">
                        <div ref={hourNameRef} className="jl-dial-name">
                          {hourLabel}
                        </div>
                        <div className={`jl-dial-tag${hour === nowHour ? ' is-now' : ''}`}>
                          {hour === nowHour ? 'Maintenant · ' : ''}
                          {hourPreview?.ref ?? hourPreview?.label ?? ''}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="jl-hours-actions">
                    <button type="button" className="jl-hours-pray" onClick={() => openHour(hour)}>
                      Prier {hourArticle}
                      {hourArticle ? hourLabel.toLowerCase() : hourLabel} <span aria-hidden="true">→</span>
                    </button>
                    <button type="button" className="jl-hours-all" onClick={() => openHour(nowHour ?? hours[0])}>
                      Tout l'office
                    </button>
                  </div>
                </section>
              )}

              {/* --- Rosaire / Garder --- */}
              <div className="jl-tiles">
                <button type="button" className="jl-tile" data-rv="0" onClick={() => navigate('/rosaire')}>
                  <span className="jl-tile-rosette" aria-hidden="true" />
                  <span className="jl-tile-title">Rosaire</span>
                  <span className="jl-tile-meta">{MYSTERY_SETS[mysterySet].label.replace('Mystères ', '')}</span>
                </button>
                <button
                  type="button"
                  className={`jl-tile${saved ? ' is-saved' : ''}`}
                  data-rv="0"
                  onClick={toggleSaved}
                  aria-pressed={saved}
                >
                  <svg ref={markRef} className="jl-tile-mark" width="18" height="22" viewBox="0 0 15 18" fill="none" aria-hidden="true">
                    <path d="M1 1h13v16l-6.5-5L1 17V1z" />
                  </svg>
                  <span className="jl-tile-title">{saved ? 'Gardé' : 'Garder'}</span>
                  <span className="jl-tile-meta">{saved ? 'Dans mes favoris' : 'Ajouter aux favoris'}</span>
                </button>
              </div>

              <p className="jl-source">
                <span aria-hidden="true">✦</span>
                Textes liturgiques · {ordo === 'vom' ? 'Divinum Officium' : feast.source.name}
              </p>
            </>
          )}

          {/* --- Veille / lendemain --- */}
          <footer className="jl-nav">
            <button type="button" className="jl-nav-button" onClick={() => changeDate(prevDate)}>
              <span className="jl-nav-kicker">← Veille</span>
              <span className="jl-nav-day">{shortDayLabel(prevDate)}</span>
            </button>
            <button type="button" className="jl-nav-button is-dark" onClick={() => changeDate(nextDate)}>
              <span className="jl-nav-kicker">Lendemain →</span>
              <span className="jl-nav-day">{shortDayLabel(nextDate)}</span>
            </button>
          </footer>
        </div>
        <WorldButton />
      </IonContent>
    </IonPage>
  );
};

export default JourLiturgique;
