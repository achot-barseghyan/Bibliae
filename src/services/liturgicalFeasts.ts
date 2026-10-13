// Dates des grandes fêtes, calculées sur l'appareil (pas de réseau) :
// fêtes fixes et fêtes mobiles du cycle pascal, selon le calendrier
// romain en usage en France (Épiphanie fixée au dimanche entre le 2 et
// le 8 janvier).

export type FeastId = 'noel' | 'bapteme-du-seigneur' | 'vendredi-saint' | 'paques' | 'pentecote';

export const FEAST_LABELS: Record<FeastId, string> = {
  noel: 'Noël',
  'bapteme-du-seigneur': 'Baptême du Seigneur',
  'vendredi-saint': 'Vendredi saint',
  paques: 'Pâques',
  pentecote: 'Pentecôte'
};

const DAY_MS = 86_400_000;

/** Date sans heure, en UTC, pour compter des jours entiers sans être gêné
 * par les changements d'heure. */
const utcDate = (year: number, month: number, day: number) => new Date(Date.UTC(year, month - 1, day));

const addDays = (date: Date, days: number) => new Date(date.getTime() + days * DAY_MS);

/** Dimanche de Pâques (comput grégorien, algorithme de Meeus/Jones/Butcher). */
export function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return utcDate(year, month, day);
}

/** Baptême du Seigneur : dimanche après l'Épiphanie, ou lundi si
 * l'Épiphanie tombe le 7 ou le 8 janvier. */
function baptismOfTheLord(year: number): Date {
  const jan2 = utcDate(year, 1, 2);
  const epiphany = addDays(jan2, (7 - jan2.getUTCDay()) % 7);
  return addDays(epiphany, epiphany.getUTCDate() >= 7 ? 1 : 7);
}

/** Date de la fête pour une année civile donnée. */
export function feastDate(feast: FeastId, year: number): Date {
  switch (feast) {
    case 'noel':
      return utcDate(year, 12, 25);
    case 'bapteme-du-seigneur':
      return baptismOfTheLord(year);
    case 'vendredi-saint':
      return addDays(easterSunday(year), -2);
    case 'paques':
      return easterSunday(year);
    case 'pentecote':
      return addDays(easterSunday(year), 49);
  }
}

/** Jours entiers jusqu'à la prochaine occurrence de la fête (0 le jour même). */
export function daysUntilFeast(feast: FeastId, today: Date = new Date()): number {
  const start = utcDate(today.getFullYear(), today.getMonth() + 1, today.getDate());
  for (const year of [start.getUTCFullYear(), start.getUTCFullYear() + 1]) {
    const date = feastDate(feast, year);
    if (date >= start) return Math.round((date.getTime() - start.getTime()) / DAY_MS);
  }
  // Inatteignable : chaque fête revient au plus tard l'année suivante.
  return 0;
}

/** « Noël dans 75 jours », « Pâques demain », « Noël · aujourd'hui ». */
export function feastCountdownLabel(feast: FeastId, today: Date = new Date()): string {
  const label = FEAST_LABELS[feast];
  const days = daysUntilFeast(feast, today);
  if (days === 0) return `${label} · aujourd'hui`;
  if (days === 1) return `${label} demain`;
  return `${label} dans ${days} jours`;
}

export type LiturgicalSeasonKey = 'avent' | 'noel' | 'ordinaire-1' | 'careme' | 'paques' | 'ordinaire-2';

export interface LiturgicalSeason {
  key: LiturgicalSeasonKey;
  label: string;
  color: 'violet' | 'blanc' | 'vert';
  days: number;
}

export interface LiturgicalYear {
  seasons: LiturgicalSeason[];
  /** Nombre total de jours de l'année liturgique. */
  length: number;
  /** Rang du jour demandé dans l'année (0 = premier dimanche de l'Avent). */
  dayIndex: number;
  /** Cycle des dimanches (A, B, C). */
  sundayCycle: 'A' | 'B' | 'C';
  /** Cycle des lectures de semaine : année paire ou impaire. */
  weekdayCycle: 'paire' | 'impaire';
}

/** Premier dimanche de l'Avent : quatrième dimanche avant Noël. */
function firstSundayOfAdvent(year: number): Date {
  const christmas = utcDate(year, 12, 25);
  return addDays(christmas, -(christmas.getUTCDay() || 7) - 21);
}

const daysBetween = (from: Date, to: Date) => Math.round((to.getTime() - from.getTime()) / DAY_MS);

/** Découpage en temps de l'année liturgique qui contient `date`. Elle porte
 * le millésime de l'année civile où elle se termine (2026 pour celle qui
 * commence à l'Avent 2025). */
export function liturgicalYear(date: Date = new Date()): LiturgicalYear {
  const day = utcDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const endYear = day >= firstSundayOfAdvent(day.getUTCFullYear()) ? day.getUTCFullYear() + 1 : day.getUTCFullYear();

  const start = firstSundayOfAdvent(endYear - 1);
  const christmas = utcDate(endYear - 1, 12, 25);
  const afterBaptism = addDays(baptismOfTheLord(endYear), 1);
  const easter = easterSunday(endYear);
  const ashWednesday = addDays(easter, -46);
  const afterPentecost = addDays(easter, 50);
  const end = firstSundayOfAdvent(endYear);

  const seasons: LiturgicalSeason[] = [
    { key: 'avent', label: 'Avent', color: 'violet', days: daysBetween(start, christmas) },
    { key: 'noel', label: 'Noël', color: 'blanc', days: daysBetween(christmas, afterBaptism) },
    { key: 'ordinaire-1', label: 'T.O.', color: 'vert', days: daysBetween(afterBaptism, ashWednesday) },
    { key: 'careme', label: 'Carême', color: 'violet', days: daysBetween(ashWednesday, easter) },
    { key: 'paques', label: 'Pâques', color: 'blanc', days: daysBetween(easter, afterPentecost) },
    { key: 'ordinaire-2', label: 'Temps ordinaire', color: 'vert', days: daysBetween(afterPentecost, end) }
  ];

  return {
    seasons,
    length: daysBetween(start, end),
    dayIndex: daysBetween(start, day),
    sundayCycle: (['C', 'A', 'B'] as const)[endYear % 3],
    weekdayCycle: endYear % 2 === 0 ? 'paire' : 'impaire'
  };
}
