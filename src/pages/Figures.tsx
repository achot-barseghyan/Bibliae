import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { IonContent, IonPage } from '@ionic/react';
import { normalizeLetter, type Figure } from '../data/figures';
import { normalizeForSearch } from '../utils/text';
import AccessibilityPanel from '../components/AccessibilityPanel';
import { AccessibilityIcon } from '../components/nav/icons';
import { useAccessibility } from '../hooks/useAccessibility';
import { useFigures } from '../hooks/useFigures';
import FigureCardsView from '../components/figures/FigureCardsView';
import FigureListView from '../components/figures/FigureListView';
import FigureIndexView from '../components/figures/FigureIndexView';
import FigureFriseView from '../components/figures/FigureFriseView';
import FiguresFilterSheet, {
  defaultFilters,
  type Filters
} from '../components/figures/FiguresFilterSheet';
import './Figures.css';

type ViewMode = 'cartes' | 'liste' | 'index' | 'frise';

const VIEW_MODES: { key: ViewMode; label: string }[] = [
  { key: 'cartes', label: 'Cartes' },
  { key: 'liste', label: 'Liste' },
  { key: 'index', label: 'Index A-Z' },
  { key: 'frise', label: 'Frise' }
];

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function matchesFilters(figure: Figure, filters: Filters, query: string): boolean {
  if (filters.testament !== 'tous' && figure.testament !== filters.testament) {
    return false;
  }
  if (filters.genre !== 'tous' && figure.genre !== filters.genre) {
    return false;
  }
  if (filters.roles.length && !filters.roles.includes(figure.role)) {
    return false;
  }
  if (filters.epoques.length && !filters.epoques.includes(figure.epoque)) {
    return false;
  }
  if (filters.book && !figure.books.includes(filters.book)) {
    return false;
  }
  if (figure.mentions < filters.minMentions) {
    return false;
  }
  const trimmed = normalizeForSearch(query.trim());
  if (trimmed) {
    const matchesName = normalizeForSearch(figure.name).includes(trimmed);
    const matchesOriginal = normalizeForSearch(figure.originalName).includes(trimmed);
    if (!matchesName && !matchesOriginal) {
      return false;
    }
  }
  return true;
}

const Figures: React.FC = () => {
  const { settings: accessibilitySettings } = useAccessibility();
  const { figures: allFigures } = useFigures();
  const [viewMode, setViewMode] = useState<ViewMode>('cartes');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const panelTransition = accessibilitySettings.reduceMotion
    ? { duration: 0 }
    : { duration: 0.32, ease: [0.4, 0, 0.2, 1] as const };
  const viewTransition = accessibilitySettings.reduceMotion
    ? { duration: 0 }
    : { duration: 0.18, ease: [0.4, 0, 0.2, 1] as const };

  const filteredBeforeLetter = useMemo(
    () => allFigures.filter((figure) => matchesFilters(figure, filters, searchQuery)),
    [allFigures, filters, searchQuery]
  );

  const availableLetters = useMemo(
    () => new Set(filteredBeforeLetter.map((figure) => normalizeLetter(figure.name))),
    [filteredBeforeLetter]
  );

  const filtered = useMemo(
    () =>
      selectedLetter
        ? filteredBeforeLetter.filter(
            (figure) => normalizeLetter(figure.name) === selectedLetter
          )
        : filteredBeforeLetter,
    [filteredBeforeLetter, selectedLetter]
  );

  const sortedFigures = useMemo(
    () => [...filtered].sort((a, b) => a.name.localeCompare(b.name, 'fr')),
    [filtered]
  );

  return (
    <IonPage>
      <IonContent fullscreen className="figures-content">
        <header className="figures-topbar">
          <span className="figures-topbar-wordmark">
            Bibli<span className="figures-topbar-wordmark-accent">ae</span>
          </span>
          <button
            type="button"
            className={`figures-a11y-button${isAccessibilityOpen ? ' is-active' : ''}`}
            onClick={() => setIsAccessibilityOpen((value) => !value)}
            aria-pressed={isAccessibilityOpen}
            aria-label="Accessibilité"
          >
            <AccessibilityIcon />
          </button>
        </header>

        <AnimatePresence initial={false}>
          {isAccessibilityOpen && (
            <motion.div
              key="a11y-panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={panelTransition}
              style={{ overflow: 'hidden' }}
            >
              <AccessibilityPanel />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="figures-intro">
          <h1 className="figures-page-title">Figures</h1>
          <p className="figures-page-subtitle">
            Les personnages de l'Écriture : nom d'origine, époque, rôle et
            livres où ils apparaissent.
          </p>
        </div>

        <div className="figures-search-row">
          <input
            type="search"
            className="figures-search-input"
            placeholder="Rechercher une figure..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="button"
            className="figures-filters-button"
            onClick={() => setIsFiltersOpen(true)}
          >
            Filtres
          </button>
        </div>

        <div className="figures-view-tabs">
          {VIEW_MODES.map((mode) => (
            <button
              key={mode.key}
              type="button"
              className={`figures-view-tab${viewMode === mode.key ? ' is-active' : ''}`}
              onClick={() => setViewMode(mode.key)}
            >
              {mode.label}
            </button>
          ))}
        </div>

        <div className="figures-alphabet-row">
          <button
            type="button"
            className={`figures-alphabet-pill figures-alphabet-all${
              !selectedLetter ? ' is-active' : ''
            }`}
            onClick={() => setSelectedLetter(null)}
          >
            Toutes
          </button>
          {ALPHABET.map((letter) => (
            <button
              key={letter}
              type="button"
              disabled={!availableLetters.has(letter)}
              className={`figures-alphabet-pill${
                selectedLetter === letter ? ' is-active' : ''
              }`}
              onClick={() => setSelectedLetter(letter)}
            >
              {letter}
            </button>
          ))}
        </div>

        <p className="figures-count">
          <span className="figures-count-number">{sortedFigures.length}</span>{' '}
          figures
        </p>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={viewTransition}
          >
            {viewMode === 'cartes' && <FigureCardsView figures={sortedFigures} />}
            {viewMode === 'liste' && <FigureListView figures={sortedFigures} />}
            {viewMode === 'index' && <FigureIndexView figures={sortedFigures} />}
            {viewMode === 'frise' && <FigureFriseView figures={sortedFigures} />}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {isFiltersOpen && (
            <FiguresFilterSheet
              key="filters-sheet"
              figures={allFigures}
              filters={filters}
              onChange={setFilters}
              onClose={() => setIsFiltersOpen(false)}
              resultCount={filtered.length}
            />
          )}
        </AnimatePresence>
      </IonContent>
    </IonPage>
  );
};

export default Figures;
