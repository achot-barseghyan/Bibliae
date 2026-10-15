import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useReadingProgress } from '../../hooks/useReadingProgress';
import { useReadingPlan } from '../../hooks/useReadingPlan';
import { PLAN_LENGTH, PLAN_TITLE } from '../../data/readingPlan';
import { useAccessibility } from '../../hooks/useAccessibility';
import { FROM_BIBLE } from './usePlanBack';
import { ChevronRightIcon } from '../../components/nav/icons';
import { tapHaptic } from '../../utils/haptics';
import { useSheetDrag } from '../../hooks/useSheetDrag';
import '../figures/VersePreviewSheet.css';
import './ParcoursSelectorSheet.css';

const EASE = [0.22, 0.8, 0.28, 1] as const;
const MINI_RING_C = 113.1;

interface ParcoursSelectorSheetProps {
  onClose: () => void;
}

/** Feuille basse ouverte par le bandeau de parcours actif : sélection immédiate, ou accès à l'écran complet. */
const ParcoursSelectorSheet: React.FC<ParcoursSelectorSheetProps> = ({ onClose }) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  useSheetDrag(sheetRef, onClose);
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
        ref={sheetRef}
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
                <span className="parcours-selector-row-line">
                  <span className={`parcours-selector-dot parcours-selector-dot--${p.color}`} aria-hidden="true" />
                  <span className="parcours-selector-name">{p.name}</span>
                  <span className="parcours-selector-percent">{percent} %</span>
                </span>
                <span className="parcours-selector-track" aria-hidden="true">
                  <span
                    className={`parcours-selector-fill parcours-selector-dot--${p.color}`}
                    style={{ width: `${percent}%` }}
                  />
                </span>
              </button>
            );
          })}
        </div>

        <p className="parcours-selector-section">Plans de lecture</p>
        <button
          type="button"
          className="parcours-selector-plan"
          onClick={() => {
            tapHaptic();
            // Réaffiche la carte du plan, en tête de la page La Bible.
            plan.setCardHidden(false);
            if (plan.progress.completedAt) {
              navigate('/bible/plan');
            } else if (plan.isStarted) {
              // Plan en cours : directement au jour à lire.
              // Le bouton retour du jour nomme la page quittée quand on la connaît.
              navigate(`/bible/plan/${plan.progress.currentDay}`, {
                state: /^\/bible\/?$/.test(pathname) ? FROM_BIBLE : undefined
              });
            } else if (!/^\/bible\/?$/.test(pathname)) {
              navigate('/bible');
            }
            onClose();
          }}
        >
          <span className="parcours-selector-plan-ring" aria-hidden="true">
            <svg width="44" height="44" viewBox="0 0 44 44">
              <circle cx="22" cy="22" r="18" className="parcours-selector-plan-ring-track" />
              <circle
                cx="22"
                cy="22"
                r="18"
                className="parcours-selector-plan-ring-fill"
                strokeDasharray={MINI_RING_C}
                strokeDashoffset={MINI_RING_C * (1 - plan.doneCount / PLAN_LENGTH)}
              />
            </svg>
            {plan.isStarted && !plan.progress.completedAt && <span className="parcours-selector-plan-pulse" />}
          </span>
          <span className="parcours-selector-plan-text">
            <span className="parcours-selector-plan-name">{PLAN_TITLE}</span>
            <span className="parcours-selector-plan-sub">{PLAN_LENGTH} jours · trois lectures par jour</span>
          </span>
          <span className="parcours-selector-plan-status">{planStatus}</span>
          <ChevronRightIcon size={12} className="parcours-selector-plan-chevron" />
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
          <span className="parcours-selector-footer-arrow" aria-hidden="true">
            →
          </span>
        </button>
      </motion.div>
    </motion.div>
  );
};

export default ParcoursSelectorSheet;
