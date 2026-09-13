import { motion } from 'framer-motion';
import AccessibilityPanel from '../../components/AccessibilityPanel';
import { useAccessibility } from '../../hooks/useAccessibility';
import {
  useBibleReadingPrefs,
  type BibleFont,
  type BibleTheme
} from '../../hooks/useBibleReadingPrefs';
import { CloseIcon } from '../../components/nav/icons';
import './BibleAccessibilityPanel.css';

const FONTS: { key: BibleFont; label: string; family: string }[] = [
  { key: 'cormorant', label: 'Cormorant', family: 'var(--font-cormorant)' },
  { key: 'garamond', label: 'EB Garamond', family: 'var(--font-eb-garamond)' },
  { key: 'inter', label: 'Inter (sans-serif)', family: 'var(--font-inter)' }
];

const THEMES: { key: BibleTheme; label: string; bg: string; text: string }[] = [
  { key: 'papier', label: 'Papier', bg: '#f2ebdc', text: '#3a332c' },
  { key: 'sepia', label: 'Sépia', bg: '#eae0c8', text: '#4a3728' },
  { key: 'nuit', label: 'Nuit', bg: '#1e1b17', text: '#ede5d3' },
  { key: 'contraste', label: 'Contraste élevé', bg: '#ffffff', text: '#000000' }
];

const EASE = [0.22, 0.61, 0.36, 1] as const;

interface BibleAccessibilityPanelProps {
  onClose: () => void;
}

const BibleAccessibilityPanel: React.FC<BibleAccessibilityPanelProps> = ({ onClose }) => {
  const { prefs, update, reset, isDefault } = useBibleReadingPrefs();
  const { settings } = useAccessibility();

  const transition = settings.reduceMotion
    ? { duration: 0 }
    : { duration: 0.32, ease: EASE };

  return (
    <motion.div
      className="bible-a11y-backdrop"
      role="presentation"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={transition}
    >
      <motion.div
        className="bible-a11y-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Accessibilité et lecture"
        onClick={(e) => e.stopPropagation()}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={transition}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={(_event, info) => {
          if (info.offset.y > 80 || info.velocity.y > 600) {
            onClose();
          }
        }}
      >
        <div className="bible-a11y-handle" aria-hidden="true" />

        <div className="bible-a11y-header">
          <button
            type="button"
            className="bible-a11y-close"
            onClick={onClose}
            aria-label="Fermer"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        <div className="bible-a11y-preview">
          <p className="bible-a11y-preview-kicker">Aperçu</p>
          <p className="bible-a11y-preview-text">
            <span className="bible-a11y-preview-verse-number">1</span>
            Voici à quoi ressemblera le texte pendant la lecture, avec la police, la taille et
            le thème choisis ci-dessous.
          </p>
        </div>

        <div className="bible-a11y-scroll">
          <AccessibilityPanel />

          <div className="bible-a11y-reading">
            <div className="bible-a11y-reading-header">
              <h2 className="bible-a11y-reading-title">Lecture</h2>
              <button
                type="button"
                className="bible-a11y-reading-reset"
                onClick={reset}
                disabled={isDefault}
              >
                {isDefault ? 'Par défaut' : 'Réinitialiser'}
              </button>
            </div>

            <p className="bible-a11y-reading-label">Police</p>
            <div className="bible-a11y-font-row">
              {FONTS.map((font) => (
                <button
                  key={font.key}
                  type="button"
                  className={`bible-a11y-font-button${prefs.font === font.key ? ' is-active' : ''}`}
                  style={{ fontFamily: font.family }}
                  onClick={() => update('font', font.key)}
                  aria-pressed={prefs.font === font.key}
                  aria-label={font.label}
                >
                  Aa
                </button>
              ))}
            </div>

            <p className="bible-a11y-reading-label">Thème de lecture</p>
            <div className="bible-a11y-theme-row">
              {THEMES.map((theme) => (
                <button
                  key={theme.key}
                  type="button"
                  className={`bible-a11y-theme-button${prefs.theme === theme.key ? ' is-active' : ''}`}
                  style={{ background: theme.bg, color: theme.text }}
                  onClick={() => update('theme', theme.key)}
                  aria-pressed={prefs.theme === theme.key}
                  aria-label={theme.label}
                >
                  Aa
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BibleAccessibilityPanel;
