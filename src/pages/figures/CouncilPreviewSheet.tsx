import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { Council } from '../../data/councils';
import { useAccessibility } from '../../hooks/useAccessibility';
import { useBookmarks } from '../../hooks/useBookmarks';
import { BookmarkIcon, CloseIcon } from '../../components/nav/icons';
import './VersePreviewSheet.css';

const EASE = [0.22, 0.61, 0.36, 1] as const;

interface CouncilPreviewSheetProps {
  council: Council;
  onClose: () => void;
}

const CouncilPreviewSheet: React.FC<CouncilPreviewSheetProps> = ({ council, onClose }) => {
  const navigate = useNavigate();
  const { settings } = useAccessibility();
  const { isBookmarked, toggle } = useBookmarks();
  const bookmarkKey = `council:${council.id}`;

  const transition = settings.reduceMotion ? { duration: 0 } : { duration: 0.32, ease: EASE };

  return (
    <motion.div
      className="verse-sheet-backdrop"
      role="presentation"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={transition}
    >
      <motion.div
        className="verse-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={council.header}
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
          <div>
            <p className="verse-sheet-ref">{council.header.toUpperCase()}</p>
            <p className="verse-sheet-book">{council.title}</p>
          </div>
          <button type="button" className="verse-sheet-close" onClick={onClose} aria-label="Fermer">
            <CloseIcon size={18} />
          </button>
        </div>

        <div className="verse-sheet-body">
          <div className="verse-sheet-body-scroll">
            <p className="verse-sheet-quote">« {council.quote} »</p>
          </div>
        </div>

        <div className="verse-sheet-actions">
          <button
            type="button"
            className="verse-sheet-read"
            onClick={() => {
              onClose();
              navigate(`/credo/${council.id}`);
            }}
          >
            {council.actionLabel}
          </button>
          <button
            type="button"
            className="verse-sheet-bookmark"
            onClick={() => toggle(bookmarkKey)}
            aria-pressed={isBookmarked(bookmarkKey)}
            aria-label="Ajouter aux favoris"
          >
            <BookmarkIcon size={18} filled={isBookmarked(bookmarkKey)} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CouncilPreviewSheet;
