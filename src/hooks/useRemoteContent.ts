import { useEffect, useState } from 'react';
import { fetchRemoteJson, getMemoryCached } from '../services/remoteContent';

/**
 * Charge un contenu distant, le fusionne avec le contenu local par défaut,
 * et affiche toujours quelque chose immédiatement (défaut, puis cache mémoire
 * de la session si déjà chargé, puis résultat réseau/cache disque dès qu'il arrive).
 */
export function useRemoteContent<TLocal, TRemote>(
  path: string,
  local: TLocal,
  merge: (local: TLocal, remote: TRemote | null) => TLocal
): TLocal {
  const [content, setContent] = useState<TLocal>(() => {
    const cached = getMemoryCached<TRemote>(path);
    return cached ? merge(local, cached) : local;
  });

  useEffect(() => {
    let cancelled = false;

    fetchRemoteJson<TRemote>(path).then((remote) => {
      if (!cancelled) setContent(merge(local, remote));
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  return content;
}
