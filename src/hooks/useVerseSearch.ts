import { useEffect, useState } from 'react';
import { searchVerses, type VerseSearchResult } from '../db/versesRepository';

const DEBOUNCE_MS = 250;

interface UseVerseSearchResult {
  results: VerseSearchResult[];
  isLoading: boolean;
}

export function useVerseSearch(query: string): UseVerseSearchResult {
  const [results, setResults] = useState<VerseSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    const timer = setTimeout(() => {
      searchVerses(trimmed)
        .then((rows) => {
          if (!cancelled) setResults(rows);
        })
        .catch((error) => {
          console.error('Échec de la recherche de versets', error);
          if (!cancelled) setResults([]);
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  return { results, isLoading };
}
