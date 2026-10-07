import { useCallback, useState } from 'react';

function loadSeen(key: string): boolean {
  try {
    return localStorage.getItem(key) === 'true';
  } catch {
    return false;
  }
}

function saveSeen(key: string) {
  try {
    localStorage.setItem(key, 'true');
  } catch {
    // stockage indisponible (navigation privée, quota) : le tour réapparaîtra, tant pis
  }
}

/** Fait apparaître un tour une seule fois par appareil, mémorisé sous `storageKey`. */
export function useSpotlightTour(storageKey: string) {
  const [isOpen, setIsOpen] = useState(() => !loadSeen(storageKey));

  const close = useCallback(() => {
    saveSeen(storageKey);
    setIsOpen(false);
  }, [storageKey]);

  return { isOpen, close };
}
