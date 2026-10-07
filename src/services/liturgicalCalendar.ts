import { Preferences } from '@capacitor/preferences';
import { CHURCH_PRAYERS } from '../data/prayers';

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

// --- Office des Heures (calendrier romain actuel) : source AELF directe ---
//
// L'API CatéGPT ci-dessus ne renvoie qu'une version tronquée et mal ordonnée
// des offices (ex. Laudes sans introduction, sans les psaumes, sans le
// Cantique de Zacharie ni le Notre Père, avec l'oraison placée avant la
// lecture). L'API publique de l'AELF (https://api.aelf.org), elle, renvoie
// la structure complète dans l'ordre liturgique correct. On ne l'utilise que
// pour les 7 heures du calendrier ordinaire (Novus Ordo) : le calendrier
// traditionnel (`vom`) n'a pas d'équivalent Vetus Ordo dans cette API et
// continue de venir de CatéGPT.
const AELF_API_BASE = 'https://api.aelf.org/v1';
const OFFICES_CACHE_KEY_PREFIX = 'liturgical-offices:';
const AELF_OFFICE_ENDPOINTS: Record<string, string> = {
  matins: 'lectures',
  lauds: 'laudes',
  terce: 'tierce',
  sext: 'sexte',
  none: 'none',
  vespers: 'vepres',
  compline: 'complies'
};

function asText(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

interface AelfRefText {
  reference: string | null;
  titre: string | null;
  texte: string;
}

function asRefText(value: unknown): AelfRefText | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const v = value as Record<string, unknown>;
  if (typeof v.texte !== 'string' || !v.texte.trim()) return null;
  return {
    reference: typeof v.reference === 'string' ? v.reference : null,
    titre: typeof v.titre === 'string' ? v.titre : null,
    texte: v.texte
  };
}

function simpleItem(key: string, label: string, value: unknown): LiturgicalItem | null {
  const text = asText(value);
  return text ? { key, label, ref: null, text } : null;
}

function hymnItem(key: string, value: unknown): LiturgicalItem | null {
  const h = asRefText(value);
  return h ? { key, label: h.titre ?? 'Hymne', ref: null, text: h.texte } : null;
}

/** Lecture courte ou longue avec référence biblique ("Parole de Dieu",
 * lecture de l'Office des lectures...) : le titre propre de la lecture
 * (s'il existe) prime sur le libellé par défaut. */
function pericopeItem(key: string, defaultLabel: string, value: unknown): LiturgicalItem | null {
  const p = asRefText(value);
  return p ? { key, label: p.titre ?? defaultLabel, ref: p.reference, text: p.texte } : null;
}

/** Antienne + psaume/cantique combinés en un seul onglet (antienne, texte,
 * antienne répétée), comme les présente le bréviaire. */
function psalmItem(key: string, labelPrefix: string, antienneValue: unknown, psalmValue: unknown): LiturgicalItem | null {
  const psalm = asRefText(psalmValue);
  if (!psalm) return null;
  const antienne = asText(antienneValue);
  const text = antienne ? `${antienne}<br /><br />${psalm.texte}<br /><br />${antienne}` : psalm.texte;
  const label = psalm.titre ?? (psalm.reference ? psalmLabelFromReference(labelPrefix, psalm.reference) : labelPrefix);
  return { key, label, ref: psalm.reference, text };
}

/** Pour un cantique, l'AELF met un titre complet dans `reference`
 * ("CANTIQUE des trois enfants (Dn 3)") plutôt qu'une simple référence —
 * il ne faut alors pas le préfixer par "Psaume". */
function psalmLabelFromReference(labelPrefix: string, reference: string): string {
  if (/^cantique\b/i.test(reference)) {
    return reference.replace(/^CANTIQUE\b/, 'Cantique');
  }
  return `${labelPrefix} ${reference}`;
}

/** Convertit un texte brut (retours à la ligne simples/doubles, comme dans
 * `data/prayers.ts`) vers le HTML `<p>`/`<br>` attendu par `htmlParagraphs` :
 * sans ça, `htmlToLines` aplatit tous les retours à la ligne en espaces. */
function plainTextToHtml(text: string): string {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
    .join('');
}

/** L'AELF ne renvoie que le libellé ("Notre Père"), pas le texte de la
 * prière, comme dans les bréviaires imprimés — on complète avec le texte
 * déjà présent dans l'app (Prier > Prières) plutôt que de n'afficher que
 * son nom. */
function notrePereItem(value: unknown): LiturgicalItem | null {
  if (!asText(value)) return null;
  const prayerText = CHURCH_PRAYERS.find((p) => p.id === 'notre-pere')?.texts.fr;
  const text = prayerText ? plainTextToHtml(prayerText) : 'Notre Père';
  return { key: 'notre_pere', label: 'Notre Père', ref: null, text };
}

function patristicItem(titreValue: unknown, texteValue: unknown): LiturgicalItem | null {
  const label = asText(titreValue);
  const text = asText(texteValue);
  return label && text ? { key: 'patristique', label, ref: null, text } : null;
}

function compact(items: Array<LiturgicalItem | null>): LiturgicalItem[] {
  return items.filter((item): item is LiturgicalItem => item !== null);
}

function mapLectures(raw: Record<string, unknown>): LiturgicalItem[] {
  return compact([
    simpleItem('introduction', 'Introduction', raw.introduction),
    hymnItem('hymne', raw.hymne),
    psalmItem('psaume_1', 'Psaume', raw.antienne_1, raw.psaume_1),
    psalmItem('psaume_2', 'Psaume', raw.antienne_2, raw.psaume_2),
    psalmItem('psaume_3', 'Psaume', raw.antienne_3, raw.psaume_3),
    simpleItem('verset_psaume', 'Verset', raw.verset_psaume),
    pericopeItem('lecture', 'Parole de Dieu', raw.lecture),
    simpleItem('repons_lecture', 'Répons', raw.repons_lecture),
    patristicItem(raw.titre_patristique, raw.texte_patristique),
    simpleItem('repons_patristique', 'Répons patristique', raw.repons_patristique),
    hymnItem('te_deum', raw.te_deum),
    simpleItem('collect', 'Oraison', raw.oraison)
  ]);
}

function mapLaudes(raw: Record<string, unknown>): LiturgicalItem[] {
  return compact([
    simpleItem('introduction', 'Introduction', raw.introduction),
    psalmItem('invitatoire', 'Invitatoire', raw.antienne_invitatoire, raw.psaume_invitatoire),
    hymnItem('hymne', raw.hymne),
    psalmItem('psaume_1', 'Psaume', raw.antienne_1, raw.psaume_1),
    psalmItem('psaume_2', 'Psaume', raw.antienne_2, raw.psaume_2),
    psalmItem('psaume_3', 'Psaume', raw.antienne_3, raw.psaume_3),
    pericopeItem('short_reading', 'Parole de Dieu', raw.pericope),
    simpleItem('responsory', 'Répons', raw.repons),
    psalmItem('cantique_zacharie', 'Cantique', raw.antienne_zacharie, raw.cantique_zacharie),
    simpleItem('intercession', 'Intercession', raw.intercession),
    notrePereItem(raw.notre_pere),
    simpleItem('collect', 'Oraison', raw.oraison)
  ]);
}

function mapPetiteHeure(raw: Record<string, unknown>): LiturgicalItem[] {
  return compact([
    simpleItem('introduction', 'Introduction', raw.introduction),
    hymnItem('hymne', raw.hymne),
    psalmItem('psaume_1', 'Psaume', raw.antienne_1, raw.psaume_1),
    psalmItem('psaume_2', 'Psaume', raw.antienne_2, raw.psaume_2),
    psalmItem('psaume_3', 'Psaume', raw.antienne_3, raw.psaume_3),
    pericopeItem('short_reading', 'Parole de Dieu', raw.pericope),
    simpleItem('responsory', 'Répons', raw.repons),
    simpleItem('collect', 'Oraison', raw.oraison)
  ]);
}

function mapVepres(raw: Record<string, unknown>): LiturgicalItem[] {
  return compact([
    simpleItem('introduction', 'Introduction', raw.introduction),
    hymnItem('hymne', raw.hymne),
    psalmItem('psaume_1', 'Psaume', raw.antienne_1, raw.psaume_1),
    psalmItem('psaume_2', 'Psaume', raw.antienne_2, raw.psaume_2),
    psalmItem('psaume_3', 'Psaume', raw.antienne_3, raw.psaume_3),
    pericopeItem('short_reading', 'Parole de Dieu', raw.pericope),
    simpleItem('responsory', 'Répons', raw.repons),
    psalmItem('cantique_mariale', 'Cantique', raw.antienne_magnificat, raw.cantique_mariale),
    simpleItem('intercession', 'Intercession', raw.intercession),
    notrePereItem(raw.notre_pere),
    simpleItem('collect', 'Oraison', raw.oraison)
  ]);
}

function mapComplies(raw: Record<string, unknown>): LiturgicalItem[] {
  return compact([
    simpleItem('introduction', 'Introduction', raw.introduction),
    hymnItem('hymne', raw.hymne),
    psalmItem('psaume_1', 'Psaume', raw.antienne_1, raw.psaume_1),
    psalmItem('psaume_2', 'Psaume', raw.antienne_2, raw.psaume_2),
    pericopeItem('short_reading', 'Parole de Dieu', raw.pericope),
    simpleItem('responsory', 'Répons', raw.repons),
    psalmItem('cantique_symeon', 'Cantique', raw.antienne_symeon, raw.cantique_symeon),
    simpleItem('collect', 'Oraison', raw.oraison),
    simpleItem('benediction', 'Bénédiction', raw.benediction),
    hymnItem('hymne_mariale', raw.hymne_mariale)
  ]);
}

function mapAelfOffice(hourKey: string, raw: Record<string, unknown>): LiturgicalItem[] {
  switch (hourKey) {
    case 'matins':
      return mapLectures(raw);
    case 'lauds':
      return mapLaudes(raw);
    case 'terce':
    case 'sext':
    case 'none':
      return mapPetiteHeure(raw);
    case 'vespers':
      return mapVepres(raw);
    case 'compline':
      return mapComplies(raw);
    default:
      return [];
  }
}

async function fetchAelfOfficeRaw(endpoint: string, date: string): Promise<Record<string, unknown> | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const response = await fetch(`${AELF_API_BASE}/${endpoint}/${date}/france`, {
      signal: controller.signal,
      cache: 'no-store'
    });
    clearTimeout(timer);
    if (!response.ok) return null;
    const data = (await response.json()) as Record<string, unknown>;
    const payload = data[endpoint];
    return payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** Récupère les 7 heures du calendrier ordinaire depuis l'AELF en parallèle.
 * Une heure dont la requête échoue est simplement absente du résultat
 * (l'appelant conserve alors la version CatéGPT pour cette heure-là) plutôt
 * que de faire échouer tout l'office. */
async function fetchAelfOffices(date: string): Promise<Record<string, LiturgicalItem[]> | null> {
  const entries = await Promise.all(
    Object.entries(AELF_OFFICE_ENDPOINTS).map(async ([hourKey, endpoint]) => {
      const raw = await fetchAelfOfficeRaw(endpoint, date);
      if (!raw) return null;
      const items = mapAelfOffice(hourKey, raw);
      return items.length > 0 ? ([hourKey, items] as const) : null;
    })
  );
  const valid = entries.filter((entry): entry is readonly [string, LiturgicalItem[]] => entry !== null);
  return valid.length > 0 ? Object.fromEntries(valid) : null;
}

async function fetchAelfOfficesWithCache(date: string): Promise<Record<string, LiturgicalItem[]> | null> {
  const cacheKey = `${OFFICES_CACHE_KEY_PREFIX}${date}`;
  const fresh = await fetchAelfOffices(date);
  if (fresh) {
    Preferences.set({ key: cacheKey, value: JSON.stringify(fresh) }).catch(() => {});
    return fresh;
  }
  try {
    const { value } = await Preferences.get({ key: cacheKey });
    if (value) return JSON.parse(value) as Record<string, LiturgicalItem[]>;
  } catch {
    // Cache illisible : on retombe sur la version CatéGPT ci-dessous.
  }
  return null;
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
  const [result, aelfOffices] = await Promise.all([
    cachedFetch<RawFeastResponse>(
      `${CACHE_KEY_PREFIX}${date}`,
      `${API_BASE}/api/v1/feast?date=${date}&locale=fr`
    ),
    fetchAelfOfficesWithCache(date)
  ]);

  const feast = result.data ? toFeastOfDay(result.data) : null;
  if (feast && aelfOffices) {
    feast.offices = { ...feast.offices, ...aelfOffices };
    feast.collect = feast.offices.lauds?.find((item) => item.key === 'collect')?.text ?? feast.collect;
  }

  return {
    feast,
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
