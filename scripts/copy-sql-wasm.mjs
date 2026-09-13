// Copies the sql.js wasm binary that jeep-sqlite needs to run SQLite in the
// browser (web build / PWA). Native iOS/Android builds use real SQLite and
// never touch this file, but it must be reachable at /assets/sql-wasm.wasm
// for the web platform to work offline.
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
// npm may or may not hoist sql.js to the root node_modules depending on the
// dependency graph, so check jeep-sqlite's own nested copy as a fallback.
const candidates = [
  join(rootDir, 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm'),
  join(rootDir, 'node_modules', 'jeep-sqlite', 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm')
];
const source = candidates.find((path) => existsSync(path));
const targetDir = join(rootDir, 'public', 'assets');
const target = join(targetDir, 'sql-wasm.wasm');

if (!source) {
  console.warn('[copy-sql-wasm] sql.js wasm file not found, skipping. Tried:', candidates);
  process.exit(0);
}

mkdirSync(targetDir, { recursive: true });
copyFileSync(source, target);
console.log('[copy-sql-wasm] copied sql-wasm.wasm to public/assets/');
