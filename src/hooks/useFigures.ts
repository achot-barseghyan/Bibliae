import { useEffect, useMemo, useState } from 'react';
import { figures as bundledFigures, type Figure } from '../data/figures';
import { fetchAllFigures } from '../db/figuresRepository';
import { fetchRemoteJson } from '../services/remoteContent';
import { REMOTE_CONTENT_PATHS } from '../config/remoteContent';
import { mergeArrayById, type Override } from '../utils/remoteMerge';

interface UseFiguresResult {
  figures: Figure[];
  isFromDatabase: boolean;
}

/**
 * Les figures viennent de la base SQLite locale (offline, native ou web).
 * En attendant que la connexion s'ouvre (chargement du wasm sur le web),
 * on affiche immédiatement les données embarquées pour éviter un écran vide.
 * Le contenu distant (textes, dates, rôles...) vient ensuite surcharger ce
 * résultat par id ; les images restent toujours locales.
 */
export function useFigures(): UseFiguresResult {
  const [baseFigures, setBaseFigures] = useState<Figure[]>(bundledFigures);
  const [isFromDatabase, setIsFromDatabase] = useState(false);
  const [remoteOverrides, setRemoteOverrides] = useState<Array<Override<Figure>> | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchAllFigures()
      .then((rows) => {
        if (!cancelled && rows.length > 0) {
          setBaseFigures(rows);
          setIsFromDatabase(true);
        }
      })
      .catch((error) => {
        console.error('Échec du chargement des figures depuis SQLite', error);
      });

    fetchRemoteJson<Array<Override<Figure>>>(REMOTE_CONTENT_PATHS.figures).then((remote) => {
      if (!cancelled && remote) setRemoteOverrides(remote);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const figures = useMemo(
    () => mergeArrayById(baseFigures, remoteOverrides),
    [baseFigures, remoteOverrides]
  );

  return { figures, isFromDatabase };
}
