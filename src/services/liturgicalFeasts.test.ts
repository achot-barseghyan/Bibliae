import { daysUntilFeast, easterSunday, feastCountdownLabel, feastDate, liturgicalYear } from './liturgicalFeasts';

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

describe('liturgicalYear', () => {
  it('découpe l’année 2025-2026 en temps liturgiques', () => {
    const year = liturgicalYear(new Date(2026, 8, 11));
    expect(year.sundayCycle).toBe('A');
    expect(year.weekdayCycle).toBe('paire');
    expect(year.seasons.map((s) => s.days)).toEqual([25, 18, 37, 46, 50, 188]);
    expect(year.length).toBe(364);
    expect(year.dayIndex).toBe(285);
  });

  it('bascule à l’Avent', () => {
    expect(liturgicalYear(new Date(2026, 10, 28)).sundayCycle).toBe('A');
    const advent = liturgicalYear(new Date(2026, 10, 29));
    expect(advent.sundayCycle).toBe('B');
    expect(advent.weekdayCycle).toBe('impaire');
    expect(advent.dayIndex).toBe(0);
  });
});
