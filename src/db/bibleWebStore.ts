// Bible en mémoire pour la plateforme web (navigateur, web app installée).
//
// Sur le web, SQLite est émulé par sql.js (jeep-sqlite) sur le fil
// principal : ouvrir la base recharge à chaque lancement tout le fichier
// depuis IndexedDB vers le WebAssembly, ce qui gèle l'interface plusieurs
// secondes sur téléphone. Le texte biblique étant en lecture seule (et sans
// FTS5 sur le web de toute façon), on le sert directement depuis le JSON
// Crampon, gardé en mémoire une fois chargé.

export interface WebVerse {
  numero: number;
  chapitre: number;
  verset: number;
  texte: string;
  /** Texte en minuscules, précalculé pour la recherche. */
  texteMinuscule: string;
}

interface BibleBookJson {
  numero: number;
  nom: string;
  chapitres: Record<string, Record<string, string>>;
}

interface WebBible {
  /** Versets dans l'ordre canonique (livre, chapitre, verset). */
  verses: WebVerse[];
  /** Clé `numero:chapitre` → versets du chapitre, dans l'ordre. */
  chapters: Map<string, WebVerse[]>;
}

let biblePromise: Promise<WebBible> | null = null;

async function loadBible(url: string): Promise<WebBible> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Bible indisponible (${response.status})`);
  const books = (await response.json()) as BibleBookJson[];

  const verses: WebVerse[] = [];
  const chapters = new Map<string, WebVerse[]>();
  for (const book of books) {
    for (const [chapitre, chapterVerses] of Object.entries(book.chapitres)) {
      const list: WebVerse[] = [];
      for (const [verset, texte] of Object.entries(chapterVerses)) {
        list.push({
          numero: book.numero,
          chapitre: Number(chapitre),
          verset: Number(verset),
          texte,
          texteMinuscule: texte.toLocaleLowerCase('fr')
        });
      }
      list.sort((a, b) => a.verset - b.verset);
      chapters.set(`${book.numero}:${chapitre}`, list);
      verses.push(...list);
    }
  }
  return { verses, chapters };
}

/** Charge la Bible une seule fois (les appels suivants réutilisent la même promesse). */
export function getWebBible(url: string): Promise<WebBible> {
  if (!biblePromise) {
    biblePromise = loadBible(url).catch((error) => {
      biblePromise = null;
      throw error;
    });
  }
  return biblePromise;
}

export async function webChapterVerses(url: string, numero: number, chapter: number): Promise<WebVerse[]> {
  const bible = await getWebBible(url);
  return bible.chapters.get(`${numero}:${chapter}`) ?? [];
}

/** Équivalent du repli `LIKE '%…%'` : sous-chaîne, sans tenir compte de la casse. */
export async function webSearchVerses(url: string, query: string, limit: number): Promise<WebVerse[]> {
  const bible = await getWebBible(url);
  const needle = query.toLocaleLowerCase('fr');
  const results: WebVerse[] = [];
  for (const verse of bible.verses) {
    if (verse.texteMinuscule.includes(needle)) {
      results.push(verse);
      if (results.length >= limit) break;
    }
  }
  return results;
}
