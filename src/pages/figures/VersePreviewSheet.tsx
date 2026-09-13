import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getBook, getCategory } from '../../data/bible';
import type { ScriptureRef } from '../../data/figureDetails';
import { fetchChapterVerses, type Verse } from '../../db/versesRepository';
import { useAccessibility } from '../../hooks/useAccessibility';
import { useBookmarks } from '../../hooks/useBookmarks';
import { BookmarkIcon, CloseIcon } from '../../components/nav/icons';
import './VersePreviewSheet.css';

const EASE = [0.22, 0.61, 0.36, 1] as const;

interface VersePreviewSheetProps {
  refData: ScriptureRef;
  onClose: () => void;
}

const VersePreviewSheet: React.FC<VersePreviewSheetProps> = ({ refData, onClose }) => {
  const navigate = useNavigate();
  const { settings } = useAccessibility();
  const { isBookmarked, toggle } = useBookmarks();
  const [verses, setVerses] = useState<Verse[]>([]);

  const book = getBook(refData.bookId);
  const category = book ? getCategory(book.category) : null;
  const bookmarkKey = `verse:${refData.bookId}-${refData.chapter}-${refData.verseStart}`;

  useEffect(() => {
    let cancelled = false;
    fetchChapterVerses(refData.bookId, refData.chapter)
      .then((rows) => {
        if (!cancelled) setVerses(rows);
      })
      .catch(() => {
        if (!cancelled) setVerses([]);
      });
    return () => {
      cancelled = true;
    };
  }, [refData.bookId, refData.chapter]);

  const verseEnd = refData.verseEnd ?? refData.verseStart;
  const quote = verses
    .filter((v) => v.number >= refData.verseStart && v.number <= verseEnd)
    .map((v) => v.text)
    .join(' ');

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
        aria-label={refData.display}
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
            <p className="verse-sheet-ref">{refData.display.toUpperCase()}</p>
            {book && category && (
              <p className="verse-sheet-book">
                {category.label} · {book.name}
              </p>
            )}
          </div>
          <button type="button" className="verse-sheet-close" onClick={onClose} aria-label="Fermer">
            <CloseIcon size={18} />
          </button>
        </div>

        <p className="verse-sheet-quote">
          {quote ? `« ${quote} »` : 'Aperçu indisponible — texte biblique pas encore intégré.'}
        </p>

        <div className="verse-sheet-actions">
          <button
            type="button"
            className="verse-sheet-read"
            onClick={() => {
              onClose();
              navigate(`/bible/${refData.bookId}/${refData.chapter}`);
            }}
          >
            Lire le passage
          </button>
          <button
            type="button"
            className="verse-sheet-bookmark"
            onClick={() => toggle(bookmarkKey)}
            aria-pressed={isBookmarked(bookmarkKey)}
            aria-label="Ajouter le verset aux favoris"
          >
            <BookmarkIcon size={18} filled={isBookmarked(bookmarkKey)} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default VersePreviewSheet;
