import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { BOOKS, getBook } from '../data/bible';
import { JSON_BOOK_ORDER, bookIdForNumero, numeroForBookId } from './bibleBookOrder';

interface BibleBookJson {
  numero: number;
  nom: string;
  chapitres: Record<string, unknown>;
}

const json = JSON.parse(readFileSync('public/data/bible_crampon_73.json', 'utf8')) as BibleBookJson[];

/** « 1 Machabées » / « 1 Maccabées », « Ézéchiel » / « Ezéchiel »... */
const normalize = (name: string) =>
  name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace('machabees', 'maccabees');

describe('ordre des livres du JSON Crampon', () => {
  it('couvre les 73 livres, chacun une fois', () => {
    expect(JSON_BOOK_ORDER).toHaveLength(BOOKS.length);
    expect(new Set(JSON_BOOK_ORDER).size).toBe(BOOKS.length);
  });

  it('associe chaque livre du JSON au livre de même nom', () => {
    for (const book of json) {
      const appBook = getBook(bookIdForNumero(book.numero) ?? '');
      expect(appBook, `numéro ${book.numero} (${book.nom})`).toBeDefined();
      // « Actes » / « Actes des Apôtres » : l'un des deux noms commence par l'autre.
      const [app, crampon] = [normalize(appBook!.name), normalize(book.nom)];
      expect(app.startsWith(crampon) || crampon.startsWith(app), `${book.nom} → ${appBook!.name}`).toBe(true);
    }
  });

  it('retrouve les Psaumes et leurs 150 chapitres', () => {
    const psalms = json.find((b) => b.numero === numeroForBookId('ps'));
    expect(psalms?.nom).toBe('Psaumes');
    expect(Object.keys(psalms?.chapitres ?? {})).toHaveLength(150);
  });

  it('est réciproque', () => {
    for (const id of JSON_BOOK_ORDER) expect(bookIdForNumero(numeroForBookId(id)!)).toBe(id);
  });
});
