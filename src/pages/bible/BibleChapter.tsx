import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IonContent, IonPage } from '@ionic/react';
import { AnimatePresence } from 'framer-motion';
import { getBook, getCategory } from '../../data/bible';
import { useChapterVerses } from '../../hooks/useChapterVerses';
import { ChevronLeftIcon, ChevronRightIcon } from '../../components/nav/icons';
import WorldButton from '../../components/nav/WorldButton';
import { tapHaptic } from '../../utils/haptics';
import { useAccessibility } from '../../hooks/useAccessibility';
import { useAnnotations } from '../../hooks/useAnnotations';
import { useReadingProgress } from '../../hooks/useReadingProgress';
import { useWordSelection } from '../../hooks/useWordSelection';
import type { Annotation, HighlightColor } from '../../services/appDataStore';
import {
  applyVerseStyle,
  chapterNotes as groupChapterNotes,
  charStyles,
  countWords,
  noteOverlaps,
  rangesBetween,
  sameRanges,
  saveVerseNote,
  tokenizeWords,
  wordsCovering,
  type StyleOp,
  type VerseNote,
  type VerseRange
} from '../../services/verseAnnotations';
import AnnotationBar from '../../components/annotate/AnnotationBar';
import VerseNoteSheet from '../../components/annotate/VerseNoteSheet';
import NoteSheet from '../../components/annotate/NoteSheet';
import { copyText } from '../../utils/clipboard';
import { shareText } from '../../utils/share';
import BibleHeader from './BibleHeader';
import VerseBlock from './VerseBlock';
import ChapterNotesSheet from './ChapterNotesSheet';
import ParcoursCompletionSheet from './ParcoursCompletionSheet';
import ParcoursCreateSheet from './ParcoursCreateSheet';
import ChapterPickerSheet from './ChapterPickerSheet';
import './BibleChapter.css';

const SCROLL_BOTTOM_RATIO = 0.92;

/** Position de défilement du dernier chapitre lu, pour y revenir après être
 * passé par une fiche (figure, lieu...) : Ionic masque alors la page, ce qui
 * remet son défilement à zéro, ou la démonte. Une seule entrée, gardée aussi
 * si le système recharge l'app. */
const CHAPTER_SCROLL_KEY = 'bible-chapter-scroll';

interface ChapterScroll {
  bookId: string;
  chapter: number;
  top: number;
}

function loadChapterScroll(bookId: string, chapter: number): number | null {
  try {
    const raw = localStorage.getItem(CHAPTER_SCROLL_KEY);
    const saved = raw ? (JSON.parse(raw) as ChapterScroll) : null;
    return saved && saved.bookId === bookId && saved.chapter === chapter ? saved.top : null;
  } catch {
    return null;
  }
}

function saveChapterScroll(position: ChapterScroll) {
  try {
    localStorage.setItem(CHAPTER_SCROLL_KEY, JSON.stringify(position));
  } catch {
    // Stockage indisponible : on perd seulement le retour à la bonne place.
  }
}

/** Ligne d'aide affichée tant que l'utilisateur n'a pas encore annoté. */
const ANNOTATION_HINT_KEY = 'bibliae:annotation-hint-seen';

function readHintSeen(): boolean {
  try {
    return localStorage.getItem(ANNOTATION_HINT_KEY) === 'true';
  } catch {
    return false;
  }
}

function writeHintSeen() {
  try {
    localStorage.setItem(ANNOTATION_HINT_KEY, 'true');
  } catch {
    // Stockage indisponible : la ligne d'aide réapparaîtra simplement.
  }
}

const NO_NOTES: VerseNote[] = [];
const NO_ANNOTATIONS: Annotation[] = [];

/** Feuille de note d'un passage de versets (sélection en cours ou note existante). */
interface VerseNoteEditor {
  ranges: VerseRange[];
  reference: string;
  quote: string;
  initialText: string;
  /** Annotations de la note modifiée, remplacées à l'enregistrement. */
  replaceIds: string[];
}

/** Note attachée au chapitre entier (ancienne fonctionnalité, éditée telle quelle). */
interface ChapterNoteEditor {
  annotationId: string;
  quote: string;
  initialText: string;
}

const BibleChapter: React.FC = () => {
  const navigate = useNavigate();
  const { bookId = '', chapter = '' } = useParams<{ bookId: string; chapter: string }>();
  const book = getBook(bookId);
  const chapterNumber = Number(chapter);
  const { verses, isLoading: areVersesLoading } = useChapterVerses(bookId, chapterNumber);
  const { settings } = useAccessibility();
  const { annotations, updateNote } = useAnnotations();
  const { parcours, activeParcours, positionFor, savePosition, markRead } = useReadingProgress();
  const versesContainerRef = useRef<HTMLDivElement>(null);
  const [noteEditor, setNoteEditor] = useState<VerseNoteEditor | null>(null);
  const [chapterNoteEditor, setChapterNoteEditor] = useState<ChapterNoteEditor | null>(null);
  const [isHintSeen, setIsHintSeen] = useState(readHintSeen);
  const [isNotesListOpen, setIsNotesListOpen] = useState(false);
  const [completedParcoursId, setCompletedParcoursId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isChapterPickerOpen, setIsChapterPickerOpen] = useState(false);
  const sourceId = `${bookId}-${chapterNumber}`;

  const textByVerse = useMemo(() => new Map(verses.map((v) => [v.number, v.text])), [verses]);
  const wordsByVerse = useMemo(() => new Map(verses.map((v) => [v.number, tokenizeWords(v.text)])), [verses]);
  const textOf = useCallback((verse: number) => textByVerse.get(verse) ?? '', [textByVerse]);

  const openFigure = useCallback(
    (figureId: string) => {
      tapHaptic();
      navigate(`/figures/${figureId}`);
    },
    [navigate]
  );
  const { selection, setSelection, clearSelection, isDragging } = useWordSelection(
    versesContainerRef,
    wordsByVerse,
    openFigure
  );

  // Annotations du chapitre, rangées par verset (références stables pour que
  // les versets non concernés par une modification ne se redessinent pas).
  const annotationsByVerse = useMemo(() => {
    const map = new Map<number, Annotation[]>();
    for (const a of annotations) {
      if (a.target.kind !== 'verse' || a.target.sourceId !== sourceId || a.target.lang) continue;
      const list = map.get(a.target.blockIndex);
      if (list) list.push(a);
      else map.set(a.target.blockIndex, [a]);
    }
    return map;
  }, [annotations, sourceId]);

  const verseNotes = useMemo(() => groupChapterNotes(annotations, sourceId), [annotations, sourceId]);
  const notesByLastVerse = useMemo(() => {
    const map = new Map<number, VerseNote[]>();
    for (const note of verseNotes) {
      const list = map.get(note.lastVerse);
      if (list) list.push(note);
      else map.set(note.lastVerse, [note]);
    }
    return map;
  }, [verseNotes]);

  // Liste « notes du chapitre » de l'en-tête : une entrée par note (une note
  // sur plusieurs versets n'est comptée qu'une fois), plus les notes posées
  // sur le chapitre entier.
  const chapterNotes = useMemo(() => {
    const verseNoteHeads = verseNotes
      .map((note) => annotations.find((a) => a.id === note.annotationIds[0]))
      .filter((a): a is Annotation => !!a);
    const wholeChapterNotes = annotations.filter(
      (a) => a.target.kind === 'chapter' && a.target.sourceId === sourceId && a.note !== null
    );
    return [...wholeChapterNotes, ...verseNoteHeads];
  }, [annotations, verseNotes, sourceId]);

  const selectedRanges = useMemo(
    () => (selection ? rangesBetween(selection.anchor, selection.focus, wordsByVerse) : []),
    [selection, wordsByVerse]
  );
  const selectedRangeByVerse = useMemo(
    () => new Map(selectedRanges.map((r) => [r.verse, { start: r.start, end: r.end }])),
    [selectedRanges]
  );

  // Ref plutôt que dépendance d'effet : `activeParcours` change de référence à
  // chaque mise à jour du store (pas seulement quand le parcours actif change),
  // ce qui redémarrerait l'écouteur de scroll à chaque note/annotation ailleurs.
  const activeParcoursRef = useRef(activeParcours);
  activeParcoursRef.current = activeParcours;
  // Ref plutôt que dépendance d'effet, pour la même raison que ci-dessus : on ne
  // veut pas relancer l'écouteur de scroll simplement parce que le chargement se
  // termine ; on veut juste pouvoir lire son état à jour au moment du nettoyage.
  const versesLoadingRef = useRef(areVersesLoading);
  versesLoadingRef.current = areVersesLoading;
  const ionContentRef = useRef<HTMLIonContentElement>(null);
  const endSentinelRef = useRef<HTMLDivElement>(null);
  // Mis à jour en continu par l'IntersectionObserver (jamais accumulé) : reflète
  // toujours si la fin du texte est visible à l'instant présent, y compris quand
  // le texte finit de charger et pousse le repère hors de l'écran.
  const endVisibleRef = useRef(false);
  const scrolledToBottomRef = useRef(false);
  // Replace la lecture à la position mémorisée ; défini une fois l'élément
  // de défilement connu, rappelé quand les versets finissent de charger.
  const restoreScrollRef = useRef<() => void>(() => {});

  useEffect(() => {
    restoreScrollRef.current();
  }, [verses.length]);

  useEffect(() => {
    endVisibleRef.current = false;
    scrolledToBottomRef.current = false;
    restoreScrollRef.current = () => {};
    if (!book) return;

    let cleanupScroll: (() => void) | null = null;
    let observer: IntersectionObserver | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let saveTimer: number | undefined;

    (async () => {
      const contentEl = ionContentRef.current;
      if (!contentEl) return;
      const scrollEl = await contentEl.getScrollElement();
      if (!scrollEl) return;

      const initialParcours = activeParcoursRef.current;
      if (initialParcours) {
        const pos = positionFor(initialParcours.id);
        if (pos && pos.bookId === book.id && pos.chapter === chapterNumber && pos.scrollRatio > 0.02) {
          const maxScroll = scrollEl.scrollHeight - scrollEl.clientHeight;
          if (maxScroll > 0) scrollEl.scrollTop = pos.scrollRatio * maxScroll;
        }
      }

      let savedTop = loadChapterScroll(book.id, chapterNumber);
      const restore = () => {
        if (savedTop !== null && scrollEl.clientHeight > 0 && Math.abs(scrollEl.scrollTop - savedTop) > 1) {
          scrollEl.scrollTop = savedTop;
        }
      };
      restoreScrollRef.current = restore;
      restore();
      // La page masquée (`display: none`) n'a plus de hauteur et perd son
      // défilement : à sa réapparition, elle reprend une taille et on la
      // replace sur le verset où l'on en était.
      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(restore);
        resizeObserver.observe(scrollEl);
      }

      const onScroll = () => {
        // Page masquée : son défilement retombe à zéro, ce n'est pas une
        // vraie lecture à mémoriser.
        if (scrollEl.clientHeight === 0) return;
        savedTop = scrollEl.scrollTop;
        window.clearTimeout(saveTimer);
        saveTimer = window.setTimeout(
          () => saveChapterScroll({ bookId: book.id, chapter: chapterNumber, top: scrollEl.scrollTop }),
          250
        );
        const max = scrollEl.scrollHeight - scrollEl.clientHeight;
        const ratio = max > 0 ? scrollEl.scrollTop / max : 1;
        if (ratio >= SCROLL_BOTTOM_RATIO) scrolledToBottomRef.current = true;
        const current = activeParcoursRef.current;
        if (current) savePosition(current.id, book.id, chapterNumber, Math.min(1, Math.max(0, ratio)));
      };
      scrollEl.addEventListener('scroll', onScroll, { passive: true });
      cleanupScroll = () => scrollEl.removeEventListener('scroll', onScroll);

      // Détecte "la fin du texte est visible" via IntersectionObserver plutôt que
      // par un calcul manuel de scrollHeight/clientHeight : c'est le navigateur qui
      // mesure, en continu et sans course avec le chargement asynchrone des versets.
      if (endSentinelRef.current) {
        observer = new IntersectionObserver(
          ([entry]) => {
            endVisibleRef.current = entry.isIntersecting;
          },
          { root: scrollEl, threshold: 0 }
        );
        observer.observe(endSentinelRef.current);
      }
    })();

    return () => {
      cleanupScroll?.();
      observer?.disconnect();
      resizeObserver?.disconnect();
      window.clearTimeout(saveTimer);
      // Un chapitre qui tient entièrement sur un écran (repère de fin visible dès
      // l'ouverture) compte comme lu ; sinon il faut avoir réellement scrollé
      // jusqu'en bas. Si le texte n'est pas encore chargé, on ne marque rien.
      const fitsWithoutScrolling = !versesLoadingRef.current && endVisibleRef.current;
      if (scrolledToBottomRef.current || fitsWithoutScrolling) {
        const current = activeParcoursRef.current;
        if (current) {
          const { justCompleted } = markRead(current.id, book.id, chapterNumber, 'reading');
          if (justCompleted) setCompletedParcoursId(current.id);
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book?.id, chapterNumber]);

  const markHintSeen = () => {
    if (isHintSeen) return;
    writeHintSeen();
    setIsHintSeen(true);
  };

  /** « Jn 1, 4 » ou « Jn 1, 3-5 » pour des plages de versets. */
  const referenceFor = (ranges: VerseRange[]): string => {
    if (!book || ranges.length === 0) return '';
    const first = ranges[0].verse;
    const last = ranges[ranges.length - 1].verse;
    return `${book.abbreviation} ${chapterNumber}, ${first === last ? first : `${first}-${last}`}`;
  };

  const quoteFor = (ranges: VerseRange[]): string =>
    ranges.map((r) => textOf(r.verse).slice(r.start, r.end)).join(' ');

  // Styles de chaque mot sélectionné (celui de sa première lettre), pour
  // l'état des pastilles et de « Souligner ».
  const selectedWordStyles = useMemo(() => {
    const result: Array<{ highlight: HighlightColor | null; underline: boolean }> = [];
    for (const range of selectedRanges) {
      const text = textByVerse.get(range.verse) ?? '';
      const styles = charStyles(annotationsByVerse.get(range.verse) ?? NO_ANNOTATIONS, text.length);
      for (const word of wordsByVerse.get(range.verse) ?? []) {
        if (word.start >= range.start && word.end <= range.end) {
          result.push({ highlight: styles.highlight[word.start], underline: styles.underline[word.start] });
        }
      }
    }
    return result;
  }, [selectedRanges, textByVerse, wordsByVerse, annotationsByVerse]);

  const activeColor =
    selectedWordStyles.length > 0 && selectedWordStyles.every((w) => w.highlight === selectedWordStyles[0].highlight)
      ? selectedWordStyles[0].highlight
      : null;
  const isUnderlined = selectedWordStyles.length > 0 && selectedWordStyles.every((w) => w.underline);
  const canErase =
    selectedWordStyles.some((w) => w.highlight !== null || w.underline) ||
    verseNotes.some((note) => noteOverlaps(note, selectedRanges));

  const applyStyle = (op: StyleOp) => {
    applyVerseStyle(sourceId, selectedRanges, op, textOf);
    tapHaptic();
    markHintSeen();
    clearSelection();
  };

  const openNoteForSelection = () => {
    const existing = verseNotes.find((note) => sameRanges(note.ranges, selectedRanges));
    setNoteEditor({
      ranges: selectedRanges,
      reference: referenceFor(selectedRanges),
      quote: quoteFor(selectedRanges),
      initialText: existing?.text ?? '',
      replaceIds: existing?.annotationIds ?? []
    });
  };

  const openExistingNote = useCallback(
    (note: VerseNote) => {
      tapHaptic();
      const words = wordsCovering(note.ranges, wordsByVerse);
      setSelection(words ? { anchor: words.from, focus: words.to } : null);
      const ranges = words ? rangesBetween(words.from, words.to, wordsByVerse) : note.ranges;
      const first = ranges[0]?.verse;
      const last = ranges[ranges.length - 1]?.verse;
      setNoteEditor({
        ranges,
        reference: book ? `${book.abbreviation} ${chapterNumber}, ${first === last ? first : `${first}-${last}`}` : '',
        quote: ranges.map((r) => (textByVerse.get(r.verse) ?? '').slice(r.start, r.end)).join(' '),
        initialText: note.text,
        replaceIds: note.annotationIds
      });
    },
    [wordsByVerse, setSelection, book, chapterNumber, textByVerse]
  );

  const handleSaveVerseNote = (text: string) => {
    if (!noteEditor) return;
    saveVerseNote(sourceId, noteEditor.ranges, text, noteEditor.replaceIds, textOf);
    tapHaptic();
    markHintSeen();
    setNoteEditor(null);
    clearSelection();
  };

  /** Citation au format « « texte » — Jn 1, 4 (Crampon) ». */
  const citation = () => `« ${quoteFor(selectedRanges)} » — ${referenceFor(selectedRanges)} (Crampon)`;

  if (!book || !Number.isInteger(chapterNumber) || chapterNumber < 1 || chapterNumber > book.chapters) {
    return (
      <IonPage>
        <IonContent fullscreen className="bible-chapter-content">
          <BibleHeader title="Chapitre introuvable" onBack={() => navigate(-1)} />
          <WorldButton />
        </IonContent>
      </IonPage>
    );
  }

  const category = getCategory(book.category);
  const hasPrev = chapterNumber > 1;
  const hasNext = chapterNumber < book.chapters;

  return (
    <IonPage>
      <IonContent fullscreen className="bible-chapter-content" ref={ionContentRef}>
        <BibleHeader
          accent
          onBack={() => navigate(-1)}
          onTitleClick={() => setIsChapterPickerOpen(true)}
          notesCount={chapterNotes.length}
          onNotesClick={() => setIsNotesListOpen(true)}
          title={`${book.name} ${chapterNumber}`}
        />

        <div className="bible-chapter-body">
          <p className="bible-chapter-kicker">{category.label}</p>
          <h1 className="bible-chapter-title">{book.name}</h1>
          <p className="bible-chapter-subtitle">
            Chapitre {chapterNumber} sur {book.chapters}
          </p>
          <p className="bible-chapter-source">
            Texte basé sur la Bible Crampon 1923, adapté et modernisé pour cette application
          </p>
          <div className="bible-chapter-rule" />

          {verses.length > 0 ? (
            <div
              className={`bible-chapter-verses${selection ? ' has-selection' : ''}${isDragging ? ' is-dragging' : ''}`}
              ref={versesContainerRef}
            >
              {!isHintSeen && (
                <p className="bible-chapter-annotate-hint">
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path
                      d="M4 1.5v8.2l2-1.6 1.5 3.6 1.6-.7L7.6 7.5H10L4 1.5z"
                      stroke="#B5892E"
                      strokeWidth="1"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Glissez sur les mots, ou touchez le premier puis le dernier. Le numéro sélectionne le verset.
                </p>
              )}
              {verses.map((verse) => (
                <VerseBlock
                  key={verse.number}
                  bookId={book.id}
                  chapter={chapterNumber}
                  verseNumber={verse.number}
                  verseText={verse.text}
                  words={wordsByVerse.get(verse.number) ?? []}
                  annotations={annotationsByVerse.get(verse.number) ?? NO_ANNOTATIONS}
                  selectedRange={selectedRangeByVerse.get(verse.number) ?? null}
                  notes={notesByLastVerse.get(verse.number) ?? NO_NOTES}
                  onOpenNote={openExistingNote}
                />
              ))}
            </div>
          ) : areVersesLoading ? (
            <div className="bible-chapter-loading">
              <div className="bible-chapter-loading-spinner" aria-hidden="true" />
              <p className="bible-chapter-loading-text">Chargement du texte…</p>
            </div>
          ) : (
            <div className="bible-chapter-placeholder">
              <p className="bible-chapter-placeholder-text">
                Le texte de ce chapitre n'est pas encore intégré.
              </p>
              <p className="bible-chapter-placeholder-note">La navigation, elle, fonctionne.</p>
            </div>
          )}

          <div ref={endSentinelRef} aria-hidden="true" style={{ height: 1 }} />
        </div>

        <footer className="bible-chapter-pager">
          <button
            type="button"
            className="bible-chapter-pager-side bible-chapter-pager-side--prev"
            disabled={!hasPrev}
            onClick={() => {
              tapHaptic();
              navigate(`/bible/${book.id}/${chapterNumber - 1}`, { replace: true });
            }}
            aria-label="Chapitre précédent"
          >
            <ChevronLeftIcon size={16} className="bible-chapter-pager-chevron" />
            <span className="bible-chapter-pager-side-text">
              <span className="bible-chapter-pager-side-label">Précédent</span>
              {hasPrev && (
                <span className="bible-chapter-pager-side-value">
                  {book.name} {chapterNumber - 1}
                </span>
              )}
            </span>
          </button>

          {/* Laisse passer le bas de la rosace (WorldButton), qui déborde
              au-dessus de sa barre. Le choix du chapitre reste accessible
              depuis le titre de l'en-tête. */}
          <span className="bible-chapter-pager-center" aria-hidden="true" />

          <button
            type="button"
            className="bible-chapter-pager-side bible-chapter-pager-side--next"
            disabled={!hasNext}
            onClick={() => {
              tapHaptic();
              navigate(`/bible/${book.id}/${chapterNumber + 1}`, { replace: true });
            }}
            aria-label="Chapitre suivant"
          >
            <span className="bible-chapter-pager-side-text">
              <span className="bible-chapter-pager-side-label">Suivant</span>
              {hasNext && (
                <span className="bible-chapter-pager-side-value">
                  {book.name} {chapterNumber + 1}
                </span>
              )}
            </span>
            <ChevronRightIcon size={16} className="bible-chapter-pager-chevron" />
          </button>
        </footer>

        <AnimatePresence>
          {selection && selectedRanges.length > 0 && !noteEditor && !isDragging && (
            <AnnotationBar
              contextLabel={(() => {
                const count = countWords(selection.anchor, selection.focus, wordsByVerse);
                return `${referenceFor(selectedRanges)} · ${count} mot${count > 1 ? 's' : ''}`;
              })()}
              activeColor={activeColor}
              isUnderlined={isUnderlined}
              canErase={canErase}
              reduceMotion={settings.reduceMotion}
              onPickColor={(color) => applyStyle({ kind: 'color', color })}
              onToggleUnderline={() => applyStyle({ kind: 'underline', on: !isUnderlined })}
              onNote={openNoteForSelection}
              onErase={() => applyStyle({ kind: 'erase' })}
              onCopy={() => {
                copyText(citation());
                tapHaptic();
                clearSelection();
              }}
              onShare={() => {
                shareText(citation());
                clearSelection();
              }}
              onClose={clearSelection}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {noteEditor && (
            <VerseNoteSheet
              reference={noteEditor.reference}
              quote={noteEditor.quote}
              initialText={noteEditor.initialText}
              reduceMotion={settings.reduceMotion}
              onSave={handleSaveVerseNote}
              onClose={() => setNoteEditor(null)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {chapterNoteEditor && (
            <NoteSheet
              quote={chapterNoteEditor.quote}
              initialText={chapterNoteEditor.initialText}
              reduceMotion={settings.reduceMotion}
              onSave={(text) => {
                updateNote(chapterNoteEditor.annotationId, text.trim() === '' ? null : text);
                tapHaptic();
                setChapterNoteEditor(null);
              }}
              onClose={() => setChapterNoteEditor(null)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isNotesListOpen && (
            <ChapterNotesSheet
              bookAbbreviation={book.abbreviation}
              bookName={book.name}
              chapterNumber={chapterNumber}
              notes={chapterNotes}
              reduceMotion={settings.reduceMotion}
              onSelect={(annotation) => {
                setIsNotesListOpen(false);
                const note = verseNotes.find((n) => n.annotationIds.includes(annotation.id));
                if (note) {
                  openExistingNote(note);
                } else {
                  setChapterNoteEditor({
                    annotationId: annotation.id,
                    quote: annotation.target.quote,
                    initialText: annotation.note ?? ''
                  });
                }
              }}
              onClose={() => setIsNotesListOpen(false)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {completedParcoursId &&
            (() => {
              const completedParcours = parcours.find((p) => p.id === completedParcoursId);
              if (!completedParcours) return null;
              return (
                <ParcoursCompletionSheet
                  parcours={completedParcours}
                  onClose={() => setCompletedParcoursId(null)}
                  onCreateNew={() => {
                    setCompletedParcoursId(null);
                    setIsCreateOpen(true);
                  }}
                />
              );
            })()}
        </AnimatePresence>

        <AnimatePresence>
          {isCreateOpen && (
            <ParcoursCreateSheet onClose={() => setIsCreateOpen(false)} onCreated={() => setIsCreateOpen(false)} />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isChapterPickerOpen && (
            <ChapterPickerSheet
              book={book}
              currentChapter={chapterNumber}
              onClose={() => setIsChapterPickerOpen(false)}
            />
          )}
        </AnimatePresence>
        <WorldButton spacer={false} />
      </IonContent>
    </IonPage>
  );
};

export default BibleChapter;
