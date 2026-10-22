import { useCallback, useEffect, useRef, useState } from 'react';
import type { Book } from '../../data/bible';
import { useReadingProgress, type BookReadsSnapshot } from '../../hooks/useReadingProgress';
import { getAppData } from '../../services/appDataStore';
import { tapHaptic } from '../../utils/haptics';
import { formatRanges, paintRange } from './chapterSelection';

const LONG_PRESS_MS = 420;
const MOVE_CANCEL_PX = 8;
const UNDO_TOAST_MS = 6000;

// Geste en cours sur la grille : un appui qui peut devenir un tap ou un appui
// long, ou un glissement de sélection (ajout ou retrait de la plage A…B).
type GridGesture =
  | { kind: 'press'; pointerId: number; x: number; y: number; chapter: number }
  | { kind: 'paint'; pointerId: number; anchor: number; last: number; base: Set<number>; add: boolean };

export interface UndoToast {
  message: string;
  snapshot: BookReadsSnapshot;
}

interface Options {
  /** Tap hors sélection. */
  onOpen: (chapter: number) => void;
  /** L'action a achevé le parcours : appelé à la fin du toast, si elle n'a pas été annulée. */
  onCompleted: (parcoursId: string) => void;
}

/**
 * Sélection multiple des chapitres d'un livre (écran Livre, psautier).
 * Gestes délégués sur un conteneur dont les cases portent `data-n`.
 * Hors sélection : tap = ouvrir le chapitre, appui long = entrer en
 * sélection (et glisser sans lever le doigt sélectionne une plage), un
 * déplacement avant le délai = défilement. En sélection : tap = basculer,
 * glissement = étendre en plage continue. La navigation part du relâchement
 * du pointeur, pas du `click` natif qui arrive parfois après un appui long ;
 * `onClick` des cases ne sert qu'au clavier (Entrée/Espace).
 */
export function useChapterSelection(book: Book | undefined, { onOpen, onCompleted }: Options) {
  const { activeParcours, markManyRead, restoreBook } = useReadingProgress();
  // null : hors sélection. Un ensemble (éventuellement vide) : mode sélection actif.
  const [selection, setSelection] = useState<Set<number> | null>(null);
  const [toast, setToast] = useState<UndoToast | null>(null);
  const selectionRef = useRef(selection);
  selectionRef.current = selection;
  const containerEl = useRef<HTMLElement | null>(null);
  const gestureRef = useRef<GridGesture | null>(null);
  const pressTimer = useRef<number | undefined>(undefined);
  const toastTimer = useRef<number | undefined>(undefined);
  // Achèvement du parcours obtenu par la dernière action : affiché à la fin du toast.
  const pendingCompletionRef = useRef<string | null>(null);
  const callbacksRef = useRef({ onOpen, onCompleted });
  callbacksRef.current = { onOpen, onCompleted };

  const exitSelection = useCallback(() => {
    window.clearTimeout(pressTimer.current);
    gestureRef.current = null;
    setSelection(null);
  }, []);

  // La sélection n'est jamais conservée d'un livre à l'autre.
  useEffect(exitSelection, [book?.id, exitSelection]);

  useEffect(
    () => () => {
      window.clearTimeout(pressTimer.current);
      window.clearTimeout(toastTimer.current);
    },
    []
  );

  // Pendant un glissement commencé par un appui long, le conteneur était
  // encore en `pan-y` au contact : bloquer le défilement à la main.
  const onTouchMove = useCallback((e: TouchEvent) => {
    if (gestureRef.current?.kind === 'paint' && e.cancelable) e.preventDefault();
  }, []);
  const containerRef = useCallback(
    (el: HTMLElement | null) => {
      containerEl.current?.removeEventListener('touchmove', onTouchMove);
      containerEl.current = el;
      el?.addEventListener('touchmove', onTouchMove, { passive: false });
    },
    [onTouchMove]
  );

  const chapterAt = (target: EventTarget | Element | null): number | null => {
    const cell = target instanceof Element ? target.closest<HTMLElement>('[data-n]') : null;
    if (!cell || !containerEl.current?.contains(cell)) return null;
    return Number(cell.dataset.n);
  };

  const startPaint = (pointerId: number, chapter: number, current: ReadonlySet<number>) => {
    const add = !current.has(chapter);
    const base = new Set(current);
    gestureRef.current = { kind: 'paint', pointerId, anchor: chapter, last: chapter, base, add };
    try {
      containerEl.current?.setPointerCapture(pointerId);
    } catch {
      // Pointeur déjà relâché : le geste se réduit à un tap.
    }
    setSelection(paintRange(base, chapter, chapter, add));
  };

  const onPointerDown = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const chapter = chapterAt(e.target);
    if (chapter === null) return;
    window.clearTimeout(pressTimer.current);
    if (selectionRef.current) {
      startPaint(e.pointerId, chapter, selectionRef.current);
      return;
    }
    const pointerId = e.pointerId;
    gestureRef.current = { kind: 'press', pointerId, x: e.clientX, y: e.clientY, chapter };
    // Sans parcours actif, rien à marquer : le tap seul ouvre le chapitre.
    if (!activeParcours) return;
    pressTimer.current = window.setTimeout(() => {
      const g = gestureRef.current;
      if (g?.kind !== 'press' || g.pointerId !== pointerId) return;
      tapHaptic();
      startPaint(pointerId, chapter, new Set());
    }, LONG_PRESS_MS);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const g = gestureRef.current;
    if (!g || g.pointerId !== e.pointerId) return;
    if (g.kind === 'press') {
      // Mouvement avant la fin du délai : c'est un défilement, pas un appui long.
      if (Math.hypot(e.clientX - g.x, e.clientY - g.y) > MOVE_CANCEL_PX) {
        window.clearTimeout(pressTimer.current);
        gestureRef.current = null;
      }
      return;
    }
    const chapter = chapterAt(document.elementFromPoint(e.clientX, e.clientY));
    if (chapter === null || chapter === g.last) return;
    g.last = chapter;
    setSelection(paintRange(g.base, g.anchor, chapter, g.add));
  };

  const onPointerUp = (e: React.PointerEvent<HTMLElement>) => {
    const g = gestureRef.current;
    if (!g || g.pointerId !== e.pointerId) return;
    window.clearTimeout(pressTimer.current);
    gestureRef.current = null;
    if (g.kind === 'press') callbacksRef.current.onOpen(g.chapter);
  };

  const onPointerCancel = () => {
    window.clearTimeout(pressTimer.current);
    gestureRef.current = null;
  };

  const handleKeyboardClick = (e: React.MouseEvent<HTMLElement>, chapter: number) => {
    // Les taps/clics pointeur sont déjà traités au relâchement ; ne réagir
    // qu'à une activation clavier, reconnaissable à detail === 0.
    if (e.detail !== 0) return;
    if (selection) setSelection(paintRange(selection, chapter, chapter, !selection.has(chapter)));
    else onOpen(chapter);
  };

  const toggleSelection = () => {
    tapHaptic();
    if (selection) exitSelection();
    else setSelection(new Set());
  };

  const dismissToast = () => {
    window.clearTimeout(toastTimer.current);
    setToast(null);
    // L'écran d'achèvement attend la fin du toast, et seulement si l'action n'a pas été annulée.
    const pending = pendingCompletionRef.current;
    pendingCompletionRef.current = null;
    if (pending && getAppData().parcours.find((p) => p.id === pending)?.completedAt) {
      callbacksRef.current.onCompleted(pending);
    }
  };

  const undo = () => {
    if (!toast) return;
    tapHaptic();
    restoreBook(toast.snapshot);
    window.clearTimeout(toastTimer.current);
    pendingCompletionRef.current = null;
    setToast(null);
  };

  const applyMark = (read: boolean) => {
    if (!book || !activeParcours || !selection || selection.size === 0) return;
    tapHaptic();
    const chapters = Array.from(selection).sort((a, b) => a - b);
    const { snapshot, justCompleted } = markManyRead(activeParcours.id, book.id, chapters, read);
    exitSelection();
    if (justCompleted) pendingCompletionRef.current = activeParcours.id;
    const plural = chapters.length > 1;
    const verb = read ? (plural ? 'marqués lus' : 'marqué lu') : plural ? 'marqués non lus' : 'marqué non lu';
    window.clearTimeout(toastTimer.current);
    setToast({ message: `${book.name} ${formatRanges(chapters)} · ${verb}`, snapshot });
    toastTimer.current = window.setTimeout(dismissToast, UNDO_TOAST_MS);
  };

  return {
    selection,
    setSelection,
    exitSelection,
    toggleSelection,
    applyMark,
    toast,
    undo,
    dismissToast,
    handleKeyboardClick,
    containerProps: {
      ref: containerRef,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onContextMenu: (e: React.MouseEvent) => e.preventDefault()
    }
  };
}
