import type { LiturgicalItem } from '../../services/liturgicalCalendar';
import { htmlParagraphs, htmlToLines } from './liturgyText';

// Découpe le texte d'une partie (messe ou heure) en blocs mis en forme
// comme dans le bréviaire (maquette Office et Messe v2) : antiennes en
// encadré, strophes avec numéros de versets et retrait suspendu, répons R/,
// dialogues V/ – R/, doxologie repliable après chaque psaume.

export interface Verse {
  /** Numéro de verset, vide si la source n'en donne pas. */
  n: string;
  lines: string[];
  /** Signe R/ ou V/ qui précède le numéro (« R/ 2 Ô Seigneur… »). */
  sign?: string;
}

export type LiturgyBlock =
  | { t: 'rub'; x: string }
  | { t: 'ant'; x: string }
  | { t: 'R'; x: string }
  | { t: 'vr'; a: string; b: string }
  | { t: 'st'; verses: Verse[] }
  | { t: 'p'; x: string }
  | { t: 'gl' };

/** Doxologie de la Liturgie des Heures, dite après chaque psaume et cantique. */
export const GLORIA_LINES = [
  'Gloire au Père, et au Fils, et au Saint-Esprit,',
  'au Dieu qui est, qui était et qui vient,',
  'pour les siècles des siècles.',
  'Amen.'
];

/** Conclusion des lectures de la messe et réponse de l'assemblée. */
const READING_CONCLUSIONS: Array<[RegExp, string, string]> = [
  [/^[–—-]?\s*Parole du Seigneur\.?$/i, 'Parole du Seigneur.', 'Nous rendons grâce à Dieu.'],
  [/^[–—-]?\s*Acclamons la Parole de Dieu\.?$/i, 'Acclamons la Parole de Dieu.', 'Louange à toi, Seigneur Jésus.']
];

const RESPONSE_PREFIX = /^(?:R\/|℟\.?)\s*/;
const VERSICLE_PREFIX = /^(?:V\/|℣\.?)\s*/;
// Le numéro peut suivre un signe R/ ou V/ (refrain en tête de strophe).
const VERSE_START = /^(?:(R\/|℟\.?|V\/|℣\.?)\s*)?(\d{1,3})\s+(.+)$/;

/** Espace fine insécable avant ; : ! ? » et après « : la ponctuation ne
 * part jamais seule en début de ligne. */
function frenchSpacing(text: string): string {
  return text.replace(/ ([;:!?»])/g, ' $1').replace(/« /g, '« ');
}

/** Une strophe (lignes sans ligne vide) → bloc. */
function stanzaBlock(lines: string[]): LiturgyBlock | null {
  if (lines.length === 0) return null;
  const single = lines.length === 1 ? lines[0] : null;

  if (single !== null) {
    for (const [pattern, a, b] of READING_CONCLUSIONS) {
      if (pattern.test(single)) return { t: 'vr', a, b };
    }
    if (RESPONSE_PREFIX.test(single)) return { t: 'R', x: single.replace(RESPONSE_PREFIX, '') };
  }
  if (lines.length === 2 && VERSICLE_PREFIX.test(lines[0]) && RESPONSE_PREFIX.test(lines[1])) {
    return { t: 'vr', a: lines[0].replace(VERSICLE_PREFIX, ''), b: lines[1].replace(RESPONSE_PREFIX, '') };
  }

  const verses: Verse[] = [];
  for (const line of lines) {
    const m = line.match(VERSE_START);
    if (m) {
      const verse: Verse = { n: String(parseInt(m[2], 10)), lines: [m[3]] };
      if (m[1]) verse.sign = m[1];
      verses.push(verse);
    } else if (verses.length > 0) {
      verses[verses.length - 1].lines.push(line);
    } else {
      verses.push({ n: '', lines: [line] });
    }
  }
  if (verses.length === 1 && verses[0].n === '' && verses[0].lines.length === 1) {
    return { t: 'p', x: verses[0].lines[0] };
  }
  return { t: 'st', verses };
}

/** HTML → blocs : un paragraphe `<p>` ou une ligne vide sépare les strophes. */
export function textBlocks(html: string): LiturgyBlock[] {
  return htmlParagraphs(html)
    .flatMap((p) => p.split(/\n{2,}/))
    .map((stanza) =>
      stanza
        .split('\n')
        .map((l) => frenchSpacing(l.trim()))
        .filter(Boolean)
    )
    .map(stanzaBlock)
    .filter((b): b is LiturgyBlock => b !== null);
}

/** Refrain du psaume de la messe : le premier paragraphe en gras du texte
 * CatéGPT, retiré du texte pour être repris entre les strophes. */
function splitPsalmRefrain(html: string): { refrain: string | null; rest: string } {
  const m = html.match(/^\s*<p>\s*<strong>([\s\S]*?)<\/strong>\s*<\/p>/i);
  if (!m) return { refrain: null, rest: html };
  return { refrain: oneLine(m[1]), rest: html.slice(m[0].length) };
}

function oneLine(html: string): string {
  return frenchSpacing(htmlToLines(html).replace(/\n+/g, ' ').trim());
}

/** Blocs d'une partie, avec antiennes, doxologie et refrains autour du texte. */
export function itemBlocks(item: LiturgicalItem, isMass: boolean): LiturgyBlock[] {
  if (isMass && item.key === 'psalm') {
    const { refrain: inline, rest } = splitPsalmRefrain(item.text);
    const refrain = inline ?? (item.refrain ? oneLine(item.refrain) : null);
    const body = textBlocks(rest);
    if (!refrain) return body;
    return [{ t: 'R', x: refrain }, ...body.flatMap((b): LiturgyBlock[] => [b, { t: 'R', x: refrain }])];
  }

  const body = textBlocks(item.text);
  const blocks: LiturgyBlock[] = [];
  if (isMass && item.acclamation) {
    blocks.push({ t: 'rub', x: 'Acclamation' }, { t: 'R', x: oneLine(item.acclamation) });
  }
  if (item.antienne) blocks.push({ t: 'ant', x: oneLine(item.antienne) });
  blocks.push(...body);
  if (item.antienne) {
    if (!/Gloire au Père/i.test(item.text)) blocks.push({ t: 'gl' });
    blocks.push({ t: 'ant', x: oneLine(item.antienne) });
  }
  return blocks;
}
