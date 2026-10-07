import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Book } from '../../data/bible';
import { getCategory } from '../../data/bible';
import { useReadingProgress } from '../../hooks/useReadingProgress';
import { useAnnotations } from '../../hooks/useAnnotations';
import { useBookmarks } from '../../hooks/useBookmarks';
import { useAccessibility } from '../../hooks/useAccessibility';
import { CloseIcon, CheckIcon, BookIcon, NoteIcon, BookmarkIcon, ShareIcon, ChevronRightIcon } from '../../components/nav/icons';
import { tapHaptic } from '../../utils/haptics';
import { shareText } from '../../utils/share';
import NoteSheet from '../../components/annotate/NoteSheet';
import '../figures/VersePreviewSheet.css';
import './ParcoursActionsSheet.css';
import './ChapterActionSheet.css';

const EASE = [0.22, 0.8, 0.28, 1] as const;

type View = 'menu' | 'confirm-annotations' | 'confirm-reset';
type Status = 'lu' | 'en-cours' | 'non-lu';

interface ChapterActionSheetProps {
  book: Book;
  chapterNumber: number;
  onClose: () => void;
  onJustCompleted: (parcoursId: string) => void;
}

/** Feuille d'actions ouverte par l'appui long sur une case de la grille des chapitres. */
const ChapterActionSheet: React.FC<ChapterActionSheetProps> = ({
  book,
  chapterNumber,
  onClose,
  onJustCompleted
}) => {
  const navigate = useNavigate();
  const { settings } = useAccessibility();
  const { activeParcours, isRead, markRead, unmarkRead, positionFor, savePosition, clearPosition } =
    useReadingProgress();
  const { annotations, add, updateNote, remove, removeAllForSource } = useAnnotations();
  const { isBookmarked, toggle: toggleBookmark } = useBookmarks();
  const transition = settings.reduceMotion ? { duration: 0 } : { duration: 0.26, ease: EASE };

  const [view, setView] = useState<View>('menu');
  const [isNoteOpen, setIsNoteOpen] = useState(false);

  const category = getCategory(book.category);
  const sourceId = `${book.id}-${chapterNumber}`;
  const chapterAnnotations = annotations.filter(
    (a) => (a.target.kind === 'verse' || a.target.kind === 'chapter') && a.target.sourceId === sourceId
  );
  const annotationCount = chapterAnnotations.length;
  const notesCount = chapterAnnotations.filter((a) => a.note !== null).length;
  const chapterNote = chapterAnnotations.find((a) => a.target.kind === 'chapter') ?? null;

  const isReadActive = activeParcours ? isRead(activeParcours.id, book.id, chapterNumber) : false;
  const position = activeParcours ? positionFor(activeParcours.id) : undefined;
  const isInProgress = !!position && position.bookId === book.id && position.chapter === chapterNumber;
  const status: Status = isReadActive ? 'lu' : isInProgress ? 'en-cours' : 'non-lu';

  const bookmarkKey = `chapter:${book.id}-${chapterNumber}`;
  const isFavorite = isBookmarked(bookmarkKey);

  const readSubtitle = isReadActive
    ? 'Relire depuis le début'
    : isInProgress
      ? 'Reprendre la lecture'
      : 'Depuis le début';

  const setStatus = (next: Status) => {
    if (!activeParcours) return;
    tapHaptic();
    if (next === 'lu') {
      if (isInProgress) clearPosition(activeParcours.id);
      if (!isReadActive) {
        const { justCompleted } = markRead(activeParcours.id, book.id, chapterNumber, 'manual');
        if (justCompleted) onJustCompleted(activeParcours.id);
      }
    } else if (next === 'en-cours') {
      if (isReadActive) unmarkRead(activeParcours.id, book.id, chapterNumber);
      savePosition(activeParcours.id, book.id, chapterNumber, isInProgress && position ? position.scrollRatio : 0);
    } else {
      if (isReadActive) unmarkRead(activeParcours.id, book.id, chapterNumber);
      if (isInProgress) clearPosition(activeParcours.id);
    }
  };

  const handleRead = () => {
    tapHaptic();
    navigate(`/bible/${book.id}/${chapterNumber}`);
    onClose();
  };

  const handleSaveChapterNote = (text: string) => {
    const trimmed = text.trim();
    if (chapterNote) {
      if (trimmed === '') remove(chapterNote.id);
      else updateNote(chapterNote.id, trimmed);
    } else if (trimmed !== '') {
      add({
        target: { kind: 'chapter', sourceId, blockIndex: 0, start: 0, end: 0, quote: `${book.name} ${chapterNumber}` },
        style: { highlight: null, underline: false },
        note: trimmed
      });
    }
    setIsNoteOpen(false);
  };

  const handleToggleFavorite = () => {
    tapHaptic();
    toggleBookmark(bookmarkKey);
  };

  const handleShare = () => {
    tapHaptic();
    void shareText(`${book.name} ${chapterNumber}`, 'Partager la référence');
    onClose();
  };

  const confirmRemoveAnnotations = () => {
    tapHaptic();
    removeAllForSource('verse', sourceId);
    removeAllForSource('chapter', sourceId);
    onClose();
  };

  const confirmReset = () => {
    tapHaptic();
    if (activeParcours) {
      unmarkRead(activeParcours.id, book.id, chapterNumber);
      if (isInProgress) clearPosition(activeParcours.id);
    }
    removeAllForSource('verse', sourceId);
    removeAllForSource('chapter', sourceId);
    if (isFavorite) toggleBookmark(bookmarkKey);
    onClose();
  };

  return (
    <motion.div
      className="verse-sheet-backdrop"
      slot="fixed"
      role="presentation"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={transition}
    >
      <motion.div
        className="verse-sheet chapter-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={`Actions sur ${book.name} ${chapterNumber}`}
        onClick={(e) => e.stopPropagation()}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={transition}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={(_event, info) => {
          if (info.offset.y > 80 || info.velocity.y > 600) {
            onClose();
          }
        }}
      >
        <div className="verse-sheet-handle" aria-hidden="true" />

        <div className="verse-sheet-header">
          <div className="chapter-sheet-header-text">
            <p className="chapter-sheet-kicker">Chapitre</p>
            <h2 className="chapter-sheet-title">
              {book.name} {chapterNumber}
            </h2>
            <p className="chapter-sheet-subtitle">
              {category.label}
              {notesCount > 0 ? ` · ${notesCount} note${notesCount > 1 ? 's' : ''}` : ''}
            </p>
          </div>
          <button type="button" className="verse-sheet-close" onClick={onClose} aria-label="Fermer">
            <CloseIcon size={18} />
          </button>
        </div>

        {view === 'menu' && (
          <>
            <div className="chapter-sheet-section">
              <p className="chapter-sheet-section-label">Avancement</p>
              <div className="chapter-sheet-segment">
                <button
                  type="button"
                  className={`chapter-sheet-segment-btn${status === 'lu' ? ' is-active' : ''}`}
                  onClick={() => setStatus('lu')}
                  aria-pressed={status === 'lu'}
                >
                  <CheckIcon size={16} />
                  <span>Lu</span>
                </button>
                <button
                  type="button"
                  className={`chapter-sheet-segment-btn${status === 'en-cours' ? ' is-active' : ''}`}
                  onClick={() => setStatus('en-cours')}
                  aria-pressed={status === 'en-cours'}
                >
                  <span className="chapter-sheet-segment-dot" aria-hidden="true" />
                  <span>En cours</span>
                </button>
                <button
                  type="button"
                  className={`chapter-sheet-segment-btn${status === 'non-lu' ? ' is-active' : ''}`}
                  onClick={() => setStatus('non-lu')}
                  aria-pressed={status === 'non-lu'}
                >
                  <span className="chapter-sheet-segment-ring" aria-hidden="true" />
                  <span>Non lu</span>
                </button>
              </div>
            </div>

            <div className="chapter-sheet-list">
              <button type="button" className="chapter-sheet-row" onClick={handleRead}>
                <BookIcon size={18} className="chapter-sheet-row-icon" />
                <span className="chapter-sheet-row-text">
                  <span className="chapter-sheet-row-title">Lire le chapitre</span>
                  <span className="chapter-sheet-row-subtitle">{readSubtitle}</span>
                </span>
                <ChevronRightIcon size={14} className="chapter-sheet-row-chevron" />
              </button>

              <button
                type="button"
                className="chapter-sheet-row"
                onClick={() => {
                  tapHaptic();
                  setIsNoteOpen(true);
                }}
              >
                <NoteIcon size={18} className="chapter-sheet-row-icon" />
                <span className="chapter-sheet-row-text">
                  <span className="chapter-sheet-row-title">{chapterNote ? 'Modifier la note' : 'Ajouter une note'}</span>
                  <span className="chapter-sheet-row-subtitle">Sur le chapitre entier</span>
                </span>
                <ChevronRightIcon size={14} className="chapter-sheet-row-chevron" />
              </button>

              <button
                type="button"
                className="chapter-sheet-row"
                onClick={handleToggleFavorite}
                aria-pressed={isFavorite}
              >
                <BookmarkIcon size={18} filled={isFavorite} className="chapter-sheet-row-icon" />
                <span className="chapter-sheet-row-text">
                  <span className="chapter-sheet-row-title">
                    {isFavorite ? 'Retirer des favoris' : 'Mettre en favori'}
                  </span>
                </span>
                <ChevronRightIcon size={14} className="chapter-sheet-row-chevron" />
              </button>

              <button type="button" className="chapter-sheet-row" onClick={handleShare}>
                <ShareIcon size={18} className="chapter-sheet-row-icon" />
                <span className="chapter-sheet-row-text">
                  <span className="chapter-sheet-row-title">Partager la référence</span>
                </span>
                <ChevronRightIcon size={14} className="chapter-sheet-row-chevron" />
              </button>
            </div>

            <div className="chapter-sheet-section">
              <p className="chapter-sheet-section-label">Effacer</p>
              <button
                type="button"
                className="chapter-sheet-erase-row"
                disabled={annotationCount === 0}
                onClick={() => setView('confirm-annotations')}
              >
                <span>Retirer les annotations</span>
                {annotationCount > 0 && <span className="chapter-sheet-erase-count">{annotationCount}</span>}
              </button>
              <button type="button" className="chapter-sheet-erase-row" onClick={() => setView('confirm-reset')}>
                <span>Tout réinitialiser sur le chapitre</span>
                <ChevronRightIcon size={14} />
              </button>
              <p className="chapter-sheet-erase-hint">Une confirmation vous sera demandée.</p>
            </div>
          </>
        )}

        {view === 'confirm-annotations' && (
          <div className="parcours-actions-panel">
            <p className="parcours-actions-warning">
              Retirer les {annotationCount} annotation{annotationCount > 1 ? 's' : ''} de {book.name}{' '}
              {chapterNumber} (surlignages, soulignages et notes) ? Cette action est définitive.
            </p>
            <button
              type="button"
              className="parcours-actions-confirm parcours-actions-confirm--danger"
              onClick={confirmRemoveAnnotations}
            >
              Retirer les annotations
            </button>
          </div>
        )}

        {view === 'confirm-reset' && (
          <div className="parcours-actions-panel">
            <p className="parcours-actions-warning">
              Réinitialiser {book.name} {chapterNumber} effacera son statut de lecture, sa position « en cours », ses
              annotations et son favori. Cette action est définitive.
            </p>
            <button
              type="button"
              className="parcours-actions-confirm parcours-actions-confirm--danger"
              onClick={confirmReset}
            >
              Réinitialiser le chapitre
            </button>
          </div>
        )}

        <AnimatePresence>
          {isNoteOpen && (
            <NoteSheet
              quote={`${book.name} ${chapterNumber}`}
              initialText={chapterNote?.note ?? ''}
              reduceMotion={settings.reduceMotion}
              onSave={handleSaveChapterNote}
              onClose={() => setIsNoteOpen(false)}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default ChapterActionSheet;
