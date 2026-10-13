import { useEffect, useRef } from 'react';
import { useAccessibility } from '../../hooks/useAccessibility';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

// Animations d'entrée du monde Bible (liste, livre, lecteur) : apparitions
// échelonnées et compteurs, jouées via l'API Web Animations pour ne rien
// laisser dans les styles une fois terminées.

export const BIBLE_EASE = 'cubic-bezier(.2,.7,.2,1)';

/** Réglage de l'app ou préférence système : dans les deux cas, pas d'animation. */
export function useBibleReducedMotion(): boolean {
  const { settings } = useAccessibility();
  const prefersReduced = usePrefersReducedMotion();
  return settings.reduceMotion || prefersReduced;
}

interface StaggerOptions {
  duration: number;
  delay?: number;
  step?: number;
  /** Plafond du décalage cumulé, pour que les longues listes ne traînent pas. */
  maxStagger?: number;
}

export function stagger(nodes: Iterable<Element>, keyframes: Keyframe[], options: StaggerOptions) {
  const { duration, delay = 0, step = 0, maxStagger = Infinity } = options;
  let i = 0;
  for (const node of nodes) {
    node.animate(keyframes, {
      duration,
      delay: delay + Math.min(i * step, maxStagger),
      easing: BIBLE_EASE,
      fill: 'backwards'
    });
    i += 1;
  }
}

export const RISE_IN: Keyframe[] = [
  { opacity: 0, transform: 'translateY(18px)', filter: 'blur(5px)' },
  { opacity: 1, transform: 'none', filter: 'blur(0)' }
];

/** Fait défiler un nombre de 0 à `target` dans `el` (décélération cubique). */
export function countUp(
  el: HTMLElement | null,
  target: number,
  delay: number,
  reduce: boolean,
  format: (n: number) => string = String
) {
  if (!el) return () => {};
  if (reduce || target === 0) {
    el.textContent = format(target);
    return () => {};
  }
  const start = performance.now() + delay;
  const duration = 1400;
  let frame = 0;
  const tick = (now: number) => {
    const p = Math.max(0, Math.min(1, (now - start) / duration));
    el.textContent = format(Math.round(target * (1 - Math.pow(1 - p, 3))));
    if (p < 1) frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(frame);
}

/** Remplit un anneau SVG (stroke-dasharray = circonférence) jusqu'à `ratio`. */
export function fillRing(circle: SVGCircleElement | null, circumference: number, ratio: number, delay: number, reduce: boolean) {
  if (!circle) return;
  const to = circumference * (1 - Math.max(0, Math.min(1, ratio)));
  circle.style.strokeDashoffset = String(to);
  if (reduce) return;
  circle.animate([{ strokeDashoffset: circumference }, { strokeDashoffset: to }], {
    duration: 1500,
    delay,
    easing: BIBLE_EASE,
    fill: 'backwards'
  });
}

const NOT_PLAYED = Symbol('not-played');

/**
 * Joue `play` une seule fois par valeur de `key` (onglet, livre, chapitre,
 * jour...). React StrictMode rejoue chaque effet au montage en
 * développement : sans cette garde, les apparitions se lançaient deux fois.
 * Les refs survivant à ce double passage, la clé déjà jouée est reconnue.
 */
export function useRevealOnce(key: unknown, play: () => void) {
  const playedKey = useRef<unknown>(NOT_PLAYED);
  useEffect(() => {
    if (Object.is(playedKey.current, key)) return;
    playedKey.current = key;
    play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}
