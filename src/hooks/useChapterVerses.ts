import { useEffect, useState } from 'react';
import { fetchChapterVerses, type Verse } from '../db/versesRepository';

interface UseChapterVersesResult {
  verses: Verse[];
  isLoading: boolean;
}

export function useChapterVerses(bookId: string, chapter: number): UseChapterVersesResult {
  const [verses, setVerses] = useState<Verse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    fetchChapterVerses(bookId, chapter)
      .then((rows) => {
        if (!cancelled) setVerses(rows);
      })
      .catch((error) => {
        console.error('Échec du chargement des versets depuis SQLite', error);
        if (!cancelled) setVerses([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [bookId, chapter]);

  return { verses, isLoading };
}
