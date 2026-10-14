import { createContext, useContext } from 'react';
import type { ScopeKey } from './searchIndex';

/** Ouvre la recherche globale, avec une portée de départ (ou « Tout »). */
export type OpenSearch = (scope?: ScopeKey | null) => void;

export const SearchContext = createContext<OpenSearch>(() => {});

/** Toutes les loupes de l'app ouvrent la même recherche (voir GlobalSearch). */
export function useOpenSearch(): OpenSearch {
  return useContext(SearchContext);
}
