import { useMemo } from 'react';
import { COUNCILS, type Council } from '../../data/councils';
import { REMOTE_CONTENT_PATHS } from '../../config/remoteContent';
import { useRemoteContent } from '../useRemoteContent';
import { mergeArrayById, type Override } from '../../utils/remoteMerge';

export function useRemoteCouncils(): Council[] {
  return useRemoteContent<Council[], Array<Override<Council>>>(
    REMOTE_CONTENT_PATHS.councils,
    COUNCILS,
    mergeArrayById
  );
}

export function useRemoteCouncil(id: string): Council | undefined {
  const councils = useRemoteCouncils();
  return useMemo(() => councils.find((council) => council.id === id), [councils, id]);
}
