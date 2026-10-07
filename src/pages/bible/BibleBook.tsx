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
import ChapterActionSheet from './ChapterActionSheet';
import ChapterMenuTour from './ChapterMenuTour';
import './BibleBook.css';

const COLUMNS = 6;
const LONG_PRESS_MS = 450;
const MOVE_CANCEL_PX = 10;

const BibleBook: React.FC = () => {
  const navigate = useNavigate();
  const { bookId = '' } = useParams<{ bookId: string }>();
  const book = getBook(bookId);
  const { parcours, activeParcours, isRead, otherReaderOf, positionFor, forParcours } = useReadingProgress();
  const { annotations } = useAnnotations();

  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [completedParcoursId, setCompletedParcoursId] = useState<string | null>(null);
  const [menuChapter, setMenuChapter] = useState<number | null>(null);

  const annotatedSourceIds = useMemo(
    () =>
      new Set(
        annotations.filter((a) => a.target.kind === 'verse' || a.target.kind === 'chapter').map((a) => a.target.sourceId)
      ),
    [annotations]
  );

  // --- Gestes de la grille : tap ouvre le chapitre ; appui long ouvre un menu
  // d'actions sans l'ouvrir. La navigation est déclenchée directement au
  // relâchement du pointeur plutôt que via l'événement `click` natif : sur
  // certains appareils ce dernier arrive trop tard (après un appui long), ce
  // qui rouvrait le chapitre au relâchement. `onClick` ne sert donc plus qu'à
  // l'activation clavier (Entrée/Espace).
  const pressTimer = useRef<number | undefined>(undefined);
  const pressStart = useRef<{ x: number; y: number } | null>(null);
  const pressChapterRef = useRef<number | null>(null);
  const longPressEngagedRef = useRef(false);

  const handlePointerMove = (e: PointerEvent) => {
    if (!pressStart.current || longPressEngagedRef.current) return;
    const dx = e.clientX - pressStart.current.x;
    const dy = e.clientY - pressStart.current.y;
    if (Math.hypot(dx, dy) > MOVE_CANCEL_PX) {
      // Mouvement avant la fin du délai : l'utilisateur fait défiler la page, pas un appui long.
      window.clearTimeout(pressTimer.current);
      pressStart.current = null;
    }
  };

  const cleanupGesture = () => {
    window.clearTimeout(pressTimer.current);
    pressTimer.current = undefined;
    pressStart.current = null;
    pressChapterRef.current = null;
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
    window.removeEventListener('pointercancel', handlePointerCancel);
  };

  const handlePointerCancel = () => {
    longPressEngagedRef.current = false;
    cleanupGesture();
  };

  const handlePointerUp = () => {
    const wasTap = pressStart.current !== null && !longPressEngagedRef.current;
    const chapter = pressChapterRef.current;
    cleanupGesture();
    longPressEngagedRef.current = false;
    if (wasTap && chapter !== null && book) {
      navigate(`/bible/${book.id}/${chapter}`);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>, chapter: number) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (!book) return;
    pressStart.current = { x: e.clientX, y: e.clientY };
    pressChapterRef.current = chapter;
    longPressEngagedRef.current = false;
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerCancel);
    pressTimer.current = window.setTimeout(() => {
      if (!pressStart.current) return;
      longPressEngagedRef.current = true;
      tapHaptic();
      setMenuChapter(chapter);
    }, LONG_PRESS_MS);
  };

  const handleKeyboardClick = (e: React.MouseEvent<HTMLButtonElement>, chapter: number) => {
    // Les taps/clics pointeur sont déjà traités dans handlePointerUp ; ce
    // handler ne doit réagir qu'à une activation clavier (Entrée/Espace),
    // reconnaissable à detail === 0.
    if (e.detail !== 0 || !book) return;
    navigate(`/bible/${book.id}/${chapter}`);
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
                onClick={(e) => handleKeyboardClick(e, chapter)}
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

        <ChapterMenuTour />

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

        <AnimatePresence>
          {menuChapter !== null && (
            <ChapterActionSheet
              book={book}
              chapterNumber={menuChapter}
              onClose={() => setMenuChapter(null)}
              onJustCompleted={(parcoursId) => setCompletedParcoursId(parcoursId)}
            />
          )}
        </AnimatePresence>
      </IonContent>
    </IonPage>
  );
};

export default BibleBook;
