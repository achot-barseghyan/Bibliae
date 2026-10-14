import { BOOKS, type Book } from '../../data/bible';
import type { Figure } from '../../data/figures';
import { EVENTS, eventPath } from '../../data/events';
import { CHURCH_PRAYERS } from '../../data/prayers';
import { CALENDAR_SAINTS } from '../../data/saintsCalendrier';
import { INTERCESSION_CATEGORIES } from '../../data/saints';
import type { VerseSearchResult } from '../../db/versesRepository';

// Recherche de l'accueil (maquette « Accueil v2 ») : un index local sur les
// figures, événements, prières et saints, plus les versets (référence tapée
// ou recherche plein texte dans la base biblique).

export type ScopeKey = 'figures' | 'versets' | 'evenements' | 'prieres' | 'saints';

export interface SearchScopeDef {
  key: ScopeKey;
  label: string;
  glyph: string;
  /** Type affiché dans « Meilleur résultat · … ». */
  type: string;
  cta: string;
  /** Exemples tapés dans la barre de l'accueil quand la portée est choisie. */
  examples: string[];
}

export const SEARCH_SCOPES: SearchScopeDef[] = [
  { key: 'figures', label: 'Figures', glyph: '✦', type: 'Figure', cta: 'Ouvrir la fiche', examples: ['Une figure…', 'Abraham', 'Marie-Madeleine', 'Élie', 'Pierre'] },
  { key: 'versets', label: 'Versets', glyph: '❡', type: 'Verset', cta: 'Lire le passage', examples: ['Un verset…', 'Jn 3, 16', 'Ps 23', 'Mt 5, 3-12', '« Je suis le chemin »'] },
  { key: 'evenements', label: 'Événements', glyph: '◈', type: 'Événement', cta: 'Voir le récit', examples: ['Un événement…', 'La Création', "L'Exode", 'La Pentecôte'] },
  { key: 'prieres', label: 'Prières', glyph: '❧', type: 'Prière', cta: 'Prier', examples: ['Une prière…', 'Notre Père', 'Je vous salue Marie', 'Angélus', 'Magnificat'] },
  { key: 'saints', label: 'Saints', glyph: '✶', type: 'Saint', cta: 'Voir la vie du saint', examples: ['Un saint…', 'Thérèse de Lisieux', "François d'Assise", 'Jean-Marie Vianney', "Jeanne d'Arc"] }
];

export interface SearchItem {
  scope: number;
  title: string;
  sub: string;
  path: string;
  /** État de navigation (ex. saint à ouvrir sur la page Saints). */
  state?: unknown;
}

export interface SearchHit extends SearchItem {
  /** Position de la correspondance dans le titre (-1 : aucune). */
  ti: number;
  /** Position dans le sous-titre (-1 : aucune). */
  si: number;
  /** 0 début du titre, 1 début d'un mot, 2 dans le titre, 3 dans le sous-titre. */
  score: number;
  /** Longueur surlignée (la saisie normalisée). */
  n: number;
}

/** Minuscules sans accents ; même longueur que l'original (pour surligner). */
export function fold(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .normalize('NFC')
    .replace(/[’]/g, "'")
    .toLowerCase();
}

const SCOPE_INDEX: Record<ScopeKey, number> = {
  figures: 0,
  versets: 1,
  evenements: 2,
  prieres: 3,
  saints: 4
};

const MOIS_COURT = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

function figureItems(figures: Figure[]): SearchItem[] {
  return figures.map((f) => ({
    scope: SCOPE_INDEX.figures,
    title: f.name,
    sub: [f.role === 'Autre' ? null : f.role, f.epoque, f.date].filter(Boolean).join(' · '),
    path: `/figures/${f.id}`
  }));
}

const STATIC_ITEMS: SearchItem[] = [
  // Livres de la Bible : « Jean », « Psaumes », « 1 Co »…
  ...BOOKS.map((b) => ({
    scope: SCOPE_INDEX.versets,
    title: b.name,
    sub: `${b.abbreviation} · ${b.chapters} chapitre${b.chapters > 1 ? 's' : ''}`,
    path: `/bible/${b.id}`
  })),
  ...EVENTS.map((e) => ({
    scope: SCOPE_INDEX.evenements,
    title: e.title,
    sub: e.published ? e.refs : `${e.refs} · fiche à venir`,
    path: e.published ? eventPath(e.id) : '/compendium/evenements'
  })),
  ...CHURCH_PRAYERS.map((p) => ({
    scope: SCOPE_INDEX.prieres,
    title: p.title,
    sub: p.reference,
    path: `/prier/prieres/${p.id}`
  })),
  ...CALENDAR_SAINTS.map((s) => ({
    scope: SCOPE_INDEX.saints,
    title: s.name,
    sub: [s.qual, s.month !== null && s.day !== null ? `${s.day === 1 ? '1er' : s.day} ${MOIS_COURT[s.month]}` : null]
      .filter(Boolean)
      .join(' · '),
    path: '/saints',
    state: { saintId: s.id }
  })),
  // Intercession (Prier › Saints) : la situation, puis le saint à prier.
  ...INTERCESSION_CATEGORIES.flatMap((c) =>
    c.items.map((item) => ({
      scope: SCOPE_INDEX.saints,
      title: item.situation,
      sub: `${item.saintName} · ${c.label}`,
      path: `/prier/saints/${item.id}`
    }))
  )
];

export function buildIndex(figures: Figure[]): SearchItem[] {
  return [...figureItems(figures), ...STATIC_ITEMS];
}

function rank(item: SearchItem, nq: string): SearchHit | null {
  const nt = fold(item.title);
  const ti = nt.indexOf(nq);
  if (ti >= 0) {
    const score = ti === 0 ? 0 : /[\s'-]/.test(nt[ti - 1]) ? 1 : 2;
    return { ...item, ti, si: -1, score, n: nq.length };
  }
  const si = fold(item.sub).indexOf(nq);
  if (si < 0) return null;
  return { ...item, ti: -1, si, score: 3, n: nq.length };
}

export function searchIndex(index: SearchItem[], query: string, scope: number): SearchHit[] {
  const nq = fold(query.trim());
  if (!nq) return [];
  const hits: SearchHit[] = [];
  for (const item of index) {
    if (scope >= 0 && item.scope !== scope) continue;
    const hit = rank(item, nq);
    if (hit) hits.push(hit);
  }
  return hits.sort((a, b) => a.score - b.score || a.title.length - b.title.length);
}

// --- Versets -----------------------------------------------------------------

const BOOK_KEYS = new Map<string, Book>();
for (const book of BOOKS) {
  BOOK_KEYS.set(fold(book.abbreviation).replace(/\s+/g, ''), book);
  BOOK_KEYS.set(fold(book.name).replace(/\s+/g, ''), book);
}

/**
 * Référence tapée : « Jn 3, 16 », « Jean 3:16 », « Ps 23 », « Mt 5, 3-12 ».
 * Le livre se reconnaît par son abréviation ou son nom, sans tenir compte
 * des accents ni des espaces (« 1co », « 1 Co »).
 */
export function parseReference(query: string): SearchHit | null {
  const match = query.trim().match(/^(.+?)\s*(\d{1,3})(?:\s*[,:.]\s*(\d{1,3})(?:\s*-\s*(\d{1,3}))?|\s+(\d{1,3}))?$/);
  if (!match) return null;
  const book = BOOK_KEYS.get(fold(match[1]).replace(/\s+/g, ''));
  if (!book) return null;
  const chapter = Number(match[2]);
  if (chapter < 1 || chapter > book.chapters) return null;
  const from = match[3] ?? match[5];
  const to = match[4];
  const verses = from ? `, ${from}${to ? `-${to}` : ''}` : '';
  const title = `${book.abbreviation} ${chapter}${verses}`;
  return {
    scope: SCOPE_INDEX.versets,
    title,
    sub: from ? `${book.name}, chapitre ${chapter}` : `${book.name} · chapitre ${chapter}`,
    path: `/bible/${book.id}/${chapter}${from ? `?v=${from}${to ? `-${to}` : ''}` : ''}`,
    ti: 0,
    si: -1,
    score: 0,
    n: title.length
  };
}

/** Versets trouvés en plein texte : le surlignage porte sur l'extrait. */
export function verseHits(rows: VerseSearchResult[], query: string): SearchHit[] {
  const nq = fold(query.trim());
  return rows.map((row) => {
    const book = BOOKS.find((b) => b.id === row.bookId);
    const text = row.text.trim();
    let si = fold(text).indexOf(nq);
    // Extrait centré sur la correspondance, pour qu'elle reste visible.
    let sub = text;
    if (si > 40) {
      const start = text.lastIndexOf(' ', si - 30) + 1;
      sub = `…${text.slice(start)}`;
      si = si - start + 1;
    }
    return {
      scope: SCOPE_INDEX.versets,
      title: `${book?.abbreviation ?? row.bookId} ${row.chapter}, ${row.verse}`,
      sub,
      path: `/bible/${row.bookId}/${row.chapter}?v=${row.verse}`,
      ti: -1,
      si,
      score: 3,
      n: nq.length
    };
  });
}

/** Coupe un texte autour de la correspondance : [avant, surligné, après]. */
export function cut(text: string, at: number, n: number): [string, string, string] {
  if (at < 0) return [text, '', ''];
  return [text.slice(0, at), text.slice(at, at + n), text.slice(at + n)];
}
