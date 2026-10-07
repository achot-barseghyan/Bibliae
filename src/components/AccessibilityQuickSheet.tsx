import { motion } from 'framer-motion';
import AccessibilityPanel from './AccessibilityPanel';
import ReadingPrefsSection from './ReadingPrefsSection';
import { READING_FONTS, READING_THEMES } from './readingPrefsOptions';
import { useAccessibility } from '../hooks/useAccessibility';
import { useBibleReadingPrefs } from '../hooks/useBibleReadingPrefs';
import { CloseIcon } from './nav/icons';
import './AccessibilityQuickSheet.css';

const EASE = [0.22, 0.61, 0.36, 1] as const;

interface AccessibilityQuickSheetProps {
  onClose: () => void;
}

// Feuille d'accès rapide partagée entre le monde Figures et le monde Bible
// (voir BibleHeader et Figures.tsx) : même contenu que la page /reglages,
// dans un raccourci pratique. L'aperçu calcule ses couleurs depuis
// READING_THEMES/READING_FONTS plutôt que depuis les jetons --bible-* (qui ne
// sont définis que sous .bible-world) afin de rester correct quel que soit
// l'écran d'où la feuille est ouverte.
const AccessibilityQuickSheet: React.FC<AccessibilityQuickSheetProps> = ({ onClose }) => {
  const { settings } = useAccessibility();
  const { prefs } = useBibleReadingPrefs();

  const activeFont = READING_FONTS.find((font) => font.key === prefs.font) ?? READING_FONTS[0];
  const activeTheme = READING_THEMES.find((theme) => theme.key === prefs.theme) ?? READING_THEMES[0];

  const transition = settings.reduceMotion ? { duration: 0 } : { duration: 0.32, ease: EASE };

  return (
    <motion.div
      className="a11y-quick-backdrop"
      role="presentation"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={transition}
    >
      <motion.div
        className="a11y-quick-sheet"
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
        <div className="a11y-quick-handle" aria-hidden="true" />

        <div className="a11y-quick-header">
          <button type="button" className="a11y-quick-close" onClick={onClose} aria-label="Fermer">
            <CloseIcon size={18} />
          </button>
        </div>

        <div
          className="a11y-quick-preview"
          style={{ background: activeTheme.bg, borderColor: activeTheme.text + '33' }}
        >
          <p className="a11y-quick-preview-kicker" style={{ color: activeTheme.text + 'b3' }}>
            Aperçu
          </p>
          <p
            className="a11y-quick-preview-text"
            style={{ fontFamily: activeFont.family, color: activeTheme.text }}
          >
            <span className="a11y-quick-preview-verse-number" style={{ color: activeTheme.text }}>
              1
            </span>
            Voici à quoi ressemblera le texte pendant la lecture, avec la police, la taille et
            le thème choisis ci-dessous.
          </p>
        </div>

        <div className="a11y-quick-scroll">
          <AccessibilityPanel />
          <ReadingPrefsSection />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AccessibilityQuickSheet;
