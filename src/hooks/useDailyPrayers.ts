import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import type { CustomPrayer, DailyPrayerSettings, PrayerBlock, PrayerMoment } from '../data/dailyPrayers';
import { getAppDataSnapshot, setAppData, subscribeAppData } from '../services/appDataStore';

export interface CustomPrayerDraft {
  id: string | null;
  moment: PrayerMoment;
  title: string;
  text: string;
  blocks: PrayerBlock[];
}

function generateCustomPrayerId(): string {
  return `prm-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useDailyPrayers() {
  const appData = useSyncExternalStore(subscribeAppData, getAppDataSnapshot, getAppDataSnapshot);
  const settings = appData.settings.dailyPrayers;

  const updateSettings = useCallback((patch: Partial<DailyPrayerSettings>) => {
    setAppData((prev) => ({
      ...prev,
      settings: { ...prev.settings, dailyPrayers: { ...prev.settings.dailyPrayers, ...patch } }
    }));
  }, []);

  /** Crée ou met à jour la prière ; renvoie son id. */
  const saveCustomPrayer = useCallback((draft: CustomPrayerDraft): string => {
    const now = new Date().toISOString();
    const id = draft.id ?? generateCustomPrayerId();
    setAppData((prev) => {
      const existing = prev.customPrayers.find((p) => p.id === id);
      const prayer: CustomPrayer = {
        id,
        moment: draft.moment,
        title: draft.title.trim() || 'Ma prière',
        text: draft.text.trim(),
        blocks: draft.blocks,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now
      };
      const customPrayers = existing
        ? prev.customPrayers.map((p) => (p.id === id ? prayer : p))
        : [...prev.customPrayers, prayer];
      return { ...prev, customPrayers };
    });
    return id;
  }, []);

  const deleteCustomPrayer = useCallback((id: string) => {
    setAppData((prev) => ({ ...prev, customPrayers: prev.customPrayers.filter((p) => p.id !== id) }));
  }, []);

  return { settings, customPrayers: appData.customPrayers, updateSettings, saveCustomPrayer, deleteCustomPrayer };
}

/** Heure courante, rafraîchie toutes les 30 s (cadran, bascule matin/soir). */
export function useNow(intervalMs = 30000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return now;
}
