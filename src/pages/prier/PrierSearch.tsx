import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Intercession } from '../../data/saints';
import { useRemotePrayers } from '../../hooks/content/useRemotePrayers';
import { useRemoteSaints } from '../../hooks/content/useRemoteSaints';
import { useAccessibility } from '../../hooks/useAccessibility';
import { normalizeForSearch } from '../../utils/text';
import { CloseIcon, SearchIcon, ChevronRightIcon } from '../../components/nav/icons';
import './PrierSearch.css';

interface PrierSearchProps {
  onClose: () => void;
}

const normalize = normalizeForSearch;

const PrierSearch: React.FC<PrierSearchProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { settings } = useAccessibility();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const churchPrayers = useRemotePrayers();
  const intercessionCategories = useRemoteSaints();

  const transition = settings.reduceMotion ? { duration: 0 } : { duration: 0.18, ease: [0.4, 0, 0.2, 1] as const };
  const trimmed = query.trim();
  const needle = normalize(trimmed);

  const prayerMatches = useMemo(() => {
    if (!needle) return [];
    return churchPrayers.filter(
      (prayer) => normalize(prayer.title).includes(needle) || normalize(prayer.reference).includes(needle)
    );
  }, [needle, churchPrayers]);

  const situationMatches = useMemo(() => {
    if (!needle) return [];
    const results: { item: Intercession; categoryLabel: string }[] = [];
    for (const category of intercessionCategories) {
      for (const item of category.items) {
        const haystack = `${item.situation} ${item.saintName} ${item.saintMeta} ${category.label}`;
        if (normalize(haystack).includes(needle)) {
          results.push({ item, categoryLabel: category.label });
        }
      }
    }
    return results;
  }, [needle, intercessionCategories]);

  const hasResults = prayerMatches.length > 0 || situationMatches.length > 0;

  const goTo = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <motion.div
      className="prier-search"
      role="dialog"
      aria-modal="true"
      aria-label="Rechercher dans Prier"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={transition}
    >
      <div className="prier-search-header">
        <div className="prier-search-field">
          <SearchIcon size={17} className="prier-search-field-icon" />
          <input
            ref={inputRef}
            type="search"
            className="prier-search-input"
            placeholder="Une prière, un saint, une situation..."
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
            Cherchez une prière par son nom, ou une situation de vie pour trouver le saint à qui la
            confier.
          </p>
        )}

        {trimmed && !hasResults && (
          <p className="prier-search-empty">Aucun résultat pour « {trimmed} ».</p>
        )}

        {prayerMatches.length > 0 && (
          <div className="prier-search-section">
            <p className="prier-search-section-label">Prières de l'Église catholique</p>
            {prayerMatches.map((prayer) => (
              <button
                key={prayer.id}
                type="button"
                className="prier-search-row"
                onClick={() => goTo(`/prier/prieres/${prayer.id}`)}
              >
                <span className="prier-search-row-body">
                  <span className="prier-search-row-title">{prayer.title}</span>
                  <span className="prier-search-row-subtitle">{prayer.reference.toUpperCase()}</span>
                </span>
                <ChevronRightIcon size={16} className="prier-search-row-chevron" />
              </button>
            ))}
          </div>
        )}

        {situationMatches.length > 0 && (
          <div className="prier-search-section">
            <p className="prier-search-section-label">Demander l'intercession des saints</p>
            {situationMatches.map(({ item, categoryLabel }) => (
              <button
                key={item.id}
                type="button"
                className="prier-search-row"
                onClick={() => goTo(`/prier/saints/${item.id}`)}
              >
                <span className="prier-search-row-body">
                  <span className="prier-search-row-title">{item.situation}</span>
                  <span className="prier-search-row-subtitle">
                    {item.saintName.toUpperCase()} · {categoryLabel.toUpperCase()}
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

export default PrierSearch;
