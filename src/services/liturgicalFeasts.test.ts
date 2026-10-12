import { daysUntilFeast, easterSunday, feastCountdownLabel, feastDate } from './liturgicalFeasts';

const iso = (d: Date) => d.toISOString().slice(0, 10);

describe('liturgicalFeasts', () => {
  it('calcule Pâques', () => {
    expect(iso(easterSunday(2024))).toBe('2024-03-31');
    expect(iso(easterSunday(2025))).toBe('2025-04-20');
    expect(iso(easterSunday(2026))).toBe('2026-04-05');
    expect(iso(easterSunday(2027))).toBe('2027-03-28');
    expect(iso(easterSunday(2038))).toBe('2038-04-25');
  });

  it('dérive les fêtes mobiles de Pâques', () => {
    expect(iso(feastDate('vendredi-saint', 2027))).toBe('2027-03-26');
    expect(iso(feastDate('pentecote', 2027))).toBe('2027-05-16');
  });

  it('place le Baptême du Seigneur après l’Épiphanie', () => {
    // Épiphanie le 3 janvier → baptême le dimanche 10.
    expect(iso(feastDate('bapteme-du-seigneur', 2027))).toBe('2027-01-10');
    // Épiphanie le 7 janvier → baptême le lundi 8.
    expect(iso(feastDate('bapteme-du-seigneur', 2024))).toBe('2024-01-08');
    // Épiphanie le 8 janvier → baptême le lundi 9.
    expect(iso(feastDate('bapteme-du-seigneur', 2023))).toBe('2023-01-09');
  });

  it('compte les jours jusqu’à la prochaine occurrence', () => {
    const today = new Date(2026, 9, 11);
    expect(daysUntilFeast('noel', today)).toBe(75);
    expect(daysUntilFeast('bapteme-du-seigneur', today)).toBe(91);
    expect(daysUntilFeast('paques', today)).toBe(168);
    // Passée cette année : on vise l'année suivante.
    expect(daysUntilFeast('noel', new Date(2026, 11, 26))).toBe(364);
  });

  it('formule le compte à rebours', () => {
    expect(feastCountdownLabel('noel', new Date(2026, 9, 11))).toBe('Noël dans 75 jours');
    expect(feastCountdownLabel('noel', new Date(2026, 11, 25))).toBe("Noël · aujourd'hui");
    expect(feastCountdownLabel('noel', new Date(2026, 11, 24))).toBe('Noël demain');
  });
});
