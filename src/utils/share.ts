import { Share } from '@capacitor/share';
import { copyText } from './clipboard';

function isUserCancellation(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return /cancel/i.test(message);
}

/** Partage un texte court ; si le partage échoue (absent de la WebView, refusé, ...), le copie dans le presse-papiers plutôt que d'échouer silencieusement. */
export async function shareText(text: string, dialogTitle?: string): Promise<'shared' | 'cancelled' | 'copied'> {
  try {
    await Share.share({ text, dialogTitle });
    return 'shared';
  } catch (err) {
    if (isUserCancellation(err)) return 'cancelled';
    await copyText(text);
    return 'copied';
  }
}
