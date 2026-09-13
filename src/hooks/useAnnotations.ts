import { useCallback, useSyncExternalStore } from 'react';
import {
  addAnnotation,
  deleteAnnotation,
  deleteAnnotationGroup,
  filterAnnotationsForBlock,
  findExactAnnotation,
  getAppDataSnapshot,
  subscribeAppData,
  updateAnnotationNote,
  updateAnnotationStyle,
  type Annotation,
  type AnnotationStyle,
  type AnnotationTargetKind,
  type NewAnnotationInput
} from '../services/appDataStore';
import type { PrayerLanguage } from '../data/prayers';

export function useAnnotations() {
  const appData = useSyncExternalStore(subscribeAppData, getAppDataSnapshot, getAppDataSnapshot);
  const annotations = appData.annotations;

  const forBlock = useCallback(
    (kind: AnnotationTargetKind, sourceId: string, blockIndex: number, lang?: PrayerLanguage) =>
      filterAnnotationsForBlock(annotations, kind, sourceId, blockIndex, lang),
    [annotations]
  );

  const findExact = useCallback(
    (
      kind: AnnotationTargetKind,
      sourceId: string,
      blockIndex: number,
      start: number,
      end: number,
      lang?: PrayerLanguage
    ) => findExactAnnotation(annotations, kind, sourceId, blockIndex, start, end, lang),
    [annotations]
  );

  const add = useCallback((input: NewAnnotationInput) => addAnnotation(input), []);
  const updateStyle = useCallback((id: string, patch: Partial<AnnotationStyle>) => updateAnnotationStyle(id, patch), []);
  const updateNote = useCallback((id: string, note: string | null) => updateAnnotationNote(id, note), []);
  const remove = useCallback((id: string) => deleteAnnotation(id), []);
  const removeGroup = useCallback((groupId: string) => deleteAnnotationGroup(groupId), []);

  return { annotations, forBlock, findExact, add, updateStyle, updateNote, remove, removeGroup };
}

export type { Annotation };
