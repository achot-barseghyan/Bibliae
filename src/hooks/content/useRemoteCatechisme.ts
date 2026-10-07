import { useMemo } from 'react';
import { CATECHISM_PARAGRAPHS, getCatechismParagraphs, type CatechismParagraph } from '../../data/catechisme';
import { REMOTE_CONTENT_PATHS } from '../../config/remoteContent';
import { useRemoteContent } from '../useRemoteContent';
import { mergeArrayById, type Override } from '../../utils/remoteMerge';

export function useRemoteCatechismParagraphs(): CatechismParagraph[] {
  return useRemoteContent<CatechismParagraph[], Array<Override<CatechismParagraph>>>(
    REMOTE_CONTENT_PATHS.catechisme,
    CATECHISM_PARAGRAPHS,
    mergeArrayById
  );
}

/** Paragraphes du Catéchisme pour une référence comme "232-267" ou "1131". */
export function useRemoteCatechismRange(ref: string): CatechismParagraph[] {
  const paragraphs = useRemoteCatechismParagraphs();
  return useMemo(() => getCatechismParagraphs(paragraphs, ref), [paragraphs, ref]);
}
