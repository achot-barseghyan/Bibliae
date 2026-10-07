import { useCallback, useSyncExternalStore } from 'react';
import {
  archiveParcours,
  chapterReadsForParcours,
  clearReadingPosition,
  createParcours,
  deleteParcours,
  getActiveParcours,
  getAppDataSnapshot,
  isChapterRead,
  markChapterRead,
  mostRecentOtherReader,
  nextAvailableParcoursColor,
  progressForParcours,
  readingPositionForParcours,
  recolorParcours,
  renameParcours,
  resetParcoursProgress,
  setActiveParcours,
  setReadingPosition,
  subscribeAppData,
  totalChaptersForScope,
  unmarkChapterRead,
  updateParcoursScope,
  type ChapterRead,
  type HighlightColor,
  type Parcours,
  type ReadingPosition,
  type ReadingScope,
  type ReadingSource
} from '../services/appDataStore';

export function useReadingProgress() {
  const appData = useSyncExternalStore(subscribeAppData, getAppDataSnapshot, getAppDataSnapshot);
  const parcours = appData.parcours;
  const activeParcours = getActiveParcours(appData);

  const forParcours = useCallback((parcoursId: string) => chapterReadsForParcours(appData, parcoursId), [appData]);

  const isRead = useCallback(
    (parcoursId: string, bookId: string, chapter: number) => isChapterRead(appData, parcoursId, bookId, chapter),
    [appData]
  );

  const positionFor = useCallback(
    (parcoursId: string) => readingPositionForParcours(appData, parcoursId),
    [appData]
  );

  const progress = useCallback(
    (p: Parcours) => progressForParcours(p, appData.chapterReads),
    [appData.chapterReads]
  );

  const otherReaderOf = useCallback(
    (bookId: string, chapter: number, excludeParcoursId: string) =>
      mostRecentOtherReader(appData, bookId, chapter, excludeParcoursId),
    [appData]
  );

  const create = useCallback(
    (input: { name: string; color: HighlightColor; scope: ReadingScope; scopeBooks?: string[] }) =>
      createParcours(input),
    []
  );

  const activate = useCallback((id: string) => setActiveParcours(id), []);
  const rename = useCallback((id: string, name: string) => renameParcours(id, name), []);
  const recolor = useCallback((id: string, color: HighlightColor) => recolorParcours(id, color), []);
  const resetProgress = useCallback((id: string) => resetParcoursProgress(id), []);
  const archive = useCallback((id: string) => archiveParcours(id), []);
  const remove = useCallback((id: string) => deleteParcours(id), []);
  const updateScope = useCallback(
    (id: string, scope: ReadingScope, scopeBooks?: string[]) => updateParcoursScope(id, scope, scopeBooks),
    []
  );
  const markRead = useCallback(
    (parcoursId: string, bookId: string, chapter: number, source: ReadingSource) =>
      markChapterRead(parcoursId, bookId, chapter, source),
    []
  );
  const unmarkRead = useCallback(
    (parcoursId: string, bookId: string, chapter: number) => unmarkChapterRead(parcoursId, bookId, chapter),
    []
  );
  const savePosition = useCallback(
    (parcoursId: string, bookId: string, chapter: number, scrollRatio: number) =>
      setReadingPosition(parcoursId, bookId, chapter, scrollRatio),
    []
  );
  const clearPosition = useCallback((parcoursId: string) => clearReadingPosition(parcoursId), []);
  const nextColor = useCallback(() => nextAvailableParcoursColor(parcours), [parcours]);
  const totalForScope = useCallback(
    (scope: ReadingScope, scopeBooks: string[] = []) => totalChaptersForScope(scope, scopeBooks),
    []
  );

  return {
    parcours,
    activeParcours,
    forParcours,
    isRead,
    positionFor,
    progress,
    otherReaderOf,
    create,
    activate,
    rename,
    recolor,
    resetProgress,
    archive,
    remove,
    updateScope,
    markRead,
    unmarkRead,
    savePosition,
    clearPosition,
    nextColor,
    totalForScope
  };
}

export type { Parcours, ChapterRead, ReadingPosition, ReadingScope, ReadingSource };
