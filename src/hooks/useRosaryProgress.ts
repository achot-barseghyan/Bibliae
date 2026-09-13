import { useCallback, useSyncExternalStore } from 'react';
import type { MysterySetKey } from '../data/rosary';
import { getAppDataSnapshot, setAppData, subscribeAppData } from '../services/appDataStore';

export function useRosaryProgress() {
  const appData = useSyncExternalStore(subscribeAppData, getAppDataSnapshot, getAppDataSnapshot);
  const progress = appData.settings.rosaryProgress;

  const setStepIndex = useCallback((stepIndex: number) => {
    setAppData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        rosaryProgress: { ...prev.settings.rosaryProgress, stepIndex }
      }
    }));
  }, []);

  const setMysterySet = useCallback((mysterySet: MysterySetKey) => {
    setAppData((prev) => ({
      ...prev,
      settings: { ...prev.settings, rosaryProgress: { mysterySet, stepIndex: 0 } }
    }));
  }, []);

  return { mysterySet: progress.mysterySet, stepIndex: progress.stepIndex, setStepIndex, setMysterySet };
}
