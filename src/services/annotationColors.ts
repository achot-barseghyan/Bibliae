import type { HighlightColor } from './appDataStore';

export interface HighlightColorInfo {
  key: HighlightColor;
  /** Nom affiché (accessibilité). */
  label: string;
  /** Couleur pleine de la pastille ; le surlignage l'applique à ~75 % d'opacité. */
  hex: string;
}

// Palette du handoff « Annotation dans le lecteur » : Or, Rose, Sauge, Ciel,
// Lavande. Les clés stockées restent celles de l'ancienne palette (elles
// servent aussi aux couleurs des parcours de lecture) : chaque ancienne
// couleur s'affiche simplement avec sa nouvelle teinte la plus proche, sans
// migration des annotations existantes.
export const HIGHLIGHT_COLORS: HighlightColorInfo[] = [
  { key: 'or', label: 'Or', hex: '#E9CF86' },
  { key: 'sanguine', label: 'Rose', hex: '#E7B5A8' },
  { key: 'olive', label: 'Sauge', hex: '#C5D0A4' },
  { key: 'bleu-encre', label: 'Ciel', hex: '#B5CBD6' },
  { key: 'oxblood', label: 'Lavande', hex: '#CDBBD8' }
];

export function highlightColorInfo(key: HighlightColor): HighlightColorInfo {
  return HIGHLIGHT_COLORS.find((c) => c.key === key) ?? HIGHLIGHT_COLORS[0];
}
