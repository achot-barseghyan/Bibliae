import { useCallback, useState, type ReactNode } from 'react';
import AccueilSearch from './AccueilSearch';
import { SEARCH_SCOPES } from './searchIndex';
import { SearchContext, type OpenSearch } from './searchContext';

/**
 * Une seule recherche plein écran pour toute l'app (accueil, Bible, fiches,
 * Prier…) : montée une fois à la racine, ouverte par useOpenSearch() avec la
 * portée qui convient à l'écran (Versets depuis la Bible, etc.). Évite de
 * charger l'index et les figures une fois par page ouverte.
 */
const GlobalSearch: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [scope, setScope] = useState(-1);

  const openSearch = useCallback<OpenSearch>((key) => {
    setScope(key ? SEARCH_SCOPES.findIndex((s) => s.key === key) : -1);
    setOpen(true);
  }, []);
  const close = useCallback(() => setOpen(false), []);

  return (
    <SearchContext.Provider value={openSearch}>
      {children}
      <AccueilSearch open={open} initialScope={scope} onClose={close} />
    </SearchContext.Provider>
  );
};

export default GlobalSearch;
