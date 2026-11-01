import {
  buildSequence,
  DEFAULT_ROSARY_CONFIG,
  MYSTERY_SETS,
  mysterySetForToday,
  PRAYERS,
  sanitizeRosaryConfig
} from '../../data/rosary';
import { rosaryStepContent } from './rosaryStep';

const local = (y: number, m: number, d: number) => new Date(y, m - 1, d);

describe('buildSequence', () => {
  it('compte 78 étapes avec le déroulé habituel', () => {
    expect(buildSequence(DEFAULT_ROSARY_CONFIG)).toHaveLength(78);
  });

  it('garde le crucifix sur la première prière de la croix', () => {
    const seq = buildSequence({ ...DEFAULT_ROSARY_CONFIG, signe: false });
    expect(seq[0]).toMatchObject({ prayerKey: 'credo', bead: 'crucifix' });
  });

  it('dit le Salve Regina au médaillon, le signe de croix final sur la chaîne', () => {
    const seq = buildSequence({ ...DEFAULT_ROSARY_CONFIG, signeFin: true });
    expect(seq.slice(-2)).toMatchObject([
      { prayerKey: 'salve-regina', bead: 'medaille' },
      { prayerKey: 'signe-croix', bead: null }
    ]);
  });

  it("retire l'annonce du mystère quand ni rappel ni Évangile ne sont demandés", () => {
    const seq = buildSequence({ ...DEFAULT_ROSARY_CONFIG, annonce: false });
    expect(seq.some((s) => s.prayerKey === 'mystere')).toBe(false);
  });
});

describe('rosaryStepContent', () => {
  const set = MYSTERY_SETS.joyeux;

  it('annonce le mystère avec son fruit', () => {
    const step = buildSequence().find((s) => s.prayerKey === 'mystere')!;
    const content = rosaryStepContent(step, set, PRAYERS, DEFAULT_ROSARY_CONFIG);
    expect(content.eyebrow).toBe('1ᵉʳ mystère joyeux');
    expect(content.title).toBe("L'Annonciation");
    expect(content.mystery).toEqual({ ref: null, fruit: "Fruit : l'humilité" });
    expect(content.paragraphs).toEqual([set.summaries[0]]);
    expect(content.source?.label).toBe('Jean-Paul II, Rosarium Virginis Mariae, §20');
    expect(content.source?.url).toContain('vatican.va');
  });

  it("lit l'Évangile sans rappel quand seul l'Évangile est activé", () => {
    const config = { ...DEFAULT_ROSARY_CONFIG, annonce: false, evangile: true };
    const step = buildSequence(config).find((s) => s.prayerKey === 'mystere')!;
    const content = rosaryStepContent(step, set, PRAYERS, config);
    expect(content.mystery?.ref?.display).toBe('Lc 1, 26-38');
    expect(content.paragraphs).toEqual([]);
    expect(content.source).toBeNull();
  });

  it('ajoute la clausule et abrège les Ave suivants', () => {
    const config = { ...DEFAULT_ROSARY_CONFIG, clausule: true, abrege: true };
    const aves = buildSequence(config).filter((s) => s.prayerKey === 'je-vous-salue-marie' && s.mysteryIndex === 0);
    const first = rosaryStepContent(aves[0], set, PRAYERS, config);
    expect(first.eyebrow).toBe("1ᵉʳ Ave · L'Annonciation");
    expect(first.paragraphs[0]).toContain("est béni,\nJésus que vous avez conçu par l'Esprit Saint.");
    expect(rosaryStepContent(aves[1], set, PRAYERS, config).paragraphs).toEqual([
      'Je vous salue, Marie, pleine de grâce…'
    ]);
  });

  it('nomme les Ave de l’ouverture par leur vertu', () => {
    const ave = buildSequence().find((s) => s.prayerKey === 'je-vous-salue-marie')!;
    expect(rosaryStepContent(ave, set, PRAYERS, DEFAULT_ROSARY_CONFIG).eyebrow).toBe('1ᵉʳ Ave · Pour la foi');
  });
});

describe('mysterySetForToday', () => {
  it('suit la répartition de la semaine', () => {
    expect(mysterySetForToday(local(2026, 10, 29))).toBe('lumineux'); // jeudi
    expect(mysterySetForToday(local(2026, 10, 31))).toBe('joyeux'); // samedi
    expect(mysterySetForToday(local(2026, 10, 25))).toBe('glorieux'); // dimanche ordinaire
  });

  it("prend les joyeux aux dimanches de l'Avent et les douloureux en Carême", () => {
    expect(mysterySetForToday(local(2026, 12, 6))).toBe('joyeux');
    expect(mysterySetForToday(local(2026, 3, 1))).toBe('douloureux');
    expect(mysterySetForToday(local(2026, 3, 1), false)).toBe('glorieux');
  });
});

describe('sanitizeRosaryConfig', () => {
  it('ignore les clés inconnues et les valeurs non booléennes', () => {
    expect(sanitizeRosaryConfig({ fatima: false, anneau: true, gloria: 'oui' })).toEqual({
      ...DEFAULT_ROSARY_CONFIG,
      fatima: false
    });
  });
});
