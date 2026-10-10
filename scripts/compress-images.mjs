// Compresse les portraits des figures : PNG 1792×2688 (~4 Mo) → WebP
// 800×1200 avec transparence (~100 Ko). L'affichage le plus grand (fiche
// figure) fait ~350px de large, soit ~1050px sur un écran 3x.
//
// Usage : node scripts/compress-images.mjs [dossier…]
// Par défaut : src/assets/images. Chaque .png est remplacé par un .webp du
// même nom ; pensez à mettre à jour les imports (.png → .webp).
import { readdir, stat, unlink } from 'node:fs/promises';
import { join, extname } from 'node:path';
import sharp from 'sharp';

const MAX_WIDTH = 800;
const MAX_HEIGHT = 1200;
const QUALITY = 80;

async function* pngFiles(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* pngFiles(path);
    else if (extname(entry.name).toLowerCase() === '.png') yield path;
  }
}

const dirs = process.argv.slice(2);
let before = 0;
let after = 0;

for (const dir of dirs.length ? dirs : ['src/assets/images']) {
  for await (const file of pngFiles(dir)) {
    const out = file.slice(0, -extname(file).length) + '.webp';
    await sharp(file)
      .resize({ width: MAX_WIDTH, height: MAX_HEIGHT, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: QUALITY, alphaQuality: 90, effort: 6 })
      .toFile(out);
    const [a, b] = [(await stat(file)).size, (await stat(out)).size];
    before += a;
    after += b;
    await unlink(file);
    console.log(`${file} : ${(a / 1e6).toFixed(1)} Mo → ${(b / 1e3).toFixed(0)} Ko`);
  }
}

console.log(`\nTotal : ${(before / 1e6).toFixed(1)} Mo → ${(after / 1e6).toFixed(1)} Mo`);
