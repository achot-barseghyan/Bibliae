import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IonContent, IonPage } from '@ionic/react';
import { AnimatePresence, motion, type PanInfo, type Transition } from 'framer-motion';
import { useLiturgicalDay } from '../hooks/useLiturgicalDay';
import { useLiturgicalMonth } from '../hooks/useLiturgicalMonth';
import { useBookmarks } from '../hooks/useBookmarks';
import { useAccessibility } from '../hooks/useAccessibility';
import { todayIso, shiftIsoDate, type LiturgicalItem, type OrdoData } from '../services/liturgicalCalendar';
import { BOOKS } from '../data/bible';
import { MYSTERY_SETS, mysterySetForToday } from '../data/rosary';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  MusicNoteIcon,
  CrossIcon,
  RosaireIcon,
  BookmarkIcon,
  AirplaneIcon,
  RefreshIcon,
  SparkleIcon
} from '../components/nav/icons';
import { tapHaptic } from '../utils/haptics';
import './JourLiturgique.css';

const LITURGICAL_COLORS: Record<string, string> = {
  blanc: '#e8e1cd',
  rouge: '#6b1e23',
  vert: '#4a5d3a',
  violet: '#5a3d6b',
  rose: '#c98a9c',
  noir: '#23201a'
};

const WEEKDAY_LETTERS = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];

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
const HOUR_LABELS: Record<string, string> = {
  matins: 'Matines',
  lauds: 'Laudes',
  prime: 'Prime',
  terce: 'Tierce',
  sext: 'Sexte',
  none: 'None',
  vespers: 'Vêpres',
  compline: 'Complies'
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

/** Décode les entités HTML (`&nbsp;`, `&eacute;`...) via un <textarea>
 * détaché : ne les exécute jamais, se contente de lire leur valeur texte. */
function decodeEntities(text: string): string {
  const el = document.createElement('textarea');
  el.innerHTML = text;
  return el.value;
}

/** Aplati tout en une seule ligne (espaces au lieu des retours) : pour les
 * aperçus courts dans les listes, où un retour à la ligne serait gênant. */
function stripHtml(html: string): string {
  return decodeEntities(
    html
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<\/p>\s*<p>/gi, ' ')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/** Comme `stripHtml`, mais garde les `<br>` comme de vrais retours à la
 * ligne (`\n`) — utile pour les lectures découpées verset par verset
 * (offices), où chaque `<br>` sépare un verset et pas juste une clause. Le
 * conteneur doit avoir `white-space: pre-line` pour les afficher.
 * Important : le HTML source contient déjà de vrais retours à la ligne
 * (mise en forme du JSON, pas du contenu) juste après chaque `<br>` — il
 * faut les aplatir en espaces AVANT d'insérer les nôtres, sinon chaque
 * `<br>` produit deux retours à la ligne (un blanc) au lieu d'un seul. */
function htmlToLines(html: string): string {
  const withRealBreaks = html.replace(/\s+/g, ' ').replace(/<br\s*\/?>\s*/gi, '\n');
  return decodeEntities(
    withRealBreaks
      .replace(/<[^>]+>/g, '')
      .replace(/ *\n */g, '\n')
      .trim()
  );
}

function htmlParagraphs(html: string): string[] {
  return html
    .split(/<\/p>/gi)
    .map((p) => htmlToLines(p))
    .filter(Boolean);
}

function excerptOf(html: string): string {
  const text = stripHtml(html)
    .replace(/^(En ce temps-là|Frères et sœurs|Frères|Lecture[^:]*:)\s*,?\s*/i, '')
    .replace(/[–-]\s*(Acclamons|Parole du Seigneur|Parole de Dieu).*$/i, '')
    .trim();
  const firstSentence = text.match(/^[^.!?»]+[.!?»]?/)?.[0]?.trim() ?? text;
  if (firstSentence.length <= 130) return firstSentence;
  const truncated = firstSentence.slice(0, 130);
  const lastSpace = truncated.lastIndexOf(' ');
  return `${truncated.slice(0, lastSpace > 0 ? lastSpace : 130).trimEnd()}…`;
}

/** Résout une référence AELF ("Lc 6, 39-42", "Ps 83 (84)") vers un chapitre
 * du lecteur biblique de l'app. Préfère le numéro entre parenthèses quand
 * il existe (numérotation hébraïque des psaumes, celle utilisée en interne). */
function resolveReadingChapter(ref: string | null): { bookId: string; chapter: number } | null {
  if (!ref) return null;
  const main = ref.match(/^((?:\d\s)?[A-Za-zÀ-ÿ]+)\s+(\d+)/);
  if (!main) return null;
  const altMatch = ref.match(/\((\d+)\)/);
  const abbr = main[1].replace(/\s+/g, '').toLowerCase();
  const chapter = altMatch ? parseInt(altMatch[1], 10) : parseInt(main[2], 10);
  const book = BOOKS.find((b) => b.abbreviation.replace(/\s+/g, '').toLowerCase() === abbr);
  return book ? { bookId: book.id, chapter } : null;
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

interface Detail {
  tabs: LiturgicalItem[];
  index: number;
  /** Contexte affiché sous le titre : date seule pour la messe, heure + date pour l'office. */
  subtitle: string;
  commemorationLine?: string | null;
}

const EASE = [0.22, 0.61, 0.36, 1] as const;

const JourLiturgique: React.FC = () => {
  const navigate = useNavigate();
  // Le paramètre d'URL ne sert qu'à choisir la date d'ouverture (lien
  // profond depuis un favori) : changer de jour ensuite ne touche plus à
  // l'URL, pour rester sur une seule et même page plutôt que d'empiler des
  // écrans dans l'historique de navigation.
  const { date: dateParam } = useParams<{ date?: string }>();
  const [date, setDate] = useState(() => dateParam ?? todayIso());
  const [ordo, setOrdo] = useState<'nom' | 'vom'>('nom');
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [detail, setDetail] = useState<Detail | null>(null);
  const { feast, isLoading, isStale, cachedAt, retry } = useLiturgicalDay(date);
  const { isBookmarked, toggle } = useBookmarks();
  const { settings } = useAccessibility();

  const active: OrdoData | null = feast ? (ordo === 'vom' && feast.vom ? feast.vom : feast) : null;

  const month = date.slice(0, 7);
  const monthEntries = useLiturgicalMonth(month);
  const monthByDate = useMemo(() => new Map(monthEntries.map((e) => [e.date, e])), [monthEntries]);

  const weekDays = useMemo(() => {
    const start = weekStart(date);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const iso = toIso(d);
      const entry = monthByDate.get(iso);
      return {
        iso,
        letter: WEEKDAY_LETTERS[i],
        day: d.getDate(),
        rank: entry ? dayRank(entry.degreeKey) : undefined
      };
    });
  }, [date, monthByDate]);

  const bookmarkKey = `liturgie:${date}`;
  const mysterySet = mysterySetForToday(new Date(`${date}T12:00:00`));

  const massTabs: LiturgicalItem[] = useMemo(() => {
    if (!active) return [];
    const tabs = [...active.mass];
    if (active.collect && !tabs.some((t) => t.key === 'collect')) {
      tabs.push({ key: 'collect', label: 'Oraison', ref: null, text: active.collect });
    }
    return tabs;
  }, [active]);

  const hours = useMemo(() => (active ? availableHours(active.offices) : []), [active]);
  const nowHour = useMemo(() => currentHourKey(hours), [hours]);

const dateLabel = new Date(`${date}T12:00:00`).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  const openReading = (index: number) => {
    tapHaptic();
    setDetail({ tabs: massTabs, index, subtitle: dateLabel, commemorationLine: active?.commemorationLine ?? null });
  };

  const openHour = (hourKey: string) => {
    const items = active?.offices[hourKey] ?? [];
    if (items.length === 0) return;
    const firstRefIndex = items.findIndex((i) => i.ref);
    tapHaptic();
    setDetail({
      tabs: items,
      index: firstRefIndex === -1 ? 0 : firstRefIndex,
      subtitle: `${HOUR_LABELS[hourKey] ?? hourKey} · ${dateLabel}`
    });
  };

  const transition = settings.reduceMotion ? { duration: 0 } : { duration: 0.28, ease: EASE };

  return (
    <IonPage>
      <IonContent fullscreen className="jour-liturgique-content">
        <header className="jour-header">
          <button
            type="button"
            className="jour-header-back"
            onClick={() => {
              tapHaptic();
              navigate(-1);
            }}
            aria-label="Retour"
          >
            <ChevronLeftIcon size={20} />
          </button>
          <h1 className="jour-header-title">Jour liturgique</h1>
          <button
            type="button"
            className="jour-header-today"
            onClick={() => setDate(todayIso())}
            aria-label="Revenir à aujourd'hui"
          >
            <CalendarIcon size={19} />
          </button>
        </header>

        {isStale && feast && (
          <div className="jour-offline-banner">
            <span className="jour-offline-banner-label">
              <AirplaneIcon size={13} />
              Hors ligne
            </span>
            {cachedAt && <span className="jour-offline-banner-time">{cachedAtLabel(cachedAt)}</span>}
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

            <div className="jour-ordo-toggle">
              <button
                type="button"
                className={`jour-ordo-button${ordo === 'nom' ? ' is-active' : ''}`}
                onClick={() => setOrdo('nom')}
              >
                Ordinaire
              </button>
              <button
                type="button"
                className={`jour-ordo-button${ordo === 'vom' ? ' is-active' : ''}`}
                onClick={() => setOrdo('vom')}
                disabled={!feast.vom}
              >
                Traditionnel
              </button>
            </div>

            <section className="jour-date-block">
              <p className="jour-date-line">
                <span
                  className="jour-date-dot"
                  style={{ background: LITURGICAL_COLORS[active.color] ?? 'var(--color-oxblood)' }}
                  aria-hidden="true"
                />
                {dateLabel} · {active.color}
              </p>
              <h2 className="jour-title">{active.name}</h2>
              {active.line && (
                <p className="jour-subtitle">
                  {active.rank} · {active.line}
                </p>
              )}
              <div className="jour-divider" aria-hidden="true" />
            </section>

            <div className="jour-week-strip">
              {weekDays.map((d) => (
                <button
                  key={d.iso}
                  type="button"
                  className={`jour-week-day${d.iso === date ? ' is-active' : ''}`}
                  onClick={() => setDate(d.iso)}
                >
                  <span className="jour-week-letter">{d.letter}</span>
                  <span className="jour-week-number">{d.day}</span>
                  {d.iso !== date && d.rank && (
                    <span className={`jour-week-marker jour-week-marker--${d.rank}`} aria-hidden="true" />
                  )}
                </button>
              ))}
            </div>

            <div className="jour-week-legend">
              <span className="jour-week-legend-item">
                <span className="jour-week-marker jour-week-marker--green" aria-hidden="true" />
                Férie ou mémoire
              </span>
              <span className="jour-week-legend-item">
                <span className="jour-week-marker jour-week-marker--gold" aria-hidden="true" />
                Fête ou solennité
              </span>
            </div>

            {(active.description || active.excerpt) && (
              <section className="jour-block">
                <p className="jour-section-kicker">Ce que l'Église célèbre</p>
                {(isDescExpanded ? htmlParagraphs(active.description ?? '') : []).length > 0 && isDescExpanded ? (
                  htmlParagraphs(active.description ?? '').map((p, i) => (
                    <p className="jour-prose" key={i}>
                      {p}
                    </p>
                  ))
                ) : (
                  <p className="jour-prose">{active.excerpt}</p>
                )}
                {active.description && active.description !== active.excerpt && (
                  <button
                    type="button"
                    className="jour-link-button"
                    onClick={() => setIsDescExpanded((v) => !v)}
                  >
                    {isDescExpanded ? 'Réduire' : 'Lire la suite'}
                    <ChevronRightIcon size={13} className={isDescExpanded ? 'jour-link-chevron--up' : ''} />
                  </button>
                )}
              </section>
            )}

            {active.mass.length > 0 && (
              <section className="jour-section">
                <div className="jour-section-heading-row">
                  <h2 className="jour-section-title">La messe</h2>
                  <span className="jour-section-count">{active.mass.length} parties</span>
                </div>
                <div className="jour-readings">
                  {active.mass.map((reading, index) => (
                    <button key={reading.key} type="button" className="jour-reading-row" onClick={() => openReading(index)}>
                      <span className="jour-reading-icon" aria-hidden="true">
                        {reading.key === 'gospel' ? (
                          <CrossIcon size={14} />
                        ) : reading.key === 'psalm' ? (
                          <MusicNoteIcon size={14} />
                        ) : (
                          READING_GLYPH[reading.key] ?? reading.label.slice(0, 2)
                        )}
                      </span>
                      <span className="jour-reading-body">
                        <span className="jour-reading-label-row">
                          <span className="jour-reading-type">{reading.label}</span>
                          {reading.ref && <span className="jour-reading-ref">{reading.ref}</span>}
                        </span>
                        <span className="jour-reading-quote">« {excerptOf(reading.text)} »</span>
                      </span>
                      <ChevronRightIcon size={16} className="jour-reading-chevron" />
                    </button>
                  ))}
                </div>

                <button type="button" className="jour-gospel-button" onClick={() => openReading(0)}>
                  Lire la messe
                  <ChevronRightIcon size={15} />
                </button>
              </section>
            )}

            {hours.length > 0 && (
              <section className="jour-block">
                <h2 className="jour-section-title">Liturgie des heures</h2>
                <div className="jour-hours-grid">
                  {hours.map((h) => {
                    const firstItem = active.offices[h]?.find((i) => i.ref) ?? active.offices[h]?.[0];
                    return (
                      <button key={h} type="button" className="jour-hour-card" onClick={() => openHour(h)}>
                        <span className={`jour-hour-name${h === nowHour ? ' is-now' : ''}`}>{HOUR_LABELS[h] ?? h}</span>
                        <span className={`jour-hour-meta${h === nowHour ? ' is-now' : ''}`}>
                          {h === nowHour ? 'Maintenant · ' : ''}
                          {firstItem?.ref ?? firstItem?.label ?? ''}
                        </span>
                      </button>
                    );
                  })}
                  {nowHour && (
                    <button type="button" className="jour-hour-card jour-hour-card--all" onClick={() => openHour(nowHour)}>
                      Tout l'office
                    </button>
                  )}
                </div>
              </section>
            )}

            <div className="jour-actions">
              <button type="button" className="jour-action-card" onClick={() => navigate('/rosaire')}>
                <RosaireIcon size={18} className="jour-action-icon" />
                <span className="jour-action-title">Rosaire</span>
                <span className="jour-action-meta">{MYSTERY_SETS[mysterySet].label.replace('Mystères ', '')}</span>
              </button>
              <button
                type="button"
                className="jour-action-card"
                onClick={() => toggle(bookmarkKey)}
                aria-pressed={isBookmarked(bookmarkKey)}
              >
                <BookmarkIcon size={18} className="jour-action-icon" filled={isBookmarked(bookmarkKey)} />
                <span className="jour-action-title">Garder</span>
                <span className="jour-action-meta">{isBookmarked(bookmarkKey) ? 'Dans mes favoris' : 'Ajouter aux favoris'}</span>
              </button>
            </div>

            <p className="jour-source">
              Textes liturgiques · {ordo === 'vom' ? 'Divinum Officium' : feast.source.name}
            </p>
          </>
        )}

        <footer className="jour-nav-footer">
          <button type="button" className="jour-nav-button" onClick={() => setDate(shiftIsoDate(date, -1))}>
            <ChevronLeftIcon size={14} />
            {new Date(`${shiftIsoDate(date, -1)}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric' }).toUpperCase()}
          </button>
          <span className="jour-nav-sep" aria-hidden="true">
            ✦
          </span>
          <button type="button" className="jour-nav-button" onClick={() => setDate(shiftIsoDate(date, 1))}>
            {new Date(`${shiftIsoDate(date, 1)}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric' }).toUpperCase()}
            <ChevronRightIcon size={14} />
          </button>
        </footer>

        <AnimatePresence>
          {detail && (
            <LiturgicalDetailView
              tabs={detail.tabs}
              index={detail.index}
              subtitle={detail.subtitle}
              commemorationLine={detail.commemorationLine}
              onIndexChange={(i) => setDetail((current) => (current ? { ...current, index: i } : current))}
              onClose={() => setDetail(null)}
              transition={transition}
            />
          )}
        </AnimatePresence>
      </IonContent>
    </IonPage>
  );
};

interface LiturgicalDetailViewProps {
  tabs: LiturgicalItem[];
  index: number;
  subtitle: string;
  commemorationLine?: string | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  transition: Transition;
}

const LiturgicalDetailView: React.FC<LiturgicalDetailViewProps> = ({
  tabs,
  index,
  subtitle,
  commemorationLine,
  onIndexChange,
  onClose,
  transition
}) => {
  const navigate = useNavigate();
  const item = tabs[index];
  const target = resolveReadingChapter(item.ref);
  const activeTabRef = useRef<HTMLButtonElement>(null);

  // Fait défiler la barre d'onglets pour garder l'onglet actif visible :
  // sinon, en avançant avec le pager du bas, l'onglet courant peut sortir
  // du cadre et il faut alors faire défiler la barre à la main.
  useEffect(() => {
    activeTabRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [index]);

  // Glisser vers la gauche/droite change d'onglet, comme le ferait la
  // pagination du bas. On exige un geste nettement plus horizontal que
  // vertical, sinon un simple défilement du texte pourrait être pris pour
  // un swipe.
  const handlePanEnd = (_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
    // Un geste rapide ("à-coup") parcourt peu de distance avant le lâcher :
    // le déplacement (offset) reste petit même si le mouvement est franchement
    // horizontal. Se fier au seul offset pour juger la direction rejetait
    // alors ces gestes à tort — on regarde aussi la vitesse, qui elle reste
    // nettement horizontale dans ce cas.
    const offsetIsHorizontal = Math.abs(info.offset.x) > Math.abs(info.offset.y) * 1.2;
    const velocityIsHorizontal = Math.abs(info.velocity.x) > Math.abs(info.velocity.y) * 1.2;
    if (!offsetIsHorizontal && !velocityIsHorizontal) return;

    if (info.offset.x < -70 || info.velocity.x < -500) {
      onIndexChange(Math.min(tabs.length - 1, index + 1));
    } else if (info.offset.x > 70 || info.velocity.x > 500) {
      onIndexChange(Math.max(0, index - 1));
    }
  };

  return (
    <motion.div
      className="jour-detail"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={transition}
    >
      <header className="jour-header">
        <button type="button" className="jour-header-back" onClick={onClose} aria-label="Retour">
          <ChevronLeftIcon size={20} />
        </button>
        <div className="jour-header-titles">
          <p className="jour-header-title jour-header-title--small">{item.label}</p>
          <p className="jour-header-subtitle">{subtitle}</p>
        </div>
        <div className="jour-header-today" aria-hidden="true" />
      </header>

      <div className="jour-detail-tabs">
        {tabs.map((t, i) => (
          <button
            key={t.key}
            ref={i === index ? activeTabRef : undefined}
            type="button"
            className={`jour-detail-tab${i === index ? ' is-active' : ''}`}
            onClick={() => onIndexChange(i)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <motion.div className="jour-detail-body" onPanEnd={handlePanEnd}>
        <div className="jour-detail-heading">
          <p className="jour-section-kicker">{item.label}</p>
          {item.ref && <p className="jour-detail-ref">{item.ref}</p>}
          <div className="jour-divider" aria-hidden="true" />
        </div>

        {htmlParagraphs(item.text).map((p, i) => (
          <p className="jour-detail-paragraph" key={i}>
            {p}
          </p>
        ))}

        {item.source && (
          <div className="jour-latin-block">
            <p className="jour-detail-paragraph jour-latin-text">{htmlToLines(item.source.text)}</p>
          </div>
        )}

        {commemorationLine && index === tabs.length - 1 && (
          <div className="jour-commemoration">
            <p className="jour-section-kicker">Commémoraison</p>
            <p className="jour-prose">{commemorationLine}</p>
          </div>
        )}

        <div className="jour-detail-actions">
          {target && (
            <button
              type="button"
              className="jour-gospel-button"
              onClick={() => navigate(`/bible/${target.bookId}/${target.chapter}`)}
            >
              Ouvrir dans la Bible
            </button>
          )}
        </div>
      </motion.div>

      <footer className="jour-detail-footer">
        <button
          type="button"
          className="jour-nav-button"
          onClick={() => onIndexChange(index - 1)}
          disabled={index === 0}
        >
          <ChevronLeftIcon size={14} />
          {tabs[index - 1]?.label ?? ''}
        </button>
        <span className="jour-detail-pager">
          {index + 1} / {tabs.length}
        </span>
        <button
          type="button"
          className="jour-nav-button"
          onClick={() => onIndexChange(index + 1)}
          disabled={index === tabs.length - 1}
        >
          {tabs[index + 1]?.label ?? ''}
          <ChevronRightIcon size={14} />
        </button>
      </footer>
    </motion.div>
  );
};


export default JourLiturgique;
