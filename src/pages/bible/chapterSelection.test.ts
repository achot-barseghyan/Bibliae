import { describe, expect, it } from 'vitest';
import { chapterRange, formatRanges, paintRange } from './chapterSelection';

describe('formatRanges', () => {
  it('fusionne les numéros consécutifs', () => {
    expect(formatRanges([1, 2, 3, 5, 7, 8, 9])).toBe('1–3, 5, 7–9');
  });

  it('trie et dédoublonne', () => {
    expect(formatRanges([24, 21, 18, 19, 20, 19])).toBe('18–21, 24');
  });

  it('gère un seul chapitre et la sélection vide', () => {
    expect(formatRanges([12])).toBe('12');
    expect(formatRanges([])).toBe('');
  });
});

describe('paintRange', () => {
  it('ajoute la plage dans l’ordre des chapitres, quel que soit le sens', () => {
    expect([...paintRange(new Set(), 15, 4, true)].sort((a, b) => a - b)).toEqual([4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
  });

  it('chapterRange couvre 1 → k', () => {
    expect([...chapterRange(4)]).toEqual([1, 2, 3, 4]);
    expect(chapterRange(0).size).toBe(0);
  });

  it('repart de la base : revenir en arrière réduit la plage', () => {
    const base = new Set([1]);
    paintRange(base, 3, 8, true);
    expect([...paintRange(base, 3, 5, true)]).toEqual([1, 3, 4, 5]);
    expect([...base]).toEqual([1]);
  });

  it('retire la plage quand le geste part d’un chapitre sélectionné', () => {
    expect([...paintRange(new Set([1, 2, 3, 4, 5]), 2, 4, false)]).toEqual([1, 5]);
  });

  it('un tap (A = B) bascule le chapitre', () => {
    expect([...paintRange(new Set([2]), 7, 7, true)]).toEqual([2, 7]);
    expect([...paintRange(new Set([2, 7]), 7, 7, false)]).toEqual([2]);
  });
});
