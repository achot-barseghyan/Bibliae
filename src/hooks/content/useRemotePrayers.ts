import { useMemo } from 'react';
import { CHURCH_PRAYERS, type Prayer } from '../../data/prayers';
import { REMOTE_CONTENT_PATHS } from '../../config/remoteContent';
import { useRemoteContent } from '../useRemoteContent';
import { mergeArrayById, type Override } from '../../utils/remoteMerge';

export function useRemotePrayers(): Prayer[] {
  return useRemoteContent<Prayer[], Array<Override<Prayer>>>(
    REMOTE_CONTENT_PATHS.prayers,
    CHURCH_PRAYERS,
    mergeArrayById
  );
}

export function useRemotePrayer(id: string): Prayer | undefined {
  const prayers = useRemotePrayers();
  return useMemo(() => prayers.find((prayer) => prayer.id === id), [prayers, id]);
}
