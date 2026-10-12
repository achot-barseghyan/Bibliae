import { createContext, useContext, useEffect, useLayoutEffect, useRef } from 'react';

// Moteur de défilement de la fiche événement : un seul écouteur de
// défilement, au plus un calcul par image (requestAnimationFrame), partagé
// par la parallaxe, le fil du récit, le chant des anges et la barre du haut.
// Les apparitions, elles, passent par un IntersectionObserver.

export interface ScrollFrame {
  scrollTop: number;
  viewportHeight: number;
}

type FrameHandler = (frame: ScrollFrame) => void;
type MeasureHandler = (scrollEl: HTMLElement) => void;

export interface ScrollEngine {
  /** Appelé à chaque image où le défilement a changé. */
  onFrame: (handler: FrameHandler) => () => void;
  /** Appelé quand la mise en page change (positions à remesurer). */
  onMeasure: (handler: MeasureHandler) => () => void;
  /** Observe l'entrée d'un élément dans l'écran : `visibleRatio` est la part
   * de l'écran (depuis le haut) que doit atteindre le haut de l'élément. */
  reveal: (el: Element, visibleRatio: number, onEnter: () => void) => () => void;
  reduceMotion: boolean;
}

export const ScrollEngineContext = createContext<ScrollEngine | null>(null);

export function useScrollEngine(): ScrollEngine {
  const engine = useContext(ScrollEngineContext);
  if (!engine) throw new Error('useScrollEngine hors de la fiche événement');
  return engine;
}

/** Position d'un élément dans le contenu défilant (indépendante du défilement). */
export function contentTop(el: Element, scrollEl: HTMLElement): number {
  return el.getBoundingClientRect().top - scrollEl.getBoundingClientRect().top + scrollEl.scrollTop;
}

export function createScrollEngine(reduceMotion: boolean) {
  const frameHandlers = new Set<FrameHandler>();
  const measureHandlers = new Set<MeasureHandler>();
  const observers = new Map<number, IntersectionObserver>();
  const callbacks = new WeakMap<Element, () => void>();
  let scrollEl: HTMLElement | null = null;
  let raf: number | null = null;
  let pendingReveals: { el: Element; ratio: number; onEnter: () => void }[] = [];

  const runFrame = () => {
    raf = null;
    if (!scrollEl) return;
    const frame = { scrollTop: scrollEl.scrollTop, viewportHeight: scrollEl.clientHeight };
    frameHandlers.forEach((h) => h(frame));
  };
  const schedule = () => {
    if (raf === null) raf = requestAnimationFrame(runFrame);
  };
  const measure = () => {
    if (!scrollEl) return;
    measureHandlers.forEach((h) => h(scrollEl!));
    schedule();
  };

  const observerFor = (ratio: number) => {
    const key = Math.round(ratio * 100);
    let observer = observers.get(key);
    if (!observer && scrollEl) {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            observer!.unobserve(entry.target);
            callbacks.get(entry.target)?.();
          }
        },
        // Bas de la zone d'observation remonté à `ratio` de l'écran.
        { root: scrollEl, rootMargin: `0px 0px -${100 - key}% 0px`, threshold: 0 }
      );
      observers.set(key, observer);
    }
    return observer;
  };

  const engine: ScrollEngine = {
    reduceMotion,
    onFrame(handler) {
      frameHandlers.add(handler);
      schedule();
      return () => frameHandlers.delete(handler);
    },
    onMeasure(handler) {
      measureHandlers.add(handler);
      if (scrollEl) {
        handler(scrollEl);
        schedule();
      }
      return () => measureHandlers.delete(handler);
    },
    reveal(el, ratio, onEnter) {
      if (reduceMotion) {
        onEnter();
        return () => {};
      }
      callbacks.set(el, onEnter);
      const observer = observerFor(ratio);
      if (observer) observer.observe(el);
      else pendingReveals.push({ el, ratio, onEnter });
      return () => {
        observerFor(ratio)?.unobserve(el);
        pendingReveals = pendingReveals.filter((p) => p.el !== el);
      };
    }
  };

  /** Branche le moteur sur l'élément défilant d'IonContent. */
  const attach = (el: HTMLElement, content: Element) => {
    scrollEl = el;
    el.addEventListener('scroll', schedule, { passive: true });
    const resize = new ResizeObserver(measure);
    resize.observe(el);
    resize.observe(content);
    pendingReveals.forEach(({ el: target, ratio }) => observerFor(ratio)?.observe(target));
    pendingReveals = [];
    measure();
    return () => {
      el.removeEventListener('scroll', schedule);
      resize.disconnect();
      observers.forEach((o) => o.disconnect());
      observers.clear();
      if (raf !== null) cancelAnimationFrame(raf);
      scrollEl = null;
    };
  };

  return { engine, attach };
}

/** Ajoute `is-in` à l'élément quand il entre dans l'écran (une seule fois). */
export function useReveal<T extends Element>(visibleRatio = 0.9) {
  const ref = useRef<T>(null);
  const { reveal } = useScrollEngine();
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    return reveal(el, visibleRatio, () => el.classList.add('is-in'));
  }, [reveal, visibleRatio]);
  return ref;
}

/** Parallaxe verticale : l'élément se décale de `factor` fois son écart au
 * centre de l'écran. Positions mesurées une fois par mise en page. */
export function useParallax<T extends HTMLElement>(factor: number) {
  const ref = useRef<T>(null);
  const { onFrame, onMeasure, reduceMotion } = useScrollEngine();
  useEffect(() => {
    const el = ref.current;
    if (!el || reduceMotion) return;
    let center = 0;
    const offMeasure = onMeasure((scrollEl) => {
      el.style.transform = '';
      center = contentTop(el, scrollEl) + el.offsetHeight / 2;
    });
    const offFrame = onFrame(({ scrollTop, viewportHeight }) => {
      const delta = center - (scrollTop + viewportHeight / 2);
      // Hors de l'écran : inutile de recalculer.
      if (Math.abs(delta) > viewportHeight * 1.2) return;
      el.style.transform = `translate3d(0, ${(-delta * factor).toFixed(1)}px, 0)`;
    });
    return () => {
      offMeasure();
      offFrame();
    };
  }, [onFrame, onMeasure, reduceMotion, factor]);
  return ref;
}
