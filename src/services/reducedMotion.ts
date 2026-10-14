import { MotionGlobalConfig } from 'framer-motion';

// « Réduire les animations » (Réglages > Accessibilité), appliqué à toute
// l'app depuis un seul endroit (voir useAccessibility, monté dans App) :
//  - CSS : html[data-reduce-motion] coupe transitions et @keyframes
//    (theme/variables.css) ;
//  - framer-motion : MotionGlobalConfig.skipAnimations saute directement
//    à l'état final, y compris pour les composants qui ne lisent pas le
//    réglage ;
//  - API Web Animations : Element.animate est enveloppé pour jouer chaque
//    animation en 0 ms (apparitions, compteurs d'anneau, transitions de page
//    Ionic, qui passent toutes par elle). L'état final et onfinish sont
//    conservés, donc rien ne reste figé à mi-chemin.
// Les animations pilotées à la main (requestAnimationFrame) lisent le réglage
// via useReducedMotion.

let reduced = false;

const nativeAnimate = typeof Element !== 'undefined' ? Element.prototype.animate : undefined;

if (nativeAnimate) {
  Element.prototype.animate = function animate(
    this: Element,
    keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
    options?: number | KeyframeAnimationOptions
  ): Animation {
    if (!reduced) return nativeAnimate.call(this, keyframes, options);
    const base: KeyframeAnimationOptions =
      typeof options === 'number' ? {} : { ...(options ?? {}) };
    const iterations = base.iterations;
    return nativeAnimate.call(this, keyframes, {
      ...base,
      duration: 0,
      delay: 0,
      endDelay: 0,
      iterations: iterations === undefined || Number.isFinite(iterations) ? iterations : 1
    });
  };
}

export function setReducedMotion(value: boolean): void {
  reduced = value;
  MotionGlobalConfig.skipAnimations = value;
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-reduce-motion', String(value));
  }
}

export function isReducedMotion(): boolean {
  return reduced;
}
