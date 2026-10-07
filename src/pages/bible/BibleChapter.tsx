import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IonContent, IonPage } from '@ionic/react';
import { AnimatePresence } from 'framer-motion';
import { getBook, getCategory } from '../../data/bible';
import { useChapterVerses } from '../../hooks/useChapterVerses';
import { BookIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '../../components/nav/icons';
import { tapHaptic } from '../../utils/haptics';
import { useAccessibility } from '../../hooks/useAccessibility';
import { useAnnotations } from '../../hooks/useAnnotations';
import { useReadingProgress } from '../../hooks/useReadingProgress';
import { useTextSelection } from '../../hooks/useTextSelection';
import { useAnnotationEditor } from '../../hooks/useAnnotationEditor';
import type { SelectionAnchor } from '../../hooks/useTextSelection';
import AnnotationMenu from '../../components/annotate/AnnotationMenu';
import NoteSheet from '../../components/annotate/NoteSheet';
import { copyText } from '../../utils/clipboard';
import BibleHeader from './BibleHeader';
import VerseBlock from './VerseBlock';
import ChapterNotesSheet from './ChapterNotesSheet';
import ParcoursCompletionSheet from './ParcoursCompletionSheet';
import ParcoursCreateSheet from './ParcoursCreateSheet';
import AnnotationTour from './AnnotationTour';
import ChapterPickerSheet from './ChapterPickerSheet';
import './BibleChapter.css';

const SCROLL_BOTTOM_RATIO = 0.92;

type NoteEditorState =
  | { mode: 'selection'; anchors: SelectionAnchor[]; groupId?: string; quote: string; initialText: string }
  | { mode: 'existing'; annotationId: string; quote: string; initialText: string }
  | null;

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
  const { selection, clearSelection } = useTextSelection(versesContainerRef);
  const editor = useAnnotationEditor(selection);
  const [noteEditor, setNoteEditor] = useState<NoteEditorState>(null);
  const [isNotesListOpen, setIsNotesListOpen] = useState(false);
  const [completedParcoursId, setCompletedParcoursId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isChapterPickerOpen, setIsChapterPickerOpen] = useState(false);
  const sourceId = `${bookId}-${chapterNumber}`;
  const chapterNotes = annotations
    .filter(
      (a) => (a.target.kind === 'verse' || a.target.kind === 'chapter') && a.target.sourceId === sourceId && a.note !== null
    )
    .sort((a, b) => a.target.blockIndex - b.target.blockIndex || a.target.start - b.target.start);

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

  useEffect(() => {
    endVisibleRef.current = false;
    scrolledToBottomRef.current = false;
    if (!book) return;

    let cleanupScroll: (() => void) | null = null;
    let observer: IntersectionObserver | null = null;

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

      const onScroll = () => {
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

  const handleSaveNote = (text: string) => {
    if (noteEditor?.mode === 'selection') {
      editor.saveNote(noteEditor.anchors, noteEditor.groupId, text, editor.activeColor ?? editor.lastUsedColor);
      tapHaptic();
      clearSelection();
    } else if (noteEditor?.mode === 'existing') {
      updateNote(noteEditor.annotationId, text.trim() === '' ? null : text);
      tapHaptic();
    }
    setNoteEditor(null);
  };

  if (!book || !Number.isInteger(chapterNumber) || chapterNumber < 1 || chapterNumber > book.chapters) {
    return (
      <IonPage>
        <IonContent fullscreen className="bible-chapter-content">
          <BibleHeader title="Chapitre introuvable" backIcon="chevron" onBack={() => navigate(-1)} />
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
          backIcon="chevron"
          onBack={() => navigate(-1)}
          onTitleClick={() => setIsChapterPickerOpen(true)}
          notesCount={chapterNotes.length}
          onNotesClick={() => setIsNotesListOpen(true)}
          title={
            <>
              {book.name} {chapterNumber}
              <ChevronDownIcon size={11} />
            </>
          }
        />

        <div className="bible-chapter-body">
          <p className="bible-chapter-kicker">{category.label}</p>
          <h1 className="bible-chapter-title">{book.name}</h1>
          <p className="bible-chapter-subtitle">Chapitre {chapterNumber}</p>
          <p className="bible-chapter-source">
            Texte basé sur la Bible Crampon 1923, adapté et modernisé pour cette application
          </p>
          <div className="bible-chapter-rule" />

          {verses.length > 0 ? (
            <div className="bible-chapter-verses" ref={versesContainerRef}>
              {verses.map((verse) => (
                <VerseBlock
                  key={verse.number}
                  sourceId={sourceId}
                  verseNumber={verse.number}
                  verseText={verse.text}
                  onOpenExistingNote={(annotation) =>
                    setNoteEditor({
                      mode: 'existing',
                      annotationId: annotation.id,
                      quote: annotation.target.quote,
                      initialText: annotation.note ?? ''
                    })
                  }
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

        {verses.length > 0 && <AnnotationTour />}

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

          <button
            type="button"
            className="bible-chapter-pager-center"
            onClick={() => {
              tapHaptic();
              setIsChapterPickerOpen(true);
            }}
            aria-haspopup="dialog"
            aria-label="Choisir un chapitre"
          >
            <BookIcon size={18} />
            <span className="bible-chapter-pager-progress">
              {chapterNumber} / {book.chapters}
            </span>
          </button>

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
          {selection && !noteEditor && (
            <AnnotationMenu
              activeColor={editor.activeColor}
              hasUnderline={editor.hasUnderline}
              hasNote={editor.noteText !== null}
              canDelete={editor.overlapping.length > 0}
              reduceMotion={settings.reduceMotion}
              onPickColor={(color) => {
                editor.applyColor(color);
                tapHaptic();
                clearSelection();
              }}
              onToggleUnderline={() => {
                editor.toggleUnderline();
                tapHaptic();
                clearSelection();
              }}
              onNote={() =>
                setNoteEditor({
                  mode: 'selection',
                  anchors: selection.anchors,
                  groupId: selection.groupId,
                  quote: selection.anchors.map((a) => a.quote).join(' '),
                  initialText: editor.noteText ?? ''
                })
              }
              onCopy={() => {
                copyText(selection.anchors.map((a) => a.quote).join(' '));
                tapHaptic();
                clearSelection();
              }}
              onDelete={() => {
                editor.removeOverlapping();
                tapHaptic();
                clearSelection();
              }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {noteEditor && (
            <NoteSheet
              quote={noteEditor.quote}
              initialText={noteEditor.initialText}
              reduceMotion={settings.reduceMotion}
              onSave={handleSaveNote}
              onClose={() => setNoteEditor(null)}
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
                setNoteEditor({
                  mode: 'existing',
                  annotationId: annotation.id,
                  quote: annotation.target.quote,
                  initialText: annotation.note ?? ''
                });
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
      </IonContent>
    </IonPage>
  );
};

export default BibleChapter;
