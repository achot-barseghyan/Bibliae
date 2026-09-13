// Génère le contenu JSON de départ (remote-content/) à partir des données
// locales actuelles, en retirant les champs qui ne doivent jamais venir du
// distant (les images). Usage : node scripts/generate-remote-content.mjs
// À supprimer une fois le dépôt de contenu distant initialisé (script
// ponctuel, pas un outil d'export continu).

import { createServer } from 'vite';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url)) + '/..';
const outDir = path.join(root, 'remote-content');
mkdirSync(outDir, { recursive: true });

function writeJson(name, data) {
  writeFileSync(path.join(outDir, name), JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`  écrit : remote-content/${name}`);
}

function stripImage(item) {
  const { image, ...rest } = item;
  return rest;
}

async function main() {
  const server = await createServer({ root, server: { middlewareMode: true } });
  const load = (p) => server.ssrLoadModule(p);

  const { figures } = await load('/src/data/figures.ts');
  writeJson('figures.json', figures.map(stripImage));

  const { figureDetails } = await load('/src/data/figureDetails.ts');
  writeJson('figure-details.json', figureDetails);

  const { CHURCH_PRAYERS } = await load('/src/data/prayers.ts');
  writeJson('prayers.json', CHURCH_PRAYERS);

  const { INTERCESSION_CATEGORIES } = await load('/src/data/saints.ts');
  const saintsForExport = INTERCESSION_CATEGORIES.map((category) => ({
    key: category.key,
    items: category.items
  }));
  writeJson('saints.json', saintsForExport);

  const { MYSTERY_SETS, PRAYERS } = await load('/src/data/rosary.ts');
  writeJson('rosary.json', { mysterySets: MYSTERY_SETS, prayers: PRAYERS });

  const { COUNCILS } = await load('/src/data/councils.ts');
  writeJson('councils.json', COUNCILS);

  const { ACCUEIL_HERO, FEATURED_FIGURES } = await load('/src/data/accueil.ts');
  writeJson('accueil.json', {
    hero: ACCUEIL_HERO,
    featuredFigures: FEATURED_FIGURES.map(stripImage)
  });

  await server.close();
  console.log('\nTerminé. Contenu prêt dans remote-content/.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
