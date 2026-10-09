import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { comparePos, type WordPos, type WordSpan } from '../services/verseAnnotations';
import { tapHaptic } from '../utils/haptics';

export interface WordSelection {
  /** Mot d'ancrage (premier touché). */
  anchor: WordPos;
  /** Mot de fin, avant ou après l'ancre. */
  focus: WordPos;
}

/** Durée d'appui avant de passer en sélection par glissé au doigt. */
const LONG_PRESS_MS = 380;
/** Au-delà de ce déplacement, l'appui est un défilement, pas un appui long. */
const MOVE_TOLERANCE_PX = 8;

interface Gesture {
  pos: WordPos;
  x: number;
  y: number;
  pointerType: string;
  moved: boolean;
  timer?: number;
}

function wordAt(target: EventTarget | null): { pos: WordPos; link: string | null } | null {
  const el = target instanceof Element ? target.closest<HTMLElement>('[data-w]') : null;
  if (!el) return null;
  const verse = Number(el.dataset.v);
  const word = Number(el.dataset.w);
  if (!Number.isFinite(verse) || !Number.isFinite(word)) return null;
  return { pos: { verse, word }, link: el.closest<HTMLElement>('[data-link]')?.dataset.link ?? null };
}

function verseNumberAt(target: EventTarget | null): number | null {
  const el = target instanceof Element ? target.closest<HTMLElement>('[data-verse-num]') : null;
  return el ? Number(el.dataset.verseNum) : null;
}

function samePos(a: WordPos, b: WordPos): boolean {
  return comparePos(a, b) === 0;
}

/**
 * Sélection au mot dans un chapitre, à la place de la sélection native :
 *  - toucher un mot le sélectionne ; toucher un autre mot étend la
 *    sélection depuis le premier ; retoucher un mot seul sélectionné le
 *    désélectionne ;
 *  - toucher le numéro d'un verset le sélectionne en entier (ou le
 *    désélectionne s'il l'est déjà) ;
 *  - glisser sur les mots sélectionne à la volée : directement à la souris,
 *    après un appui long au doigt (pour ne pas gêner le défilement).
 * Un nom de figure (`data-link`) suit son lien quand rien n'est
 * sélectionné ; sinon il se comporte comme un mot.
 */
export function useWordSelection(
  containerRef: RefObject<HTMLElement | null>,
  wordsByVerse: Map<number, WordSpan[]>,
  onLinkTap: (target: string) => void
) {
  const [selection, setSelection] = useState<WordSelection | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const selectionRef = useRef(selection);
  selectionRef.current = selection;
  const wordsRef = useRef(wordsByVerse);
  wordsRef.current = wordsByVerse;
  const onLinkTapRef = useRef(onLinkTap);
  onLinkTapRef.current = onLinkTap;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let gesture: Gesture | null = null;
    let dragging = false;
    // Le `click` qui suit un glissé ne doit pas être pris pour un toucher.
    let suppressClick = false;

    const startDrag = (pos: WordPos) => {
      dragging = true;
      suppressClick = true;
      setIsDragging(true);
      setSelection({ anchor: pos, focus: pos });
    };

    const extendTo = (x: number, y: number) => {
      const hit = wordAt(document.elementFromPoint(x, y));
      if (!hit) return;
      setSelection((current) =>
        current && !samePos(current.focus, hit.pos) ? { anchor: current.anchor, focus: hit.pos } : current
      );
    };

    const endGesture = () => {
      if (gesture?.timer) window.clearTimeout(gesture.timer);
      gesture = null;
      if (dragging) {
        dragging = false;
        setIsDragging(false);
      }
    };

    // Au doigt, le navigateur peut annuler le pointeur (appui long, début de
    // geste) alors que le glissé continue : c'est `touchend` qui le termine.
    const onPointerCancel = () => {
      if (dragging && gesture?.pointerType === 'touch') return;
      endGesture();
    };

    const onPointerDown = (e: PointerEvent) => {
      // Après un glissé au doigt, le navigateur n'émet pas de `click` : le
      // drapeau ne doit pas avaler le toucher suivant.
      suppressClick = false;
      const hit = wordAt(e.target);
      if (!hit) return;
      gesture = { pos: hit.pos, x: e.clientX, y: e.clientY, pointerType: e.pointerType, moved: false };
      if (e.pointerType === 'touch') {
        const pending = gesture;
        pending.timer = window.setTimeout(() => {
          if (gesture === pending && !pending.moved) {
            tapHaptic();
            startDrag(pending.pos);
          }
        }, LONG_PRESS_MS);
      } else if (e.button === 0) {
        startDrag(hit.pos);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!gesture) return;
      if (!dragging && Math.hypot(e.clientX - gesture.x, e.clientY - gesture.y) > MOVE_TOLERANCE_PX) {
        gesture.moved = true;
        if (gesture.timer) window.clearTimeout(gesture.timer);
      }
      if (dragging && e.pointerType !== 'touch') extendTo(e.clientX, e.clientY);
    };

    // Au doigt, on suit le glissé par `touchmove` : écouteur non passif pour
    // empêcher la page de défiler pendant qu'on étend la sélection.
    const onTouchMove = (e: TouchEvent) => {
      if (!dragging) return;
      e.preventDefault();
      const touch = e.touches[0];
      if (touch) extendTo(touch.clientX, touch.clientY);
    };

    const onClick = (e: MouseEvent) => {
      if (suppressClick) {
        suppressClick = false;
        return;
      }
      const current = selectionRef.current;

      const verse = verseNumberAt(e.target);
      if (verse !== null) {
        const total = wordsRef.current.get(verse)?.length ?? 0;
        if (total === 0) return;
        tapHaptic();
        const first = { verse, word: 0 };
        const last = { verse, word: total - 1 };
        const isWholeVerse =
          current &&
          ((samePos(current.anchor, first) && samePos(current.focus, last)) ||
            (samePos(current.anchor, last) && samePos(current.focus, first)));
        setSelection(isWholeVerse ? null : { anchor: first, focus: last });
        return;
      }

      const hit = wordAt(e.target);
      if (!hit) return;
      if (!current) {
        if (hit.link) {
          onLinkTapRef.current(hit.link);
          return;
        }
        setSelection({ anchor: hit.pos, focus: hit.pos });
        return;
      }
      if (samePos(current.anchor, current.focus) && samePos(current.anchor, hit.pos)) {
        setSelection(null);
        return;
      }
      setSelection({ anchor: current.anchor, focus: hit.pos });
    };

    // L'appui long ouvrirait sinon le menu contextuel / la loupe du système.
    const onContextMenu = (e: Event) => {
      if (wordAt(e.target)) e.preventDefault();
    };

    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', endGesture);
    window.addEventListener('pointercancel', onPointerCancel);
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchend', endGesture);
    container.addEventListener('click', onClick);
    container.addEventListener('contextmenu', onContextMenu);
    return () => {
      if (gesture?.timer) window.clearTimeout(gesture.timer);
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', endGesture);
      window.removeEventListener('pointercancel', onPointerCancel);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', endGesture);
      container.removeEventListener('click', onClick);
      container.removeEventListener('contextmenu', onContextMenu);
    };
    // Le conteneur n'existe qu'une fois les versets chargés : on se rebranche
    // quand la liste des versets change.
  }, [containerRef, wordsByVerse]);

  const clearSelection = useCallback(() => setSelection(null), []);

  return { selection, setSelection, clearSelection, isDragging };
}
