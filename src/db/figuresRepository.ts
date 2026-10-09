import { Capacitor } from '@capacitor/core';
import type { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { figures as seedFigures, type Figure } from '../data/figures';
import { getDatabase } from './sqlite';

const CREATE_TABLE = `
  CREATE TABLE IF NOT EXISTS figures (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    original_name TEXT NOT NULL,
    testament TEXT NOT NULL,
    genre TEXT NOT NULL,
    role TEXT NOT NULL,
    epoque TEXT NOT NULL,
    date TEXT NOT NULL,
    books TEXT NOT NULL,
    mentions INTEGER NOT NULL,
    image TEXT NOT NULL
  );
`;

interface FigureRow {
  id: string;
  name: string;
  original_name: string;
  testament: string;
  genre: string;
  role: string;
  epoque: string;
  date: string;
  books: string;
  mentions: number;
  image: string;
}

function rowToFigure(row: FigureRow): Figure {
  return {
    id: row.id,
    name: row.name,
    originalName: row.original_name,
    testament: row.testament as Figure['testament'],
    genre: row.genre as Figure['genre'],
    role: row.role as Figure['role'],
    epoque: row.epoque as Figure['epoque'],
    date: row.date,
    books: JSON.parse(row.books) as string[],
    mentions: row.mentions,
    image: row.image
  };
}

async function seedIfEmpty(db: SQLiteDBConnection): Promise<void> {
  const countResult = await db.query('SELECT COUNT(*) AS count FROM figures;');
  const count = (countResult.values?.[0]?.count as number) ?? 0;
  if (count > 0) return;

  const insertStatement = `
    INSERT INTO figures
      (id, name, original_name, testament, genre, role, epoque, date, books, mentions, image)
    VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `;
  const rows = seedFigures.map((figure) => [
    figure.id,
    figure.name,
    figure.originalName,
    figure.testament,
    figure.genre,
    figure.role,
    figure.epoque,
    figure.date,
    JSON.stringify(figure.books),
    figure.mentions,
    figure.image
  ]);

  await db.executeSet(rows.map((values) => ({ statement: insertStatement, values })));
}

let readyPromise: Promise<SQLiteDBConnection> | null = null;

async function initFiguresDatabase(): Promise<SQLiteDBConnection> {
  const db = await getDatabase();
  await db.execute(CREATE_TABLE);
  await seedIfEmpty(db);
  return db;
}

function getReadyDatabase(): Promise<SQLiteDBConnection> {
  if (!readyPromise) {
    readyPromise = initFiguresDatabase().catch((error) => {
      readyPromise = null;
      throw error;
    });
  }
  return readyPromise;
}

export async function fetchAllFigures(): Promise<Figure[]> {
  // Sur le web, SQLite est émulé sur le fil principal et gèle l'interface
  // à l'ouverture (voir db/bibleWebStore.ts) : les figures étant des
  // données fixes, on les sert directement, triées comme la requête.
  if (Capacitor.getPlatform() === 'web') {
    return [...seedFigures].sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  }
  const db = await getReadyDatabase();
  const result = await db.query('SELECT * FROM figures ORDER BY name;');
  return (result.values ?? []).map((row) => rowToFigure(row as FigureRow));
}
