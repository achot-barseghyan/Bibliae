import { ChevronLeftIcon, BookmarkIcon, SearchIcon } from '../../components/nav/icons';
import { tapHaptic } from '../../utils/haptics';
import './PrierHeader.css';

interface PrierHeaderProps {
  label: string;
  roman?: string;
  /** Absent sur l'accueil de Prier : la barre rosace (WorldButton) sert de navigation. */
  onBack?: () => void;
  onSearch: () => void;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
}

const PrierHeader: React.FC<PrierHeaderProps> = ({
  label,
  roman,
  onBack,
  onSearch,
  isBookmarked,
  onToggleBookmark
}) => (
  <header className="prier-header">
    {onBack ? (
      <button
        type="button"
        className="prier-header-back"
        onClick={() => {
          tapHaptic();
          onBack();
        }}
        aria-label="Retour"
      >
        <ChevronLeftIcon size={18} />
        <span className="prier-header-label">{label}</span>
      </button>
    ) : (
      <span className="prier-header-label">{label}</span>
    )}

    <div className="prier-header-actions">
      {roman && <span className="prier-header-roman">{roman}</span>}
      {onToggleBookmark && (
        <button
          type="button"
          className="prier-header-button"
          onClick={onToggleBookmark}
          aria-pressed={isBookmarked}
          aria-label="Ajouter aux favoris"
        >
          <BookmarkIcon size={18} filled={isBookmarked} />
        </button>
      )}
      <button
        type="button"
        className="prier-header-button"
        onClick={onSearch}
        aria-label="Rechercher"
      >
        <SearchIcon size={18} />
      </button>
    </div>
  </header>
);

export default PrierHeader;
