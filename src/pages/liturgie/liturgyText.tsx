import { Fragment, type ReactNode } from 'react';
import { BOOKS } from '../../data/bible';
import type { LiturgicalItem, OrdoData } from '../../services/liturgicalCalendar';

// Outils partagés par le jour liturgique (JourLiturgique) et la page de
// lecture d'une messe ou d'une heure (LiturgieLecture).

/** Couleur liturgique (AELF) → teinte des arcs, pastilles et points. */
export const LITURGICAL_COLORS: Record<string, string> = {
  vert: '#5E6A3A',
  blanc: '#C9BFA6',
  or: '#B5892E',
  violet: '#5B4A6B',
  rouge: '#8C2F28',
  rose: '#B08088',
  noir: '#23201A'
};

export const HOUR_LABELS: Record<string, string> = {
  matins: 'Matines',
  lauds: 'Laudes',
  prime: 'Prime',
  terce: 'Tierce',
  sext: 'Sexte',
  none: 'None',
  vespers: 'Vêpres',
  compline: 'Complies'
};

/** Décode les entités HTML (`&nbsp;`, `&eacute;`...) via un <textarea>
 * détaché : ne les exécute jamais, se contente de lire leur valeur texte. */
export function decodeEntities(text: string): string {
  const el = document.createElement('textarea');
  el.innerHTML = text;
  return el.value;
}

/** Aplati tout en une seule ligne (espaces au lieu des retours) : pour les
 * aperçus courts dans les listes, où un retour à la ligne serait gênant. */
export function stripHtml(html: string): string {
  return decodeEntities(
    html
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<\/p>\s*<p>/gi, ' ')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/** Comme `stripHtml`, mais garde les `<br>` comme de vrais retours à la
 * ligne (`\n`) — utile pour les lectures découpées verset par verset
 * (offices), où chaque `<br>` sépare un verset et pas juste une clause.
 * Important : le HTML source contient déjà de vrais retours à la ligne
 * (mise en forme du JSON, pas du contenu) juste après chaque `<br>` — il
 * faut les aplatir en espaces AVANT d'insérer les nôtres, sinon chaque
 * `<br>` produit deux retours à la ligne (un blanc) au lieu d'un seul. */
export function htmlToLines(html: string): string {
  const withRealBreaks = html.replace(/\s+/g, ' ').replace(/<br\s*\/?>\s*/gi, '\n');
  return decodeEntities(
    withRealBreaks
      .replace(/<[^>]+>/g, '')
      .replace(/ *\n */g, '\n')
      .trim()
  );
}

export function htmlParagraphs(html: string): string[] {
  return html
    .split(/<\/p>/gi)
    .map((p) => htmlToLines(p))
    .filter(Boolean);
}

/** Signes liturgiques mis en rouge comme dans le bréviaire : versets et
 * répons (l'AELF les écrit « V/ » et « R/ », parfois collés au texte, qu'on
 * remplace par ℣ et ℟), et les marques de médiante « * » et de flexe « + »
 * des psaumes. Ces deux dernières sont masquées aux lecteurs d'écran, qui
 * liraient sinon « astérisque » à chaque vers. */
const RUBRIC_PATTERN = /(V\/\s?|R\/\s?|℣\.?\s?|℟\.?\s?|[+*])/;

export function renderRubrics(text: string, keyPrefix: string): ReactNode[] {
  return text.split(RUBRIC_PATTERN).map((part, i) => {
    if (i % 2 === 0) return part;
    // « ℣. » / « ℟. » (calendrier traditionnel) : le point suit le signe.
    const symbol = part.trim().replace(/\.$/, '');
    if (symbol === 'V/' || symbol === '℣' || symbol === 'R/' || symbol === '℟') {
      return (
        <Fragment key={`${keyPrefix}-${i}`}>
          <span className="jour-rubric">{symbol === 'V/' || symbol === '℣' ? '℣' : '℟'}</span>{' '}
        </Fragment>
      );
    }
    return (
      <span key={`${keyPrefix}-${i}`} className="jour-rubric" aria-hidden="true">
        {symbol}
      </span>
    );
  });
}

/** Résout une référence AELF ("Lc 6, 39-42", "Ps 83 (84)") vers un chapitre
 * du lecteur biblique de l'app. Préfère le numéro entre parenthèses quand
 * il existe (numérotation hébraïque des psaumes, celle utilisée en interne). */
export function resolveReadingChapter(ref: string | null): { bookId: string; chapter: number } | null {
  if (!ref) return null;
  const main = ref.match(/^((?:\d\s)?[A-Za-zÀ-ÿ]+)\s+(\d+)/);
  if (!main) return null;
  const altMatch = ref.match(/\((\d+)\)/);
  const abbr = main[1].replace(/\s+/g, '').toLowerCase();
  const chapter = altMatch ? parseInt(altMatch[1], 10) : parseInt(main[2], 10);
  const book = BOOKS.find((b) => b.abbreviation.replace(/\s+/g, '').toLowerCase() === abbr);
  return book ? { bookId: book.id, chapter } : null;
}

/** Onglets de la messe : les parties du jour, plus l'oraison si la source
 * ne l'a pas déjà rangée parmi elles. */
export function massTabsOf(active: OrdoData): LiturgicalItem[] {
  const tabs = [...active.mass];
  if (active.collect && !tabs.some((t) => t.key === 'collect')) {
    tabs.push({ key: 'collect', label: 'Oraison', ref: null, text: active.collect });
  }
  return tabs;
}

/** « 27ème » / « 27e » → « 27ᵉ » ; « 1er » reste tel quel. */
export function formatOrdinals(text: string): string {
  return text.replace(/(\d+)(ème|eme|e)\b/g, '$1ᵉ');
}

export function longDateLabel(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
}
