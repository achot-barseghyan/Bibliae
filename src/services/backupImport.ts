import { isKnownVersion, type AppData } from './appDataStore';

export type ImportPickResult = { status: 'picked'; file: File } | { status: 'cancelled' };

/**
 * Ouvre le sélecteur de fichier natif via un `<input type="file">` caché — dans la
 * WebView Capacitor, ceci déclenche le sélecteur système (Android : chooser
 * Fichiers/Drive ; iOS : Document Picker natif), sans permission ni plugin
 * supplémentaire. Il n'existe pas d'événement standard cross-plateforme pour détecter
 * l'annulation du sélecteur sur un input file en WebView : on utilise le fallback
 * habituel (retour de focus sur la fenêtre sans qu'un fichier ait été choisi).
 */
export function pickImportFile(): Promise<ImportPickResult> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.style.display = 'none';

    let resolved = false;

    const finish = (result: ImportPickResult) => {
      if (resolved) return;
      resolved = true;
      window.removeEventListener('focus', onFocus);
      input.remove();
      resolve(result);
    };

    const onFocus = () => {
      window.setTimeout(() => {
        if (!resolved) finish({ status: 'cancelled' });
      }, 300);
    };

    input.addEventListener('change', () => {
      const file = input.files?.[0];
      finish(file ? { status: 'picked', file } : { status: 'cancelled' });
    });

    window.addEventListener('focus', onFocus);
    document.body.appendChild(input);
    input.click();
  });
}

export type ImportValidationError = 'invalid-json' | 'invalid-shape' | 'unknown-version';

export type ImportReadResult =
  | { status: 'ok'; data: AppData; bookmarksCount: number }
  | { status: 'error'; error: ImportValidationError };

function isAppDataShape(value: unknown): value is AppData {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.version === 'number' &&
    Array.isArray(v.bookmarks) &&
    v.bookmarks.every((k) => typeof k === 'string') &&
    typeof v.settings === 'object' &&
    v.settings !== null
  );
}

export async function readAndValidateImportFile(file: File): Promise<ImportReadResult> {
  let text: string;
  try {
    text = await file.text();
  } catch {
    return { status: 'error', error: 'invalid-json' };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { status: 'error', error: 'invalid-json' };
  }

  if (!isAppDataShape(parsed)) {
    return { status: 'error', error: 'invalid-shape' };
  }
  // Les sauvegardes de versions antérieures restent importables :
  // appDataStore.sanitize() les met à niveau automatiquement.
  const version = parsed.version as number;
  if (!isKnownVersion(version)) {
    return { status: 'error', error: 'unknown-version' };
  }

  return { status: 'ok', data: parsed, bookmarksCount: parsed.bookmarks.length };
}
