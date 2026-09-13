import { motion } from 'framer-motion';
import type { Annotation } from '../../hooks/useAnnotations';
import { CloseIcon, ChevronRightIcon } from '../../components/nav/icons';
import { tapHaptic } from '../../utils/haptics';
import '../figures/VersePreviewSheet.css';
import './ChapterNotesSheet.css';

const EASE = [0.22, 0.8, 0.28, 1] as const;

interface ChapterNotesSheetProps {
  bookAbbreviation: string;
  bookName: string;
  chapterNumber: number;
  notes: Annotation[];
  reduceMotion: boolean;
  onSelect: (annotation: Annotation) => void;
  onClose: () => void;
}

/** Feuille listant toutes les notes du chapitre en cours, triées par ordre d'apparition. */
const ChapterNotesSheet: React.FC<ChapterNotesSheetProps> = ({
  bookAbbreviation,
  bookName,
  chapterNumber,
  notes,
  reduceMotion,
  onSelect,
  onClose
}) => {
  const transition = reduceMotion ? { duration: 0 } : { duration: 0.26, ease: EASE };

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
        className="verse-sheet chapter-notes-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={`Notes de ${bookName} ${chapterNumber}`}
        onClick={(e) => e.stopPropagation()}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={transition}
      >
        <div className="verse-sheet-handle" aria-hidden="true" />

        <div className="verse-sheet-header">
          <div>
            <p className="chapter-notes-title">Mes notes</p>
            <p className="chapter-notes-subtitle">
              {bookName} {chapterNumber} · {notes.length} note{notes.length > 1 ? 's' : ''}
            </p>
          </div>
          <button type="button" className="verse-sheet-close" onClick={onClose} aria-label="Fermer">
            <CloseIcon size={18} />
          </button>
        </div>

        <div className="chapter-notes-list">
          {notes.map((annotation) => {
            const highlight = annotation.style.highlight ?? 'oxblood';
            return (
              <button
                key={annotation.id}
                type="button"
                className={`chapter-notes-item chapter-notes-item--${highlight}`}
                onClick={() => {
                  tapHaptic();
                  onSelect(annotation);
                }}
              >
                <span className="chapter-notes-item-main">
                  <span className="chapter-notes-item-note">{annotation.note}</span>
                  <span className="chapter-notes-item-meta">
                    <span className="chapter-notes-item-ref">
                      {bookAbbreviation} {chapterNumber}, {annotation.target.blockIndex}
                    </span>
                    <span className="chapter-notes-item-quote">{annotation.target.quote}</span>
                  </span>
                </span>
                <ChevronRightIcon size={14} className="chapter-notes-item-chevron" />
              </button>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ChapterNotesSheet;
