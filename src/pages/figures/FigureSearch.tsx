import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Figure } from '../../data/figures';
import { useAccessibility } from '../../hooks/useAccessibility';
import { normalizeForSearch } from '../../utils/text';
import { CloseIcon, SearchIcon, ChevronRightIcon } from '../../components/nav/icons';
import { tapHaptic } from '../../utils/haptics';
// Même habillage que la recherche de « Prier ».
import '../prier/PrierSearch.css';

interface FigureSearchProps {
  figures: Figure[];
  onClose: () => void;
}

const normalize = normalizeForSearch;

const FigureSearch: React.FC<FigureSearchProps> = ({ figures, onClose }) => {
  const navigate = useNavigate();
  const { settings } = useAccessibility();
  const [query, setQuery] = useState('');

  const transition = settings.reduceMotion ? { duration: 0 } : { duration: 0.18, ease: [0.4, 0, 0.2, 1] as const };
  const trimmed = query.trim();
  const needle = normalize(trimmed);

  const matches = useMemo(() => {
    if (!needle) return [];
    return figures.filter((figure) => {
      const haystack = `${figure.name} ${figure.originalName} ${figure.role} ${figure.epoque}`;
      return normalize(haystack).includes(needle);
    });
  }, [needle, figures]);

  const goTo = (figureId: string) => {
    tapHaptic();
    onClose();
    navigate(`/figures/${figureId}`);
  };

  return (
    <motion.div
      className="prier-search"
      role="dialog"
      aria-modal="true"
      aria-label="Rechercher une figure"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={transition}
    >
      <div className="prier-search-header">
        <div className="prier-search-field">
          <SearchIcon size={17} className="prier-search-field-icon" />
          <input
            type="search"
            className="prier-search-input"
            placeholder="Rechercher une figure..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
        <button type="button" className="prier-search-close" onClick={onClose} aria-label="Fermer la recherche">
          <CloseIcon size={20} />
        </button>
      </div>

      <div className="prier-search-body">
        {!trimmed && (
          <p className="prier-search-hint">
            Cherchez une figure par son nom, son nom d'origine, son rôle ou son époque.
          </p>
        )}

        {trimmed && matches.length === 0 && (
          <p className="prier-search-empty">Aucun résultat pour « {trimmed} ».</p>
        )}

        {matches.length > 0 && (
          <div className="prier-search-section">
            <p className="prier-search-section-label">Figures</p>
            {matches.map((figure) => (
              <button
                key={figure.id}
                type="button"
                className="prier-search-row"
                onClick={() => goTo(figure.id)}
              >
                <span className="prier-search-row-body">
                  <span className="prier-search-row-title">{figure.name}</span>
                  <span className="prier-search-row-subtitle">
                    {figure.role.toUpperCase()} · {figure.epoque.toUpperCase()}
                  </span>
                </span>
                <ChevronRightIcon size={16} className="prier-search-row-chevron" />
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default FigureSearch;
