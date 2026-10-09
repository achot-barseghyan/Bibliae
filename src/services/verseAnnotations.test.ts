import { beforeEach, describe, expect, it } from 'vitest';
import { getAppData, setAppData, type Annotation } from './appDataStore';
import {
  applyVerseStyle,
  chapterNotes,
  charStyles,
  countWords,
  rangesBetween,
  saveVerseNote,
  tokenizeWords,
  wordsCovering
} from './verseAnnotations';

const SOURCE = 'jean-1';
const TEXTS = new Map([
  [1, 'Au commencement était le Verbe,'],
  [2, 'Il était au commencement en Dieu.']
]);
const textOf = (verse: number) => TEXTS.get(verse) ?? '';
const words = new Map([...TEXTS].map(([v, t]) => [v, tokenizeWords(t)]));

function verseAnnotations(verse: number): Annotation[] {
  return getAppData().annotations.filter((a) => a.target.sourceId === SOURCE && a.target.blockIndex === verse);
}

function stylesOf(verse: number) {
  return charStyles(verseAnnotations(verse), textOf(verse).length);
}

beforeEach(() => {
  setAppData((prev) => ({ ...prev, annotations: [] }));
});

describe('sélection au mot', () => {
  it('découpe les mots et convertit une sélection sur plusieurs versets en plages', () => {
    expect(words.get(1)?.map((w) => textOf(1).slice(w.start, w.end))).toEqual([
      'Au',
      'commencement',
      'était',
      'le',
      'Verbe,'
    ]);
    const ranges = rangesBetween({ verse: 2, word: 1 }, { verse: 1, word: 3 }, words);
    expect(ranges).toEqual([
      { verse: 1, start: 22, end: textOf(1).length },
      { verse: 2, start: 0, end: 8 }
    ]);
    expect(countWords({ verse: 1, word: 3 }, { verse: 2, word: 1 }, words)).toBe(4);
  });
});

describe('styles', () => {
  it('surligne, puis recolore une partie sans laisser d’annotations superposées', () => {
    const all = rangesBetween({ verse: 1, word: 0 }, { verse: 1, word: 4 }, words);
    applyVerseStyle(SOURCE, all, { kind: 'color', color: 'or' }, textOf);
    const middle = rangesBetween({ verse: 1, word: 1 }, { verse: 1, word: 2 }, words);
    applyVerseStyle(SOURCE, middle, { kind: 'color', color: 'olive' }, textOf);

    const anns = verseAnnotations(1);
    expect(anns.map((a) => [a.target.quote, a.style.highlight])).toEqual([
      ['Au ', 'or'],
      ['commencement était', 'olive'],
      [' le Verbe,', 'or']
    ]);
  });

  it('souligne puis retire le soulignement exactement sur la sélection', () => {
    const all = rangesBetween({ verse: 1, word: 0 }, { verse: 1, word: 4 }, words);
    applyVerseStyle(SOURCE, all, { kind: 'underline', on: true }, textOf);
    const one = rangesBetween({ verse: 1, word: 1 }, { verse: 1, word: 1 }, words);
    applyVerseStyle(SOURCE, one, { kind: 'underline', on: false }, textOf);

    const styles = stylesOf(1);
    expect(styles.underline[0]).toBe(true);
    expect(styles.underline[5]).toBe(false);
    expect(styles.underline[25]).toBe(true);
  });

  it('efface style et notes qui chevauchent la sélection, sur tous leurs versets', () => {
    const passage = rangesBetween({ verse: 1, word: 3 }, { verse: 2, word: 1 }, words);
    applyVerseStyle(SOURCE, passage, { kind: 'color', color: 'sanguine' }, textOf);
    saveVerseNote(SOURCE, passage, 'Le Verbe', [], textOf);
    expect(chapterNotes(getAppData().annotations, SOURCE)).toHaveLength(1);

    const erase = rangesBetween({ verse: 2, word: 0 }, { verse: 2, word: 0 }, words);
    applyVerseStyle(SOURCE, erase, { kind: 'erase' }, textOf);

    expect(chapterNotes(getAppData().annotations, SOURCE)).toHaveLength(0);
    expect(stylesOf(2).highlight[0]).toBeNull();
    // Le surlignage hors de la sélection effacée reste en place.
    expect(stylesOf(2).highlight[4]).toBe('sanguine');
    expect(stylesOf(1).highlight[22]).toBe('sanguine');
  });
});

describe('notes', () => {
  it('regroupe une note sur plusieurs versets, la modifie et la supprime', () => {
    const passage = rangesBetween({ verse: 1, word: 4 }, { verse: 2, word: 0 }, words);
    saveVerseNote(SOURCE, passage, 'Première version', [], textOf);
    let notes = chapterNotes(getAppData().annotations, SOURCE);
    expect(notes).toHaveLength(1);
    expect(notes[0].lastVerse).toBe(2);
    expect(notes[0].text).toBe('Première version');

    saveVerseNote(SOURCE, passage, 'Seconde version', notes[0].annotationIds, textOf);
    notes = chapterNotes(getAppData().annotations, SOURCE);
    expect(notes).toHaveLength(1);
    expect(notes[0].text).toBe('Seconde version');
    expect(wordsCovering(notes[0].ranges, words)).toEqual({
      from: { verse: 1, word: 4 },
      to: { verse: 2, word: 0 }
    });

    saveVerseNote(SOURCE, passage, '   ', notes[0].annotationIds, textOf);
    expect(chapterNotes(getAppData().annotations, SOURCE)).toHaveLength(0);
  });

  it('garde le surlignage d’une ancienne note (note + couleur) quand on modifie son verset', () => {
    const now = new Date().toISOString();
    setAppData((prev) => ({
      ...prev,
      annotations: [
        {
          id: 'legacy',
          createdAt: now,
          updatedAt: now,
          target: { kind: 'verse', sourceId: SOURCE, blockIndex: 1, start: 3, end: 15, quote: 'commencement' },
          style: { highlight: 'bleu-encre', underline: false },
          note: 'Ancienne note'
        }
      ]
    }));
    const first = rangesBetween({ verse: 1, word: 0 }, { verse: 1, word: 0 }, words);
    applyVerseStyle(SOURCE, first, { kind: 'underline', on: true }, textOf);

    const styles = stylesOf(1);
    expect(styles.highlight[3]).toBe('bleu-encre');
    expect(styles.underline[0]).toBe(true);
    const notes = chapterNotes(getAppData().annotations, SOURCE);
    expect(notes.map((n) => n.text)).toEqual(['Ancienne note']);
    expect(verseAnnotations(1).find((a) => a.id === 'legacy')?.style.highlight).toBeNull();
  });
});
