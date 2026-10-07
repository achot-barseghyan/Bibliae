import { getBook } from '../data/bible';
import { figures } from '../data/figures';
import { COUNCILS } from '../data/councils';
import { getPrayer } from '../data/prayers';
import { findIntercession } from '../data/saints';

export type BookmarkType =
  | 'verse'
  | 'chapter'
  | 'figure'
  | 'council'
  | 'prayer'
  | 'saint'
  | 'prier-home'
  | 'liturgie'
  | 'unknown';

export interface ResolvedBookmark {
  key: string;
  type: BookmarkType;
  title: string;
  subtitle?: string;
  path?: string;
}

function resolveVerse(key: string, rest: string): ResolvedBookmark {
  const [bookId, chapter, verseStart] = rest.split('-');
  const book = getBook(bookId);
  if (!book || !chapter || !verseStart) {
    return { key, type: 'unknown', title: key, subtitle: 'Ce favori ne peut plus être retrouvé' };
  }
  return {
    key,
    type: 'verse',
    title: `${book.name} ${chapter}, ${verseStart}`,
    subtitle: 'Verset',
    path: `/bible/${bookId}/${chapter}`
  };
}

function resolveChapter(key: string, rest: string): ResolvedBookmark {
  const [bookId, chapter] = rest.split('-');
  const book = getBook(bookId);
  if (!book || !chapter) {
    return { key, type: 'unknown', title: key, subtitle: 'Ce favori ne peut plus être retrouvé' };
  }
  return {
    key,
    type: 'chapter',
    title: `${book.name} ${chapter}`,
    subtitle: 'Chapitre',
    path: `/bible/${bookId}/${chapter}`
  };
}

function resolveFigure(key: string, id: string): ResolvedBookmark {
  const figure = figures.find((f) => f.id === id);
  if (!figure) {
    return { key, type: 'unknown', title: key, subtitle: 'Ce favori ne peut plus être retrouvé' };
  }
  return {
    key,
    type: 'figure',
    title: figure.name,
    subtitle: 'Figure',
    path: `/figures/${id}`
  };
}

function resolveCouncil(key: string, id: string): ResolvedBookmark {
  const council = COUNCILS.find((c) => c.id === id);
  if (!council) {
    return { key, type: 'unknown', title: key, subtitle: 'Ce favori ne peut plus être retrouvé' };
  }
  return {
    key,
    type: 'council',
    title: council.title,
    subtitle: council.display,
    path: `/credo/${id}`
  };
}

function resolvePrayer(key: string, id: string): ResolvedBookmark {
  const prayer = getPrayer(id);
  if (!prayer) {
    return { key, type: 'unknown', title: key, subtitle: 'Ce favori ne peut plus être retrouvé' };
  }
  return {
    key,
    type: 'prayer',
    title: prayer.title,
    subtitle: prayer.reference,
    path: `/prier/prieres/${id}`
  };
}

function resolveSaint(key: string, id: string): ResolvedBookmark {
  const item = findIntercession(id);
  if (!item) {
    return { key, type: 'unknown', title: key, subtitle: 'Ce favori ne peut plus être retrouvé' };
  }
  return {
    key,
    type: 'saint',
    title: item.situation,
    subtitle: item.saintName,
    path: `/prier/saints/${id}`
  };
}

function resolveLiturgie(key: string, date: string): ResolvedBookmark {
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return { key, type: 'unknown', title: key, subtitle: 'Ce favori ne peut plus être retrouvé' };
  }
  return {
    key,
    type: 'liturgie',
    title: parsed.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }),
    subtitle: 'Jour liturgique',
    path: `/liturgie/${date}`
  };
}

export function resolveBookmark(key: string): ResolvedBookmark {
  if (key === 'prier:home') {
    return {
      key,
      type: 'prier-home',
      title: 'Prier',
      subtitle: 'Prières et intercession des saints',
      path: '/prier'
    };
  }

  const separatorIndex = key.indexOf(':');
  if (separatorIndex === -1) {
    return { key, type: 'unknown', title: key, subtitle: 'Ce favori ne peut plus être retrouvé' };
  }
  const prefix = key.slice(0, separatorIndex);
  const rest = key.slice(separatorIndex + 1);

  switch (prefix) {
    case 'verse':
      return resolveVerse(key, rest);
    case 'chapter':
      return resolveChapter(key, rest);
    case 'figure':
      return resolveFigure(key, rest);
    case 'council':
      return resolveCouncil(key, rest);
    case 'prayer':
      return resolvePrayer(key, rest);
    case 'saint':
      return resolveSaint(key, rest);
    case 'liturgie':
      return resolveLiturgie(key, rest);
    default:
      return { key, type: 'unknown', title: key, subtitle: 'Ce favori ne peut plus être retrouvé' };
  }
}

export const BOOKMARK_TYPE_LABELS: Record<BookmarkType, string> = {
  verse: 'Versets',
  chapter: 'Chapitres',
  figure: 'Figures',
  council: 'Conciles',
  prayer: 'Prières',
  saint: 'Saints',
  'prier-home': 'Prier',
  liturgie: 'Jours liturgiques',
  unknown: 'Introuvables'
};

export const BOOKMARK_TYPE_ORDER: BookmarkType[] = [
  'verse',
  'chapter',
  'figure',
  'prayer',
  'saint',
  'council',
  'prier-home',
  'liturgie',
  'unknown'
];
