import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { REMOTE_CONTENT_PATHS } from '../config/remoteContent';
import { fetchRemoteJson } from './remoteContent';

// Invitation à mettre à jour l'app (maquette « Mise à jour v2 »). La dernière
// version et la version minimale sont annoncées dans le contenu distant
// (remote-content/app-version.json) : publier une version revient à modifier
// ce fichier, sans republier l'app. Sans fichier ou hors ligne : rien.

export interface UpdateNews {
  glyph: string;
  title: string;
  body: string;
}

interface RemoteAppVersion {
  /** Dernière version publiée (« 1.2.0 »). */
  latest?: string;
  /** En dessous : mise à jour obligatoire. */
  minimum?: string;
  news?: UpdateNews[];
  stores?: { android?: string; ios?: string };
}

export type StorePlatform = 'android' | 'ios';

export interface UpdatePrompt {
  version: string;
  forced: boolean;
  platform: StorePlatform;
  storeUrl: string;
  news: UpdateNews[];
}

const DEFAULT_STORES: Partial<Record<StorePlatform, string>> = {
  android: 'https://play.google.com/store/apps/details?id=com.bibliae.app'
  // iOS : l'identifiant numérique de l'App Store n'est connu qu'après la
  // publication ; à renseigner dans app-version.json (stores.ios).
};

const DISMISS_KEY = 'bibliae:update-dismissed';
/** « Plus tard » : on ne redemande pas avant ce délai (même version). */
const DISMISS_MS = 3 * 24 * 3600 * 1000;

/** Compare « 1.10.2 » et « 1.9 » numériquement : < 0, 0 ou > 0. */
export function compareVersions(a: string, b: string): number {
  const pa = a.split(/[.-]/).map((n) => parseInt(n, 10) || 0);
  const pb = b.split(/[.-]/).map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d !== 0) return d;
  }
  return 0;
}

async function wasDismissed(version: string): Promise<boolean> {
  try {
    const { value } = await Preferences.get({ key: DISMISS_KEY });
    if (!value) return false;
    const saved = JSON.parse(value) as { version?: string; at?: number };
    return saved.version === version && Date.now() - (saved.at ?? 0) < DISMISS_MS;
  } catch {
    return false;
  }
}

export function rememberDismiss(version: string): void {
  Preferences.set({ key: DISMISS_KEY, value: JSON.stringify({ version, at: Date.now() }) }).catch(() => {
    /* best-effort : au pire, l'invitation revient au prochain lancement */
  });
}

/** Invitation à afficher, ou null (à jour, web, hors ligne, déjà reportée). */
export async function checkForUpdate(): Promise<UpdatePrompt | null> {
  if (!Capacitor.isNativePlatform()) return null;
  const platform = Capacitor.getPlatform() as StorePlatform;
  if (platform !== 'android' && platform !== 'ios') return null;

  const remote = await fetchRemoteJson<RemoteAppVersion>(REMOTE_CONTENT_PATHS.appVersion);
  if (!remote?.latest) return null;

  const { version: installed } = await App.getInfo();
  if (compareVersions(installed, remote.latest) >= 0) return null;

  const storeUrl = remote.stores?.[platform] || DEFAULT_STORES[platform];
  if (!storeUrl) return null;

  const forced = !!remote.minimum && compareVersions(installed, remote.minimum) < 0;
  if (!forced && (await wasDismissed(remote.latest))) return null;

  const news = Array.isArray(remote.news)
    ? remote.news.filter((n) => n && typeof n.title === 'string' && typeof n.body === 'string')
    : [];

  return { version: remote.latest, forced, platform, storeUrl, news };
}
