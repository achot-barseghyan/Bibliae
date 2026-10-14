import { motion } from 'framer-motion';
import AccessibilityPanel from './AccessibilityPanel';
import ReadingPrefsSection from './ReadingPrefsSection';
import { READING_FONTS, READING_THEMES } from './readingPrefsOptions';
import { useAccessibility } from '../hooks/useAccessibility';
import { useBibleReadingPrefs } from '../hooks/useBibleReadingPrefs';
import './AccessibilityQuickSheet.css';

const EASE = [0.2, 0.8, 0.2, 1] as const;

// Lignes visibles dans l'aperçu selon la taille (1 à 4) : assez pour que
// le changement de taille se voie sans faire grandir l'en-tête à l'excès.
const PREVIEW_LINES = [3, 4, 4, 5];

interface AccessibilityQuickSheetProps {
  onClose: () => void;
}

// Feuille « Réglages · Lecture » (maquette Réglages lecture v2) partagée
// entre le monde Figures et le monde Bible (voir BibleHeader et Figures.tsx) :
// même contenu que la page /reglages, dans un raccourci pratique. L'aperçu
// calcule ses couleurs depuis READING_THEMES/READING_FONTS plutôt que depuis
// les jetons CSS (redéfinis par le thème choisi) afin de rester correct quel
// que soit l'écran d'où la feuille est ouverte ; la feuille elle-même garde
// sa palette crème fixe (voir AccessibilityQuickSheet.css).
const AccessibilityQuickSheet: React.FC<AccessibilityQuickSheetProps> = ({ onClose }) => {
  const { settings } = useAccessibility();
  const { prefs } = useBibleReadingPrefs();

  const activeFont = READING_FONTS.find((font) => font.key === prefs.font) ?? READING_FONTS[0];
  const activeTheme = READING_THEMES.find((theme) => theme.key === prefs.theme) ?? READING_THEMES[0];

  const scaleIndex = Math.min(Math.max(settings.textScale - 1, 0), 3);
  const previewLines =
    PREVIEW_LINES[scaleIndex] + (prefs.font === 'inter' && scaleIndex > 0 ? 1 : 0);

  const fade = settings.reduceMotion ? { duration: 0 } : { duration: 0.5 };
  const slide = settings.reduceMotion ? { duration: 0 } : { duration: 0.65, ease: EASE };

  return (
    <motion.div
      className="a11y-quick-backdrop"
      role="presentation"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={fade}
    >
      <motion.div
        className="a11y-quick-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Réglages de lecture"
        onClick={(e) => e.stopPropagation()}
        initial={{ y: '105%' }}
        animate={{ y: 0 }}
        exit={{ y: '105%' }}
        transition={slide}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={(_event, info) => {
          if (info.offset.y > 80 || info.velocity.y > 600) {
            onClose();
          }
        }}
      >
        <div className="a11y-quick-hero">
          <span className="a11y-quick-rosace" aria-hidden="true" />
          <span className="a11y-quick-glow" aria-hidden="true" />

          <div className="a11y-quick-handle" aria-hidden="true" />

          <div className="a11y-quick-header">
            <div>
              <p className="a11y-quick-kicker">Réglages</p>
              <h2 className="a11y-quick-title">Lecture</h2>
            </div>
            <button type="button" className="a11y-quick-close" onClick={onClose} aria-label="Fermer">
              <svg width="12" height="12" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                <path
                  d="M1 1l13 13M14 1L1 14"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <div className="a11y-quick-preview" style={{ background: activeTheme.bg }}>
            <span className="a11y-quick-preview-shine" aria-hidden="true" />
            <div className="a11y-quick-preview-top">
              <span className="a11y-quick-preview-kicker" style={{ color: activeTheme.accent }}>
                Aperçu
              </span>
              <span className="a11y-quick-preview-meta" style={{ color: activeTheme.muted }}>
                {activeFont.label} · {activeTheme.label}
              </span>
            </div>
            <p
              className="a11y-quick-preview-text"
              style={
                {
                  fontFamily: activeFont.family,
                  color: settings.contrast ? activeTheme.hi : activeTheme.text,
                  '--pv-lines': previewLines
                } as React.CSSProperties
              }
            >
              <sup className="a11y-quick-preview-verse-number" style={{ color: activeTheme.accent }}>
                1
              </sup>
              Voici à quoi ressemblera le texte pendant la lecture, avec la police, la taille et
              le thème choisis ci-dessous.
            </p>
          </div>
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
