import { useState, type ReactNode, type RefObject } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  AccessibilityIcon,
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
  /** Absent sur la page d'accueil du monde : la barre rosace (WorldButton) sert de navigation. */
  onBack?: () => void;
  onTitleClick?: () => void;
  accent?: boolean;
  /** Nombre de notes du chapitre affiché ; le badge n'apparaît que si > 0. */
  notesCount?: number;
  onNotesClick?: () => void;
  /** Notes du chapitre dépliées en cartes ; avec `onToggleNotes`, remplace le badge du nombre de notes. */
  notesExpanded?: boolean;
  onToggleNotes?: () => void;
  /** Remplissage du filet de progression de lecture, piloté par la page (scaleX). */
  progressRef?: RefObject<HTMLSpanElement | null>;
}

const BibleHeader: React.FC<BibleHeaderProps> = ({
  title,
  onBack,
  onTitleClick,
  accent = false,
  notesCount = 0,
  onNotesClick,
  notesExpanded = false,
  onToggleNotes,
  progressRef
}) => {
  const [isA11yOpen, setIsA11yOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <header className={`bible-header${accent ? ' bible-header--accent' : ''}${onBack ? '' : ' bible-header--home'}`}>
        <div className="bible-header-side bible-header-side--left">
          {onBack && (
            <button
              type="button"
              className="bible-header-button"
              onClick={() => {
                tapHaptic();
                onBack();
              }}
              aria-label="Retour"
            >
              <ChevronLeftIcon size={22} />
            </button>
          )}
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
          {notesCount > 0 && onToggleNotes && (
            <button
              type="button"
              className={`bible-header-notes-toggle${notesExpanded ? ' is-expanded' : ''}`}
              onClick={() => {
                tapHaptic();
                onToggleNotes();
              }}
              aria-pressed={notesExpanded}
              aria-label={notesExpanded ? 'Replier les notes' : 'Déplier les notes'}
            >
              <span className="bible-header-notes-toggle-fleuron" aria-hidden="true">
                {'❦︎'}
              </span>
              {notesExpanded ? 'Replier' : 'Déplier'}
            </button>
          )}
          {notesCount > 0 && !onToggleNotes && (
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
        {progressRef && (
          <span className="bible-header-progress" aria-hidden="true">
            <span className="bible-header-progress-fill" ref={progressRef} />
          </span>
        )}
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
