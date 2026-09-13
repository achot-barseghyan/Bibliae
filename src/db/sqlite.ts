import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, type SQLiteDBConnection } from '@capacitor-community/sqlite';

const DB_NAME = 'bibliae';
const DB_VERSION = 1;

const sqlite = new SQLiteConnection(CapacitorSQLite);

let dbPromise: Promise<SQLiteDBConnection> | null = null;

async function ensureWebStore(): Promise<void> {
  await customElements.whenDefined('jeep-sqlite');
  let jeepEl = document.querySelector('jeep-sqlite');
  if (!jeepEl) {
    jeepEl = document.createElement('jeep-sqlite');
    document.body.appendChild(jeepEl);
    await customElements.whenDefined('jeep-sqlite');
  }
  await sqlite.initWebStore();
}

async function openConnection(): Promise<SQLiteDBConnection> {
  if (Capacitor.getPlatform() === 'web') {
    await ensureWebStore();
  }

  const isConsistent = (await sqlite.checkConnectionsConsistency()).result ?? false;
  const alreadyOpen = (await sqlite.isConnection(DB_NAME, false)).result ?? false;

  const db =
    isConsistent && alreadyOpen
      ? await sqlite.retrieveConnection(DB_NAME, false)
      : await sqlite.createConnection(DB_NAME, false, 'no-encryption', DB_VERSION, false);

  await db.open();
  return db;
}

/** Retourne la connexion SQLite partagée, en l'ouvrant si nécessaire (web ou natif). */
export function getDatabase(): Promise<SQLiteDBConnection> {
  if (!dbPromise) {
    dbPromise = openConnection().catch((error) => {
      dbPromise = null;
      throw error;
    });
  }
  return dbPromise;
}
