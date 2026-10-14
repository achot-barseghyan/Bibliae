// Horaires des messes via l'API messes.info (v2). Elle exige une clé
// (« userkey ») activée par messes.info : on la lit dans
// VITE_MESSESINFO_USERKEY (.env.local, non versionné). Sans clé, la fiche
// paroisse renvoie simplement vers la page messes.info de la communauté —
// jamais d'horaires inventés.

const API_URL = 'https://www.messes.info/api/v2/horaires/';
const USERKEY = (import.meta.env.VITE_MESSESINFO_USERKEY as string | undefined)?.trim() || '';

export const MESSESINFO_ENABLED = USERKEY.length > 0;

export type MassKind = 'SUNDAYMASS' | 'WEEKMASS' | string;

export interface Mass {
  /** Date locale « AAAA-MM-JJ ». */
  date: string;
  /** Minutes depuis minuit. */
  minutes: number;
  /** Heure affichée, « 8h30 ». */
  time: string;
  kind: MassKind;
  church: string;
  note: string;
}

export const MASS_KIND_LABELS: Record<string, string> = {
  SUNDAYMASS: 'Messe dominicale',
  WEEKMASS: 'Messe de semaine'
};

export function massKindLabel(kind: MassKind): string {
  return MASS_KIND_LABELS[kind] ?? 'Célébration';
}

/** Page publique de la communauté sur messes.info. */
export function messesInfoPageUrl(messesinfoId: string): string {
  return `https://messes.info/communaute/${messesinfoId}`;
}

/** « 8h30 », « 08:30 », « 18h » → minutes depuis minuit. */
function parseMinutes(time: string): number | null {
  const match = String(time).match(/(\d{1,2})\D?(\d{2})?/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2] ?? 0);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

export function formatMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${h}h${String(m).padStart(2, '0')}`;
}

interface RawCelebration {
  date?: string;
  time?: string;
  timeType?: string;
  celebrationTimeType?: string;
  locality?: { name?: string };
  localityName?: string;
  localityId?: string | number;
  comment?: string;
  celebrationName?: string;
}

// Le format de réponse varie selon les versions de l'API : liste directe ou
// enveloppe ; on accepte les deux et on écarte ce qui n'est pas exploitable.
function normalize(json: unknown): Mass[] {
  const envelope = json as Record<string, unknown>;
  const list: RawCelebration[] = Array.isArray(json)
    ? (json as RawCelebration[])
    : ((envelope?.listCelebrationTime ?? envelope?.celebrationTimes ?? envelope?.items ?? []) as RawCelebration[]);
  if (!Array.isArray(list)) return [];

  const masses: Mass[] = [];
  for (const c of list) {
    if (!c?.date || !c.time) continue;
    const date = String(c.date).slice(0, 10);
    const minutes = parseMinutes(c.time);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || minutes === null) continue;
    const church =
      c.locality?.name ||
      c.localityName ||
      String(c.localityId ?? '')
        .split('/')
        .pop()
        ?.replace(/-/g, ' ') ||
      '';
    masses.push({
      date,
      minutes,
      time: formatMinutes(minutes),
      kind: c.timeType || c.celebrationTimeType || '',
      church,
      note: c.comment || c.celebrationName || ''
    });
  }
  return masses.sort((a, b) => a.date.localeCompare(b.date) || a.minutes - b.minutes);
}

export async function fetchMasses(messesinfoId: string, signal?: AbortSignal): Promise<Mass[]> {
  const url = `${API_URL}${messesinfoId}?format=json&userkey=${encodeURIComponent(USERKEY)}`;
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return normalize(await response.json());
}
