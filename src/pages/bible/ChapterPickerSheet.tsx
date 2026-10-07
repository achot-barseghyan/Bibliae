import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Book } from '../../data/bible';
import { useAccessibility } from '../../hooks/useAccessibility';
import { CloseIcon } from '../../components/nav/icons';
import { tapHaptic } from '../../utils/haptics';
import '../figures/VersePreviewSheet.css';
import './ChapterPickerSheet.css';

const EASE = [0.22, 0.8, 0.28, 1] as const;
const COLUMNS = 7;

interface ChapterPickerSheetProps {
  book: Book;
  currentChapter: number;
  onClose: () => void;
}

/** Feuille de saut rapide de chapitre, ouverte depuis le titre du header ou le centre de la barre de pagination. */
const ChapterPickerSheet: React.FC<ChapterPickerSheetProps> = ({ book, currentChapter, onClose }) => {
  const navigate = useNavigate();
  const { settings } = useAccessibility();
  const transition = settings.reduceMotion ? { duration: 0 } : { duration: 0.26, ease: EASE };
  const emptyCount = Math.ceil(book.chapters / COLUMNS) * COLUMNS - book.chapters;

  const goToChapter = (chapter: number) => {
    if (chapter !== currentChapter) {
      tapHaptic();
      navigate(`/bible/${book.id}/${chapter}`, { replace: true });
    }
    onClose();
  };

  const goToBookList = () => {
    tapHaptic();
    navigate('/bible');
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
        className="verse-sheet chapter-picker-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={`Choisir un chapitre de ${book.name}`}
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

        <div className="chapter-picker-header">
          <button type="button" className="chapter-picker-title" onClick={goToBookList}>
            {book.name}
          </button>
          <button type="button" className="verse-sheet-close" onClick={onClose} aria-label="Fermer">
            <CloseIcon size={18} />
          </button>
        </div>

        <div className="chapter-picker-grid">
          {Array.from({ length: book.chapters }, (_, index) => {
            const chapter = index + 1;
            const isCurrent = chapter === currentChapter;
            return (
              <button
                key={chapter}
                type="button"
                className={`chapter-picker-cell${isCurrent ? ' is-current' : ''}`}
                onClick={() => goToChapter(chapter)}
                aria-current={isCurrent ? 'true' : undefined}
              >
                {chapter}
              </button>
            );
          })}
          {Array.from({ length: emptyCount }, (_, index) => (
            <span key={`empty-${index}`} className="chapter-picker-cell chapter-picker-cell--empty" aria-hidden="true" />
          ))}
        </div>

        <p className="chapter-picker-hint">Toucher « {book.name} » revient à la liste des livres.</p>
      </motion.div>
    </motion.div>
  );
};

export default ChapterPickerSheet;
