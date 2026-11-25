// Logique pure du quiz : tirage quotidien, barème, jour de référence.
// Aucun accès à la base ici, pour pouvoir la tester seule.

export interface PoolQuestion {
  /** Énoncé. */
  q: string;
  /** Bonne réponse (questions à choix) ou explication (vrai/faux, peut être vide). */
  a: string;
  /** Référence biblique, ex. « Lc 1, 33 » (peut être vide). */
  ref: string;
  /**
   * Type de réponse : V / F pour vrai ou faux ; sinon une famille de réponses
   * (s, l, n, w, p, a, b…) dans laquelle on pioche les mauvaises propositions.
   */
  t: string;
}

export interface DrawnQuestion {
  /** Rang de la question dans la banque. */
  id: number;
  q: string;
  choices: string[];
  /** Indice de la bonne proposition dans `choices`. */
  good: number;
  /** Texte affiché après la réponse. */
  answer: string;
  ref: string;
}

export const QUESTIONS_PER_DAY = 20;
export const QUESTION_TIME_S = 20;
/** Marge accordée au réseau avant de compter une réponse comme hors délai. */
export const NETWORK_GRACE_S = 2;
export const QUIZ_TIMEZONE = 'Europe/Paris';

export function fnv(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Générateur pseudo-aléatoire déterministe (mulberry32). */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Les 20 questions du jour, identiques pour tout le monde : tirage déterministe
 * à partir de la date. Les mauvaises propositions viennent de questions de la
 * même famille, de longueur comparable.
 */
export function drawDailyQuiz(pool: PoolQuestion[], day: string, count = QUESTIONS_PER_DAY): DrawnQuestion[] {
  const r = rng(fnv('bibliae-quiz|' + day));
  const idx = pool.map((_, i) => i);
  const n = Math.min(count, pool.length);
  for (let i = 0; i < n; i++) {
    const j = i + Math.floor(r() * (idx.length - i));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx.slice(0, n).map((id) => {
    const { q, a, ref, t } = pool[id];
    if (t === 'V' || t === 'F') {
      const good = t === 'V' ? 'Vrai' : 'Faux';
      return { id, q, choices: ['Vrai', 'Faux'], good: t === 'V' ? 0 : 1, answer: a ? `${good}. ${a}` : good, ref };
    }
    const picks: string[] = [];
    const seen = new Set([a.toLowerCase()]);
    const loose = 'nwpab'.includes(t);
    for (let tries = 0; picks.length < 3 && tries < 600; tries++) {
      const c = pool[Math.floor(r() * pool.length)];
      if (c.t !== t) continue;
      const ratio = c.a.length / Math.max(a.length, 1);
      if (tries < 400 && (ratio < (loose ? 0.25 : 0.45) || ratio > (loose ? 4 : 2.2))) continue;
      const lc = c.a.toLowerCase();
      if (seen.has(lc)) continue;
      seen.add(lc);
      picks.push(c.a);
    }
    const choices = [a, ...picks];
    for (let i = choices.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [choices[i], choices[j]] = [choices[j], choices[i]];
    }
    return { id, q, choices, good: choices.indexOf(a), answer: a, ref };
  });
}

/**
 * Points d'une réponse juste : 100, plus jusqu'à 50 de bonus de vitesse, plus
 * 20 à partir de la troisième bonne réponse d'affilée (`combo` l'inclut).
 */
export function gainFor(elapsedS: number, combo: number): number {
  const left = Math.max(0, QUESTION_TIME_S - elapsedS);
  return 100 + Math.round((50 * left) / QUESTION_TIME_S) + (combo >= 3 ? 20 : 0);
}

const dayFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: QUIZ_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
});
const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: QUIZ_TIMEZONE,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23'
});

/** Jour du quiz (AAAA-MM-JJ, heure de Paris) : un nouveau tirage à minuit. */
export function quizDay(now: Date = new Date()): string {
  return dayFormatter.format(now);
}

/** Secondes jusqu'au prochain minuit, heure de Paris. */
export function secondsUntilNextQuiz(now: Date = new Date()): number {
  const [h, m, s] = timeFormatter.format(now).split(':').map(Number);
  return Math.max(1, 86400 - (h * 3600 + m * 60 + s));
}

/** Jour précédent ou suivant d'une clé AAAA-MM-JJ. */
export function shiftDay(day: string, n: number): string {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
