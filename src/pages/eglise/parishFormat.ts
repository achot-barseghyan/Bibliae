import type { Parish } from '../../hooks/useParishSearch';

// Petits formats partagés par la liste des paroisses et la fiche paroisse.

export function hasWebsite(parish: Parish): boolean {
  return parish.website.includes('.');
}

export function websiteUrl(parish: Parish): string {
  return parish.website.startsWith('http') ? parish.website : `https://${parish.website}`;
}

/** Numéro de département (outre-mer : 3 chiffres, Corse : 2A/2B). */
export function departmentCode(zip: string): string {
  if (zip.startsWith('97') || zip.startsWith('98')) return zip.slice(0, 3);
  if (zip.startsWith('20')) return Number(zip) < 20200 ? '2A' : '2B';
  return zip.slice(0, 2);
}

export function churchCountLabel(n: number): string {
  return n > 0 ? `${n} église${n > 1 ? 's' : ''}` : 'Églises à préciser';
}
