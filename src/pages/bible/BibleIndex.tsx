import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { IonContent, IonPage } from '@ionic/react';
import {
  BOOKS,
  booksByTestament,
  booksInCategory,
  categoriesByTestament,
  getBook,
  getCategory,
  type Book,
  type Testament
} from '../../data/bible';
import { useReadingProgress } from '../../hooks/useReadingProgress';
import { useReadingPlan } from '../../hooks/useReadingPlan';
import { useAnnotations } from '../../hooks/useAnnotations';
import WorldButton from '../../components/nav/WorldButton';
import AccessibilityQuickSheet from '../../components/AccessibilityQuickSheet';
import { AccessibilityIcon, ChevronDownIcon, SearchIcon } from '../../components/nav/icons';
import { tapHaptic } from '../../utils/haptics';
import { useOpenSearch } from '../accueil/searchContext';
import ParcoursSelectorSheet from './ParcoursSelectorSheet';
import PlanCard from './PlanCard';
import ChapterLegend from './ChapterLegend';
import NightStars from './NightStars';
import { PSALTER, categoryNumeral } from './bibleSections';
import { RISE_IN, countUp, fillRing, stagger, useBibleReducedMotion, useRevealOnce } from './bibleMotion';
import './BibleIndex.css';

type IndexTab = 'ancien' | 'psaumes' | 'nouveau';

/** Onglet et défilement de la page, gardés aussi si le système recharge l'app. */
const INDEX_VIEW_KEY = 'bible-index-view';

interface IndexView {
  tab: IndexTab;
  top: number;
}

function loadIndexView(): IndexView | null {
  try {
    const raw = localStorage.getItem(INDEX_VIEW_KEY);
    const saved = raw ? (JSON.parse(raw) as Partial<IndexView>) : null;
    if (!saved || (saved.tab !== 'ancien' && saved.tab !== 'psaumes' && saved.tab !== 'nouveau')) return null;
    return { tab: saved.tab, top: typeof saved.top === 'number' ? saved.top : 0 };
  } catch {
    return null;
  }
}

function saveIndexView(view: IndexView) {
  try {
    localStorage.setItem(INDEX_VIEW_KEY, JSON.stringify(view));
  } catch {
    // Stockage indisponible : on revient simplement sur l'Ancien Testament.
  }
}

const TABS: { key: IndexTab; label: string; count: number }[] = [
  { key: 'ancien', label: 'Ancien Testament', count: booksByTestament('ancien').length },
  { key: 'psaumes', label: 'Psaumes', count: getBook('ps')?.chapters ?? 150 },
  { key: 'nouveau', label: 'Nouveau Testament', count: booksByTestament('nouveau').length }
];

const PSALM_COUNT = getBook('ps')?.chapters ?? 150;
const TOTAL_CHAPTERS = BOOKS.reduce((sum, b) => sum + b.chapters, 0);
const OLD_COUNT = booksByTestament('ancien').length;
const NEW_COUNT = booksByTestament('nouveau').length;
/** Position du filet séparant les deux Testaments sous la rangée de dos. */
const TESTAMENT_SPLIT = `${((OLD_COUNT / BOOKS.length) * 100).toFixed(1)}%`;

const testamentOf = (book: Book): Testament => getCategory(book.category).testament;

/** « 1 334 » avec espace fine insécable, à la française. */
const formatCount = (n: number) => n.toLocaleString('fr-FR').replace(/\s/g, ' ');

const RING_C = 169.6;

const BibleIndex: React.FC = () => {
  const navigate = useNavigate();
  const reduceMotion = useBibleReducedMotion();
  const { activeParcours, forParcours, positionFor, progress, otherReaderOf } = useReadingProgress();
  const { annotations } = useAnnotations();
  const plan = useReadingPlan();
  const [tab, setTab] = useState<IndexTab>(() => loadIndexView()?.tab ?? 'ancien');
  const contentRef = useRef<HTMLIonContentElement>(null);
  const tabRef = useRef(tab);
  tabRef.current = tab;

  // Onglet et défilement mémorisés : on revient sur « Nouveau Testament »,
  // à hauteur de 1 Pierre, après un passage par un livre ou un autre monde.
  // Une page Ionic masquée perd son défilement (comme dans BibleChapter) :
  // on le replace quand elle reprend une taille.
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    (async () => {
      const scrollEl = await contentRef.current?.getScrollElement();
      if (cancelled || !scrollEl) return;
      let savedTop = loadIndexView()?.top ?? 0;
      let saveTimer: number | undefined;
      const restore = () => {
        if (savedTop > 0 && scrollEl.clientHeight > 0 && Math.abs(scrollEl.scrollTop - savedTop) > 1) {
          scrollEl.scrollTop = savedTop;
        }
      };
      restore();
      const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(restore) : null;
      resizeObserver?.observe(scrollEl);
      const onScroll = () => {
        if (scrollEl.clientHeight === 0) return;
        savedTop = scrollEl.scrollTop;
        window.clearTimeout(saveTimer);
        saveTimer = window.setTimeout(() => saveIndexView({ tab: tabRef.current, top: savedTop }), 250);
      };
      scrollEl.addEventListener('scroll', onScroll, { passive: true });
      cleanup = () => {
        scrollEl.removeEventListener('scroll', onScroll);
        resizeObserver?.disconnect();
        window.clearTimeout(saveTimer);
      };
    })();
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  useEffect(() => {
    const previous = loadIndexView();
    saveIndexView({ tab, top: previous?.top ?? 0 });
  }, [tab]);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isA11yOpen, setIsA11yOpen] = useState(false);
  const openSearch = useOpenSearch();

  const heroRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const resumeRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const percentRef = useRef<HTMLSpanElement>(null);
  const introPlayedRef = useRef(false);
  const ringPlayedRef = useRef(false);

  const reads = useMemo(() => (activeParcours ? forParcours(activeParcours.id) : []), [activeParcours, forParcours]);
  const readCountByBook = useMemo(() => {
    const map = new Map<string, number>();
    reads.forEach((c) => map.set(c.bookId, (map.get(c.bookId) ?? 0) + 1));
    return map;
  }, [reads]);
  const readPsalms = useMemo(() => new Set(reads.filter((c) => c.bookId === 'ps').map((c) => c.chapter)), [reads]);

  const annotatedPsalms = useMemo(() => {
    const set = new Set<number>();
    for (const a of annotations) {
      if ((a.target.kind === 'verse' || a.target.kind === 'chapter') && a.target.sourceId.startsWith('ps-')) {
        set.add(Number(a.target.sourceId.slice(3)));
      }
    }
    return set;
  }, [annotations]);

  const readIn = (book: Book) => Math.min(book.chapters, readCountByBook.get(book.id) ?? 0);
  const percentOf = (books: Book[]) => {
    const total = books.reduce((sum, b) => sum + b.chapters, 0);
    return total > 0 ? Math.round((books.reduce((sum, b) => sum + readIn(b), 0) / total) * 100) : 0;
  };

  const parcoursProgress = activeParcours ? progress(activeParcours) : null;
  const position = activeParcours ? positionFor(activeParcours.id) : undefined;
  const positionBook = position ? getBook(position.bookId) : undefined;

  // Une seule reprise en tête de page : la carte de nuit du plan quand il est
  // en cours (le parcours actif passe alors dans la pastille dessous), sinon
  // la carte du parcours actif.
  const isPlanFocus = plan.isStarted && !plan.progress.completedAt && !plan.progress.cardHidden;

  // --- Animations d'entrée (une seule fois) puis à chaque changement d'onglet ---
  useRevealOnce(tab, () => {
    const hero = heroRef.current;
    const list = listRef.current;
    const isIntro = !introPlayedRef.current;
    introPlayedRef.current = true;
    if (reduceMotion || !hero || !list) return;
    if (isIntro) {
      const intro = [...hero.querySelectorAll('[data-in]'), ...(resumeRef.current ? [resumeRef.current] : [])];
      stagger(intro, RISE_IN, { duration: 1000, delay: 120, step: 110 });
      stagger(hero.querySelectorAll('[data-spine]'), [{ transform: 'scaleY(0)', opacity: 0 }, { transform: 'scaleY(1)' }], {
        duration: 900,
        delay: 450,
        step: 14
      });
    }
    const delay = isIntro ? 900 : 0;
    stagger(list.querySelectorAll('[data-row]'), [{ opacity: 0, transform: 'translateX(-16px)' }, { opacity: 1, transform: 'none' }], {
      duration: 700,
      delay,
      step: 45,
      maxStagger: 700
    });
    stagger(list.querySelectorAll('[data-bar]'), [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], {
      duration: 1100,
      delay: delay + 200,
      step: 45,
      maxStagger: 700
    });
  });

  const percent = parcoursProgress?.percent ?? 0;
  // `isPlanFocus` aussi : la carte du parcours se remonte quand le plan s'achève.
  useEffect(() => {
    const animate = !reduceMotion && !ringPlayedRef.current;
    ringPlayedRef.current = true;
    fillRing(ringRef.current, RING_C, percent / 100, 900, !animate);
    // Pas d'annulation au nettoyage : StrictMode rejoue l'effet aussitôt, et
    // couper le compteur figerait l'anneau sur sa valeur finale sans l'animer.
    countUp(percentRef.current, percent, 900, !animate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [percent, isPlanFocus]);

  const openBook = (bookId: string) => {
    tapHaptic();
    navigate(`/bible/${bookId}`);
  };

  const resume = () => {
    tapHaptic();
    if (position) navigate(`/bible/${position.bookId}/${position.chapter}`);
    else setIsSelectorOpen(true);
  };

  const tabIndex = TABS.findIndex((t) => t.key === tab);
  // Psaume où reprendre : même règle que la grille d'un livre (BibleBook).
  let psalmCurrent: number | null = null;
  if (position?.bookId === 'ps' && !readPsalms.has(position.chapter)) {
    psalmCurrent = position.chapter;
  } else if (readPsalms.size > 0 && readPsalms.size < PSALM_COUNT) {
    for (let n = 1; n <= PSALM_COUNT; n++) {
      if (!readPsalms.has(n)) {
        psalmCurrent = n;
        break;
      }
    }
  }

  return (
    <IonPage>
      <IonContent fullscreen className="bible-index-content" ref={contentRef}>
        <div className="bible-hero" ref={heroRef}>
          <NightStars />
          <div className="bible-hero-halo" aria-hidden="true" />

          <div className="bible-hero-inner">
            <div className="bible-hero-top" data-in>
              <span className="bible-hero-kicker">Bibliothèque</span>
              <div className="bible-hero-actions">
                <button
                  type="button"
                  className="bible-hero-icon"
                  onClick={() => setIsA11yOpen(true)}
                  aria-label="Accessibilité et lecture"
                  aria-haspopup="dialog"
                >
                  <AccessibilityIcon size={17} />
                </button>
                <button
                  type="button"
                  className="bible-hero-icon"
                  onClick={() => openSearch('versets')}
                  aria-label="Rechercher"
                  aria-haspopup="dialog"
                >
                  <SearchIcon size={16} />
                </button>
              </div>
            </div>
            <h1 className="bible-hero-title" data-in>
              La Bible
            </h1>
            <p className="bible-hero-subtitle" data-in>
              Soixante-treize livres, de la Genèse à l'Apocalypse.
            </p>
            <p className="bible-hero-stats" data-in>
              {OLD_COUNT} Ancien · {NEW_COUNT} Nouveau · {formatCount(TOTAL_CHAPTERS)} chapitres
            </p>

            <div className="bible-shelf" aria-hidden="true" style={{ '--bible-split': TESTAMENT_SPLIT } as React.CSSProperties}>
              <div className="bible-shelf-spines">
                {BOOKS.map((b) => {
                  const p = Math.round((readIn(b) / b.chapters) * 100);
                  const isLit = tab === 'psaumes' ? b.id === 'ps' : testamentOf(b) === tab;
                  return (
                    <div
                      key={b.id}
                      data-spine
                      className={`bible-shelf-spine${isLit ? ' is-lit' : ''}${positionBook?.id === b.id ? ' is-current' : ''}`}
                      style={{
                        height: `${(16 + Math.sqrt(b.chapters) * 5.3).toFixed(1)}px`,
                        background: `linear-gradient(to top, #F0D58E ${p}%, rgba(244, 237, 220, 0.26) ${p}%)`
                      }}
                      onClick={() => openBook(b.id)}
                    />
                  );
                })}
              </div>
              <div className="bible-shelf-floor" />
              <div className="bible-shelf-split" />
              <div className="bible-shelf-labels">
                <span>Ancien Testament</span>
                <span className="bible-shelf-labels-new">Nouveau</span>
              </div>
            </div>
          </div>
        </div>

        {isPlanFocus ? (
          <div className="bible-resume-wrap bible-resume-wrap--plan">
            <div ref={resumeRef}>
              <PlanCard />
            </div>
            {activeParcours && parcoursProgress && (
              <button
                type="button"
                className="bible-resume-parcours"
                onClick={() => {
                  tapHaptic();
                  setIsSelectorOpen(true);
                }}
                aria-haspopup="dialog"
              >
                <span className={`parcours-selector-dot parcours-selector-dot--${activeParcours.color}`} aria-hidden="true" />
                <span className="bible-resume-parcours-label">Parcours actif</span>
                <span className="bible-resume-parcours-name">{activeParcours.name}</span>
                <span className="bible-resume-parcours-percent">{parcoursProgress.percent} %</span>
                <ChevronDownIcon size={9} />
              </button>
            )}
          </div>
        ) : (
          <>
            {activeParcours && parcoursProgress && (
              <div className="bible-resume-wrap">
                <div className="bible-resume" ref={resumeRef}>
                  <span className="bible-resume-shine" aria-hidden="true" />
                  <button type="button" className="bible-resume-main" onClick={resume}>
                    <span className="bible-resume-ring">
                      <svg width="62" height="62" viewBox="0 0 62 62" aria-hidden="true">
                        <circle cx="31" cy="31" r="27" className="bible-resume-ring-track" />
                        <circle
                          ref={ringRef}
                          cx="31"
                          cy="31"
                          r="27"
                          className="bible-resume-ring-fill"
                          strokeDasharray={RING_C}
                          strokeDashoffset={RING_C}
                        />
                      </svg>
                      <span className="bible-resume-percent">
                        <span ref={percentRef} />
                        <span className="bible-resume-percent-sign">%</span>
                      </span>
                    </span>
                    <span className="bible-resume-text">
                      <span className="bible-resume-name">{activeParcours.name}</span>
                      <span className="bible-resume-detail">
                        {parcoursProgress.read} / {formatCount(parcoursProgress.total)} ch.
                        {position && positionBook ? ` · reprendre ${positionBook.abbreviation} ${position.chapter}` : ''}
                      </span>
                    </span>
                    <span className="bible-resume-go" aria-hidden="true">
                      ›
                    </span>
                  </button>
                  <button
                    type="button"
                    className="bible-resume-switch"
                    onClick={() => {
                      tapHaptic();
                      setIsSelectorOpen(true);
                    }}
                    aria-haspopup="dialog"
                  >
                    Parcours actif
                    <ChevronDownIcon size={9} />
                  </button>
                </div>
              </div>
            )}
            <div className="bible-index-plan">
              <PlanCard />
            </div>
          </>
        )}

        <div className={`bible-index-tabs${activeParcours ? '' : ' bible-index-tabs--alone'}`}>
          <div className="bible-pill" role="tablist">
            <span className="bible-pill-thumb" style={{ transform: `translateX(${tabIndex * 100}%)` }} aria-hidden="true" />
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={tab === t.key}
                className={`bible-pill-tab${tab === t.key ? ' is-active' : ''}`}
                onClick={() => {
                  tapHaptic();
                  setTab(t.key);
                }}
              >
                <span className="bible-pill-label">{t.label}</span>
                <span className="bible-pill-count">{t.count}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bible-index-list" ref={listRef}>
          {tab === 'psaumes' ? (
            <>
              {PSALTER.map((part) => {
                const length = part.to - part.from + 1;
                let read = 0;
                for (let n = part.from; n <= part.to; n++) if (readPsalms.has(n)) read++;
                return (
                  <section key={part.numeral} className="bible-section">
                    <div className="bible-section-heading" data-row>
                      <span className="bible-section-numeral">{part.numeral}</span>
                      <span className="bible-section-name">Livre {part.numeral}</span>
                      <span className="bible-section-count">
                        Ps {part.from} – {part.to}
                      </span>
                      <span className="bible-section-rule" />
                      {activeParcours && <span className="bible-section-percent">{Math.round((read / length) * 100)} %</span>}
                    </div>
                    {/* Mêmes cases que la grille d'un livre (BibleBook). */}
                    <div className="bible-chapter-grid bible-psalm-grid">
                      {Array.from({ length }, (_, i) => {
                        const n = part.from + i;
                        const isCurrent = n === psalmCurrent;
                        const other =
                          activeParcours && !isCurrent ? otherReaderOf('ps', n, activeParcours.id) : undefined;
                        const classes = ['bible-chapter-cell'];
                        if (isCurrent) classes.push('is-current');
                        else if (activeParcours && readPsalms.has(n)) classes.push('is-read', `is-read--${activeParcours.color}`);
                        return (
                          <button
                            key={n}
                            type="button"
                            data-row
                            className={classes.join(' ')}
                            onClick={() => {
                              tapHaptic();
                              navigate(`/bible/ps/${n}`);
                            }}
                            aria-label={`Psaume ${n}`}
                          >
                            {n}
                            {other && (
                              <span
                                className={`bible-chapter-cell-other bible-chapter-cell-other--${other.parcours.color}`}
                                aria-hidden="true"
                              />
                            )}
                            {annotatedPsalms.has(n) && <span className="bible-chapter-cell-note" aria-hidden="true" />}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
              <div className="bible-psalm-legend">
                <ChapterLegend readColor={activeParcours?.color} />
              </div>
            </>
          ) : (
            categoriesByTestament(tab).map((category) => {
                const books = booksInCategory(category.key);
                return (
                  <section key={category.key} className="bible-section">
                    <div className="bible-section-heading" data-row>
                      <span className="bible-section-numeral">{categoryNumeral(category.key)}</span>
                      <span className="bible-section-name">{category.label}</span>
                      <span className="bible-section-count">{books.length}</span>
                      <span className="bible-section-rule" />
                      {activeParcours && <span className="bible-section-percent">{percentOf(books)} %</span>}
                    </div>
                    <div className="bible-section-books">
                      {books.map((book) => {
                        const read = readIn(book);
                        const isComplete = !!activeParcours && read >= book.chapters;
                        return (
                          <button
                            key={book.id}
                            type="button"
                            data-row
                            className={`bible-book-row${positionBook?.id === book.id ? ' is-current' : ''}`}
                            onClick={() => openBook(book.id)}
                          >
                            <span className="bible-book-abbr">{book.abbreviation}</span>
                            <span className="bible-book-main">
                              <span className="bible-book-name">{book.name}</span>
                              {activeParcours && (
                                <span className="bible-book-progress">
                                  <span className="bible-book-progress-track">
                                    <span
                                      data-bar
                                      className="bible-book-progress-fill"
                                      style={{ width: `${Math.round((read / book.chapters) * 100)}%` }}
                                    />
                                  </span>
                                  <span className={`bible-book-progress-label${isComplete ? ' is-complete' : ''}`}>
                                    {isComplete ? 'Achevé' : read === 0 ? 'Non commencé' : `${read} / ${book.chapters}`}
                                  </span>
                                </span>
                              )}
                            </span>
                            {isComplete ? (
                              <svg className="bible-book-check" width="14" height="14" viewBox="0 0 12 12" fill="none" aria-label="Achevé">
                                <path
                                  d="M1.2 6.4l3.2 3.2 6.4-7.2"
                                  stroke="currentColor"
                                  strokeWidth="1.6"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            ) : (
                              <span className="bible-book-chapters">{book.chapters}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                );
              })
          )}
        </div>

        <AnimatePresence>
          {isSelectorOpen && <ParcoursSelectorSheet onClose={() => setIsSelectorOpen(false)} />}
        </AnimatePresence>
        <AnimatePresence>
          {isA11yOpen && <AccessibilityQuickSheet onClose={() => setIsA11yOpen(false)} />}
        </AnimatePresence>
        <WorldButton />
      </IonContent>
    </IonPage>
  );
};

export default BibleIndex;
