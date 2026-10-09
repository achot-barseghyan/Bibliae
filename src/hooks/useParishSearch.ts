import { useEffect, useState } from 'react';

const DEBOUNCE_MS = 400;
const API_BASE = 'https://open-church.io/api/parishes';
const GEOCODER_URL = 'https://api-adresse.data.gouv.fr/search/';
/** Score minimal du géocodeur pour considérer la saisie comme une ville. */
const CITY_MIN_SCORE = 0.6;

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

interface ParishPage {
  'hydra:member'?: RawParish[];
}

async function fetchParishes(param: 'name' | 'zipCode', value: string): Promise<Parish[]> {
  const response = await fetch(`${API_BASE}?${param}=${encodeURIComponent(value)}`, {
    headers: { Accept: 'application/ld+json' }
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = (await response.json()) as ParishPage;
  return Array.isArray(data['hydra:member']) ? data['hydra:member'].map(parseParish) : [];
}

/** Minuscules sans accents ni tirets : « Chalon-sur-Saône » → « chalon sur saone ». */
function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[-'’]/g, ' ')
    .replace(/s+/g, ' ')
    .trim();
}

/** Codes postaux d'une ville, via la Base Adresse Nationale : open-church
 * ne connaît pas les noms de communes, seulement les codes postaux. */
async function cityPostcodes(query: string): Promise<string[]> {
  const response = await fetch(`${GEOCODER_URL}?q=${encodeURIComponent(query)}&type=municipality&limit=5`);
  if (!response.ok) return [];
  const data = (await response.json()) as {
    features?: Array<{ properties?: { postcode?: string; score?: number } }>;
  };
  const best = data.features?.[0]?.properties?.score ?? 0;
  if (best < CITY_MIN_SCORE) return [];
  // Une même commune peut avoir plusieurs codes postaux ; on garde ceux des
  // résultats presque aussi pertinents que le meilleur.
  const codes = (data.features ?? [])
    .filter((f) => (f.properties?.score ?? 0) >= best - 0.05)
    .map((f) => f.properties?.postcode)
    .filter((code): code is string => !!code);
  return [...new Set(codes)];
}

/** La recherche par code postal d'open-church est approchée (elle renvoie
 * aussi des codes voisins) : on ne garde que les correspondances exactes. */
async function parishesForPostcode(postcode: string): Promise<Parish[]> {
  const parishes = await fetchParishes('zipCode', postcode);
  return parishes.filter((parish) => parish.zipCode === postcode);
}

/** Recherche « nom, ville ou code postal », comme l'annonce la page :
 * d'abord les paroisses de la ville (ou du code postal), puis celles dont
 * le nom contient vraiment la saisie — la recherche par nom de l'API étant
 * approchée, elle renvoie sinon des paroisses sans rapport (« Chatou » pour
 * « chalon »). */
async function searchParishes(query: string): Promise<Parish[]> {
  if (/^d{5}$/.test(query)) return parishesForPostcode(query);

  const [byName, postcodes] = await Promise.all([
    fetchParishes('name', query),
    cityPostcodes(query).catch(() => [] as string[])
  ]);
  const byCity = (await Promise.all(postcodes.map(parishesForPostcode))).flat();

  const words = normalize(query).split(' ');
  const nameMatches = byName.filter((parish) => {
    const name = normalize(parish.name);
    return words.every((word) => name.includes(word));
  });

  const seen = new Set<number>();
  return [...byCity, ...nameMatches].filter((parish) => {
    if (seen.has(parish.id)) return false;
    seen.add(parish.id);
    return true;
  });
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
      searchParishes(trimmed)
        .then((parishes) => {
          if (cancelled) return;
          setResults(parishes);
          setTotalItems(parishes.length);
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
