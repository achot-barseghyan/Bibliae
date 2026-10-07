import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAccessibility } from '../../hooks/useAccessibility';
import './NavigationTour.css';

export interface TourStep {
  selector: string;
  title: string;
  text: string;
  shape: 'pill' | 'circle';
  padding: number;
}

const EASE = [0.22, 0.61, 0.36, 1] as const;

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function measure(step: TourStep): SpotlightRect | null {
  const el = document.querySelector(step.selector);
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  return {
    top: rect.top - step.padding,
    left: rect.left - step.padding,
    width: rect.width + step.padding * 2,
    height: rect.height + step.padding * 2
  };
}

interface SpotlightTourProps {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  /** Distance depuis le bas de l'écran pour la carte : sous la barre d'onglets par défaut (112px), à ajuster sur un écran sans barre d'onglets. */
  cardBottom?: number | string;
}

/** Surbrillance d'un élément de l'interface avec une carte d'explication — moteur générique consommé par les tours de l'app (navigation, chapitre biblique, annotation...). */
const SpotlightTour: React.FC<SpotlightTourProps> = ({ steps, isOpen, onClose, cardBottom = 112 }) => {
  const { settings } = useAccessibility();
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<SpotlightRect | null>(null);

  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;

  useEffect(() => {
    if (!isOpen) return;

    const update = () => setRect(measure(step));
    update();
    // Le premier rendu peut survenir avant que l'élément ciblé n'ait sa taille
    // finale (polices, safe-area) : on remesure une fois de plus.
    const raf = requestAnimationFrame(update);
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', update);
    };
  }, [isOpen, step]);

  if (!isOpen) return null;

  const transition = settings.reduceMotion ? { duration: 0 } : { duration: 0.28, ease: EASE };

  const next = () => {
    if (isLast) {
      onClose();
    } else {
      setStepIndex((i) => i + 1);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="tour-overlay"
        role="dialog"
        aria-modal="true"
        aria-label={step.title}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={transition}
      >
        {rect && (
          <motion.div
            className={`tour-spotlight tour-spotlight--${step.shape}`}
            initial={false}
            animate={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
            transition={transition}
          />
        )}

        <div className="tour-card" style={{ bottom: cardBottom }}>
          <p className="tour-card-title">{step.title}</p>
          <p className="tour-card-text">{step.text}</p>

          <div className="tour-card-footer">
            <button type="button" className="tour-card-skip" onClick={onClose}>
              Passer
            </button>
            {steps.length > 1 && (
              <div className="tour-card-dots" aria-hidden="true">
                {steps.map((s, i) => (
                  <span key={s.selector} className={`tour-card-dot${i === stepIndex ? ' is-active' : ''}`} />
                ))}
              </div>
            )}
            <button type="button" className="tour-card-next" onClick={next}>
              {isLast ? 'Terminer' : 'Suivant'}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SpotlightTour;
