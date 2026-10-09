import { Preferences } from '@capacitor/preferences';

// Demande « Me prévenir à l'ouverture » de la section Lieux, et annonce
// déjà montrée : deux drapeaux sur l'appareil (pas de serveur ni de push).
const WANTS_NOTICE_KEY = 'bibliae:lieux:notify-on-open';
const NOTICE_SHOWN_KEY = 'bibliae:lieux:notice-shown';

async function readFlag(key: string): Promise<boolean> {
  try {
    const { value } = await Preferences.get({ key });
    return value === 'true';
  } catch {
    return false;
  }
}

function writeFlag(key: string, value: boolean): void {
  Preferences.set({ key, value: String(value) }).catch(() => {});
}

export const getWantsLieuxNotice = () => readFlag(WANTS_NOTICE_KEY);
export const setWantsLieuxNotice = (value: boolean) => writeFlag(WANTS_NOTICE_KEY, value);

/** L'annonce est due si l'utilisateur l'a demandée et ne l'a pas encore vue. */
export async function isLieuxNoticeDue(): Promise<boolean> {
  const [wants, shown] = await Promise.all([readFlag(WANTS_NOTICE_KEY), readFlag(NOTICE_SHOWN_KEY)]);
  return wants && !shown;
}

export const markLieuxNoticeShown = () => writeFlag(NOTICE_SHOWN_KEY, true);
