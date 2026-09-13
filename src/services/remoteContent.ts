import { Preferences } from '@capacitor/preferences';
import { REMOTE_CONTENT_BASE_URL } from '../config/remoteContent';

const CACHE_KEY_PREFIX = 'remote-content:';
const FETCH_TIMEOUT_MS = 8000;

// Cache mémoire du process : évite de re-demander Preferences (async) et un
// flash de contenu par défaut à chaque montage de composant dans la même session.
const memoryCache = new Map<string, unknown>();

function cacheKeyFor(path: string): string {
  return `${CACHE_KEY_PREFIX}${path}`;
}

export function getMemoryCached<T>(path: string): T | undefined {
  return memoryCache.get(path) as T | undefined;
}

async function readCache<T>(path: string): Promise<T | null> {
  try {
    const { value } = await Preferences.get({ key: cacheKeyFor(path) });
    if (!value) return null;
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function writeCache(path: string, data: unknown): void {
  memoryCache.set(path, data);
  Preferences.set({ key: cacheKeyFor(path), value: JSON.stringify(data) }).catch(() => {
    // Cache best-effort : une écriture ratée ne doit jamais bloquer l'affichage.
  });
}

/**
 * Récupère un fichier JSON de contenu distant (dépôt GitHub public).
 * Ne lève jamais d'exception : retourne le cache local si le réseau échoue,
 * ou `null` si aucune donnée n'est encore disponible (premier lancement hors-ligne).
 */
export async function fetchRemoteJson<T>(path: string): Promise<T | null> {
  const cached = memoryCache.has(path)
    ? (memoryCache.get(path) as T)
    : await readCache<T>(path);

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const response = await fetch(`${REMOTE_CONTENT_BASE_URL}/${path}`, {
      signal: controller.signal,
      cache: 'no-store'
    });
    clearTimeout(timer);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = (await response.json()) as T;
    writeCache(path, data);
    return data;
  } catch (error) {
    if (!cached) {
      console.warn(`Contenu distant indisponible pour ${path}, utilisation du contenu par défaut.`, error);
    }
    return cached ?? null;
  }
}
