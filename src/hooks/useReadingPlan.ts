import { useMemo, useSyncExternalStore } from 'react';
import {
  archiveReadingPlan,
  getAppDataSnapshot,
  getPlanProgress,
  markPlanCelebrated,
  planDayStates,
  restartReadingPlan,
  setPlanDayRead,
  setPlanCardHidden,
  setPlanRefRead,
  startReadingPlan,
  subscribeAppData,
  type PlanProgress
} from '../services/appDataStore';

export function useReadingPlan() {
  const appData = useSyncExternalStore(subscribeAppData, getAppDataSnapshot, getAppDataSnapshot);
  const progress = getPlanProgress(appData);
  const dayStates = useMemo(() => planDayStates(appData), [appData]);
  const doneCount = useMemo(() => dayStates.filter((refs) => refs.every(Boolean)).length, [dayStates]);
  const readCount = useMemo(() => dayStates.flat().filter(Boolean).length, [dayStates]);

  /** Références lues du jour `n` (1…365). */
  const readsFor = (n: number): boolean[] => dayStates[n - 1] ?? [];

  return {
    progress,
    isStarted: progress.startedAt !== null,
    doneCount,
    readCount,
    readsFor,
    start: startReadingPlan,
    setRefRead: setPlanRefRead,
    setDayRead: setPlanDayRead,
    markCelebrated: markPlanCelebrated,
    restart: restartReadingPlan,
    archive: archiveReadingPlan,
    setCardHidden: setPlanCardHidden
  };
}

export type { PlanProgress };
