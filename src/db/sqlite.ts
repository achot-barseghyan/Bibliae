import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, type SQLiteDBConnection } from '@capacitor-community/sqlite';

const DB_NAME = 'bibliae';
const DB_VERSION = 1;

const sqlite = new SQLiteConnection(CapacitorSQLite);

let dbPromise: Promise<SQLiteDBConnection> | null = null;

async function openConnection(): Promise<SQLiteDBConnection> {
  // Le web n'utilise pas SQLite (émulé par sql.js sur le fil principal, il
  // gelait l'interface) : la Bible et les figures y sont servies en mémoire.
  if (Capacitor.getPlatform() === 'web') {
    throw new Error('SQLite n’est pas utilisé sur la plateforme web.');
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

/** Retourne la connexion SQLite partagée (iOS/Android), en l'ouvrant si nécessaire. */
export function getDatabase(): Promise<SQLiteDBConnection> {
  if (!dbPromise) {
    dbPromise = openConnection().catch((error) => {
      dbPromise = null;
      throw error;
    });
  }
  return dbPromise;
}
