import { BOOKS } from '../data/bible';

// Correspondance entre le numéro d'un livre dans le JSON Crampon
// (public/data/bible_crampon_73.json, aussi utilisé comme clé `livres.numero`
// en SQLite) et l'identifiant du livre dans l'app.
//
// Le JSON suit l'ordre de BOOKS, sauf pour les deux livres des Maccabées :
// BOOKS les range parmi les livres historiques (après Esther), le JSON à la
// fin de l'Ancien Testament (après Malachie). Les apparier par simple
// position décalait de deux tous les livres de Job à Malachie (les Psaumes
// affichaient l'Ecclésiaste).
const MACCABEES = ['1m', '2m'];

export const JSON_BOOK_ORDER: string[] = (() => {
  const ids = BOOKS.map((b) => b.id).filter((id) => !MACCABEES.includes(id));
  ids.splice(ids.indexOf('ml') + 1, 0, ...MACCABEES);
  return ids;
})();

export function bookIdForNumero(numero: number): string | undefined {
  return JSON_BOOK_ORDER[numero - 1];
}

export function numeroForBookId(bookId: string): number | undefined {
  const index = JSON_BOOK_ORDER.indexOf(bookId.toLowerCase());
  return index === -1 ? undefined : index + 1;
}
