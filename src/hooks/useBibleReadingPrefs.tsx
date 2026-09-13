import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode
} from 'react';
import {
  defaultBibleReadingPrefs,
  getAppDataSnapshot,
  setAppData,
  subscribeAppData,
  type BibleFont,
  type BibleReadingPrefs,
  type BibleTheme
} from '../services/appDataStore';

export type { BibleFont, BibleTheme, BibleReadingPrefs };

interface BibleReadingPrefsContextValue {
  prefs: BibleReadingPrefs;
  update: <K extends keyof BibleReadingPrefs>(key: K, value: BibleReadingPrefs[K]) => void;
  reset: () => void;
  isDefault: boolean;
}

// Un seul état partagé (pas un hook local) : le panneau (dans le header) et
// le conteneur `.bible-world` (dans Bible.tsx) doivent voir les mêmes
// changements de police/thème pour que ceux-ci s'appliquent réellement.
const BibleReadingPrefsContext = createContext<BibleReadingPrefsContextValue | null>(null);

export const BibleReadingPrefsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const appData = useSyncExternalStore(subscribeAppData, getAppDataSnapshot, getAppDataSnapshot);
  const prefs = appData.settings.bibleReading;

  const update = useCallback(
    <K extends keyof BibleReadingPrefs>(key: K, value: BibleReadingPrefs[K]) => {
      setAppData((prev) => ({
        ...prev,
        settings: {
          ...prev.settings,
          bibleReading: { ...prev.settings.bibleReading, [key]: value }
        }
      }));
    },
    []
  );

  const reset = useCallback(() => {
    setAppData((prev) => ({
      ...prev,
      settings: { ...prev.settings, bibleReading: { ...defaultBibleReadingPrefs } }
    }));
  }, []);

  const isDefault =
    prefs.font === defaultBibleReadingPrefs.font && prefs.theme === defaultBibleReadingPrefs.theme;

  const value = useMemo(
    () => ({ prefs, update, reset, isDefault }),
    [prefs, update, reset, isDefault]
  );

  return (
    <BibleReadingPrefsContext.Provider value={value}>
      {children}
    </BibleReadingPrefsContext.Provider>
  );
};

export function useBibleReadingPrefs(): BibleReadingPrefsContextValue {
  const context = useContext(BibleReadingPrefsContext);
  if (!context) {
    throw new Error('useBibleReadingPrefs doit être utilisé sous BibleReadingPrefsProvider');
  }
  return context;
}
