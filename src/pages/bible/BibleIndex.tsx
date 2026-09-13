import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { IonContent, IonPage } from '@ionic/react';
import {
  booksByTestament,
  categoriesByTestament,
  booksInCategory,
  type Book,
  type CategoryKey,
  type Testament
} from '../../data/bible';
import { useAccessibility } from '../../hooks/useAccessibility';
import { useReadingProgress } from '../../hooks/useReadingProgress';
import WorldSheet from '../../components/nav/WorldSheet';
import BibleHeader from './BibleHeader';
import ParcoursBandeau from './ParcoursBandeau';
import ParcoursSelectorSheet from './ParcoursSelectorSheet';
import { ChevronRightIcon } from '../../components/nav/icons';
import './BibleIndex.css';

const TESTAMENTS: { key: Testament; label: string }[] = [
  { key: 'ancien', label: 'Ancien' },
  { key: 'nouveau', label: 'Nouveau' }
];

const BibleIndex: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useAccessibility();
  const { activeParcours, forParcours } = useReadingProgress();
  const [testament, setTestament] = useState<Testament>('ancien');
  const [isWorldSheetOpen, setIsWorldSheetOpen] = useState(false);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Partial<Record<CategoryKey, HTMLDivElement | null>>>({});

  const categories = categoriesByTestament(testament);

  const readCountByBook = new Map<string, number>();
  if (activeParcours) {
    forParcours(activeParcours.id).forEach((c) => readCountByBook.set(c.bookId, (readCountByBook.get(c.bookId) ?? 0) + 1));
  }

  const categoryPercent = (books: Book[]): number => {
    const total = books.reduce((sum, b) => sum + b.chapters, 0);
    if (total === 0) return 0;
    const read = books.reduce((sum, b) => sum + Math.min(b.chapters, readCountByBook.get(b.id) ?? 0), 0);
    return Math.round((read / total) * 100);
  };

  const transition = settings.reduceMotion
    ? { duration: 0 }
    : { duration: 0.18, ease: [0.4, 0, 0.2, 1] as const };

  const scrollToCategory = (key: CategoryKey) => {
    const target = sectionRefs.current[key];
    const container = scrollRef.current;
    if (!target || !container) return;
    // `target.offsetTop` remonte jusqu'au premier ancêtre positionné, qui
    // n'est pas forcément `container` (ici aucun des deux ne l'est) : le
    // résultat inclut alors tout ce qui précède le conteneur de scroll
    // (en-tête, onglets...) et fait défiler bien trop loin. On mesure donc
    // l'écart réel entre les deux éléments à l'écran.
    const targetTop = target.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;
    container.scrollTo({
      top: targetTop - 8,
      behavior: settings.reduceMotion ? 'auto' : 'smooth'
    });
  };

  return (
    <IonPage>
      <IonContent fullscreen className="bible-index-content">
        <BibleHeader
          title="La Bible"
          backIcon="world"
          onBack={() => setIsWorldSheetOpen(true)}
        />

        <ParcoursBandeau onOpenSelector={() => setIsSelectorOpen(true)} />

        <div className="bible-tabs" role="tablist">
          {TESTAMENTS.map((t) => {
            const count = booksByTestament(t.key).length;
            const isActive = testament === t.key;
            return (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`bible-tab${isActive ? ' is-active' : ''}`}
                onClick={() => setTestament(t.key)}
              >
                {t.label} <span className="bible-tab-count">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="bible-index-body">
          <div className="bible-index-list" ref={scrollRef}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={testament}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={transition}
              >
                {categories.map((category) => (
                  <div
                    key={category.key}
                    className="bible-category"
                    ref={(el) => {
                      sectionRefs.current[category.key] = el;
                    }}
                  >
                    <div className="bible-category-heading">
                      <span className="bible-category-name">{category.label}</span>
                      <span className="bible-category-count">
                        {booksInCategory(category.key).length}
                      </span>
                      {activeParcours && (
                        <span className="bible-category-percent">
                          {categoryPercent(booksInCategory(category.key))}%
                        </span>
                      )}
                    </div>

                    {booksInCategory(category.key).map((book) => {
                      const read = Math.min(book.chapters, readCountByBook.get(book.id) ?? 0);
                      const isComplete = !!activeParcours && book.chapters > 0 && read >= book.chapters;
                      const percent = book.chapters > 0 ? Math.round((read / book.chapters) * 100) : 0;
                      return (
                        <button
                          key={book.id}
                          type="button"
                          className="bible-book-row"
                          onClick={() => navigate(`/bible/${book.id}`)}
                        >
                          <span className="bible-book-abbr">{book.abbreviation}</span>
                          <span className="bible-book-main">
                            <span className="bible-book-name">{book.name}</span>
                            {activeParcours && (
                              <span className="bible-book-progress-row">
                                <span className="bible-book-progress-row-track">
                                  <span
                                    className={`bible-book-progress-row-fill bible-book-progress-row-fill--${activeParcours.color}`}
                                    style={{ width: `${percent}%` }}
                                  />
                                </span>
                                <span className="bible-book-progress-row-label">
                                  {isComplete ? 'Achevé' : read === 0 ? 'Non commencé' : `${read} / ${book.chapters}`}
                                </span>
                              </span>
                            )}
                          </span>
                          {isComplete ? (
                            <ChevronRightIcon size={14} className="bible-book-row-check" />
                          ) : (
                            <span className="bible-book-chapters">{book.chapters}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="bible-rail">
            {categories.map((category) => (
              <button
                key={category.key}
                type="button"
                className="bible-rail-button"
                onClick={() => scrollToCategory(category.key)}
                aria-label={`Aller à ${category.label}`}
              >
                {category.railLabel}
              </button>
            ))}
          </div>
        </div>

        <WorldSheet isOpen={isWorldSheetOpen} onClose={() => setIsWorldSheetOpen(false)} />

        <AnimatePresence>
          {isSelectorOpen && <ParcoursSelectorSheet onClose={() => setIsSelectorOpen(false)} />}
        </AnimatePresence>
      </IonContent>
    </IonPage>
  );
};

export default BibleIndex;
