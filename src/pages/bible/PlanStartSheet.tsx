import { motion } from 'framer-motion';
import { PLAN_TITLE } from '../../data/readingPlan';
import { useAccessibility } from '../../hooks/useAccessibility';
import { tapHaptic } from '../../utils/haptics';
import '../figures/VersePreviewSheet.css';
import './ReadingPlan.css';

const EASE = [0.22, 0.8, 0.28, 1] as const;

interface PlanStartSheetProps {
  activeName: string | null;
  hasPlanParcours: boolean;
  onChoose: (usePlanParcours: boolean) => void;
}

/** Feuille proposée au démarrage du plan : suivre ses chapitres dans un parcours dédié, ou garder le parcours actif. */
const PlanStartSheet: React.FC<PlanStartSheetProps> = ({ activeName, hasPlanParcours, onChoose }) => {
  const { settings } = useAccessibility();
  const transition = settings.reduceMotion ? { duration: 0 } : { duration: 0.26, ease: EASE };

  return (
    <motion.div
      className="verse-sheet-backdrop"
      slot="fixed"
      role="presentation"
      onClick={() => onChoose(false)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={transition}
    >
      <motion.div
        className="verse-sheet plan-start-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="plan-start-title"
        onClick={(e) => e.stopPropagation()}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={transition}
      >
        <div className="verse-sheet-handle" aria-hidden="true" />
        <p className="plan-start-kicker">{PLAN_TITLE}</p>
        <h2 id="plan-start-title" className="plan-start-title">
          Suivre le plan dans son propre parcours ?
        </h2>
        <p className="plan-start-text">
          Les chapitres lus pendant le plan seront comptés dans un parcours « {PLAN_TITLE} »
          {activeName ? `, sans se mêler à « ${activeName} »` : ''}. Vous pourrez changer de parcours à tout moment.
        </p>
        <div className="plan-start-actions">
          <button
            type="button"
            className="gold-cta"
            onClick={() => {
              tapHaptic();
              onChoose(true);
            }}
          >
            <span>{hasPlanParcours ? 'Reprendre ce parcours' : 'Créer le parcours'}</span>
          </button>
          <button
            type="button"
            className="plan-pill"
            onClick={() => {
              tapHaptic();
              onChoose(false);
            }}
          >
            {activeName ? `Garder « ${activeName} »` : 'Plus tard'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PlanStartSheet;
