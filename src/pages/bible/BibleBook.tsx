import { useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { IonContent, IonPage } from '@ionic/react';
import { getBook, getCategory } from '../../data/bible';
import { useReadingProgress } from '../../hooks/useReadingProgress';
import { useAnnotations } from '../../hooks/useAnnotations';
import { tapHaptic } from '../../utils/haptics';
import BibleHeader from './BibleHeader';
import ParcoursBandeau from './ParcoursBandeau';
import ParcoursSelectorSheet from './ParcoursSelectorSheet';
import ParcoursCreateSheet from './ParcoursCreateSheet';
import ParcoursCompletionSheet from './ParcoursCompletionSheet';
import './BibleBook.css';

const COLUMNS = 6;
const LONG_PRESS_MS = 450;
const MOVE_CANCEL_PX = 10;

const BibleBook: React.FC = () => {
  const navigate = useNavigate();
  const { bookId = '' } = useParams<{ bookId: string }>();
  const book = getBook(bookId);
  const {
    parcours,
    activeParcours,
    isRead,
    markRead,
    unmarkRead,
    otherReaderOf,
    positionFor,
    forParcours,
    hasEverMarkedManually
  } = useReadingProgress();
  const { annotations } = useAnnotations();

  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [completedParcoursId, setCompletedParcoursId] = useState<string | null>(null);

  const annotatedSourceIds = useMemo(
    () => new Set(annotations.filter((a) => a.target.kind === 'verse').map((a) => a.target.sourceId)),
    [annotations]
  );

  // --- Gestes de la grille : tap ouvre ; appui long bascule lu/non lu sans
  // ouvrir ; appui long puis glissement étend le marquage à une plage. ---
  const pressTimer = useRef<number | undefined>(undefined);
  const pressStart = useRef<{ x: number; y: number } | null>(null);
  const dragValueRef = useRef<boolean | null>(null);
  const draggedChaptersRef = useRef<Set<number>>(new Set());
  const longPressEngagedRef = useRef(false);

  const applyToChapter = (chapter: number, value: boolean) => {
    if (!activeParcours || !book) return;
    if (draggedChaptersRef.current.has(chapter)) return;
    draggedChaptersRef.current.add(chapter);
    tapHaptic();
    if (value) {
      const { justCompleted } = markRead(activeParcours.id, book.id, chapter, 'manual');
      if (justCompleted) setCompletedParcoursId(activeParcours.id);
    } else {
      unmarkRead(activeParcours.id, book.id, chapter);
    }
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!pressStart.current) return;
    if (!longPressEngagedRef.current) {
      const dx = e.clientX - pressStart.current.x;
      const dy = e.clientY - pressStart.current.y;
      if (Math.hypot(dx, dy) > MOVE_CANCEL_PX) {
        // Mouvement avant la fin du délai : l'utilisateur fait défiler la page, pas un appui long.
        window.clearTimeout(pressTimer.current);
        pressStart.current = null;
      }
      return;
    }
    if (dragValueRef.current === null) return;
    const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    const chapterAttr = el?.closest<HTMLElement>('[data-chapter]')?.dataset.chapter;
    if (!chapterAttr) return;
    applyToChapter(Number(chapterAttr), dragValueRef.current);
  };

  const endGesture = () => {
    window.clearTimeout(pressTimer.current);
    pressTimer.current = undefined;
    pressStart.current = null;
    dragValueRef.current = null;
    draggedChaptersRef.current.clear();
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', endGesture);
    window.removeEventListener('pointercancel', endGesture);
    // Laisse le clic natif (déclenché juste après pointerup pour un appui long) voir le flag
    // avant de le réinitialiser pour le prochain geste.
    window.setTimeout(() => {
      longPressEngagedRef.current = false;
    }, 0);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>, chapter: number) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (!book) return;
    pressStart.current = { x: e.clientX, y: e.clientY };
    longPressEngagedRef.current = false;
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', endGesture);
    window.addEventListener('pointercancel', endGesture);
    pressTimer.current = window.setTimeout(() => {
      if (!pressStart.current || !activeParcours) return;
      longPressEngagedRef.current = true;
      const nextValue = !isRead(activeParcours.id, book.id, chapter);
      dragValueRef.current = nextValue;
      applyToChapter(chapter, nextValue);
    }, LONG_PRESS_MS);
  };

  const handleTap = (chapter: number) => {
    if (longPressEngagedRef.current) {
      longPressEngagedRef.current = false;
      return;
    }
    navigate(`/bible/${book!.id}/${chapter}`);
  };

  if (!book) {
    return (
      <IonPage>
        <IonContent fullscreen className="bible-book-content">
          <BibleHeader title="Livre introuvable" backIcon="chevron" onBack={() => navigate(-1)} />
        </IonContent>
      </IonPage>
    );
  }

  const category = getCategory(book.category);
  const cellCount = Math.ceil(book.chapters / COLUMNS) * COLUMNS;
  const readInBook = activeParcours ? forParcours(activeParcours.id).filter((c) => c.bookId === book.id).length : 0;
  const bookProgressPercent = book.chapters > 0 ? Math.round((readInBook / book.chapters) * 100) : 0;
  const position = activeParcours ? positionFor(activeParcours.id) : undefined;
  const completedParcours = completedParcoursId ? parcours.find((p) => p.id === completedParcoursId) ?? null : null;

  return (
    <IonPage>
      <IonContent fullscreen className="bible-book-content">
        <BibleHeader title={book.name} backIcon="chevron" onBack={() => navigate(-1)} />

        <ParcoursBandeau onOpenSelector={() => setIsSelectorOpen(true)} />

        <div className="bible-book-heading">
          <div>
            <h2 className="bible-book-title">{book.name}</h2>
            <p className="bible-book-subtitle">
              {category.label} · {book.chapters} chapitres
            </p>
          </div>
          <span className="bible-book-badge">{book.abbreviation}</span>
        </div>

        {activeParcours && (
          <div className="bible-book-progress">
            <span className="bible-book-progress-track">
              <span
                className={`bible-book-progress-fill bible-book-progress-fill--${activeParcours.color}`}
                style={{ width: `${bookProgressPercent}%` }}
              />
            </span>
            <span className="bible-book-progress-count">
              {readInBook} / {book.chapters}
            </span>
          </div>
        )}

        <div className="bible-chapter-grid">
          {Array.from({ length: cellCount }, (_, index) => {
            const chapter = index + 1;
            if (chapter > book.chapters) {
              return <span className="bible-chapter-cell bible-chapter-cell--empty" key={index} aria-hidden="true" />;
            }

            const isReadActive = activeParcours ? isRead(activeParcours.id, book.id, chapter) : false;
            const isInProgress = !isReadActive && position?.bookId === book.id && position.chapter === chapter;
            const other = activeParcours ? otherReaderOf(book.id, chapter, activeParcours.id) : undefined;
            const hasNote = annotatedSourceIds.has(`${book.id}-${chapter}`);

            const classes = ['bible-chapter-cell'];
            if (isReadActive && activeParcours) classes.push('is-read', `is-read--${activeParcours.color}`);
            if (isInProgress) classes.push('is-in-progress');
            if (other) classes.push('has-other', `has-other--${other.parcours.color}`);

            return (
              <button
                key={index}
                type="button"
                className={classes.join(' ')}
                data-chapter={chapter}
                onPointerDown={(e) => handlePointerDown(e, chapter)}
                onClick={() => handleTap(chapter)}
                onContextMenu={(e) => e.preventDefault()}
              >
                {chapter}
                {hasNote && <span className="bible-chapter-cell-note" aria-hidden="true" />}
              </button>
            );
          })}
        </div>

        <div className="bible-book-legend">
          <div className="bible-book-legend-row">
            <span className="bible-book-legend-item">
              <span className={`bible-book-legend-swatch bible-book-legend-swatch--read${activeParcours ? ` bible-book-legend-swatch--read-${activeParcours.color}` : ''}`} />
              Lu
            </span>
            <span className="bible-book-legend-item">
              <span className="bible-book-legend-swatch bible-book-legend-swatch--progress" />
              En cours
            </span>
          </div>
          <div className="bible-book-legend-row">
            <span className="bible-book-legend-item">
              <span className="bible-book-legend-swatch bible-book-legend-swatch--other" />
              Autre parcours
            </span>
            <span className="bible-book-legend-item">
              <span className="bible-book-legend-swatch bible-book-legend-swatch--note" />
              Note
            </span>
          </div>
        </div>

        {!hasEverMarkedManually && (
          <p className="bible-book-hint">Appui long sur un chapitre pour le marquer lu sans l'ouvrir.</p>
        )}

        <AnimatePresence>
          {isSelectorOpen && <ParcoursSelectorSheet onClose={() => setIsSelectorOpen(false)} />}
        </AnimatePresence>

        <AnimatePresence>
          {isCreateOpen && (
            <ParcoursCreateSheet onClose={() => setIsCreateOpen(false)} onCreated={() => setIsCreateOpen(false)} />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {completedParcours && (
            <ParcoursCompletionSheet
              parcours={completedParcours}
              onClose={() => setCompletedParcoursId(null)}
              onCreateNew={() => {
                setCompletedParcoursId(null);
                setIsCreateOpen(true);
              }}
            />
          )}
        </AnimatePresence>
      </IonContent>
    </IonPage>
  );
};

export default BibleBook;
