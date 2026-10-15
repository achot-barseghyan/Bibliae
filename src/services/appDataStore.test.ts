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

import { APP_DATA_VERSION, getAppData, initAppDataStore, isKnownVersion } from './appDataStore';

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
