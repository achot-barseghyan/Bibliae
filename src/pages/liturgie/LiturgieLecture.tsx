import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { IonPage } from '@ionic/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperInstance } from 'swiper';
import 'swiper/css';
import { useLiturgicalDay } from '../../hooks/useLiturgicalDay';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useSheetDrag } from '../../hooks/useSheetDrag';
import { todayIso, type LiturgicalItem, type OrdoData } from '../../services/liturgicalCalendar';
import { ChevronLeftIcon, AccessibilityIcon } from '../../components/nav/icons';
import AccessibilityQuickSheet from '../../components/AccessibilityQuickSheet';
import { tapHaptic } from '../../utils/haptics';
import {
  HOUR_LABELS,
  LITURGICAL_COLORS,
  formatOrdinals,
  htmlToLines,
  longDateLabel,
  massTabsOf,
  renderRubrics,
  resolveReadingChapter
} from './liturgyText';
import { GLORIA_LINES, itemBlocks, type LiturgyBlock } from './liturgyBlocks';
// Signes en rouge, bloc latin, commémoraison : styles partagés avec le jour.
import '../JourLiturgique.css';
import './LiturgieLecture.css';

const SHEET_EASE = [0.2, 0.7, 0.2, 1] as const;

/** Au-delà, les parties de la messe (calendrier traditionnel) passent du
 * sélecteur à parts égales au fil de points, comme l'office. */
const MAX_SEGMENTS = 5;

const HOUR_SUBTITLES: Record<string, string> = {
  matins: 'Office des lectures',
  lauds: 'Prière du matin',
  prime: 'Première heure du jour',
  terce: 'Prière du milieu du jour',
  sext: 'Prière du milieu du jour',
  none: 'Prière du milieu du jour',
  vespers: 'Prière du soir',
  compline: 'Prière avant le repos'
};

/** Lueur de l'en-tête de l'office : aube, plein jour, couchant, nuit. */
const HOUR_GLOWS: Record<string, string> = {
  matins: 'rgba(200, 210, 240, 0.14)',
  lauds: 'rgba(240, 213, 142, 0.32)',
  prime: 'rgba(240, 213, 142, 0.28)',
  terce: 'rgba(244, 226, 170, 0.24)',
  sext: 'rgba(250, 236, 190, 0.26)',
  none: 'rgba(244, 210, 150, 0.24)',
  vespers: 'rgba(222, 140, 110, 0.3)',
  compline: 'rgba(170, 180, 230, 0.12)'
};

/** « Sommaire des Laudes », « Sommaire de Tierce ». */
const HOUR_OF: Record<string, string> = {
  matins: 'des ',
  lauds: 'des ',
  vespers: 'des ',
  compline: 'des '
};

/** Surtitre de chaque partie de l'office (calendrier romain actuel). */
const OFFICE_KICKERS: Record<string, string> = {
  introduction: "Début de l'office",
  invitatoire: 'Psaume invitatoire',
  hymne: 'Hymne',
  psaume_1: 'Psalmodie',
  psaume_2: 'Psalmodie',
  psaume_3: 'Psalmodie',
  verset_psaume: 'Verset',
  lecture: 'Lecture',
  repons_lecture: 'Répons',
  patristique: 'Lecture patristique',
  repons_patristique: 'Répons',
  te_deum: 'Hymne',
  short_reading: 'Lecture brève',
  responsory: 'Répons bref',
  cantique_zacharie: 'Cantique évangélique',
  cantique_mariale: 'Cantique évangélique',
  cantique_symeon: 'Cantique évangélique',
  intercession: 'Prières',
  notre_pere: 'Prière du Seigneur',
  collect: 'Conclusion',
  benediction: 'Conclusion',
  hymne_mariale: 'Antienne mariale'
};

const MASS_READING_KEYS = ['reading', 'first_reading', 'second_reading'];

interface PartInfo {
  /** Libellé court (sélecteur, bouton « Suite »). */
  short: string;
  kicker: string;
  name: string;
  sub: string;
  intro: string | null;
  dark: boolean;
}

function officePart(item: LiturgicalItem, hourLabel: string): PartInfo {
  const ref = item.ref && !item.label.toLowerCase().includes(item.ref.toLowerCase()) ? item.ref : '';
  return {
    short: item.label,
    kicker: OFFICE_KICKERS[item.key] ?? hourLabel,
    name: item.label,
    sub: item.title ?? ref,
    intro: null,
    dark: false
  };
}

function massPart(item: LiturgicalItem, readingNumber: number, readingCount: number, active: OrdoData, isVom: boolean): PartInfo {
  const isReading = MASS_READING_KEYS.includes(item.key);
  // « Ps 32 (33), 1-2, 4-5 » : la référence en titre, les versets dessous.
  const psalmRef = item.key === 'psalm' && item.ref ? item.ref.match(/^(Ps\s+\d+(?:\s*\(\d+\))?),\s*(.+)$/) : null;

  let short = item.label;
  let kicker = item.label;
  if (!isVom) {
    if (isReading) {
      short = readingCount > 1 ? `Lecture ${readingNumber === 1 ? 'I' : 'II'}` : 'Lecture';
      kicker = readingNumber === 1 ? 'Première lecture' : 'Deuxième lecture';
    } else if (item.key === 'psalm') {
      short = kicker = 'Psaume';
    } else if (item.key === 'gospel') {
      short = kicker = 'Évangile';
    } else if (item.key === 'collect') {
      short = 'Oraison';
      kicker = "Prière d'ouverture";
    }
  }

  let intro = item.intro ?? null;
  if (psalmRef) intro = psalmRef[2];
  else if (item.key === 'collect' && !isVom) intro = formatOrdinals(active.name);

  return {
    short,
    kicker,
    name: psalmRef ? psalmRef[1] : (item.ref ?? (item.key === 'collect' ? 'Collecte' : item.label)),
    sub: '',
    intro,
    dark: item.key === 'gospel'
  };
}

/** Position de lecture (onglet + défilement de chaque onglet), mémorisée
 * pour la retrouver si le système recharge l'app pendant qu'on est passé
 * dans une autre. Une seule entrée, liée à l'entrée d'historique
 * (`location.key`, conservée au rechargement) : rouvrir une lecture depuis
 * le jour liturgique repart donc de l'onglet choisi, pas de l'ancienne
 * position. */
const READING_POSITION_KEY = 'liturgie-reading-position';

interface ReadingPosition {
  entryKey: string;
  index: number;
  scroll: Record<number, number>;
}

function loadReadingPosition(entryKey: string): ReadingPosition | null {
  try {
    const raw = localStorage.getItem(READING_POSITION_KEY);
    const position = raw ? (JSON.parse(raw) as ReadingPosition) : null;
    return position?.entryKey === entryKey ? position : null;
  } catch {
    return null;
  }
}

function saveReadingPosition(position: ReadingPosition) {
  try {
    localStorage.setItem(READING_POSITION_KEY, JSON.stringify(position));
  } catch {
    // Stockage indisponible : on perd seulement la reprise de lecture.
  }
}

/** Lignes d'une strophe avec retrait suspendu, signes liturgiques en rouge. */
function Lines({ lines, keyPrefix }: { lines: string[]; keyPrefix: string }) {
  return (
    <>
      {lines.map((l, k) => (
        <div className="lec-line" key={k}>
          {renderRubrics(l, `${keyPrefix}-${k}`)}
        </div>
      ))}
    </>
  );
}

interface BlockViewProps {
  block: LiturgyBlock;
  id: string;
  gloriaOpen: boolean;
  onToggleGloria: () => void;
}

function BlockView({ block: b, id, gloriaOpen, onToggleGloria }: BlockViewProps) {
  switch (b.t) {
    case 'rub':
      return <p className="lec-rubric">{b.x}</p>;
    case 'ant':
      return (
        <div className="lec-antienne">
          <span className="lec-sign">Ant.</span>
          <span className="lec-antienne-text">{renderRubrics(b.x, `${id}-ant`)}</span>
        </div>
      );
    case 'R':
      return (
        <div className="lec-response">
          <span className="lec-sign" aria-label="Répons">R/</span>
          <span className="lec-response-text">{renderRubrics(b.x, `${id}-r`)}</span>
        </div>
      );
    case 'vr':
      return (
        <div className="lec-dialogue">
          <div className="lec-text">{renderRubrics(b.a, `${id}-a`)}</div>
          <div className="lec-dialogue-answer">
            <span className="lec-sign" aria-hidden="true">—</span>
            <span className="lec-text lec-dialogue-answer-text">{renderRubrics(b.b, `${id}-b`)}</span>
          </div>
        </div>
      );
    case 'st':
      return (
        <div className="lec-stanza">
          {b.verses.map((v, k) => (
            <div className="lec-verse" key={k}>
              <span className="lec-verse-number">{v.n}</span>
              <div>
                <Lines lines={v.lines} keyPrefix={`${id}-${k}`} />
              </div>
            </div>
          ))}
        </div>
      );
    case 'p':
      return <p className="lec-text lec-prose">{renderRubrics(b.x, `${id}-p`)}</p>;
    case 'gl':
      return (
        <div className="lec-gloria">
          <button type="button" className="lec-gloria-toggle" onClick={onToggleGloria} aria-expanded={gloriaOpen}>
            <span className="lec-gloria-title">Gloire au Père…</span>
            <span className="lec-gloria-action">{gloriaOpen ? 'Replier' : 'Afficher'}</span>
          </button>
          {gloriaOpen && (
            <div className="lec-gloria-body">
              <Lines lines={GLORIA_LINES} keyPrefix={`${id}-gl`} />
            </div>
          )}
        </div>
      );
  }
}

/** Page de lecture d'une partie du jour (maquette Office et Messe v2) : la
 * messe (`/liturgie/:date/messe`) ou une heure de l'office
 * (`/liturgie/:date/lauds`...). `?onglet=` choisit la partie d'ouverture,
 * `?ordo=vom` le calendrier traditionnel. */
const LiturgieLecture: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { date = todayIso(), part = '' } = useParams<{ date: string; part: string }>();
  const reducedMotion = useReducedMotion();
  const isVom = searchParams.get('ordo') === 'vom';
  const { feast } = useLiturgicalDay(date);
  const active: OrdoData | null = feast ? (isVom && feast.vom ? feast.vom : feast) : null;
  const isMass = part === 'messe';
  const hourLabel = HOUR_LABELS[part] ?? part;

  const tabs = useMemo(() => {
    if (!active) return [];
    return isMass ? massTabsOf(active) : (active.offices[part] ?? []);
  }, [active, part, isMass]);

  const parts = useMemo(() => {
    if (!active) return [];
    const readingCount = tabs.filter((t) => MASS_READING_KEYS.includes(t.key)).length;
    let readingNumber = 0;
    return tabs.map((t) => {
      if (!isMass) return officePart(t, hourLabel);
      if (MASS_READING_KEYS.includes(t.key)) readingNumber += 1;
      return massPart(t, readingNumber, readingCount, active, isVom);
    });
  }, [tabs, active, isMass, isVom, hourLabel]);

  const blocksByTab = useMemo(() => tabs.map((t) => itemBlocks(t, isMass)), [tabs, isMass]);
  const commemorationLine = isMass ? (active?.commemorationLine ?? null) : null;
  const sourceName = isVom ? 'Divinum Officium' : 'AELF';
  const useSegments = isMass && tabs.length <= MAX_SEGMENTS;

  const positionRef = useRef<ReadingPosition>(
    loadReadingPosition(location.key) ?? {
      entryKey: location.key,
      index: Math.max(0, parseInt(searchParams.get('onglet') ?? '0', 10) || 0),
      scroll: {}
    }
  );
  const [index, setIndex] = useState(positionRef.current.index);
  const bodyRefs = useRef<Array<HTMLDivElement | null>>([]);
  const saveTimerRef = useRef<number | undefined>(undefined);
  const swiperRef = useRef<SwiperInstance | null>(null);
  const [isA11yOpen, setIsA11yOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [openGlorias, setOpenGlorias] = useState<Record<string, boolean>>({});

  const n = tabs.length;
  const hasTabs = n > 0;
  const current = Math.min(index, Math.max(0, n - 1));
  const info = parts[current];
  const isLast = current === n - 1;

  const changeIndex = (i: number) => {
    if (i < 0 || i >= n) return;
    setIndex(i);
    positionRef.current = { ...positionRef.current, index: i };
    saveReadingPosition(positionRef.current);
  };

  // Enregistrement différé : un défilement émet des dizaines d'évènements
  // par seconde, inutile d'écrire à chacun.
  const rememberScroll = (i: number, top: number) => {
    positionRef.current = { ...positionRef.current, scroll: { ...positionRef.current.scroll, [i]: top } };
    window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => saveReadingPosition(positionRef.current), 250);
  };

  useEffect(() => () => window.clearTimeout(saveTimerRef.current), []);

  // Les textes arrivent après le premier rendu (cache puis réseau) : on
  // restaure le défilement de chaque partie une fois qu'ils sont affichés.
  useEffect(() => {
    if (!hasTabs) return;
    Object.entries(positionRef.current.scroll).forEach(([i, top]) => {
      const body = bodyRefs.current[Number(i)];
      if (body) body.scrollTop = top;
    });
  }, [hasTabs]);

  // La partie peut changer hors du glissement (fil, sélecteur, sommaire,
  // barre du bas) : on répercute alors le changement sur le Swiper.
  useEffect(() => {
    if (swiperRef.current && swiperRef.current.activeIndex !== current) {
      swiperRef.current.slideTo(current, reducedMotion ? 0 : undefined);
    }
  }, [current, reducedMotion]);

  // Ouverte directement (app rechargée sur cette page), il n'y a pas de
  // page précédente dans l'historique : on retourne alors au jour.
  const goBack = () => {
    if (((window.history.state as { idx?: number } | null)?.idx ?? 0) > 0) {
      navigate(-1);
    } else {
      navigate(`/liturgie/${date}`, { replace: true });
    }
  };

  const goTo = (i: number) => {
    tapHaptic();
    setIsSheetOpen(false);
    changeIndex(i);
  };

  const dateLabel = longDateLabel(date);
  const massColor = LITURGICAL_COLORS[active?.color ?? ''] ?? LITURGICAL_COLORS.vert;
  const massSubtitle = active ? formatOrdinals(active.line ?? active.name) : '';
  const sheetTitle = isMass ? 'Sommaire de la messe' : `Sommaire ${HOUR_OF[part] ?? 'de '}${hourLabel}`;
  const heroClass = isMass ? 'lec-hero is-mass' : 'lec-hero is-office';

  const rail = n > 1 && !useSegments && (
    <>
      <div className="lec-rail">
        <span className="lec-rail-track" aria-hidden="true" />
        <span
          className="lec-rail-fill"
          aria-hidden="true"
          style={{ width: `calc((100% - 28px) * ${(current / (n - 1)).toFixed(3)})` }}
        />
        <div className="lec-rail-dots">
          {parts.map((p, k) => (
            <button
              key={tabs[k].key}
              type="button"
              className={`lec-rail-dot${k < current ? ' is-done' : ''}${k === current ? ' is-current' : ''}`}
              onClick={() => goTo(k)}
              aria-label={p.name}
              aria-current={k === current ? 'step' : undefined}
            >
              <span />
            </button>
          ))}
        </div>
      </div>
      <div className="lec-step">
        <button type="button" className="lec-step-button" onClick={() => setIsSheetOpen(true)} aria-haspopup="dialog">
          <span className="lec-step-name">{info?.short}</span>
          {info?.sub && <span className="lec-step-sub">{info.sub}</span>}
          <span className="lec-step-caret" aria-hidden="true">
            ▾
          </span>
        </button>
        <span className="lec-step-pos">
          {current + 1} / {n}
        </span>
      </div>
    </>
  );

  return (
    <IonPage>
      <div className="lec-page">
        <header
          className={heroClass}
          style={
            isMass
              ? ({ '--lec-season': massColor } as CSSProperties)
              : ({ '--lec-glow': HOUR_GLOWS[part] ?? HOUR_GLOWS.lauds } as CSSProperties)
          }
        >
          {!isMass && <span className="lec-hero-glow" aria-hidden="true" />}
          {isMass && <span className="lec-hero-season" aria-hidden="true" />}
          <div className="lec-hero-nav">
            <button type="button" className="lec-round" onClick={goBack} aria-label="Retour">
              <ChevronLeftIcon size={20} />
            </button>
            <p className="lec-hero-date">{dateLabel}</p>
            <button
              type="button"
              className="lec-round lec-round-end"
              onClick={() => setIsA11yOpen(true)}
              aria-label="Accessibilité et lecture"
              aria-haspopup="dialog"
              aria-expanded={isA11yOpen}
            >
              <AccessibilityIcon size={19} />
            </button>
          </div>

          <div className="lec-hero-titles">
            {isMass ? (
              <h1 className="lec-hero-title">
                <span className="lec-hero-dot" aria-hidden="true" />
                Messe du jour
              </h1>
            ) : (
              <h1 className="lec-hero-title">{hourLabel}</h1>
            )}
            <p className="lec-hero-subtitle">
              {isMass ? massSubtitle : `${HOUR_SUBTITLES[part] ?? ''}${isVom ? ' · Calendrier traditionnel' : ''}`}
            </p>
          </div>

          {useSegments && n > 1 && (
            <div className="lec-segments" role="tablist" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
              <span
                className="lec-segments-thumb"
                aria-hidden="true"
                style={{ width: `calc((100% - 6px) / ${n})`, transform: `translateX(${current * 100}%)` }}
              />
              {parts.map((p, k) => (
                <button
                  key={tabs[k].key}
                  type="button"
                  role="tab"
                  aria-selected={k === current}
                  className={`lec-segment${k === current ? ' is-active' : ''}`}
                  onClick={() => goTo(k)}
                >
                  {p.short}
                </button>
              ))}
            </div>
          )}
          {rail}
        </header>

        <AnimatePresence>
          {isA11yOpen && <AccessibilityQuickSheet onClose={() => setIsA11yOpen(false)} />}
        </AnimatePresence>

        {hasTabs && (
          <Swiper
            className="lec-swiper"
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            initialSlide={current}
            slidesPerView={1}
            spaceBetween={0}
            resistanceRatio={0.65}
            onSlideChange={(swiper) => changeIndex(swiper.activeIndex)}
          >
            {tabs.map((t, i) => {
              const p = parts[i];
              const bibleTarget = resolveReadingChapter(t.ref);
              return (
                <SwiperSlide key={t.key} className="lec-slide">
                  <div
                    className="lec-body"
                    ref={(el) => {
                      bodyRefs.current[i] = el;
                    }}
                    onScroll={(e) => rememberScroll(i, e.currentTarget.scrollTop)}
                  >
                    {p.dark ? (
                      <div className="lec-gospel-card">
                        <span className="lec-gospel-cross" aria-hidden="true">
                          ✝
                        </span>
                        <p className="lec-kicker">{p.kicker}</p>
                        <h2 className="lec-name">{p.name}</h2>
                        {p.intro && <p className="lec-intro">{p.intro}</p>}
                      </div>
                    ) : (
                      <div className="lec-heading">
                        <p className="lec-kicker">{p.kicker}</p>
                        <div className="lec-name-row">
                          <h2 className="lec-name">{p.name}</h2>
                          {p.sub && <span className="lec-name-sub">{p.sub}</span>}
                        </div>
                        <span className="lec-divider" aria-hidden="true" />
                        {p.intro && <p className="lec-intro">{p.intro}</p>}
                      </div>
                    )}

                    {blocksByTab[i].map((b, j) => {
                      const id = `${i}-${j}`;
                      return (
                        <BlockView
                          key={id}
                          block={b}
                          id={id}
                          gloriaOpen={!!openGlorias[id]}
                          onToggleGloria={() => setOpenGlorias((g) => ({ ...g, [id]: !g[id] }))}
                        />
                      );
                    })}

                    {t.source && (
                      <div className="jour-latin-block">
                        <p className="jour-detail-paragraph jour-latin-text">{htmlToLines(t.source.text)}</p>
                      </div>
                    )}

                    {commemorationLine && i === n - 1 && (
                      <div className="jour-commemoration">
                        <p className="jour-section-kicker">Commémoraison</p>
                        <p className="jour-prose">{commemorationLine}</p>
                      </div>
                    )}

                    {bibleTarget && (
                      <button
                        type="button"
                        className="jour-gospel-button lec-bible-button"
                        onClick={() => navigate(`/bible/${bibleTarget.bookId}/${bibleTarget.chapter}`)}
                      >
                        Ouvrir dans la Bible
                      </button>
                    )}

                    <p className="lec-source">
                      <span aria-hidden="true">✦</span> Textes liturgiques · {sourceName}
                    </p>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        )}

        {hasTabs && (
          <footer className="lec-bar">
            <div className="lec-bar-row">
              <button
                type="button"
                className="lec-bar-prev"
                onClick={() => goTo(current - 1)}
                disabled={current === 0}
                aria-label="Partie précédente"
              >
                <ChevronLeftIcon size={20} />
              </button>
              <button type="button" className="lec-bar-next" onClick={() => goTo(isLast ? 0 : current + 1)}>
                <span className="lec-bar-next-kicker">{isLast ? 'Terminé' : 'Suite'}</span>
                <span className="lec-bar-next-label">{isLast ? 'Recommencer' : parts[current + 1]?.short}</span>
                <span className="lec-bar-next-arrow" aria-hidden="true">
                  →
                </span>
              </button>
            </div>
          </footer>
        )}

        <AnimatePresence>
          {isSheetOpen && (
            <SummarySheet
              title={sheetTitle}
              parts={parts}
              keys={tabs.map((t) => t.key)}
              current={current}
              onSelect={goTo}
              onClose={() => setIsSheetOpen(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </IonPage>
  );
};

interface SummarySheetProps {
  title: string;
  parts: PartInfo[];
  keys: string[];
  current: number;
  onSelect: (i: number) => void;
  onClose: () => void;
}

/** Sommaire de l'heure (ou de la messe) : toutes les parties, la partie en
 * cours marquée, les précédentes cochées en or. */
function SummarySheet({ title, parts, keys, current, onSelect, onClose }: SummarySheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  useSheetDrag(sheetRef, onClose);
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className="lec-sheet-backdrop"
      role="presentation"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.35 }}
    >
      <motion.div
        ref={sheetRef}
        className="lec-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.48, ease: SHEET_EASE }}
      >
        <span className="lec-sheet-handle" aria-hidden="true" />
        <div className="lec-sheet-header">
          <h2 className="lec-sheet-title">{title}</h2>
          <span className="lec-sheet-pos">
            {current + 1} / {parts.length}
          </span>
        </div>
        <ol className="lec-sheet-list">
          {parts.map((p, k) => (
            <li key={keys[k]}>
              <button
                type="button"
                className={`lec-sheet-item${k < current ? ' is-done' : ''}${k === current ? ' is-current' : ''}`}
                onClick={() => onSelect(k)}
                aria-current={k === current ? 'step' : undefined}
              >
                <span className="lec-sheet-number">{k + 1}</span>
                <span className="lec-sheet-name">{p.name}</span>
                {p.sub && <span className="lec-sheet-sub">{p.sub}</span>}
              </button>
            </li>
          ))}
        </ol>
      </motion.div>
    </motion.div>
  );
}

export default LiturgieLecture;
