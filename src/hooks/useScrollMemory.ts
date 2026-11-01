import { useEffect, type RefObject } from 'react';
import { useNavigationType } from 'react-router-dom';

// Position de défilement de chaque page, pour la session. Au retour en
// arrière (POP), la page revient là où on l'avait laissée, même si elle a été
// recréée entre-temps (passage par une page hors des onglets, comme le
// Catéchisme). Une navigation « en avant » repart du haut.
const positions = new Map<string, number>();

/** Nombre d'images (~0,5 s) pendant lesquelles on réessaie : le contenu peut
 *  encore grandir (images, contenu distant) avant d'atteindre la position. */
const MAX_TRIES = 30;

export function useScrollMemory(contentRef: RefObject<HTMLIonContentElement | null>, key: string): void {
  const navigationType = useNavigationType();

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    let scrollEl: HTMLElement | null = null;
    let cancelled = false;
    let raf = 0;
    const save = () => {
      if (scrollEl) positions.set(key, scrollEl.scrollTop);
    };

    content.getScrollElement().then((el) => {
      if (cancelled) return;
      scrollEl = el;
      const saved = positions.get(key);
      if (navigationType === 'POP' && saved) {
        let tries = 0;
        const restore = () => {
          if (cancelled) return;
          el.scrollTop = saved;
          if (Math.abs(el.scrollTop - saved) > 1 && tries++ < MAX_TRIES) raf = requestAnimationFrame(restore);
        };
        restore();
      }
      el.addEventListener('scroll', save, { passive: true });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      scrollEl?.removeEventListener('scroll', save);
    };
    // La position ne se restaure qu'à l'arrivée sur la page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}
