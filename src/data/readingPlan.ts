// Plan de lecture « La Bible en 1 an » : 365 jours numérotés, chacun composé
// de 3 à 6 références. Le texte du plan (planBibleUnAn.ts) est conservé tel
// quel à l'affichage ; chaque référence est en plus rattachée au livre et au
// chapitre de l'app pour ouvrir le lecteur au bon endroit.
import { BOOKS } from './bible';
import PLAN_TEXT from './planBibleUnAn';

export const PLAN_ID = 'bible-1-an';
export const PLAN_TITLE = 'La Bible en 1 an';
export const PLAN_LENGTH = 365;
/** Jour 366 : pas une ligne de données, l'écran « Félicitations ». */
export const PLAN_FINALE_DAY = PLAN_LENGTH + 1;

export interface PlanRef {
  /** Texte du plan, tel qu'affiché : « 1 Samuel », « Esaïe »... */
  book: string;
  chap: string;
  /** Plage de versets telle qu'écrite dans le plan (« 1-16 », « 1 »). */
  vv: string;
  /** Cible dans le lecteur de l'app (versification de la Bible Crampon). */
  bookId: string;
  chapter: number;
  fromVerse: number;
  /** Dernier verset de la plage ; à borner au nombre de versets du chapitre. */
  toVerse: number;
}

export interface PlanDay {
  n: number;
  refs: PlanRef[];
}

/** Noms du plan qui diffèrent de ceux de l'app (canon de 66 livres, graphie protestante). */
const BOOK_ALIASES: Record<string, string> = {
  Esaïe: 'is',
  Cantique: 'ct',
  Ezéchiel: 'ez',
  Ephésiens: 'ep',
  Actes: 'ac'
};

const BOOK_ID_BY_NAME = new Map(BOOKS.map((b) => [b.name, b.id]));

/**
 * Le plan suit la versification protestante ; la Bible Crampon suit l'hébraïque
 * là où les découpages de chapitres divergent. Seuls les cas où le chapitre
 * n'existe pas ou ne correspond pas sont corrigés ici ; les fins de plage qui
 * dépassent d'un ou deux versets sont bornées à la lecture.
 */
const TARGET_OVERRIDES: Record<string, Pick<PlanRef, 'bookId' | 'chapter' | 'fromVerse' | 'toVerse'>> = {
  'Joël 3.1-21': { bookId: 'jl', chapter: 4, fromVerse: 1, toVerse: 21 },
  'Malachie 4.1-6': { bookId: 'ml', chapter: 3, fromVerse: 19, toVerse: 24 }
};

/** « 1 Samuel 21.1-16 » → livre avant le dernier espace, puis chapitre et versets. */
export function parsePlanRef(raw: string): PlanRef {
  const text = raw.trim();
  const lastSpace = text.lastIndexOf(' ');
  const book = text.slice(0, lastSpace);
  const [chap, vv = ''] = text.slice(lastSpace + 1).split('.');
  const [from, to] = vv.split('-').map(Number);
  const target = TARGET_OVERRIDES[text] ?? {
    bookId: BOOK_ALIASES[book] ?? BOOK_ID_BY_NAME.get(book) ?? '',
    chapter: Number(chap),
    fromVerse: from || 1,
    toVerse: to || from || Number.MAX_SAFE_INTEGER
  };
  return { book, chap, vv, ...target };
}

export const PLAN_DAYS: PlanDay[] = PLAN_TEXT.trim()
  .split('\n')
  .map((line, i) => ({ n: i + 1, refs: line.split(',').map(parsePlanRef) }));

export function getPlanDay(n: number): PlanDay | undefined {
  return PLAN_DAYS[n - 1];
}

/** « Genèse 1 » : livre et chapitre, sans versets. */
export function planRefLabel(ref: PlanRef): string {
  return `${ref.book} ${ref.chap}`;
}

export function planDayLabel(day: PlanDay): string {
  return day.refs.map(planRefLabel).join(' · ');
}

export interface PlanGroup {
  book: string;
  first: number;
  last: number;
  days: PlanDay[];
}

/** Jours regroupés par le livre de leur première référence (groupes consécutifs). */
export const PLAN_GROUPS: PlanGroup[] = PLAN_DAYS.reduce<PlanGroup[]>((groups, day) => {
  const book = day.refs[0].book;
  const current = groups[groups.length - 1];
  if (current && current.book === book) {
    current.days.push(day);
    current.last = day.n;
  } else {
    groups.push({ book, first: day.n, last: day.n, days: [day] });
  }
  return groups;
}, []);

/** Nombre de couples livre + chapitre distincts du plan. */
export const PLAN_CHAPTER_COUNT = new Set(
  PLAN_DAYS.flatMap((d) => d.refs.map((r) => `${r.book} ${r.chap}`))
).size;

/** Lien vers le lecteur : le passage précis, avec le jour et la référence du plan à cocher au retour. */
export function planReaderPath(ref: PlanRef, day: number, refIndex: number): string {
  return `/bible/${ref.bookId}/${ref.chapter}?plan=${day}-${refIndex}`;
}
