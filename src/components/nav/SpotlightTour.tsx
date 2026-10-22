import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAccessibility } from '../../hooks/useAccessibility';
import './NavigationTour.css';

export interface TourStep {
  selector: string;
  title: string;
  text: string;
  shape: 'pill' | 'circle';
  padding: number;
  /** Fait défiler la page jusqu'à l'élément s'il est hors de l'écran. */
  scrollIntoView?: boolean;
}

const EASE = [0.22, 0.61, 0.36, 1] as const;

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/** `origin` : coin du bloc conteneur des éléments fixes. Sur ordinateur, le
 * cadre centré de l'app (desktopFrame.css) en est un, décalé dans la fenêtre,
 * alors que getBoundingClientRect se repère sur la fenêtre. */
function measure(step: TourStep, origin: { top: number; left: number }): SpotlightRect | null {
  const el = document.querySelector(step.selector);
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  return {
    top: rect.top - origin.top - step.padding,
    left: rect.left - origin.left - step.padding,
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
  // Le voile couvre tout le bloc conteneur (`inset: 0`) : son coin en donne l'origine.
  const overlayRef = useRef<HTMLDivElement>(null);

  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;

  useEffect(() => {
    if (!isOpen) return;

    const update = () => setRect(measure(step, overlayRef.current?.getBoundingClientRect() ?? { top: 0, left: 0 }));
    // Pendant une seconde et demie, on remesure à chaque image : l'élément
    // ciblé peut apparaître après l'ouverture du tour (contenu chargé) ou
    // bouger le temps du défilement. Le défilement d'IonContent se fait dans
    // son shadow DOM et n'émet aucun évènement `scroll` visible d'ici.
    // Un défilement demandé pendant l'animation d'entrée de la page est ignoré :
    // on le redemande tant que l'élément reste hors de la moitié haute de
    // l'écran (le bas est occupé par la carte).
    let lastScroll = -Infinity;
    let raf = 0;
    const start = performance.now();
    const track = () => {
      const now = performance.now();
      const el = step.scrollIntoView ? document.querySelector(step.selector) : null;
      if (el && now - lastScroll > 400) {
        const r = el.getBoundingClientRect();
        if (r.top < 0 || r.bottom > window.innerHeight * 0.6) {
          el.scrollIntoView({ block: 'center', behavior: settings.reduceMotion ? 'auto' : 'smooth' });
          lastScroll = now;
        }
      }
      update();
      if (now - start < 2500) raf = requestAnimationFrame(track);
    };
    track();
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', update);
    };
  }, [isOpen, step, settings.reduceMotion]);

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
        ref={overlayRef}
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
