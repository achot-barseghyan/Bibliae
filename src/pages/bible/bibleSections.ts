import { CATEGORIES, type CategoryKey } from '../../data/bible';

// Habillage des catégories dans le monde Bible : numéro romain de section et
// fond du bandeau d'en-tête de chaque livre.

export const CATEGORY_GRADIENT: Record<CategoryKey, string> = {
  pentateuque: 'linear-gradient(165deg, #8A2A2F 0%, #4A1418 70%, #2A0C0E)',
  historiques: 'linear-gradient(165deg, #2E4A72, #141C30)',
  sapientiaux: 'linear-gradient(165deg, #5E6A3A, #2A3018)',
  prophetes: 'linear-gradient(165deg, #5A3A6E, #241830)',
  evangiles: 'linear-gradient(165deg, #8A6A2A, #3A2A10)',
  actes: 'linear-gradient(165deg, #A0502E, #40180E)',
  epitres: 'linear-gradient(165deg, #24406B, #0F1526)',
  apocalypse: 'linear-gradient(165deg, #3A2A4E, #0F1526)'
};

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

export function categoryNumeral(key: CategoryKey): string {
  return ROMAN[CATEGORIES.findIndex((c) => c.key === key)] ?? '';
}

/** Les cinq livres du Psautier (Ps 1-41, 42-72, 73-89, 90-106, 107-150). */
export const PSALTER: { numeral: string; from: number; to: number }[] = [
  { numeral: 'I', from: 1, to: 41 },
  { numeral: 'II', from: 42, to: 72 },
  { numeral: 'III', from: 73, to: 89 },
  { numeral: 'IV', from: 90, to: 106 },
  { numeral: 'V', from: 107, to: 150 }
];
