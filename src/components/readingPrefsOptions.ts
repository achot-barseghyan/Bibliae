import type { BibleFont, BibleTheme } from '../hooks/useBibleReadingPrefs';

export const READING_FONTS: { key: BibleFont; label: string; family: string }[] = [
  { key: 'cormorant', label: 'Cormorant', family: 'var(--font-cormorant)' },
  { key: 'garamond', label: 'EB Garamond', family: 'var(--font-eb-garamond)' },
  { key: 'inter', label: 'Inter (sans-serif)', family: 'var(--font-inter)' }
];

export const READING_THEMES: { key: BibleTheme; label: string; bg: string; text: string }[] = [
  { key: 'papier', label: 'Papier', bg: '#f2ebdc', text: '#3a332c' },
  { key: 'sepia', label: 'Sépia', bg: '#eae0c8', text: '#4a3728' },
  { key: 'nuit', label: 'Nuit', bg: '#1e1b17', text: '#ede5d3' },
  { key: 'contraste', label: 'Contraste élevé', bg: '#ffffff', text: '#000000' }
];
