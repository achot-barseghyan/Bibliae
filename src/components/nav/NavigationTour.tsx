import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAccessibility } from '../../hooks/useAccessibility';
import { useNavigationTour } from '../../hooks/useNavigationTour';
import './NavigationTour.css';

interface TourStep {
  selector: string;
  title: string;
  text: string;
  shape: 'pill' | 'circle';
  padding: number;
}

const STEPS: TourStep[] = [
  {
    selector: '.app-tab-bar',
    title: 'Le Compendium',
    text: "Figures, Lieux, Frise et Église sont les quatre sections du Compendium, l'index de la Bible.",
    shape: 'pill',
    padding: 0
  },
  {
    selector: '.app-tab-bar-cross',
    title: 'Changer de monde',
    text: 'Ce bouton ouvre La Bible et le Rosaire, les deux autres grands espaces de l’application.',
    shape: 'circle',
    padding: 6
  }
];

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

const NavigationTour: React.FC = () => {
  const { isOpen, close } = useNavigationTour();
  const { settings } = useAccessibility();
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<SpotlightRect | null>(null);

  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;

  useEffect(() => {
    if (!isOpen) return;

    const update = () => setRect(measure(step));
    update();
    // Le premier rendu peut survenir avant que la barre d'onglets n'ait sa
    // taille finale (polices, safe-area) : on remesure une fois de plus.
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
      close();
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

        <div className="tour-card">
          <p className="tour-card-title">{step.title}</p>
          <p className="tour-card-text">{step.text}</p>

          <div className="tour-card-footer">
            <button type="button" className="tour-card-skip" onClick={close}>
              Passer
            </button>
            <div className="tour-card-dots" aria-hidden="true">
              {STEPS.map((s, i) => (
                <span key={s.selector} className={`tour-card-dot${i === stepIndex ? ' is-active' : ''}`} />
              ))}
            </div>
            <button type="button" className="tour-card-next" onClick={next}>
              {isLast ? 'Terminer' : 'Suivant'}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NavigationTour;
