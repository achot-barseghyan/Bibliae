// Remplace "Yahweh" par "Seigneur" (avec l'article adapté : le/du/au/ô,
// ou sans article au vocatif) dans le texte biblique. Script ponctuel, à
// supprimer une fois appliqué. Usage : node scripts/replace-yahweh.mjs
//
// Règle par défaut (tous livres) : "Yahweh" -> "le Seigneur" (sujet,
// complément, formule "dit le Seigneur"...), avec majuscule si "Yahweh"
// ouvrait la phrase/le verset ou une citation.
//
// Cas particuliers, dans cet ordre :
//   1. Noms composés ("Yahweh-Yiréh"...)           -> "Seigneur-..."
//   2. "Seigneur Yahweh" (Adonaï YHWH)              -> "Seigneur Dieu"
//   3. Contractions "de/à/ô Yahweh"                 -> "du/au/ô Seigneur"
//   4. Dans les Psaumes seulement : un verset qui COMMENCE par "Yahweh"
//      ET est immédiatement suivi d'une ponctuation (, ; : ! ?) est une
//      invocation directe ("Yahweh, écoute ma voix" = vocatif) : pas de
//      "le" devant. Vérifié pour ne pas confondre avec les versets
//      déclaratifs ("Yahweh est mon berger", "Yahweh a entendu...") qui,
//      eux, commencent aussi par Yahweh mais sans ponctuation immédiate.

import { readFileSync, writeFileSync, copyFileSync, existsSync, mkdirSync } from 'node:fs';

const SOURCE = 'public/data/bible_crampon_73.json';
const BACKUP = 'backups/bible_crampon_73.pre-yahweh.json';

mkdirSync('backups', { recursive: true });
if (!existsSync(BACKUP)) copyFileSync(SOURCE, BACKUP);

const data = JSON.parse(readFileSync(existsSync(BACKUP) ? BACKUP : SOURCE, 'utf8'));

let totalBefore = 0;
let totalAfter = 0;
let vocativeCount = 0;

function transformVerse(text, { vocativeAware }) {
  totalBefore += (text.match(/Yahweh/g) || []).length;

  // 1. Noms composés (lieux/autels) : ce sont des noms propres, on ne
  //    touche pas à l'article.
  text = text.replace(/Yahweh-([A-Za-zÀ-ÿ-]+)/g, 'Seigneur-$1');

  // 2. "Seigneur Yahweh" (Adonaï YHWH) : éviter "Seigneur Seigneur".
  text = text.replace(/\bSeigneur Yahweh\b/g, 'Seigneur Dieu');

  // 3. Contractions de préposition (avant la règle par défaut, pour ne
  //    pas produire "de le Seigneur" / "à le Seigneur"). Le "A" sans
  //    accent est une graphie présente telle quelle dans la source.
  // Note : \b ne détecte pas correctement une limite de mot juste avant un
  // caractère accentué (à, À, ô, Ô) en JS — on utilise donc un lookbehind
  // explicite pour ces cas au lieu de \b.
  const NOT_WORD_BEFORE = '(?<![\\wÀ-ÿ])';
  text = text.replace(/\bDe Yahweh\b/g, 'Du Seigneur');
  text = text.replace(/\bde Yahweh\b/g, 'du Seigneur');
  text = text.replace(/\bA Yahweh\b/g, 'Au Seigneur');
  text = text.replace(new RegExp(`${NOT_WORD_BEFORE}À Yahweh\\b`, 'g'), 'Au Seigneur');
  text = text.replace(new RegExp(`${NOT_WORD_BEFORE}à Yahweh\\b`, 'g'), 'au Seigneur');
  text = text.replace(new RegExp(`${NOT_WORD_BEFORE}Ô Yahweh\\b`, 'g'), 'Ô Seigneur');
  text = text.replace(new RegExp(`${NOT_WORD_BEFORE}ô Yahweh\\b`, 'g'), 'ô Seigneur');

  // 4. Vocatif verset-initial (Psaumes uniquement, voir en-tête).
  if (vocativeAware && /^Yahweh[,;:!?]/.test(text)) {
    text = text.replace(/^Yahweh(?=[,;:!?])/, 'Seigneur');
    vocativeCount += 1;
  }

  // 5. Par défaut : "le Seigneur", avec majuscule si "Yahweh" ouvrait la
  //    phrase, le verset ou une citation.
  text = text.replace(/(^|":"|[.!?;:]\s+|["«]\s*)Yahweh\b/g, (_m, prefix) => `${prefix}Le Seigneur`);
  text = text.replace(/\bYahweh\b/g, 'le Seigneur');

  totalAfter += (text.match(/Yahweh/g) || []).length;
  return text;
}

for (const book of data) {
  const vocativeAware = book.nom === 'Psaumes';
  for (const chapter of Object.values(book.chapitres)) {
    for (const verseNum of Object.keys(chapter)) {
      chapter[verseNum] = transformVerse(chapter[verseNum], { vocativeAware });
    }
  }
}

const output = JSON.stringify(data);
JSON.parse(output); // valide avant d'écrire
writeFileSync(SOURCE, output, 'utf8');

console.log(`Occurrences de "Yahweh" avant : ${totalBefore}`);
console.log(`Occurrences de "Yahweh" restantes : ${totalAfter}`);
console.log(`Versets au vocatif adapté (Psaumes) : ${vocativeCount}`);
console.log(`Sauvegarde de l'original : ${BACKUP}`);
