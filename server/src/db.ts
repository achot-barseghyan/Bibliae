import { readFile, readdir } from 'node:fs/promises';
import pg from 'pg';
import type { PoolQuestion } from './quiz.ts';

// Les colonnes DATE restent des chaînes AAAA-MM-JJ (pas de décalage de fuseau).
pg.types.setTypeParser(1082, (value) => value);

export const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: Number(process.env.PG_POOL_MAX ?? 10)
});

const SQL_DIR = new URL('../sql/', import.meta.url);
const QUESTIONS_FILE = new URL('../data/questions.json', import.meta.url);

/** Applique, dans l'ordre, les fichiers sql/NNN_*.sql pas encore passés. */
export async function migrate(): Promise<void> {
  const client = await db.connect();
  try {
    await client.query('SELECT pg_advisory_lock(727001)');
    await client.query(
      'CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())'
    );
    const done = new Set((await client.query<{ name: string }>('SELECT name FROM schema_migrations')).rows.map((r) => r.name));
    const files = (await readdir(SQL_DIR)).filter((f) => /^\d+_.*\.sql$/.test(f)).sort();
    for (const file of files) {
      if (done.has(file)) continue;
      const sql = await readFile(new URL(file, SQL_DIR), 'utf8');
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
    }
  } finally {
    await client.query('SELECT pg_advisory_unlock(727001)').catch(() => {});
    client.release();
  }
}

/**
 * Recopie data/questions.json dans la table questions (id = rang dans le
 * fichier). Les questions retirées du fichier sont désactivées, pas effacées :
 * les tirages passés les citent encore.
 */
export async function syncQuestions(): Promise<number> {
  const pool = JSON.parse(await readFile(QUESTIONS_FILE, 'utf8')) as PoolQuestion[];
  const ids = pool.map((_, i) => i);
  await db.query(
    `INSERT INTO questions (id, text, answer, ref, kind, active)
     SELECT * , true FROM unnest($1::int[], $2::text[], $3::text[], $4::text[], $5::text[])
     ON CONFLICT (id) DO UPDATE
       SET text = EXCLUDED.text, answer = EXCLUDED.answer, ref = EXCLUDED.ref, kind = EXCLUDED.kind, active = true`,
    [ids, pool.map((p) => p.q), pool.map((p) => p.a), pool.map((p) => p.ref), pool.map((p) => p.t)]
  );
  await db.query('UPDATE questions SET active = false WHERE id >= $1', [pool.length]);
  return pool.length;
}
