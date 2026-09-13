import type { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { BOOKS } from '../data/bible';
import { getDatabase } from './sqlite';

const CREATE_LIVRES = `
  CREATE TABLE IF NOT EXISTS livres (
    id      INTEGER PRIMARY KEY,
    numero  INTEGER NOT NULL UNIQUE,
    nom     TEXT    NOT NULL
  );
`;

const CREATE_VERSETS = `
  CREATE TABLE IF NOT EXISTS versets (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    livre_id  INTEGER NOT NULL REFERENCES livres(id),
    chapitre  INTEGER NOT NULL,
    verset    INTEGER NOT NULL,
    texte     TEXT    NOT NULL,
    UNIQUE (livre_id, chapitre, verset)
  );
`;

const CREATE_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_versets_ref ON versets(livre_id, chapitre, verset);
`;

const CREATE_FTS = `
  CREATE VIRTUAL TABLE IF NOT EXISTS versets_fts USING fts5(
    texte,
    content='versets',
    content_rowid='id'
  );
`;

// Bible Crampon (1923, domaine public), seule traduction disponible tant
// qu'AELF n'autorise pas la réutilisation de son texte.
const BIBLE_DATA_URL = '/data/bible_crampon_73.json';

interface BibleBookJson {
  numero: number;
  nom: string;
  chapitres: Record<string, Record<string, string>>;
}

export interface Verse {
  number: number;
  text: string;
}

export interface VerseSearchResult {
  bookId: string;
  chapter: number;
  verse: number;
  text: string;
}

// Le JSON Crampon numérote ses 73 livres dans le même ordre que BOOKS
// (data/bible.ts), donc numero (1-based) et l'index du tableau coïncident.
function bookIdForNumero(numero: number): string | undefined {
  return BOOKS[numero - 1]?.id;
}

function numeroForBookId(bookId: string): number | undefined {
  const index = BOOKS.findIndex((b) => b.id === bookId.toLowerCase());
  return index === -1 ? undefined : index + 1;
}

async function seedIfEmpty(db: SQLiteDBConnection): Promise<void> {
  const countResult = await db.query('SELECT COUNT(*) AS count FROM versets;');
  const count = (countResult.values?.[0]?.count as number) ?? 0;
  if (count > 0) return;

  const response = await fetch(BIBLE_DATA_URL);
  if (!response.ok) return;
  const books = (await response.json()) as BibleBookJson[];
  if (!books.length) return;

  const insertLivre = 'INSERT INTO livres (id, numero, nom) VALUES (?, ?, ?);';
  await db.executeSet(
    books.map((book) => ({ statement: insertLivre, values: [book.numero, book.numero, book.nom] }))
  );

  const insertVerset = `
    INSERT INTO versets (livre_id, chapitre, verset, texte)
    VALUES (?, ?, ?, ?);
  `;

  const BATCH_SIZE = 500;
  let batch: { statement: string; values: unknown[] }[] = [];

  const flush = async () => {
    if (!batch.length) return;
    await db.executeSet(batch);
    batch = [];
  };

  for (const book of books) {
    for (const [chapitre, verses] of Object.entries(book.chapitres)) {
      for (const [verset, texte] of Object.entries(verses)) {
        batch.push({ statement: insertVerset, values: [book.numero, Number(chapitre), Number(verset), texte] });
        if (batch.length >= BATCH_SIZE) await flush();
      }
    }
  }
  await flush();

  if (ftsAvailable) {
    // Table FTS5 à contenu externe : on la peuple d'un coup après le
    // chargement en masse plutôt que via des triggers par ligne.
    await db.execute("INSERT INTO versets_fts(versets_fts) VALUES('rebuild');");
  }
}

// Le binaire sql.js utilisé par jeep-sqlite sur la plateforme web (voir
// public/assets/sql-wasm.wasm) est compilé sans le module FTS5 — seules les
// cibles natives (iOS/Android, SQLite du système) le supportent. On détecte
// la disponibilité une fois au démarrage et on bascule la recherche sur
// LIKE quand elle manque, plutôt que de planter au lancement sur le web.
let ftsAvailable = true;
let readyPromise: Promise<SQLiteDBConnection> | null = null;

async function initBibleDatabase(): Promise<SQLiteDBConnection> {
  const db = await getDatabase();
  await db.execute(CREATE_LIVRES);
  await db.execute(CREATE_VERSETS);
  await db.execute(CREATE_INDEX);
  try {
    await db.execute(CREATE_FTS);
  } catch (error) {
    ftsAvailable = false;
    console.warn('FTS5 indisponible sur cette plateforme, recherche en repli sur LIKE.', error);
  }
  await seedIfEmpty(db);
  return db;
}

function getReadyDatabase(): Promise<SQLiteDBConnection> {
  if (!readyPromise) {
    readyPromise = initBibleDatabase().catch((error) => {
      readyPromise = null;
      throw error;
    });
  }
  return readyPromise;
}

export async function fetchChapterVerses(bookId: string, chapter: number): Promise<Verse[]> {
  const numero = numeroForBookId(bookId);
  if (numero === undefined) return [];

  const db = await getReadyDatabase();
  const result = await db.query(
    `SELECT v.verset AS verset, v.texte AS texte
     FROM versets v
     JOIN livres l ON l.id = v.livre_id
     WHERE l.numero = ? AND v.chapitre = ?
     ORDER BY v.verset;`,
    [numero, chapter]
  );
  return (result.values ?? []).map((row) => ({
    number: row.verset as number,
    text: row.texte as string
  }));
}

const SEARCH_LIMIT = 40;

interface SearchRow {
  numero: number;
  chapitre: number;
  verset: number;
  texte: string;
}

function rowsToSearchResults(rows: SearchRow[]): VerseSearchResult[] {
  return rows
    .map((row) => {
      const bookId = bookIdForNumero(row.numero);
      if (!bookId) return null;
      return { bookId, chapter: row.chapitre, verse: row.verset, text: row.texte };
    })
    .filter((r): r is VerseSearchResult => r !== null);
}

export async function searchVerses(query: string): Promise<VerseSearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const db = await getReadyDatabase();

  if (ftsAvailable) {
    // Requête en phrase FTS5 : les guillemets internes sont doublés pour
    // rester dans une phrase littérale, ce qui évite toute erreur de syntaxe
    // MATCH côté utilisateur.
    const ftsPhrase = `"${trimmed.replace(/"/g, '""')}"`;
    const result = await db.query(
      `SELECT l.numero AS numero, v.chapitre AS chapitre, v.verset AS verset, v.texte AS texte
       FROM versets_fts f
       JOIN versets v ON v.id = f.rowid
       JOIN livres l ON l.id = v.livre_id
       WHERE f.texte MATCH ?
       ORDER BY l.numero, v.chapitre, v.verset
       LIMIT ?;`,
      [ftsPhrase, SEARCH_LIMIT]
    );
    return rowsToSearchResults((result.values ?? []) as SearchRow[]);
  }

  const result = await db.query(
    `SELECT l.numero AS numero, v.chapitre AS chapitre, v.verset AS verset, v.texte AS texte
     FROM versets v
     JOIN livres l ON l.id = v.livre_id
     WHERE v.texte LIKE ?
     ORDER BY l.numero, v.chapitre, v.verset
     LIMIT ?;`,
    [`%${trimmed}%`, SEARCH_LIMIT]
  );
  return rowsToSearchResults((result.values ?? []) as SearchRow[]);
}
