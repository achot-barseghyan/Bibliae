// Structure des 73 livres du canon catholique (métadonnées seulement :
// noms, découpage en catégories, nombre de chapitres). Le texte biblique
// lui-même n'est pas inclus ici.

export type Testament = 'ancien' | 'nouveau';

export type CategoryKey =
  | 'pentateuque'
  | 'historiques'
  | 'sapientiaux'
  | 'prophetes'
  | 'evangiles'
  | 'actes'
  | 'epitres'
  | 'apocalypse';

export interface Category {
  key: CategoryKey;
  testament: Testament;
  label: string;
  railLabel: string;
}

export interface Book {
  id: string;
  abbreviation: string;
  name: string;
  category: CategoryKey;
  chapters: number;
}

export const CATEGORIES: Category[] = [
  { key: 'pentateuque', testament: 'ancien', label: 'Pentateuque', railLabel: 'Pent.' },
  { key: 'historiques', testament: 'ancien', label: 'Historiques', railLabel: 'Hist.' },
  { key: 'sapientiaux', testament: 'ancien', label: 'Sapientiaux', railLabel: 'Sap.' },
  { key: 'prophetes', testament: 'ancien', label: 'Prophètes', railLabel: 'Proph.' },
  { key: 'evangiles', testament: 'nouveau', label: 'Évangiles', railLabel: 'Évang.' },
  { key: 'actes', testament: 'nouveau', label: 'Actes', railLabel: 'Actes' },
  { key: 'epitres', testament: 'nouveau', label: 'Épîtres', railLabel: 'Épîtres' },
  { key: 'apocalypse', testament: 'nouveau', label: 'Apocalypse', railLabel: 'Apoc.' }
];

export const BOOKS: Book[] = [
  // --- Pentateuque ---
  { id: 'gn', abbreviation: 'Gn', name: 'Genèse', category: 'pentateuque', chapters: 50 },
  { id: 'ex', abbreviation: 'Ex', name: 'Exode', category: 'pentateuque', chapters: 40 },
  { id: 'lv', abbreviation: 'Lv', name: 'Lévitique', category: 'pentateuque', chapters: 27 },
  { id: 'nb', abbreviation: 'Nb', name: 'Nombres', category: 'pentateuque', chapters: 36 },
  { id: 'dt', abbreviation: 'Dt', name: 'Deutéronome', category: 'pentateuque', chapters: 34 },

  // --- Historiques ---
  { id: 'jos', abbreviation: 'Jos', name: 'Josué', category: 'historiques', chapters: 24 },
  { id: 'jg', abbreviation: 'Jg', name: 'Juges', category: 'historiques', chapters: 21 },
  { id: 'rt', abbreviation: 'Rt', name: 'Ruth', category: 'historiques', chapters: 4 },
  { id: '1s', abbreviation: '1S', name: '1 Samuel', category: 'historiques', chapters: 31 },
  { id: '2s', abbreviation: '2S', name: '2 Samuel', category: 'historiques', chapters: 24 },
  { id: '1r', abbreviation: '1R', name: '1 Rois', category: 'historiques', chapters: 22 },
  { id: '2r', abbreviation: '2R', name: '2 Rois', category: 'historiques', chapters: 25 },
  { id: '1ch', abbreviation: '1Ch', name: '1 Chroniques', category: 'historiques', chapters: 29 },
  { id: '2ch', abbreviation: '2Ch', name: '2 Chroniques', category: 'historiques', chapters: 36 },
  { id: 'esd', abbreviation: 'Esd', name: 'Esdras', category: 'historiques', chapters: 10 },
  { id: 'ne', abbreviation: 'Né', name: 'Néhémie', category: 'historiques', chapters: 13 },
  { id: 'tb', abbreviation: 'Tb', name: 'Tobie', category: 'historiques', chapters: 14 },
  { id: 'jdt', abbreviation: 'Jdt', name: 'Judith', category: 'historiques', chapters: 16 },
  { id: 'est', abbreviation: 'Est', name: 'Esther', category: 'historiques', chapters: 10 },
  { id: '1m', abbreviation: '1M', name: '1 Maccabées', category: 'historiques', chapters: 16 },
  { id: '2m', abbreviation: '2M', name: '2 Maccabées', category: 'historiques', chapters: 15 },

  // --- Sapientiaux ---
  { id: 'jb', abbreviation: 'Jb', name: 'Job', category: 'sapientiaux', chapters: 42 },
  { id: 'ps', abbreviation: 'Ps', name: 'Psaumes', category: 'sapientiaux', chapters: 150 },
  { id: 'pr', abbreviation: 'Pr', name: 'Proverbes', category: 'sapientiaux', chapters: 31 },
  { id: 'qo', abbreviation: 'Qo', name: 'Ecclésiaste', category: 'sapientiaux', chapters: 12 },
  { id: 'ct', abbreviation: 'Ct', name: 'Cantique des Cantiques', category: 'sapientiaux', chapters: 8 },
  { id: 'sg', abbreviation: 'Sg', name: 'Sagesse', category: 'sapientiaux', chapters: 19 },
  { id: 'si', abbreviation: 'Si', name: 'Ecclésiastique (Siracide)', category: 'sapientiaux', chapters: 51 },

  // --- Prophètes ---
  { id: 'is', abbreviation: 'Is', name: 'Isaïe', category: 'prophetes', chapters: 66 },
  { id: 'jr', abbreviation: 'Jr', name: 'Jérémie', category: 'prophetes', chapters: 52 },
  { id: 'lm', abbreviation: 'Lm', name: 'Lamentations', category: 'prophetes', chapters: 5 },
  { id: 'ba', abbreviation: 'Ba', name: 'Baruch', category: 'prophetes', chapters: 6 },
  { id: 'ez', abbreviation: 'Éz', name: 'Ézéchiel', category: 'prophetes', chapters: 48 },
  { id: 'dn', abbreviation: 'Dn', name: 'Daniel', category: 'prophetes', chapters: 14 },
  { id: 'os', abbreviation: 'Os', name: 'Osée', category: 'prophetes', chapters: 14 },
  { id: 'jl', abbreviation: 'Jl', name: 'Joël', category: 'prophetes', chapters: 4 },
  { id: 'am', abbreviation: 'Am', name: 'Amos', category: 'prophetes', chapters: 9 },
  { id: 'ab', abbreviation: 'Ab', name: 'Abdias', category: 'prophetes', chapters: 1 },
  { id: 'jon', abbreviation: 'Jon', name: 'Jonas', category: 'prophetes', chapters: 4 },
  { id: 'mi', abbreviation: 'Mi', name: 'Michée', category: 'prophetes', chapters: 7 },
  { id: 'na', abbreviation: 'Na', name: 'Nahum', category: 'prophetes', chapters: 3 },
  { id: 'ha', abbreviation: 'Ha', name: 'Habacuc', category: 'prophetes', chapters: 3 },
  { id: 'so', abbreviation: 'So', name: 'Sophonie', category: 'prophetes', chapters: 3 },
  { id: 'ag', abbreviation: 'Ag', name: 'Aggée', category: 'prophetes', chapters: 2 },
  { id: 'za', abbreviation: 'Za', name: 'Zacharie', category: 'prophetes', chapters: 14 },
  { id: 'ml', abbreviation: 'Ml', name: 'Malachie', category: 'prophetes', chapters: 4 },

  // --- Évangiles ---
  { id: 'mt', abbreviation: 'Mt', name: 'Matthieu', category: 'evangiles', chapters: 28 },
  { id: 'mc', abbreviation: 'Mc', name: 'Marc', category: 'evangiles', chapters: 16 },
  { id: 'lc', abbreviation: 'Lc', name: 'Luc', category: 'evangiles', chapters: 24 },
  { id: 'jn', abbreviation: 'Jn', name: 'Jean', category: 'evangiles', chapters: 21 },

  // --- Actes ---
  { id: 'ac', abbreviation: 'Ac', name: 'Actes des Apôtres', category: 'actes', chapters: 28 },

  // --- Épîtres ---
  { id: 'rm', abbreviation: 'Rm', name: 'Romains', category: 'epitres', chapters: 16 },
  { id: '1co', abbreviation: '1Co', name: '1 Corinthiens', category: 'epitres', chapters: 16 },
  { id: '2co', abbreviation: '2Co', name: '2 Corinthiens', category: 'epitres', chapters: 13 },
  { id: 'ga', abbreviation: 'Ga', name: 'Galates', category: 'epitres', chapters: 6 },
  { id: 'ep', abbreviation: 'Ép', name: 'Éphésiens', category: 'epitres', chapters: 6 },
  { id: 'ph', abbreviation: 'Ph', name: 'Philippiens', category: 'epitres', chapters: 4 },
  { id: 'col', abbreviation: 'Col', name: 'Colossiens', category: 'epitres', chapters: 4 },
  { id: '1th', abbreviation: '1Th', name: '1 Thessaloniciens', category: 'epitres', chapters: 5 },
  { id: '2th', abbreviation: '2Th', name: '2 Thessaloniciens', category: 'epitres', chapters: 3 },
  { id: '1tm', abbreviation: '1Tm', name: '1 Timothée', category: 'epitres', chapters: 6 },
  { id: '2tm', abbreviation: '2Tm', name: '2 Timothée', category: 'epitres', chapters: 4 },
  { id: 'tt', abbreviation: 'Tt', name: 'Tite', category: 'epitres', chapters: 3 },
  { id: 'phm', abbreviation: 'Phm', name: 'Philémon', category: 'epitres', chapters: 1 },
  { id: 'he', abbreviation: 'Hé', name: 'Hébreux', category: 'epitres', chapters: 13 },
  { id: 'jc', abbreviation: 'Jc', name: 'Jacques', category: 'epitres', chapters: 5 },
  { id: '1p', abbreviation: '1P', name: '1 Pierre', category: 'epitres', chapters: 5 },
  { id: '2p', abbreviation: '2P', name: '2 Pierre', category: 'epitres', chapters: 3 },
  { id: '1jn', abbreviation: '1Jn', name: '1 Jean', category: 'epitres', chapters: 5 },
  { id: '2jn', abbreviation: '2Jn', name: '2 Jean', category: 'epitres', chapters: 1 },
  { id: '3jn', abbreviation: '3Jn', name: '3 Jean', category: 'epitres', chapters: 1 },
  { id: 'jude', abbreviation: 'Jude', name: 'Jude', category: 'epitres', chapters: 1 },

  // --- Apocalypse ---
  { id: 'ap', abbreviation: 'Ap', name: 'Apocalypse', category: 'apocalypse', chapters: 22 }
];

export function getCategory(key: CategoryKey): Category {
  const category = CATEGORIES.find((c) => c.key === key);
  if (!category) throw new Error(`Catégorie inconnue : ${key}`);
  return category;
}

export function getBook(id: string): Book | undefined {
  return BOOKS.find((b) => b.id === id.toLowerCase());
}

export function booksByTestament(testament: Testament): Book[] {
  const categoryKeys = new Set(
    CATEGORIES.filter((c) => c.testament === testament).map((c) => c.key)
  );
  return BOOKS.filter((b) => categoryKeys.has(b.category));
}

export function categoriesByTestament(testament: Testament): Category[] {
  return CATEGORIES.filter((c) => c.testament === testament);
}

export function booksInCategory(category: CategoryKey): Book[] {
  return BOOKS.filter((b) => b.category === category);
}
