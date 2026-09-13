const DIACRITICS = /[̀-ͯ]/g;

// Normalise pour une recherche insensible aux accents et à la casse
// ("Épître" et "epitre" doivent se matcher).
export function normalizeForSearch(value: string): string {
  return value.normalize('NFD').replace(DIACRITICS, '').toLowerCase();
}
