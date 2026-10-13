import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { PLAN_TITLE } from '../../data/readingPlan';
import { useReadingPlan } from '../../hooks/useReadingPlan';
import { useReadingProgress } from '../../hooks/useReadingProgress';
import PlanStartSheet from './PlanStartSheet';

/**
 * Démarrage du plan : le lance, propose une fois le parcours dédié, puis
 * ouvre le jour demandé. `prompt` est à rendre dans la page appelante.
 */
export function usePlanStart() {
  const navigate = useNavigate();
  const plan = useReadingPlan();
  const { parcours, activeParcours, create, activate, nextColor } = useReadingProgress();
  const [pending, setPending] = useState<{ path: string; state?: unknown } | null>(null);

  // Repéré par son nom : renommé, il redevient un parcours comme les autres.
  const planParcours = parcours.find((p) => p.name === PLAN_TITLE && !p.archived);

  // Le plan ne démarre qu'une fois le choix fait : la carte du plan, qui
  // affiche cette feuille, change d'état (et la démonterait) dès le démarrage.
  const begin = (path: string, state?: unknown) => {
    if (plan.isStarted || (activeParcours && activeParcours.id === planParcours?.id)) {
      plan.start();
      navigate(path, { state });
      return;
    }
    setPending({ path, state });
  };

  const choose = (usePlanParcours: boolean) => {
    if (!pending) return;
    plan.start();
    if (usePlanParcours) {
      const id = planParcours?.id ?? create({ name: PLAN_TITLE, color: nextColor(), scope: 'bible' }).id;
      activate(id);
    }
    setPending(null);
    navigate(pending.path, { state: pending.state });
  };

  const prompt = (
    <AnimatePresence>
      {pending && (
        <PlanStartSheet
          activeName={activeParcours?.name ?? null}
          hasPlanParcours={!!planParcours}
          onChoose={choose}
        />
      )}
    </AnimatePresence>
  );

  return { begin, prompt };
}
