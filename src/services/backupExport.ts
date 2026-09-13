import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { getAppData } from './appDataStore';

function backupFileName(date = new Date()): string {
  const iso = date.toISOString().slice(0, 10);
  return `mesdonnees-${iso}.json`;
}

export type ExportResult = { status: 'shared' } | { status: 'cancelled' } | { status: 'error'; error: unknown };

function isUserCancellation(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return /cancel/i.test(message);
}

export async function exportAppData(): Promise<ExportResult> {
  try {
    const data = getAppData();
    const fileName = backupFileName();
    const json = JSON.stringify(data, null, 2);

    const written = await Filesystem.writeFile({
      path: fileName,
      data: json,
      directory: Directory.Cache,
      encoding: Encoding.UTF8
    });

    await Share.share({
      title: 'Mes données Bibliae',
      url: written.uri,
      dialogTitle: 'Exporter mes données'
    });

    return { status: 'shared' };
  } catch (err) {
    if (isUserCancellation(err)) return { status: 'cancelled' };
    return { status: 'error', error: err };
  }
}
