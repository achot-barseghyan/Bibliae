import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { getAppDataSnapshot, setAppData, subscribeAppData } from '../services/appDataStore';

export function useBookmarks() {
  const appData = useSyncExternalStore(subscribeAppData, getAppDataSnapshot, getAppDataSnapshot);
  const bookmarkSet = useMemo(() => new Set(appData.bookmarks), [appData.bookmarks]);

  const isBookmarked = useCallback((key: string) => bookmarkSet.has(key), [bookmarkSet]);

  const toggle = useCallback((key: string) => {
    setAppData((prev) => {
      const has = prev.bookmarks.includes(key);
      return {
        ...prev,
        bookmarks: has ? prev.bookmarks.filter((k) => k !== key) : [...prev.bookmarks, key]
      };
    });
  }, []);

  return { bookmarks: appData.bookmarks, isBookmarked, toggle };
}
