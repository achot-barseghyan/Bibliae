import { useEffect } from 'react';
import { setReducedMotion } from '../services/reducedMotion';
import { useAccessibility } from './useAccessibility';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

/**
 * Animations à couper : réglage de l'app (Réglages > Accessibilité) ou
 * préférence système. À utiliser pour toute animation pilotée à la main
 * (requestAnimationFrame, défilement animé…) ; CSS, framer-motion et
 * Element.animate sont déjà neutralisés globalement (services/reducedMotion).
 */
export function useReducedMotion(): boolean {
  const { settings } = useAccessibility();
  const prefersReduced = usePrefersReducedMotion();
  return settings.reduceMotion || prefersReduced;
}

/**
 * Applique le choix à toute l'app (CSS, framer-motion, Element.animate) :
 * à monter une seule fois, à la racine (App).
 */
export function useApplyReducedMotion(): void {
  const reduced = useReducedMotion();
  useEffect(() => {
    setReducedMotion(reduced);
  }, [reduced]);
}
