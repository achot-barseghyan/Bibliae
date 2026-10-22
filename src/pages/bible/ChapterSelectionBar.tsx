import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Book } from '../../data/bible';
import { useReadingProgress } from '../../hooks/useReadingProgress';
import { useAnnotations } from '../../hooks/useAnnotations';
import { useBookmarks } from '../../hooks/useBookmarks';
import { useAccessibility } from '../../hooks/useAccessibility';
import { CheckIcon, CloseIcon } from '../../components/nav/icons';
import NoteSheet from '../../components/annotate/NoteSheet';
import { tapHaptic } from '../../utils/haptics';
import { shareText } from '../../utils/share';
import { chapterRange, formatRanges } from './chapterSelection';
import './ChapterSelectionBar.css';

const EASE = [0.2, 0.7, 0.2, 1] as const;

interface ChapterSelectionBarProps {
  book: Book;
  selection: ReadonlySet<number>;
  /** Chapitres non lus du livre dans le parcours actif. */
  unreadChapters: number[];
  /** Chapitre « en cours » (dérivé de la position de lecture), s'il y en a un. */
  resumeChapter: number | null;
  isChapterRead: (chapter: number) => boolean;
  onChangeSelection: (next: Set<number>) => void;
  onMark: (read: boolean) => void;
  onRead: (chapter: number) => void;
  onClose: () => void;
}

/**
 * Feuille basse sombre du mode sélection de l'écran Livre. Un seul chapitre :
 * reprend les actions de l'ancien menu d'appui long. Plusieurs : résumé des
 * plages, raccourcis et marquage groupé.
 */
const ChapterSelectionBar: React.FC<ChapterSelectionBarProps> = ({
  book,
  selection,
  unreadChapters,
  resumeChapter,
  isChapterRead,
  onChangeSelection,
  onMark,
  onRead,
  onClose
}) => {
  const { settings } = useAccessibility();
  const { activeParcours, unmarkRead, positionFor, clearPosition } = useReadingProgress();
  const { annotations, add, updateNote, remove, removeAllForSource } = useAnnotations();
  const { isBookmarked, toggle: toggleBookmark } = useBookmarks();
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);

  const count = selection.size;
  const sorted = Array.from(selection).sort((a, b) => a - b);
  const single = count === 1 ? sorted[0] : null;
  const maxSelected = count > 0 ? sorted[count - 1] : 0;
  const isEmpty = count === 0;

  // La confirmation porte sur un chapitre précis : la quitter si la sélection change.
  useEffect(() => setIsConfirmingReset(false), [single]);
  const confirming = isConfirmingReset && single !== null;

  const select = (next: Set<number>) => {
    tapHaptic();
    onChangeSelection(next);
  };

  const shortcuts = (
    <div className="chapter-select-section">
      <p className="chapter-select-label">{count === 1 ? 'Étendre la sélection' : 'Sélection'}</p>
      <div className="chapter-select-chips">
        <button type="button" className="chapter-select-chip" onClick={() => select(chapterRange(book.chapters))}>
          Tout le livre
        </button>
        <button
          type="button"
          className="chapter-select-chip"
          disabled={unreadChapters.length === 0}
          onClick={() => select(new Set(unreadChapters))}
        >
          Non lus
        </button>
        <button
          type="button"
          className="chapter-select-chip"
          disabled={maxSelected <= 1}
          onClick={() => select(chapterRange(maxSelected))}
        >
          {maxSelected > 1 ? `Du 1 au ${maxSelected}` : 'Jusqu’ici'}
        </button>
        <button type="button" className="chapter-select-chip" disabled={isEmpty} onClick={() => select(new Set())}>
          Aucun
        </button>
      </div>
    </div>
  );

  const markActions = (
    <div className="chapter-select-marks">
      <button
        type="button"
        className="chapter-select-mark chapter-select-mark--read"
        disabled={isEmpty}
        onClick={() => onMark(true)}
      >
        <CheckIcon size={16} />
        Marquer lu
      </button>
      <button
        type="button"
        className="chapter-select-mark chapter-select-mark--unread"
        disabled={isEmpty}
        onClick={() => onMark(false)}
      >
        Non lu
      </button>
    </div>
  );

  const header = (label: string) => (
    <div className="chapter-select-header">
      <p className="chapter-select-count" aria-live="polite">
        {label}
      </p>
      <button type="button" className="chapter-select-close" onClick={onClose} aria-label="Quitter la sélection">
        <CloseIcon size={18} />
      </button>
    </div>
  );

  let body: React.ReactNode;
  if (single !== null) {
    const sourceId = `${book.id}-${single}`;
    const chapterNote =
      annotations.find((a) => a.target.kind === 'chapter' && a.target.sourceId === sourceId) ?? null;
    const bookmarkKey = `chapter:${sourceId}`;
    const isFavorite = isBookmarked(bookmarkKey);
    const status = isChapterRead(single) ? 'Lu' : single === resumeChapter ? 'En cours' : 'Non lu';

    const handleSaveNote = (text: string) => {
      const trimmed = text.trim();
      if (chapterNote) {
        if (trimmed === '') remove(chapterNote.id);
        else updateNote(chapterNote.id, trimmed);
      } else if (trimmed !== '') {
        add({
          target: { kind: 'chapter', sourceId, blockIndex: 0, start: 0, end: 0, quote: `${book.name} ${single}` },
          style: { highlight: null, underline: false },
          note: trimmed
        });
      }
      setIsNoteOpen(false);
    };

    const confirmReset = () => {
      tapHaptic();
      if (activeParcours) {
        unmarkRead(activeParcours.id, book.id, single);
        const position = positionFor(activeParcours.id);
        if (position?.bookId === book.id && position.chapter === single) clearPosition(activeParcours.id);
      }
      removeAllForSource('verse', sourceId);
      removeAllForSource('chapter', sourceId);
      setIsConfirmingReset(false);
      onClose();
    };

    body = (
      <>
        <div className="chapter-select-header">
          <p className="chapter-select-count" aria-live="polite">
            Chapitre
          </p>
          <span className="chapter-select-status">{status}</span>
          <button type="button" className="chapter-select-close" onClick={onClose} aria-label="Quitter la sélection">
            <CloseIcon size={18} />
          </button>
        </div>
        <h2 className="chapter-select-title">
          {book.name} {single}
        </h2>

        {confirming ? (
          <div className="chapter-select-confirm">
            <p>
              Réinitialiser {book.name} {single} effacera son état de lecture, ses notes et ses surlignages. Cette
              action est définitive.
            </p>
            <div className="chapter-select-marks">
              <button
                type="button"
                className="chapter-select-mark chapter-select-mark--danger"
                onClick={confirmReset}
              >
                Réinitialiser
              </button>
              <button
                type="button"
                className="chapter-select-mark chapter-select-mark--unread"
                onClick={() => setIsConfirmingReset(false)}
              >
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="chapter-select-actions">
              <button
                type="button"
                className="chapter-select-action"
                onClick={() => {
                  tapHaptic();
                  onRead(single);
                }}
              >
                <span className="chapter-select-glyph" aria-hidden="true">→</span>
                Lire
              </button>
              <button
                type="button"
                className="chapter-select-action"
                onClick={() => {
                  tapHaptic();
                  setIsNoteOpen(true);
                }}
              >
                <span className="chapter-select-glyph" aria-hidden="true">¶</span>
                Note
              </button>
              <button
                type="button"
                className={`chapter-select-action${isFavorite ? ' is-on' : ''}`}
                aria-pressed={isFavorite}
                onClick={() => {
                  tapHaptic();
                  toggleBookmark(bookmarkKey);
                }}
              >
                <span className="chapter-select-glyph" aria-hidden="true">{isFavorite ? '✦' : '✧'}</span>
                Favori
              </button>
              <button
                type="button"
                className="chapter-select-action"
                onClick={() => {
                  tapHaptic();
                  void shareText(`${book.name} ${single}`, 'Partager la référence');
                }}
              >
                <span className="chapter-select-glyph" aria-hidden="true">↗</span>
                Partager
              </button>
            </div>
            {shortcuts}
            {markActions}
            <button type="button" className="chapter-select-reset" onClick={() => setIsConfirmingReset(true)}>
              Réinitialiser le chapitre
            </button>
          </>
        )}

        <AnimatePresence>
          {isNoteOpen && (
            <NoteSheet
              quote={`${book.name} ${single}`}
              initialText={chapterNote?.note ?? ''}
              reduceMotion={settings.reduceMotion}
              onSave={handleSaveNote}
              onClose={() => setIsNoteOpen(false)}
            />
          )}
        </AnimatePresence>
      </>
    );
  } else {
    body = (
      <>
        {header(isEmpty ? 'Sélection' : `${count} chapitres sélectionnés`)}
        <h2 className={`chapter-select-title${isEmpty ? ' is-empty' : ''}`}>
          {isEmpty ? 'Touchez ou glissez sur les chapitres' : `${book.name} ${formatRanges(sorted)}`}
        </h2>
        {shortcuts}
        {markActions}
      </>
    );
  }

  return (
    <motion.div
      className="chapter-select-bar"
      slot="fixed"
      role="region"
      aria-label="Sélection de chapitres"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={settings.reduceMotion ? { duration: 0 } : { duration: 0.52, ease: EASE }}
    >
      {body}
    </motion.div>
  );
};

export default ChapterSelectionBar;
