import { BookmarkIcon, ChevronLeftIcon, SearchIcon } from '../../components/nav/icons';
import { tapHaptic } from '../../utils/haptics';
import '../bible/bibleTheme.css';
import './prierTheme.css';

interface PrierHeroBarProps {
  /** Libellé du retour (« Prier », « Prières »...) ; absent sur l'accueil de Prier. */
  backLabel?: string;
  onBack?: () => void;
  onSearch: () => void;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
}

/** Barre posée en haut des bandeaux sombres de Prier : retour doré, favori et recherche. */
const PrierHeroBar: React.FC<PrierHeroBarProps> = ({ backLabel, onBack, onSearch, isBookmarked, onToggleBookmark }) => (
  <div className="prier-hero-bar">
    {onBack ? (
      <button
        type="button"
        className="night-back"
        onClick={() => {
          tapHaptic();
          onBack();
        }}
      >
        <ChevronLeftIcon size={16} />
        {backLabel}
      </button>
    ) : (
      <span />
    )}
    <div className="prier-hero-actions">
      {onToggleBookmark && (
        <button
          type="button"
          className="prier-hero-icon"
          onClick={() => {
            tapHaptic();
            onToggleBookmark();
          }}
          aria-pressed={isBookmarked}
          aria-label={isBookmarked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <BookmarkIcon size={16} filled={isBookmarked} />
        </button>
      )}
      <button type="button" className="prier-hero-icon" onClick={onSearch} aria-label="Rechercher">
        <SearchIcon size={16} />
      </button>
    </div>
  </div>
);

export default PrierHeroBar;
