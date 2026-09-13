import { useCallback, useEffect, useSyncExternalStore } from 'react';
import {
  defaultAccessibilitySettings,
  getAppDataSnapshot,
  setAppData,
  subscribeAppData,
  type AccessibilitySettings,
  type TextScale
} from '../services/appDataStore';

export type { TextScale, AccessibilitySettings };

export function useAccessibility() {
  const appData = useSyncExternalStore(subscribeAppData, getAppDataSnapshot, getAppDataSnapshot);
  const settings = appData.settings.accessibility;

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-text-scale', String(settings.textScale));
    root.setAttribute('data-line-spacing', String(settings.lineSpacing));
    root.setAttribute('data-contrast', String(settings.contrast));
    root.setAttribute('data-reduce-motion', String(settings.reduceMotion));
  }, [settings]);

  const update = useCallback(
    <K extends keyof AccessibilitySettings>(
      key: K,
      value: AccessibilitySettings[K]
    ) => {
      setAppData((prev) => ({
        ...prev,
        settings: {
          ...prev.settings,
          accessibility: { ...prev.settings.accessibility, [key]: value }
        }
      }));
    },
    []
  );

  const reset = useCallback(() => {
    setAppData((prev) => ({
      ...prev,
      settings: { ...prev.settings, accessibility: { ...defaultAccessibilitySettings } }
    }));
  }, []);

  const isDefault =
    settings.textScale === defaultAccessibilitySettings.textScale &&
    settings.lineSpacing === defaultAccessibilitySettings.lineSpacing &&
    settings.contrast === defaultAccessibilitySettings.contrast &&
    settings.reduceMotion === defaultAccessibilitySettings.reduceMotion;

  return { settings, update, reset, isDefault };
}
