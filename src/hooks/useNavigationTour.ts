import { useCallback, useState } from 'react';

const STORAGE_KEY = 'bibliae:navigation-tour-seen';

function loadSeen(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function saveSeen() {
  try {
    localStorage.setItem(STORAGE_KEY, 'true');
  } catch {
    // stockage indisponible (navigation privée, quota) : le tour réapparaîtra, tant pis
  }
}

export function useNavigationTour() {
  const [isOpen, setIsOpen] = useState(() => !loadSeen());

  const close = useCallback(() => {
    saveSeen();
    setIsOpen(false);
  }, []);

  return { isOpen, close };
}
