import { useEffect, useState } from 'react';

/** Médaillons en vitrail (public/assets/quiz/), dans l'ordre des numéros stockés côté serveur. */
export const AVATARS = [
  'Clés de saint Pierre',
  'Parchemin scellé',
  'Évangéliaire',
  'Mitre et crosse',
  'Colombe de l’Esprit',
  'Sacré-Cœur',
  'Cathédrale',
  'Mains en prière'
].map((label, i) => ({ label, src: `${import.meta.env.BASE_URL}assets/quiz/medaillon-${i}.webp` }));

export const avatarOf = (i: number) => AVATARS[i] ?? AVATARS[0];

export const ROMAN = ['I', 'II', 'III', 'IV'];

const DAYS_FR = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const MONTHS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

/** 12345 → « 12 345 ». */
export const fmt = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
export const ord = (n: number) => (n === 1 ? '1er' : `${n}e`);

/** « 2026-11-25 » → « 25 novembre » / « Mercredi 25 novembre ». */
export function dayLabels(day: string): { short: string; long: string } {
  const [y, m, d] = day.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const short = `${d} ${MONTHS_FR[m - 1]}`;
  const weekday = DAYS_FR[date.getDay()];
  return { short, long: `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} ${short}` };
}

export function formatCountdown(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map((n) => String(n).padStart(2, '0')).join(':');
}

/** Heure courante, rafraîchie toutes les `ms` millisecondes. */
export function useTicker(ms: number): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), ms);
    return () => window.clearInterval(id);
  }, [ms]);
  return now;
}
