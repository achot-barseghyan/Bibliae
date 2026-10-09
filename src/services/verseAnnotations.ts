// Annotation des versets au mot près (voir le handoff « Annotation dans le
// lecteur »).
//
// Le stockage reste celui des annotations existantes : des plages de
// caractères ancrées sur un verset (`blockIndex`), ce qui garde valides les
// annotations déjà posées. Deux sortes d'annotations cohabitent :
//  - les styles (surlignage / soulignement) : `note === null`. Ils sont
//    réécrits à chaque modification en plages maximales de style identique,
//    ce qui rend « souligner/retirer » et « effacer » exacts même quand des
//    annotations se chevauchent ;
//  - les notes : `note !== null`, sans style. Une note sur plusieurs versets
//    est un groupe d'annotations (`groupId`), une par verset, portant le même
//    texte.
// Les anciennes notes portaient aussi un surlignage : leur style est
// transféré dans les plages de style dès que leur verset est modifié.

import {
  setAppData,
  type Annotation,
  type AnnotationStyle,
  type HighlightColor
} from './appDataStore';

export interface WordSpan {
  start: number;
  end: number;
}

/** Position d'un mot dans le chapitre : verset puis rang du mot dans le verset. */
export interface WordPos {
  verse: number;
  word: number;
}

/** Portion d'un verset, en décalages de caractères (fin exclue). */
export interface VerseRange {
  verse: number;
  start: number;
  end: number;
}

export type StyleOp =
  | { kind: 'color'; color: HighlightColor }
  | { kind: 'underline'; on: boolean }
  | { kind: 'erase' };

export interface CharStyles {
  highlight: Array<HighlightColor | null>;
  underline: boolean[];
}

/** Une note de l'utilisateur, éventuellement répartie sur plusieurs versets. */
export interface VerseNote {
  /** `groupId` de la note, ou l'id de son unique annotation. */
  key: string;
  annotationIds: string[];
  /** Plages couvertes, dans l'ordre du texte. */
  ranges: VerseRange[];
  text: string;
  /** Verset sous lequel la note s'affiche : celui où finit le passage. */
  lastVerse: number;
  updatedAt: string;
}

export function tokenizeWords(text: string): WordSpan[] {
  const words: WordSpan[] = [];
  for (const match of text.matchAll(/\S+/g)) {
    const start = match.index ?? 0;
    words.push({ start, end: start + match[0].length });
  }
  return words;
}

export function comparePos(a: WordPos, b: WordPos): number {
  return a.verse - b.verse || a.word - b.word;
}

/** Plages couvertes par une sélection de mots (de `from` à `to` inclus, dans n'importe quel ordre). */
export function rangesBetween(from: WordPos, to: WordPos, wordsByVerse: Map<number, WordSpan[]>): VerseRange[] {
  const [first, last] = comparePos(from, to) <= 0 ? [from, to] : [to, from];
  const ranges: VerseRange[] = [];
  for (let verse = first.verse; verse <= last.verse; verse++) {
    const words = wordsByVerse.get(verse);
    if (!words || words.length === 0) continue;
    const startWord = verse === first.verse ? first.word : 0;
    const endWord = verse === last.verse ? last.word : words.length - 1;
    const start = words[Math.min(startWord, words.length - 1)];
    const end = words[Math.min(endWord, words.length - 1)];
    if (start && end && end.end > start.start) ranges.push({ verse, start: start.start, end: end.end });
  }
  return ranges;
}

export function countWords(from: WordPos, to: WordPos, wordsByVerse: Map<number, WordSpan[]>): number {
  const [first, last] = comparePos(from, to) <= 0 ? [from, to] : [to, from];
  let count = 0;
  for (let verse = first.verse; verse <= last.verse; verse++) {
    const total = wordsByVerse.get(verse)?.length ?? 0;
    if (total === 0) continue;
    const startWord = verse === first.verse ? first.word : 0;
    const endWord = verse === last.verse ? last.word : total - 1;
    count += Math.max(0, Math.min(endWord, total - 1) - startWord + 1);
  }
  return count;
}

function isVerseAnnotation(a: Annotation, sourceId: string, verse?: number): boolean {
  return (
    a.target.kind === 'verse' &&
    a.target.sourceId === sourceId &&
    !a.target.lang &&
    (verse === undefined || a.target.blockIndex === verse)
  );
}

function hasStyle(style: AnnotationStyle): boolean {
  return style.highlight !== null || style.underline;
}

/**
 * Style de chaque caractère d'un verset. En cas de chevauchement, le
 * surlignage le plus récemment modifié l'emporte ; le soulignement
 * s'applique dès qu'une annotation le porte.
 */
export function charStyles(blockAnnotations: Annotation[], length: number): CharStyles {
  const highlight: Array<HighlightColor | null> = new Array(length).fill(null);
  const underline: boolean[] = new Array(length).fill(false);
  const styled = blockAnnotations
    .filter((a) => hasStyle(a.style))
    .sort((a, b) => (a.updatedAt < b.updatedAt ? -1 : a.updatedAt > b.updatedAt ? 1 : 0));
  for (const a of styled) {
    const from = Math.max(0, a.target.start);
    const to = Math.min(length, a.target.end);
    for (let i = from; i < to; i++) {
      if (a.style.highlight) highlight[i] = a.style.highlight;
      if (a.style.underline) underline[i] = true;
    }
  }
  return { highlight, underline };
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function makeAnnotation(
  sourceId: string,
  verse: number,
  start: number,
  end: number,
  text: string,
  style: AnnotationStyle,
  note: string | null,
  now: string,
  groupId?: string
): Annotation {
  return {
    id: generateId('ann'),
    createdAt: now,
    updatedAt: now,
    target: { kind: 'verse', sourceId, blockIndex: verse, start, end, quote: text.slice(start, end) },
    style,
    note,
    groupId
  };
}

function overlaps(a: Annotation, range: VerseRange): boolean {
  return a.target.blockIndex === range.verse && a.target.start < range.end && a.target.end > range.start;
}

/** Applique une couleur, un (dé)soulignement ou un effacement aux plages données. */
export function applyVerseStyle(
  sourceId: string,
  ranges: VerseRange[],
  op: StyleOp,
  textOf: (verse: number) => string
): void {
  if (ranges.length === 0) return;
  setAppData((prev) => {
    const now = new Date().toISOString();
    const removedIds = new Set<string>();
    const strippedIds = new Set<string>();
    const erasedNoteKeys = new Set<string>();
    const added: Annotation[] = [];

    for (const range of ranges) {
      const text = textOf(range.verse);
      const block = prev.annotations.filter((a) => isVerseAnnotation(a, sourceId, range.verse));
      const styles = charStyles(block, text.length);

      for (let i = Math.max(0, range.start); i < Math.min(text.length, range.end); i++) {
        if (op.kind === 'color') styles.highlight[i] = op.color;
        else if (op.kind === 'underline') styles.underline[i] = op.on;
        else {
          styles.highlight[i] = null;
          styles.underline[i] = false;
        }
      }

      for (const a of block) {
        if (a.note === null) removedIds.add(a.id);
        else if (hasStyle(a.style)) strippedIds.add(a.id);
        if (op.kind === 'erase' && a.note !== null && overlaps(a, range)) erasedNoteKeys.add(a.groupId ?? a.id);
      }

      let i = 0;
      while (i < text.length) {
        const highlight = styles.highlight[i];
        const underline = styles.underline[i];
        if (!highlight && !underline) {
          i++;
          continue;
        }
        let j = i + 1;
        while (j < text.length && styles.highlight[j] === highlight && styles.underline[j] === underline) j++;
        added.push(makeAnnotation(sourceId, range.verse, i, j, text, { highlight, underline }, null, now));
        i = j;
      }
    }

    const annotations = prev.annotations
      .filter((a) => !removedIds.has(a.id))
      .flatMap((a): Annotation[] => {
        const isErasedNote = a.note !== null && erasedNoteKeys.has(a.groupId ?? a.id);
        const style = strippedIds.has(a.id) ? { highlight: null, underline: false } : a.style;
        if (isErasedNote) {
          // Une ancienne note portait aussi un surlignage : hors des versets
          // modifiés, on garde ce surlignage et on retire seulement la note.
          return hasStyle(style) ? [{ ...a, note: null, groupId: undefined, updatedAt: now }] : [];
        }
        return strippedIds.has(a.id) ? [{ ...a, style }] : [a];
      });

    return { ...prev, annotations: [...annotations, ...added] };
  });
}

/**
 * Enregistre la note d'un passage, en remplaçant `replaceIds` (la note
 * qu'on modifie, s'il y en a une). Un texte vide supprime la note.
 */
export function saveVerseNote(
  sourceId: string,
  ranges: VerseRange[],
  text: string,
  replaceIds: string[],
  textOf: (verse: number) => string
): void {
  const trimmed = text.trim();
  setAppData((prev) => {
    const now = new Date().toISOString();
    const replaced = new Set(replaceIds);
    const annotations = prev.annotations.flatMap((a): Annotation[] => {
      if (!replaced.has(a.id)) return [a];
      return hasStyle(a.style) ? [{ ...a, note: null, groupId: undefined, updatedAt: now }] : [];
    });
    if (!trimmed || ranges.length === 0) return { ...prev, annotations };

    const groupId = ranges.length > 1 ? generateId('grp') : undefined;
    const noteAnnotations = ranges.map((range) =>
      makeAnnotation(
        sourceId,
        range.verse,
        range.start,
        range.end,
        textOf(range.verse),
        { highlight: null, underline: false },
        trimmed,
        now,
        groupId
      )
    );
    return { ...prev, annotations: [...annotations, ...noteAnnotations] };
  });
}

/** Notes d'un chapitre, regroupées (une entrée par note, même répartie sur plusieurs versets). */
export function chapterNotes(annotations: Annotation[], sourceId: string): VerseNote[] {
  const groups = new Map<string, Annotation[]>();
  for (const a of annotations) {
    if (a.note === null || !isVerseAnnotation(a, sourceId)) continue;
    const key = a.groupId ?? a.id;
    const list = groups.get(key);
    if (list) list.push(a);
    else groups.set(key, [a]);
  }
  return Array.from(groups.entries())
    .map(([key, list]) => {
      const sorted = [...list].sort(
        (a, b) => a.target.blockIndex - b.target.blockIndex || a.target.start - b.target.start
      );
      return {
        key,
        annotationIds: sorted.map((a) => a.id),
        ranges: sorted.map((a) => ({ verse: a.target.blockIndex, start: a.target.start, end: a.target.end })),
        text: sorted[0].note ?? '',
        lastVerse: sorted[sorted.length - 1].target.blockIndex,
        updatedAt: sorted.reduce((latest, a) => (a.updatedAt > latest ? a.updatedAt : latest), sorted[0].updatedAt)
      };
    })
    .sort((a, b) => {
      const ra = a.ranges[0];
      const rb = b.ranges[0];
      return ra.verse - rb.verse || ra.start - rb.start;
    });
}

export function noteOverlaps(note: VerseNote, ranges: VerseRange[]): boolean {
  return note.ranges.some((nr) =>
    ranges.some((r) => r.verse === nr.verse && r.start < nr.end && r.end > nr.start)
  );
}

export function sameRanges(a: VerseRange[], b: VerseRange[]): boolean {
  return (
    a.length === b.length &&
    a.every((r, i) => r.verse === b[i].verse && r.start === b[i].start && r.end === b[i].end)
  );
}

/** Mots qui recouvrent une plage (pour resélectionner le passage d'une note). */
export function wordsCovering(
  ranges: VerseRange[],
  wordsByVerse: Map<number, WordSpan[]>
): { from: WordPos; to: WordPos } | null {
  if (ranges.length === 0) return null;
  const first = ranges[0];
  const last = ranges[ranges.length - 1];
  const firstWords = wordsByVerse.get(first.verse) ?? [];
  const lastWords = wordsByVerse.get(last.verse) ?? [];
  const fromIdx = firstWords.findIndex((w) => w.end > first.start);
  let toIdx = -1;
  lastWords.forEach((w, i) => {
    if (w.start < last.end) toIdx = i;
  });
  if (fromIdx === -1 || toIdx === -1) return null;
  return { from: { verse: first.verse, word: fromIdx }, to: { verse: last.verse, word: toIdx } };
}
