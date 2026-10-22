import { beforeEach, describe, expect, it, vi } from 'vitest';

const store = new Map<string, string>();

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn(async ({ key }: { key: string }) => ({ value: store.get(key) ?? null })),
    set: vi.fn(async ({ key, value }: { key: string; value: string }) => {
      store.set(key, value);
    })
  }
}));

import {
  APP_DATA_VERSION,
  createParcours,
  getAppData,
  initAppDataStore,
  isKnownVersion,
  markChapterRead,
  resetAppData,
  restoreBookReads,
  setChaptersRead
} from './appDataStore';

beforeEach(() => {
  store.clear();
});

// Garde-fou : si APP_DATA_VERSION est incrémentée sans mettre à jour
// isKnownVersion(), sanitize() remplace les données des utilisateurs par les
// valeurs par défaut au lancement suivant la mise à jour.
describe('versions des données utilisateur', () => {
  it('reconnaît toutes les versions de 1 à APP_DATA_VERSION', () => {
    for (let version = 1; version <= APP_DATA_VERSION; version++) {
      expect(isKnownVersion(version), `version ${version}`).toBe(true);
    }
  });

  it('conserve les données stockées à la version courante au démarrage', async () => {
    store.set('bibliae:appdata:migrated', 'true');
    store.set(
      'bibliae:appdata',
      JSON.stringify({ version: APP_DATA_VERSION, bookmarks: ['jean-3-16'], settings: {} })
    );

    await initAppDataStore();

    expect(getAppData().bookmarks).toEqual(['jean-3-16']);
  });

  it('conserve les données stockées à une ancienne version (v1)', async () => {
    store.set('bibliae:appdata:migrated', 'true');
    store.set('bibliae:appdata', JSON.stringify({ version: 1, bookmarks: ['psaumes-23-1'], settings: {} }));

    await initAppDataStore();

    expect(getAppData().bookmarks).toEqual(['psaumes-23-1']);
    expect(getAppData().version).toBe(APP_DATA_VERSION);
  });
});

describe('marquage groupé de chapitres', () => {
  const readsOf = (parcoursId: string, bookId: string) =>
    getAppData()
      .chapterReads.filter((c) => c.parcoursId === parcoursId && c.bookId === bookId)
      .map((c) => c.chapter)
      .sort((a, b) => a - b);

  it('marque un lot en une transaction, sans doublon, et l’annulation restaure les readAt d’origine', () => {
    resetAppData();
    const p = createParcours({ name: 'Test', color: 'or', scope: 'custom', scopeBooks: ['rt'] });
    markChapterRead(p.id, 'rt', 2, 'reading');
    const original = getAppData().chapterReads.find((c) => c.parcoursId === p.id && c.chapter === 2)!;

    const { snapshot } = setChaptersRead(p.id, 'rt', [1, 2, 3], true);
    expect(readsOf(p.id, 'rt')).toEqual([1, 2, 3]);
    expect(getAppData().chapterReads.every((c) => c.source === 'manual' || c.parcoursId !== p.id)).toBe(true);

    restoreBookReads(snapshot);
    expect(readsOf(p.id, 'rt')).toEqual([2]);
    expect(getAppData().chapterReads.find((c) => c.parcoursId === p.id && c.chapter === 2)).toEqual(original);
  });

  it('pose completedAt quand le scope est complet, et l’annulation le retire', () => {
    resetAppData();
    const p = createParcours({ name: 'Ruth', color: 'or', scope: 'custom', scopeBooks: ['rt'] });
    const { snapshot, justCompleted } = setChaptersRead(p.id, 'rt', [1, 2, 3, 4], true);
    expect(justCompleted).toBe(true);
    expect(getAppData().parcours.find((x) => x.id === p.id)!.completedAt).not.toBeNull();

    restoreBookReads(snapshot);
    expect(getAppData().parcours.find((x) => x.id === p.id)!.completedAt).toBeNull();
  });

  it('Non lu ne touche pas les autres parcours', () => {
    resetAppData();
    const a = createParcours({ name: 'A', color: 'or', scope: 'bible' });
    const b = createParcours({ name: 'B', color: 'olive', scope: 'bible' });
    setChaptersRead(a.id, 'gn', [1, 2], true);
    setChaptersRead(b.id, 'gn', [1, 2], true);

    setChaptersRead(a.id, 'gn', [1, 2], false);
    expect(readsOf(a.id, 'gn')).toEqual([]);
    expect(readsOf(b.id, 'gn')).toEqual([1, 2]);
  });
});
