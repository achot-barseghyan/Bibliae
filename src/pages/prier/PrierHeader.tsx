import { ChevronLeftIcon, CrossIcon, BookmarkIcon, SearchIcon } from '../../components/nav/icons';
import { tapHaptic } from '../../utils/haptics';
import './PrierHeader.css';

interface PrierHeaderProps {
  label: string;
  roman?: string;
  onBack: () => void;
  backIcon?: 'chevron' | 'world';
  onSearch: () => void;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
}

const PrierHeader: React.FC<PrierHeaderProps> = ({
  label,
  roman,
  onBack,
  backIcon = 'chevron',
  onSearch,
  isBookmarked,
  onToggleBookmark
}) => (
  <header className="prier-header">
    <button
      type="button"
      className={`prier-header-back${backIcon === 'world' ? ' prier-header-back--world' : ''}`}
      onClick={() => {
        tapHaptic();
        onBack();
      }}
      aria-label={backIcon === 'world' ? 'Changer de monde' : 'Retour'}
    >
      {backIcon === 'world' ? (
        <CrossIcon size={17} />
      ) : (
        <>
          <ChevronLeftIcon size={18} />
          <span className="prier-header-label">{label}</span>
        </>
      )}
    </button>

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
