import { Preferences } from '@capacitor/preferences';

// Source : API publique CatéGPT (gratuite, sans clé), textes eux-mêmes
// fournis par l'AELF (Novus Ordo) et Divinum Officium (Vetus Ordo). Voir
// `source`/`credits` dans la réponse — à afficher à l'écran (obligation
// de la source imposée par l'API).
const API_BASE = 'https://categpt.chat';
const CACHE_KEY_PREFIX = 'liturgical-feast:';
const MONTH_CACHE_KEY_PREFIX = 'liturgical-month:';
const FETCH_TIMEOUT_MS = 8000;

export interface TextSource {
  language: string;
  label: string;
  ref: string | null;
  text: string;
}

export interface LiturgicalItem {
  key: string;
  label: string;
  ref: string | null;
  text: string;
  /** Texte latin d'origine (messe traditionnelle uniquement). */
  source?: TextSource | null;
}

export interface OrdoData {
  name: string;
  rank: string;
  color: string;
  line: string | null;
  excerpt: string | null;
  description: string | null;
  commemorationLine: string | null;
  mass: LiturgicalItem[];
  /** Oraison du jour (Laudes) : pratique, extraite ici des offices. */
  collect: string | null;
  offices: Record<string, LiturgicalItem[]>;
}

export interface FeastOfDay extends OrdoData {
  date: string;
  /** Calendrier traditionnel (1962), absent seulement en cas de réponse partielle de l'API. */
  vom: OrdoData | null;
  source: { name: string; url: string };
}

export interface CalendarDayEntry {
  date: string;
  name: string;
  degreeKey: string | null;
  degree: string | null;
  color: string;
}

interface RawOrdo {
  name: string;
  rank: string;
  color: string;
  line: string | null;
  excerpt: string | null;
  description: string | null;
  commemorationLine: string | null;
  mass: Array<{ key: string; label: string; ref: string | null; text: string; source?: TextSource | null }>;
  offices?: Record<string, Array<{ key: string; label: string; ref: string | null; text: string; source?: TextSource | null }>>;
}

interface RawFeastResponse {
  date: string;
  nom: RawOrdo;
  vom: RawOrdo | null;
  credits: { nom: { source: string; url: string } };
}

interface RawCalendarResponse {
  month: string;
  entries: Array<{
    date: string;
    name: string;
    degreeKey: string | null;
    degree: string | null;
    color: string;
  }>;
}

export function todayIso(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function shiftIsoDate(date: string, deltaDays: number): string {
  const d = new Date(`${date}T12:00:00`);
  d.setDate(d.getDate() + deltaDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function toOrdoData(raw: RawOrdo): OrdoData {
  const collect = raw.offices?.lauds?.find((item) => item.key === 'collect')?.text ?? null;
  return {
    name: raw.name,
    rank: raw.rank,
    color: raw.color,
    line: raw.line,
    excerpt: raw.excerpt,
    description: raw.description,
    commemorationLine: raw.commemorationLine,
    mass: raw.mass.map((m) => ({ key: m.key, label: m.label, ref: m.ref, text: m.text, source: m.source ?? null })),
    collect,
    offices: raw.offices ?? {}
  };
}

function toFeastOfDay(raw: RawFeastResponse): FeastOfDay {
  return {
    ...toOrdoData(raw.nom),
    date: raw.date,
    vom: raw.vom ? toOrdoData(raw.vom) : null,
    source: { name: raw.credits.nom.source, url: raw.credits.nom.url }
  };
}

interface CacheEntry<T> {
  value: T;
  cachedAt: string;
}

export interface FetchResult<T> {
  data: T | null;
  /** `true` si la réponse vient du cache (réseau indisponible), pas d'Internet. */
  isStale: boolean;
  /** Date ISO de la mise en cache, `null` si rien n'a jamais pu être mis en cache pour cette clé. */
  cachedAt: string | null;
}

async function cachedFetch<T>(cacheKey: string, url: string): Promise<FetchResult<T>> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const response = await fetch(url, { signal: controller.signal, cache: 'no-store' });
    clearTimeout(timer);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = (await response.json()) as T;
    const cachedAt = new Date().toISOString();
    const entry: CacheEntry<T> = { value: data, cachedAt };
    Preferences.set({ key: cacheKey, value: JSON.stringify(entry) }).catch(() => {});
    return { data, isStale: false, cachedAt };
  } catch (error) {
    try {
      const { value } = await Preferences.get({ key: cacheKey });
      if (value) {
        const parsed = JSON.parse(value) as Partial<CacheEntry<T>>;
        // Garde-fou pour un cache écrit par une version antérieure de
        // l'app (format brut, sans `{ value, cachedAt }`) : on l'ignore
        // plutôt que de planter sur un objet de forme inattendue.
        if (parsed && typeof parsed === 'object' && 'value' in parsed && 'cachedAt' in parsed) {
          return { data: parsed.value as T, isStale: true, cachedAt: parsed.cachedAt as string };
        }
      }
    } catch {
      // Cache illisible : on retombe sur l'absence de données ci-dessous.
    }
    console.warn(`Calendrier liturgique indisponible pour ${url}.`, error);
    return { data: null, isStale: true, cachedAt: null };
  }
}

export interface FeastFetchResult {
  feast: FeastOfDay | null;
  isStale: boolean;
  cachedAt: string | null;
}

/**
 * Récupère la fête/férie d'une date donnée, calendrier romain actuel
 * (Novus Ordo) ET calendrier traditionnel (Vetus Ordo, 1962) : nom,
 * couleur, lectures de la messe, office des heures, oraison. Ne lève
 * jamais d'exception : `isStale` indique que la réponse vient du cache
 * (réseau indisponible), `feast` vaut `null` si rien n'a jamais pu être
 * mis en cache pour cette date.
 */
export async function fetchFeastForDate(date: string): Promise<FeastFetchResult> {
  const result = await cachedFetch<RawFeastResponse>(
    `${CACHE_KEY_PREFIX}${date}`,
    `${API_BASE}/api/v1/feast?date=${date}&locale=fr`
  );
  return {
    feast: result.data ? toFeastOfDay(result.data) : null,
    isStale: result.isStale,
    cachedAt: result.cachedAt
  };
}

/** Vue mensuelle allégée (un objet par jour) : utilisée pour la bande de semaine. */
export async function fetchMonthCalendar(month: string): Promise<CalendarDayEntry[] | null> {
  const result = await cachedFetch<RawCalendarResponse>(
    `${MONTH_CACHE_KEY_PREFIX}${month}`,
    `${API_BASE}/api/liturgical/calendar?month=${month}&locale=fr`
  );
  return result.data ? result.data.entries : null;
}
