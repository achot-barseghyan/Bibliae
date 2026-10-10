import { useLayoutEffect, useRef, useState } from 'react';

/** Largeur d'un élément, suivie au redimensionnement. */
export function useElementWidth<T extends Element>(fallback: number) {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(fallback);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth || fallback);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [fallback]);
  return [ref, width] as const;
}
