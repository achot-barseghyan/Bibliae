import { useState, type ReactNode } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  AccessibilityIcon,
  CrossIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  NoteIcon,
  SearchIcon
} from '../../components/nav/icons';
import AccessibilityQuickSheet from '../../components/AccessibilityQuickSheet';
import BibleSearch from './BibleSearch';
import { tapHaptic } from '../../utils/haptics';
import './BibleHeader.css';

interface BibleHeaderProps {
  title: ReactNode;
  onBack: () => void;
  backIcon?: 'world' | 'chevron';
  onTitleClick?: () => void;
  accent?: boolean;
  /** Nombre de notes du chapitre affiché ; le badge n'apparaît que si > 0. */
  notesCount?: number;
  onNotesClick?: () => void;
}

const BibleHeader: React.FC<BibleHeaderProps> = ({
  title,
  onBack,
  backIcon = 'chevron',
  onTitleClick,
  accent = false,
  notesCount = 0,
  onNotesClick
}) => {
  const [isA11yOpen, setIsA11yOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <header className={`bible-header${accent ? ' bible-header--accent' : ''}`}>
        <div className="bible-header-side bible-header-side--left">
          <button
            type="button"
            className={`bible-header-button${backIcon === 'world' ? ' bible-header-button--world' : ''}`}
            onClick={() => {
              tapHaptic();
              onBack();
            }}
            aria-label={backIcon === 'world' ? 'Changer de monde' : 'Retour'}
          >
            {backIcon === 'world' ? <CrossIcon size={17} /> : <ChevronLeftIcon size={22} />}
          </button>
        </div>

        {onTitleClick ? (
          <button
            type="button"
            className="bible-header-title bible-header-title--button"
            onClick={() => {
              tapHaptic();
              onTitleClick();
            }}
          >
            {/* Le texte seul est tronqué (« … ») : le chevron reste visible
                pour signaler que le titre ouvre un sélecteur. */}
            <span className="bible-header-title-text">{title}</span>
            <ChevronDownIcon size={11} />
          </button>
        ) : (
          <h1 className="bible-header-title">
            <span className="bible-header-title-text">{title}</span>
          </h1>
        )}

        <div className="bible-header-side bible-header-side--right">
          {notesCount > 0 && (
            <button
              type="button"
              className="bible-header-notes-badge"
              onClick={() => {
                tapHaptic();
                onNotesClick?.();
              }}
              aria-label={`Voir les ${notesCount} note${notesCount > 1 ? 's' : ''} de ce chapitre`}
              aria-haspopup="dialog"
            >
              <NoteIcon size={14} />
              {notesCount}
            </button>
          )}
          <button
            type="button"
            className={`bible-header-button${isA11yOpen ? ' is-active' : ''}`}
            onClick={() => setIsA11yOpen((value) => !value)}
            aria-label="Accessibilité et lecture"
            aria-haspopup="dialog"
            aria-expanded={isA11yOpen}
          >
            <AccessibilityIcon size={19} />
          </button>
          <button
            type="button"
            className={`bible-header-button${isSearchOpen ? ' is-active' : ''}`}
            onClick={() => setIsSearchOpen(true)}
            aria-label="Rechercher"
            aria-haspopup="dialog"
            aria-expanded={isSearchOpen}
          >
            <SearchIcon size={19} />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {isA11yOpen && <AccessibilityQuickSheet onClose={() => setIsA11yOpen(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {isSearchOpen && <BibleSearch onClose={() => setIsSearchOpen(false)} />}
      </AnimatePresence>
    </>
  );
};

export default BibleHeader;
