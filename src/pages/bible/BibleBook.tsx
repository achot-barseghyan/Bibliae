import { useEffect, useMemo, useRef, useState } from 'react';
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
import ChapterLegend from './ChapterLegend';
import WorldButton from '../../components/nav/WorldButton';
import { ChevronLeftIcon } from '../../components/nav/icons';
import { CATEGORY_GRADIENT } from './bibleSections';
import { RISE_IN, countUp, fillRing, stagger, useBibleReducedMotion, useRevealOnce } from './bibleMotion';
import './BibleBook.css';

const RING_C = 389.6;
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
  const reduceMotion = useBibleReducedMotion();
  const heroRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const hasPlayedIntroRef = useRef(false);

  const bookReadCount =
    book && activeParcours ? forParcours(activeParcours.id).filter((c) => c.bookId === book.id).length : 0;

  // Entrée du bandeau et de la grille, une fois par livre ouvert.
  useRevealOnce(book?.id, () => {
    if (reduceMotion || !heroRef.current || !bodyRef.current) return;
    stagger(heroRef.current.querySelectorAll('[data-b2]'), RISE_IN, { duration: 900, delay: 100, step: 110 });
    stagger(
      bodyRef.current.querySelectorAll('[data-cell]'),
      [{ opacity: 0, transform: 'scale(.5) translateY(10px)' }, { opacity: 1, transform: 'none' }],
      { duration: 600, delay: 350, step: 16, maxStagger: 900 }
    );
  });

  // Anneau et compteur : animés à l'ouverture, mis à jour sans animation ensuite.
  useEffect(() => {
    if (!book) return;
    const animate = !reduceMotion && !hasPlayedIntroRef.current;
    hasPlayedIntroRef.current = true;
    fillRing(ringRef.current, RING_C, bookReadCount / book.chapters, 250, !animate);
    // Pas d'annulation au nettoyage : StrictMode rejoue l'effet aussitôt, et
    // couper le compteur le figerait sur sa valeur finale sans l'animer.
    countUp(countRef.current, bookReadCount, 250, !animate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book?.id, bookReadCount]);

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
          <BibleHeader title="Livre introuvable" onBack={() => navigate(-1)} />
          <WorldButton />
        </IonContent>
      </IonPage>
    );
  }

  const category = getCategory(book.category);
  const readInBook = bookReadCount;
  const position = activeParcours ? positionFor(activeParcours.id) : undefined;
  const completedParcours = completedParcoursId ? parcours.find((p) => p.id === completedParcoursId) ?? null : null;
  const isReadActive = (chapter: number) => (activeParcours ? isRead(activeParcours.id, book.id, chapter) : false);

  // Chapitre où reprendre : la position mémorisée si elle est dans ce livre
  // et pas encore lue, sinon le premier chapitre non lu d'un livre entamé.
  let resumeChapter: number | null = null;
  if (position?.bookId === book.id && !isReadActive(position.chapter)) {
    resumeChapter = position.chapter;
  } else if (readInBook > 0 && readInBook < book.chapters) {
    for (let n = 1; n <= book.chapters; n++) {
      if (!isReadActive(n)) {
        resumeChapter = n;
        break;
      }
    }
  }
  const isBookDone = !!activeParcours && readInBook >= book.chapters;
  const cta = isBookDone
    ? { label: 'Relire depuis le chapitre 1', chapter: 1 }
    : resumeChapter !== null
      ? { label: `Reprendre · chapitre ${resumeChapter}`, chapter: resumeChapter }
      : { label: 'Commencer la lecture', chapter: 1 };

  return (
    <IonPage>
      <IonContent fullscreen className="bible-book-content">
        <div className="bible-book-hero" ref={heroRef} style={{ background: CATEGORY_GRADIENT[book.category] }}>
          <span className="bible-book-hero-abbr" aria-hidden="true" data-b2>
            {book.abbreviation}
          </span>
          <div className="bible-book-hero-top">
            <button
              type="button"
              className="bible-book-back"
              onClick={() => {
                tapHaptic();
                navigate(-1);
              }}
            >
              <ChevronLeftIcon size={16} />
              La Bible
            </button>
            <span className="bible-book-hero-category">{category.label}</span>
          </div>

          <div className="bible-book-ring">
            <span className="bible-book-ring-glow" aria-hidden="true" />
            <span className="bible-rays bible-book-ring-rays" aria-hidden="true" />
            <svg width="170" height="170" viewBox="0 0 170 170" aria-hidden="true">
              <circle cx="85" cy="85" r="62" className="bible-book-ring-track" />
              <circle
                ref={ringRef}
                cx="85"
                cy="85"
                r="62"
                className="bible-book-ring-fill"
                strokeDasharray={RING_C}
                strokeDashoffset={RING_C}
              />
            </svg>
            <span className="bible-book-ring-label">
              <span className="bible-book-ring-count" ref={countRef} />
              <span className="bible-book-ring-caption">sur {book.chapters} lus</span>
            </span>
          </div>

          <h2 className="bible-book-title" data-b2>
            {book.name}
          </h2>
          <p className="bible-book-subtitle" data-b2>
            {category.label} · {book.chapters} chapitre{book.chapters > 1 ? 's' : ''}
          </p>
          <div className="bible-book-cta-row" data-b2>
            <button
              type="button"
              className="bible-book-cta"
              onClick={() => {
                tapHaptic();
                navigate(`/bible/${book.id}/${cta.chapter}`);
              }}
            >
              <span className="bible-book-cta-shine" aria-hidden="true" />
              <span className="bible-book-cta-label">{cta.label}</span>
              <span className="bible-book-cta-arrow" aria-hidden="true">
                →
              </span>
            </button>
          </div>
        </div>

        <ParcoursBandeau onOpenSelector={() => setIsSelectorOpen(true)} />

        <div className="bible-book-body" ref={bodyRef}>
          <div className="bible-book-grid-heading">
            <span className="bible-book-grid-title">Chapitres</span>
            <span className="bible-book-grid-rule" />
            {activeParcours && (
              <span className="bible-book-grid-count">
                {readInBook} / {book.chapters}
              </span>
            )}
          </div>

          <div className="bible-chapter-grid">
            {Array.from({ length: book.chapters }, (_, index) => {
              const chapter = index + 1;
              const isCurrent = chapter === resumeChapter;
              const other =
                activeParcours && !isCurrent ? otherReaderOf(book.id, chapter, activeParcours.id) : undefined;
              const hasNote = annotatedSourceIds.has(`${book.id}-${chapter}`);

              const classes = ['bible-chapter-cell'];
              if (isCurrent) classes.push('is-current');
              else if (activeParcours && isReadActive(chapter)) classes.push('is-read', `is-read--${activeParcours.color}`);

              return (
                <button
                  key={chapter}
                  type="button"
                  className={classes.join(' ')}
                  data-chapter={chapter}
                  data-cell
                  onPointerDown={(e) => handlePointerDown(e, chapter)}
                  onClick={(e) => handleKeyboardClick(e, chapter)}
                  onContextMenu={(e) => e.preventDefault()}
                >
                  {chapter}
                  {other && (
                    <span
                      className={`bible-chapter-cell-other bible-chapter-cell-other--${other.parcours.color}`}
                      aria-hidden="true"
                    />
                  )}
                  {hasNote && <span className="bible-chapter-cell-note" aria-hidden="true" />}
                </button>
              );
            })}
          </div>

          <ChapterLegend readColor={activeParcours?.color} />
          <p className="bible-book-hint">Appui long sur un chapitre pour le marquer lu sans l'ouvrir.</p>
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
        <WorldButton />
      </IonContent>
    </IonPage>
  );
};

export default BibleBook;
