import { motion } from 'framer-motion';
import AccessibilityPanel from './AccessibilityPanel';
import ReadingPrefsSection from './ReadingPrefsSection';
import ReadingPreview from './ReadingPreview';
import { useAccessibility } from '../hooks/useAccessibility';
import './AccessibilityQuickSheet.css';

const EASE = [0.2, 0.8, 0.2, 1] as const;

interface AccessibilityQuickSheetProps {
  onClose: () => void;
}

// Feuille « Réglages · Lecture » (maquette Réglages lecture v2) partagée
// entre le monde Figures et le monde Bible (voir BibleHeader et Figures.tsx) :
// même contenu que la page /reglages, dans un raccourci pratique. La feuille
// garde sa palette crème fixe (voir AccessibilityQuickSheet.css) ; seul
// l'aperçu (ReadingPreview) reflète le thème choisi.
const AccessibilityQuickSheet: React.FC<AccessibilityQuickSheetProps> = ({ onClose }) => {
  const { settings } = useAccessibility();

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

          <ReadingPreview className="a11y-quick-preview" />
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
