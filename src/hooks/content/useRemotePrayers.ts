import { useMemo } from 'react';
import { CHURCH_PRAYERS, type Prayer } from '../../data/prayers';
import { REMOTE_CONTENT_PATHS } from '../../config/remoteContent';
import { useRemoteContent } from '../useRemoteContent';
import { mergeArrayById, type Override } from '../../utils/remoteMerge';

// Les textes sont fusionnés langue par langue : une surcharge distante qui ne
// fournit que certaines langues ne fait pas disparaître les autres.
function mergePrayers(local: Prayer[], remote: Array<Override<Prayer>> | null | undefined): Prayer[] {
  const merged = mergeArrayById(local, remote);
  return merged.map((prayer, i) =>
    prayer.texts === local[i].texts ? prayer : { ...prayer, texts: { ...local[i].texts, ...prayer.texts } }
  );
}

export function useRemotePrayers(): Prayer[] {
  return useRemoteContent<Prayer[], Array<Override<Prayer>>>(
    REMOTE_CONTENT_PATHS.prayers,
    CHURCH_PRAYERS,
    mergePrayers
  );
}

export function useRemotePrayer(id: string): Prayer | undefined {
  const prayers = useRemotePrayers();
  return useMemo(() => prayers.find((prayer) => prayer.id === id), [prayers, id]);
}
