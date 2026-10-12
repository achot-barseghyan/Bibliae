import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useReadingProgress } from '../../hooks/useReadingProgress';
import { useReadingPlan } from '../../hooks/useReadingPlan';
import { PLAN_LENGTH, PLAN_TITLE } from '../../data/readingPlan';
import { useAccessibility } from '../../hooks/useAccessibility';
import { CloseIcon, ChevronRightIcon } from '../../components/nav/icons';
import { tapHaptic } from '../../utils/haptics';
import '../figures/VersePreviewSheet.css';
import './ParcoursSelectorSheet.css';

const EASE = [0.22, 0.8, 0.28, 1] as const;

interface ParcoursSelectorSheetProps {
  onClose: () => void;
}

/** Feuille basse ouverte par le bandeau de parcours actif : sélection immédiate, ou accès à l'écran complet. */
const ParcoursSelectorSheet: React.FC<ParcoursSelectorSheetProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { settings } = useAccessibility();
  const { parcours, activeParcours, progress, activate } = useReadingProgress();
  const { pathname } = useLocation();
  const plan = useReadingPlan();
  const planStatus = plan.progress.completedAt
    ? 'Achevé'
    : plan.isStarted
      ? `Jour ${plan.progress.currentDay}`
      : 'Non commencé';
  const transition = settings.reduceMotion ? { duration: 0 } : { duration: 0.26, ease: EASE };
  const visible = parcours.filter((p) => !p.archived);

  return (
    <motion.div
      className="verse-sheet-backdrop"
      slot="fixed"
      role="presentation"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={transition}
    >
      <motion.div
        className="verse-sheet parcours-selector-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Choisir un parcours de lecture"
        onClick={(e) => e.stopPropagation()}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={transition}
      >
        <div className="verse-sheet-handle" aria-hidden="true" />

        <div className="verse-sheet-header">
          <p className="parcours-selector-title">Parcours de lecture</p>
          <button type="button" className="verse-sheet-close" onClick={onClose} aria-label="Fermer">
            <CloseIcon size={18} />
          </button>
        </div>

        <p className="parcours-selector-section">Parcours</p>
        <div className="parcours-selector-list">
          {visible.map((p) => {
            const { percent } = progress(p);
            const isActive = p.id === activeParcours?.id;
            return (
              <button
                key={p.id}
                type="button"
                className={`parcours-selector-row${isActive ? ' is-active' : ''}`}
                onClick={() => {
                  tapHaptic();
                  if (!isActive) activate(p.id);
                  onClose();
                }}
                aria-pressed={isActive}
              >
                <span className={`parcours-selector-dot parcours-selector-dot--${p.color}`} aria-hidden="true" />
                <span className="parcours-selector-name">{p.name}</span>
                <span className="parcours-selector-percent">{percent}%</span>
              </button>
            );
          })}
        </div>

        <p className="parcours-selector-section">Plans de lecture</p>
        <button
          type="button"
          className="parcours-selector-row parcours-selector-plan"
          onClick={() => {
            tapHaptic();
            // Réaffiche la carte du plan, en tête de la page La Bible.
            plan.setCardHidden(false);
            if (!/^\/bible\/?$/.test(pathname)) navigate('/bible');
            onClose();
          }}
        >
          <span
            className={`parcours-selector-plan-mark${plan.isStarted ? ' is-started' : ''}`}
            aria-hidden="true"
          />
          <span className="parcours-selector-plan-text">
            <span className="parcours-selector-name">{PLAN_TITLE}</span>
            <span className="parcours-selector-plan-sub">{PLAN_LENGTH} jours · trois lectures par jour</span>
          </span>
          <span className="parcours-selector-plan-status">{planStatus}</span>
          <ChevronRightIcon size={14} />
        </button>

        <button
          type="button"
          className="parcours-selector-footer"
          onClick={() => {
            tapHaptic();
            navigate('/bible/mes-lectures');
            onClose();
          }}
        >
          Voir mes lectures
          <ChevronRightIcon size={16} />
        </button>
      </motion.div>
    </motion.div>
  );
};

export default ParcoursSelectorSheet;
