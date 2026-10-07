import { useEffect, useState } from 'react';

const DEBOUNCE_MS = 400;
const API_BASE = 'https://open-church.io/api/parishes';

export interface Parish {
  id: number;
  name: string;
  dioceseId: string | null;
  zipCode: string;
  website: string;
  churchCount: number;
}

interface RawParish {
  id: number;
  name: string;
  diocese?: string;
  zipCode?: string;
  website?: string;
  wikidataChurches?: string[];
}

function parseParish(raw: RawParish): Parish {
  const dioceseMatch = raw.diocese?.match(/(\d+)$/);
  return {
    id: raw.id,
    name: raw.name,
    dioceseId: dioceseMatch ? dioceseMatch[1] : null,
    zipCode: raw.zipCode ?? '',
    website: raw.website ?? '',
    churchCount: Array.isArray(raw.wikidataChurches) ? raw.wikidataChurches.length : 0
  };
}

interface UseParishSearchResult {
  results: Parish[];
  totalItems: number;
  isLoading: boolean;
  error: string | null;
}

export function useParishSearch(query: string): UseParishSearchResult {
  const [results, setResults] = useState<Parish[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setTotalItems(0);
      setError(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    const timer = setTimeout(() => {
      fetch(`${API_BASE}?name=${encodeURIComponent(trimmed)}`, {
        headers: { Accept: 'application/ld+json' }
      })
        .then((response) => {
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return response.json();
        })
        .then((data: { 'hydra:member'?: RawParish[]; 'hydra:totalItems'?: number }) => {
          if (cancelled) return;
          const members = Array.isArray(data['hydra:member']) ? data['hydra:member'] : [];
          setResults(members.map(parseParish));
          setTotalItems(typeof data['hydra:totalItems'] === 'number' ? data['hydra:totalItems'] : members.length);
        })
        .catch((err) => {
          console.error('Échec de la recherche de paroisses', err);
          if (!cancelled) {
            setResults([]);
            setTotalItems(0);
            setError('La recherche est momentanément indisponible. Réessaie dans un instant.');
          }
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

  return { results, totalItems, isLoading, error };
}
