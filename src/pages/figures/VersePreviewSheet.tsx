import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getBook, getCategory } from '../../data/bible';
import type { ScriptureRef } from '../../data/figureDetails';
import { useChapterVerses } from '../../hooks/useChapterVerses';
import { useAccessibility } from '../../hooks/useAccessibility';
import { useBookmarks } from '../../hooks/useBookmarks';
import { AccessibilityIcon, BookmarkIcon, ChevronDownIcon, CloseIcon } from '../../components/nav/icons';
import AccessibilityQuickSheet from '../../components/AccessibilityQuickSheet';
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
  const { verses, isLoading } = useChapterVerses(refData.bookId, refData.chapter);
  const [isA11yOpen, setIsA11yOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollMore, setCanScrollMore] = useState(false);

  const book = getBook(refData.bookId);
  const category = book ? getCategory(book.category) : null;
  const bookmarkKey = `verse:${refData.bookId}-${refData.chapter}-${refData.verseStart}`;

  const verseEnd = refData.verseEnd ?? refData.verseStart;
  const quoteVerses = verses.filter((v) => v.number >= refData.verseStart && v.number <= verseEnd);
  const hasQuote = quoteVerses.length > 0;

  // Repère s'il reste du texte sous le bord visible : sans ça, rien
  // n'indique qu'une citation longue continue au-delà du cadre visible.
  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollMore(el.scrollHeight - el.scrollTop - el.clientHeight > 4);
  }, []);

  useEffect(() => {
    checkScroll();
  }, [quoteVerses.length, checkScroll]);

  const transition = settings.reduceMotion ? { duration: 0 } : { duration: 0.32, ease: EASE };

  return (
    <>
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
            <div className="verse-sheet-header-actions">
              <button
                type="button"
                className={`verse-sheet-a11y${isA11yOpen ? ' is-active' : ''}`}
                onClick={() => setIsA11yOpen(true)}
                aria-label="Accessibilité et lecture"
                aria-haspopup="dialog"
                aria-expanded={isA11yOpen}
              >
                <AccessibilityIcon size={18} />
              </button>
              <button type="button" className="verse-sheet-close" onClick={onClose} aria-label="Fermer">
                <CloseIcon size={18} />
              </button>
            </div>
          </div>

          <div className="verse-sheet-body">
            <div className="verse-sheet-body-scroll" ref={scrollRef} onScroll={checkScroll}>
              {hasQuote ? (
                <div className="verse-sheet-quote">
                  {quoteVerses.map((v, i) => (
                    <p className="verse-sheet-verse" key={v.number}>
                      {i === 0 && '« '}
                      <span className="verse-sheet-verse-number">{v.number}</span>
                      {v.text}
                      {i === quoteVerses.length - 1 && ' »'}
                    </p>
                  ))}
                </div>
              ) : isLoading ? (
                <div className="verse-sheet-loading">
                  <div className="verse-sheet-loading-spinner" aria-hidden="true" />
                  <p className="verse-sheet-loading-text">Chargement du texte…</p>
                </div>
              ) : (
                <p className="verse-sheet-quote">Aperçu indisponible — texte biblique pas encore intégré.</p>
              )}
            </div>
            {canScrollMore && (
              <>
                <div className="verse-sheet-scroll-fade" aria-hidden="true" />
                <ChevronDownIcon size={16} className="verse-sheet-scroll-hint" />
              </>
            )}
          </div>

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

      <AnimatePresence>
        {isA11yOpen && <AccessibilityQuickSheet onClose={() => setIsA11yOpen(false)} />}
      </AnimatePresence>
    </>
  );
};

export default VersePreviewSheet;
