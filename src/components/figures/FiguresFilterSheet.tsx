import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { EPOQUES, ROLES, type Epoque, type Figure, type Role } from '../../data/figures';
import { useAccessibility } from '../../hooks/useAccessibility';
import './FiguresFilterSheet.css';

export interface Filters {
  testament: 'tous' | 'ancien' | 'nouveau';
  genre: 'tous' | 'homme' | 'femme';
  roles: Role[];
  epoques: Epoque[];
  book: string | null;
  minMentions: number;
}

export const defaultFilters: Filters = {
  testament: 'tous',
  genre: 'tous',
  roles: [],
  epoques: [],
  book: null,
  minMentions: 0
};

interface FiguresFilterSheetProps {
  figures: Figure[];
  filters: Filters;
  onChange: (filters: Filters) => void;
  onClose: () => void;
  resultCount: number;
}

const FiguresFilterSheet: React.FC<FiguresFilterSheetProps> = ({
  figures,
  filters,
  onChange,
  onClose,
  resultCount
}) => {
  const { settings } = useAccessibility();
  const overlayTransition = settings.reduceMotion
    ? { duration: 0 }
    : { duration: 0.22, ease: [0.4, 0, 0.2, 1] as const };
  const sheetTransition = settings.reduceMotion
    ? { duration: 0 }
    : { duration: 0.32, ease: [0.32, 0.72, 0, 1] as const };

  const allBooks = useMemo(
    () => Array.from(new Set(figures.flatMap((f) => f.books))).sort(),
    [figures]
  );
  const maxMentions = useMemo(
    () => figures.reduce((max, f) => Math.max(max, f.mentions), 0),
    [figures]
  );

  const roleCounts = useMemo(() => {
    const counts: Partial<Record<Role, number>> = {};
    figures.forEach((figure) => {
      if (filters.testament !== 'tous' && figure.testament !== filters.testament) {
        return;
      }
      if (filters.genre !== 'tous' && figure.genre !== filters.genre) {
        return;
      }
      counts[figure.role] = (counts[figure.role] ?? 0) + 1;
    });
    return counts;
  }, [figures, filters.testament, filters.genre]);

  const toggleRole = (role: Role) => {
    const roles = filters.roles.includes(role)
      ? filters.roles.filter((r) => r !== role)
      : [...filters.roles, role];
    onChange({ ...filters, roles });
  };

  const toggleEpoque = (epoque: Epoque) => {
    const epoques = filters.epoques.includes(epoque)
      ? filters.epoques.filter((e) => e !== epoque)
      : [...filters.epoques, epoque];
    onChange({ ...filters, epoques });
  };

  return (
    <motion.div
      className="filters-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Filtres"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={overlayTransition}
    >
      <motion.div
        className="filters-sheet"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={sheetTransition}
      >
        <div className="filters-header">
          <h2 className="filters-title">Filtres</h2>
          <button
            type="button"
            className="filters-close"
            onClick={onClose}
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        <div className="filters-body">
          <section className="filters-section">
            <p className="filters-label">Testament</p>
            <div className="filters-segmented">
              {(['tous', 'ancien', 'nouveau'] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`filters-segmented-option${
                    filters.testament === value ? ' is-active' : ''
                  }`}
                  onClick={() => onChange({ ...filters, testament: value })}
                >
                  {value === 'tous' ? 'Tous' : value === 'ancien' ? 'Ancien' : 'Nouveau'}
                </button>
              ))}
            </div>
          </section>

          <section className="filters-section">
            <p className="filters-label">Genre</p>
            <div className="filters-segmented">
              {(['tous', 'femme', 'homme'] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`filters-segmented-option${
                    filters.genre === value ? ' is-active' : ''
                  }`}
                  onClick={() => onChange({ ...filters, genre: value })}
                >
                  {value === 'tous' ? 'Tous' : value === 'femme' ? 'Femmes' : 'Hommes'}
                </button>
              ))}
            </div>
          </section>

          <section className="filters-section">
            <p className="filters-label">Rôle</p>
            <div className="filters-chips">
              {ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  className={`filters-chip${
                    filters.roles.includes(role) ? ' is-active' : ''
                  }`}
                  onClick={() => toggleRole(role)}
                  disabled={!roleCounts[role]}
                >
                  {role} {roleCounts[role] ?? 0}
                </button>
              ))}
            </div>
          </section>

          <section className="filters-section">
            <p className="filters-label">Époque</p>
            <div className="filters-chips">
              {EPOQUES.map((epoque) => (
                <button
                  key={epoque}
                  type="button"
                  className={`filters-chip${
                    filters.epoques.includes(epoque) ? ' is-active' : ''
                  }`}
                  onClick={() => toggleEpoque(epoque)}
                >
                  {epoque}
                </button>
              ))}
            </div>
          </section>

          <section className="filters-section">
            <p className="filters-label">Livre</p>
            <select
              className="filters-select"
              value={filters.book ?? ''}
              onChange={(e) =>
                onChange({ ...filters, book: e.target.value || null })
              }
            >
              <option value="">Tous les livres</option>
              {allBooks.map((book) => (
                <option key={book} value={book}>
                  {book}
                </option>
              ))}
            </select>
          </section>

          <section className="filters-section">
            <p className="filters-label">
              Mentions : au moins {filters.minMentions}
            </p>
            <input
              type="range"
              className="filters-range"
              min={0}
              max={maxMentions}
              step={5}
              value={filters.minMentions}
              onChange={(e) =>
                onChange({ ...filters, minMentions: Number(e.target.value) })
              }
            />
          </section>
        </div>

        <div className="filters-footer">
          <button
            type="button"
            className="filters-reset"
            onClick={() => onChange(defaultFilters)}
          >
            Réinitialiser
          </button>
          <button type="button" className="filters-apply" onClick={onClose}>
            Voir {resultCount} figures
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FiguresFilterSheet;
