// Deuxième passe, ciblée : dans les Psaumes, corrige les invocations
// directes à Dieu ("Yahweh" devenu "le Seigneur" partout, mais l'article
// ne convient pas quand on s'adresse directement à lui : "Lève-toi,
// Seigneur" et non "Lève-toi, le Seigneur"). Chaque verset a été relu
// individuellement (voir la conversation) avant d'être listé ici.
//
// Corrige aussi, dans toute la Bible (pas seulement les Psaumes), la
// tournure "en le Seigneur" (issue de "en Yahweh"), qui n'est pas du
// français correct : "dans le Seigneur".
//
// Script ponctuel, à supprimer une fois appliqué.
// Usage : node scripts/polish-psaumes-vocatif.mjs

import { readFileSync, writeFileSync } from 'node:fs';

const SOURCE = 'public/data/bible_crampon_73.json';
const data = JSON.parse(readFileSync(SOURCE, 'utf8'));

// [chapitre, verset] : versets des Psaumes où "le/Le Seigneur" est en
// réalité une invocation directe et doit devenir "Seigneur" (sans article).
const VOCATIVE_VERSES = [
  ['3', '4'], ['5', '2'], ['6', '3'], ['6', '5'], ['7', '7'], ['9', '14'],
  ['10', '1'], ['12', '8'], ['13', '2'], ['13', '4'], ['17', '13'],
  ['25', '4'], ['25', '6'], ['25', '11'], ['26', '2'], ['30', '2'],
  ['30', '11'], ['31', '10'], ['35', '10'], ['35', '24'], ['38', '16'],
  ['39', '5'], ['39', '13'], ['40', '6'], ['40', '12'], ['40', '14'],
  ['41', '5'], ['41', '11'], ['59', '6'], ['59', '9'], ['69', '17'],
  ['79', '5'], ['84', '9'], ['85', '2'], ['88', '14'], ['88', '15'],
  ['89', '6'], ['89', '47'], ['89', '52'], ['92', '5'], ['92', '6'],
  ['92', '10'], ['94', '1'], ['94', '3'], ['94', '12'], ['97', '9'],
  ['102', '13'], ['106', '4'], ['106', '47'], ['108', '4'], ['109', '26'],
  ['115', '1'], ['116', '16'], ['119', '33'], ['119', '41'], ['119', '55'],
  ['119', '57'], ['119', '75'], ['119', '89'], ['119', '108'],
  ['119', '137'], ['119', '145'], ['119', '151'], ['119', '166'],
  ['119', '174'], ['123', '3'], ['130', '3'], ['132', '8'], ['137', '7'],
  ['138', '4'], ['139', '21'], ['142', '6'], ['143', '7'], ['143', '9'],
  ['143', '11'], ['145', '10']
];

const ps = data.find((b) => b.nom === 'Psaumes');
let vocativeFixed = 0;

for (const [ch, v] of VOCATIVE_VERSES) {
  const before = ps.chapitres[ch]?.[v];
  if (before === undefined) {
    throw new Error(`Verset introuvable : Psaumes ${ch}:${v}`);
  }
  if (!/\b[Ll]e Seigneur\b/.test(before)) {
    throw new Error(`"le Seigneur" absent de Psaumes ${ch}:${v} : ${before}`);
  }
  const after = before.replace(/\b[Ll]e Seigneur\b/, 'Seigneur');
  ps.chapitres[ch][v] = after;
  vocativeFixed += 1;
}

// Cas particulier : accent circonflexe manquant sur "Ô" dans la source
// (même bug que le "A" sans accent grave déjà corrigé), en plus du
// vocatif : "O le Seigneur, donne le salut !" -> "Ô Seigneur, donne le
// salut !"
const before25 = ps.chapitres['118']['25'];
if (before25 !== 'O le Seigneur, donne le salut !') {
  throw new Error(`Texte inattendu pour Psaumes 118:25 : ${before25}`);
}
ps.chapitres['118']['25'] = 'Ô Seigneur, donne le salut !';

// Correction globale (tous livres) : "en le Seigneur" (issu de "en
// Yahweh") n'est pas du français correct -> "dans le Seigneur".
let enLeFixed = 0;
for (const book of data) {
  for (const chapter of Object.values(book.chapitres)) {
    for (const verseNum of Object.keys(chapter)) {
      if (chapter[verseNum].includes('en le Seigneur')) {
        chapter[verseNum] = chapter[verseNum].split('en le Seigneur').join('dans le Seigneur');
        enLeFixed += 1;
      }
    }
  }
}

const output = JSON.stringify(data);
JSON.parse(output); // valide avant d'écrire
writeFileSync(SOURCE, output, 'utf8');

console.log(`Versets des Psaumes corrigés (vocatif) : ${vocativeFixed} + 1 (accent Ô)`);
console.log(`Occurrences "en le Seigneur" -> "dans le Seigneur" (tous livres) : ${enLeFixed}`);
