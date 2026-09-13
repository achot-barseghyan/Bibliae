import type { HighlightColor } from './appDataStore';

export interface HighlightColorInfo {
  key: HighlightColor;
  rgba: string;
  usageLabel: string;
}

// Valeurs et libellés d'usage indicatifs, tels que spécifiés. Les libellés ne
// sont affichés que dans les réglages (documentation), jamais dans le menu
// contextuel — l'utilisateur reste libre du sens qu'il donne à chaque couleur.
export const HIGHLIGHT_COLORS: HighlightColorInfo[] = [
  { key: 'or', rgba: 'rgba(181, 137, 46, 0.28)', usageLabel: 'ce qui est à retenir' },
  { key: 'oxblood', rgba: 'rgba(107, 30, 35, 0.18)', usageLabel: 'ce qui interroge' },
  { key: 'olive', rgba: 'rgba(94, 106, 58, 0.22)', usageLabel: 'ce qui console' },
  { key: 'bleu-encre', rgba: 'rgba(58, 78, 106, 0.20)', usageLabel: 'ce qui est à étudier' },
  { key: 'sanguine', rgba: 'rgba(166, 92, 58, 0.22)', usageLabel: 'ce qui est à prier' }
];

export const UNDERLINE_COLOR = 'rgba(107, 30, 35, 0.6)';

export function highlightColorValue(key: HighlightColor): string {
  return HIGHLIGHT_COLORS.find((c) => c.key === key)?.rgba ?? HIGHLIGHT_COLORS[0].rgba;
}
