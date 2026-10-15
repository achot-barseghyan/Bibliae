import { useEffect, useRef, type RefObject } from 'react';
import { isReducedMotion } from '../services/reducedMotion';

/** Distance (px) ou vitesse (px/ms) vers le bas au-delà de laquelle la feuille se ferme. */
const CLOSE_DISTANCE = 90;
const CLOSE_VELOCITY = 0.5;
/** Déplacement à partir duquel un appui devient un glissement. */
const SLOP = 8;
const SNAP_BACK_MS = 320;
const SNAP_BACK = `translate ${SNAP_BACK_MS}ms cubic-bezier(.2, .8, .2, 1)`;
/** Le temps que la feuille finisse de sortir avant de remettre son décalage à zéro. */
const RESET_AFTER_CLOSE_MS = 750;

interface Gesture {
  x0: number;
  y0: number;
  /** Zone défilante sous le doigt : on ne tire la feuille que si elle est en haut. */
  scroller: HTMLElement | null;
  dragging: boolean;
  offset: number;
  baseTransition: string;
  samples: { y: number; t: number }[];
}

const NO_DRAG = 'input, textarea, select, [contenteditable="true"], [data-sheet-nodrag]';

function scrollerAt(target: Element, sheet: HTMLElement): HTMLElement | null {
  for (let n: Element | null = target; n; n = n.parentElement) {
    if (n instanceof HTMLElement && /(auto|scroll)/.test(getComputedStyle(n).overflowY) && n.scrollHeight > n.clientHeight + 1)
      return n;
    if (n === sheet) break;
  }
  return null;
}

/**
 * Feuille du bas qui se ferme en la glissant vers le bas, au doigt ou à la
 * souris. Le glissement part de n'importe où sur la feuille ; dans une zone
 * qui défile, seulement quand elle est déjà tout en haut.
 *
 * Le décalage passe par la propriété CSS `translate`, distincte de
 * `transform` : il se cumule avec l'animation d'ouverture et de fermeture de
 * la feuille (CSS ou framer-motion) sans la perturber.
 */
export function useSheetDrag(ref: RefObject<HTMLElement | null>, onClose: () => void, enabled = true) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const sheet = ref.current;
    if (!sheet || !enabled) return;

    sheet.setAttribute('data-sheet-drag', '');
    let g: Gesture | null = null;
    let resetTimer = 0;

    const begin = (x: number, y: number, target: EventTarget | null) => {
      if (!(target instanceof Element) || target.closest(NO_DRAG)) return;
      // Feuille posée dans une autre : le geste revient à la plus proche.
      if (target.closest('[data-sheet-drag]') !== sheet) return;
      g = {
        x0: x,
        y0: y,
        scroller: scrollerAt(target, sheet),
        dragging: false,
        offset: 0,
        baseTransition: '',
        samples: [{ y, t: performance.now() }]
      };
    };

    /** Vrai si le geste doit être retenu (pas de défilement natif). */
    const move = (x: number, y: number): boolean => {
      if (!g) return false;
      const dx = x - g.x0;
      const dy = y - g.y0;
      if (!g.dragging) {
        const downward = dy > 0 && dy >= Math.abs(dx) && (!g.scroller || g.scroller.scrollTop <= 0);
        if (!downward) {
          // Geste vers le haut, de côté, ou contenu défilé : on laisse faire.
          if (Math.abs(dx) >= SLOP || Math.abs(dy) >= SLOP) g = null;
          return false;
        }
        if (dy < SLOP) return true;
        window.clearTimeout(resetTimer);
        g.dragging = true;
        g.y0 = y;
        g.baseTransition = getComputedStyle(sheet).transition;
        sheet.style.transition = 'none';
      }
      g.offset = Math.max(0, y - g.y0);
      sheet.style.translate = `0 ${g.offset}px`;
      const t = performance.now();
      g.samples.push({ y, t });
      while (g.samples.length > 2 && t - g.samples[0].t > 100) g.samples.shift();
      return true;
    };

    /** Vrai si un glissement vient de se terminer. */
    const end = (): boolean => {
      const done = g;
      g = null;
      if (!done?.dragging) return false;
      const first = done.samples[0];
      const last = done.samples[done.samples.length - 1];
      const velocity = last.t > first.t ? (last.y - first.y) / (last.t - first.t) : 0;
      const keep = done.baseTransition && done.baseTransition !== 'none' ? `${done.baseTransition}, ` : '';
      if (done.offset > CLOSE_DISTANCE || velocity > CLOSE_VELOCITY) {
        // La feuille sort depuis là où le doigt l'a laissée ; on remet le
        // décalage à zéro une fois qu'elle est hors de l'écran.
        sheet.style.transition = '';
        closeRef.current();
        resetTimer = window.setTimeout(() => {
          sheet.style.transition = 'none';
          sheet.style.translate = '';
          void sheet.offsetHeight;
          sheet.style.transition = '';
        }, RESET_AFTER_CLOSE_MS);
      } else {
        sheet.style.transition = isReducedMotion() ? '' : `${keep}${SNAP_BACK}`;
        sheet.style.translate = '';
        // Rend la main aux transitions de la feuille (elles changent parfois
        // entre l'état ouvert et l'état fermé).
        resetTimer = window.setTimeout(() => (sheet.style.transition = ''), SNAP_BACK_MS);
      }
      return true;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) begin(e.touches[0].clientX, e.touches[0].clientY, e.target);
      else g = null;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (move(e.touches[0].clientX, e.touches[0].clientY) && e.cancelable) e.preventDefault();
    };
    const onTouchEnd = () => {
      end();
    };

    const onMouseMove = (e: MouseEvent) => {
      move(e.clientX, e.clientY);
    };
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (!end()) return;
      // Le relâchement après un glissement ne doit pas valoir un clic.
      const swallow = (ev: MouseEvent) => {
        ev.stopPropagation();
        ev.preventDefault();
      };
      window.addEventListener('click', swallow, { capture: true, once: true });
      window.setTimeout(() => window.removeEventListener('click', swallow, { capture: true }), 0);
    };
    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      begin(e.clientX, e.clientY, e.target);
      if (!g) return;
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    };

    sheet.addEventListener('touchstart', onTouchStart, { passive: true });
    sheet.addEventListener('touchmove', onTouchMove, { passive: false });
    sheet.addEventListener('touchend', onTouchEnd);
    sheet.addEventListener('touchcancel', onTouchEnd);
    sheet.addEventListener('mousedown', onMouseDown);
    return () => {
      sheet.removeAttribute('data-sheet-drag');
      sheet.removeEventListener('touchstart', onTouchStart);
      sheet.removeEventListener('touchmove', onTouchMove);
      sheet.removeEventListener('touchend', onTouchEnd);
      sheet.removeEventListener('touchcancel', onTouchEnd);
      sheet.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [ref, enabled]);
}
