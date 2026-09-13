import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IonContent, IonPage } from '@ionic/react';
import { AnimatePresence } from 'framer-motion';
import { getBook, getCategory } from '../../data/bible';
import { useChapterVerses } from '../../hooks/useChapterVerses';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '../../components/nav/icons';
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
  const { verses } = useChapterVerses(bookId, chapterNumber);
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
  const sourceId = `${bookId}-${chapterNumber}`;
  const chapterNotes = annotations
    .filter((a) => a.target.kind === 'verse' && a.target.sourceId === sourceId && a.note !== null)
    .sort((a, b) => a.target.blockIndex - b.target.blockIndex || a.target.start - b.target.start);

  // Ref plutôt que dépendance d'effet : `activeParcours` change de référence à
  // chaque mise à jour du store (pas seulement quand le parcours actif change),
  // ce qui redémarrerait l'écouteur de scroll à chaque note/annotation ailleurs.
  const activeParcoursRef = useRef(activeParcours);
  activeParcoursRef.current = activeParcours;
  const ionContentRef = useRef<HTMLIonContentElement>(null);
  const reachedBottomRef = useRef(false);

  useEffect(() => {
    reachedBottomRef.current = false;
    if (!book) return;

    let cleanupScroll: (() => void) | null = null;

    (async () => {
      const contentEl = ionContentRef.current;
      if (!contentEl) return;
      const scrollEl = await contentEl.getScrollElement();
      if (!scrollEl) return;

      const maxScroll = scrollEl.scrollHeight - scrollEl.clientHeight;
      if (maxScroll <= 4) reachedBottomRef.current = true;

      const initialParcours = activeParcoursRef.current;
      if (initialParcours && maxScroll > 0) {
        const pos = positionFor(initialParcours.id);
        if (pos && pos.bookId === book.id && pos.chapter === chapterNumber && pos.scrollRatio > 0.02) {
          scrollEl.scrollTop = pos.scrollRatio * maxScroll;
        }
      }

      const onScroll = () => {
        const max = scrollEl.scrollHeight - scrollEl.clientHeight;
        const ratio = max > 0 ? scrollEl.scrollTop / max : 1;
        if (ratio >= SCROLL_BOTTOM_RATIO) reachedBottomRef.current = true;
        const current = activeParcoursRef.current;
        if (current) savePosition(current.id, book.id, chapterNumber, Math.min(1, Math.max(0, ratio)));
      };
      scrollEl.addEventListener('scroll', onScroll, { passive: true });
      cleanupScroll = () => scrollEl.removeEventListener('scroll', onScroll);
    })();

    return () => {
      cleanupScroll?.();
      if (reachedBottomRef.current) {
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
          onTitleClick={() => navigate(-1)}
          notesCount={chapterNotes.length}
          onNotesClick={() => setIsNotesListOpen(true)}
          title={
            <>
              {book.abbreviation} {chapterNumber}
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
          ) : (
            <div className="bible-chapter-placeholder">
              <p className="bible-chapter-placeholder-text">
                Le texte de ce chapitre n'est pas encore intégré.
              </p>
              <p className="bible-chapter-placeholder-note">La navigation, elle, fonctionne.</p>
            </div>
          )}
        </div>

        <footer className="bible-chapter-pager">
          <button
            type="button"
            className="bible-chapter-pager-button"
            disabled={!hasPrev}
            onClick={() => {
              tapHaptic();
              navigate(`/bible/${book.id}/${chapterNumber - 1}`, { replace: true });
            }}
            aria-label="Chapitre précédent"
          >
            <ChevronLeftIcon size={18} />
          </button>

          <div className="bible-chapter-pager-center">
            <span className="bible-chapter-pager-label">
              {book.abbreviation} {chapterNumber}
            </span>
            <span className="bible-chapter-pager-progress">
              {chapterNumber} / {book.chapters}
            </span>
          </div>

          <button
            type="button"
            className="bible-chapter-pager-button"
            disabled={!hasNext}
            onClick={() => {
              tapHaptic();
              navigate(`/bible/${book.id}/${chapterNumber + 1}`, { replace: true });
            }}
            aria-label="Chapitre suivant"
          >
            <ChevronRightIcon size={18} />
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
      </IonContent>
    </IonPage>
  );
};

export default BibleChapter;
