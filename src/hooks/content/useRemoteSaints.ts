import { useMemo } from 'react';
import { INTERCESSION_CATEGORIES, type Intercession, type IntercessionCategory } from '../../data/saints';
import { REMOTE_CONTENT_PATHS } from '../../config/remoteContent';
import { useRemoteContent } from '../useRemoteContent';
import { mergeArrayById, type Override } from '../../utils/remoteMerge';

interface RemoteIntercessionCategory {
  key: string;
  items: Array<Override<Intercession>>;
}

function mergeCategories(
  local: IntercessionCategory[],
  remote: RemoteIntercessionCategory[] | null
): IntercessionCategory[] {
  if (!remote || remote.length === 0) return local;
  const remoteByKey = new Map(remote.map((category) => [category.key, category]));
  return local.map((category) => {
    const remoteCategory = remoteByKey.get(category.key);
    if (!remoteCategory) return category;
    return { ...category, items: mergeArrayById(category.items, remoteCategory.items) };
  });
}

export function useRemoteSaints(): IntercessionCategory[] {
  return useRemoteContent<IntercessionCategory[], RemoteIntercessionCategory[]>(
    REMOTE_CONTENT_PATHS.saints,
    INTERCESSION_CATEGORIES,
    mergeCategories
  );
}

export function useRemoteIntercession(id: string): {
  item: Intercession | undefined;
  category: IntercessionCategory | undefined;
} {
  const categories = useRemoteSaints();
  return useMemo(() => {
    for (const category of categories) {
      const item = category.items.find((candidate) => candidate.id === id);
      if (item) return { item, category };
    }
    return { item: undefined, category: undefined };
  }, [categories, id]);
}
