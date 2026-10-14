import type { BibleFont, BibleTheme } from '../hooks/useBibleReadingPrefs';

// Piles de polices littérales (pas var(--font-*)) : data-reading-font
// redéfinit --font-cormorant/--font-eb-garamond sur <html>, ce qui ferait
// afficher la même police dans toutes les cartes « Aa ».
export const READING_FONTS: { key: BibleFont; label: string; family: string }[] = [
  { key: 'garamond', label: 'Classique', family: "'EB Garamond', serif" },
  { key: 'cormorant', label: 'Élégante', family: "'Cormorant Garamond', serif" },
  { key: 'inter', label: 'Moderne', family: "'Inter', sans-serif" }
];

// Couleurs reprises de theme/variables.css (html[data-reading-theme=…]) pour
// que l'aperçu montre exactement ce que le lecteur affichera.
// hi : encre utilisée quand « Contraste renforcé » est actif.
export const READING_THEMES: {
  key: BibleTheme;
  label: string;
  bg: string;
  text: string;
  hi: string;
  muted: string;
  accent: string;
}[] = [
  {
    key: 'papier',
    label: 'Crème',
    bg: '#EFE7D3',
    text: '#23201A',
    hi: '#0E0C09',
    muted: 'rgba(35, 32, 26, 0.6)',
    accent: '#6B1E23'
  },
  {
    key: 'sepia',
    label: 'Sépia',
    bg: '#eae0c8',
    text: '#4a3728',
    hi: '#1A1209',
    muted: 'rgba(74, 55, 40, 0.62)',
    accent: '#8b3a1e'
  },
  {
    key: 'nuit',
    label: 'Nuit',
    bg: '#1e1b17',
    text: '#ede5d3',
    hi: '#FFFFFF',
    muted: 'rgba(237, 229, 211, 0.62)',
    accent: '#F0D58E'
  },
  {
    key: 'contraste',
    label: 'Blanc',
    bg: '#ffffff',
    text: '#000000',
    hi: '#000000',
    muted: 'rgba(0, 0, 0, 0.58)',
    accent: '#a3001e'
  }
];
