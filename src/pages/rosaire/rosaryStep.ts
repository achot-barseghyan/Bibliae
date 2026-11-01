import type { ScriptureRef } from '../../data/figureDetails';
import { ROSARY_SOURCE, type MysterySet, type PrayerKey, type RosaryBead, type RosaryConfig } from '../../data/rosary';

interface RosaryPrayer {
  name: string;
  text: string;
}

export interface RosaryStepContent {
  eyebrow: string;
  title: string;
  /** Annonce du mystère : référence (si l'Évangile est lu) et fruit. */
  mystery: { ref: ScriptureRef | null; fruit: string | null } | null;
  paragraphs: string[];
  /** Référence du rappel du mystère (Rosarium Virginis Mariae). */
  source: { label: string; url: string } | null;
}

const ORD_M = ['1ᵉʳ', '2ᵉ', '3ᵉ', '4ᵉ', '5ᵉ'];
const ORD_F = ['1ʳᵉ', '2ᵉ', '3ᵉ', '4ᵉ', '5ᵉ'];
/** Les trois Ave de l'ouverture, pour les vertus théologales. */
const INTRO_AVE = ['Pour la foi', "Pour l'espérance", 'Pour la charité'];
const ABRIDGED_AVE = 'Je vous salue, Marie, pleine de grâce…';

const lowerFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);
const ordinalAve = (n: number) => `${n === 1 ? '1ᵉʳ' : `${n}ᵉ`} Ave`;

export function rosaryStepContent(
  step: RosaryBead,
  set: MysterySet,
  prayers: Record<PrayerKey, RosaryPrayer>,
  config: RosaryConfig
): RosaryStepContent {
  const decade = step.mysteryIndex;
  const mysteryTitle = decade !== null ? set.mysteries[decade] : null;

  if (step.prayerKey === 'mystere' && decade !== null) {
    const ref = config.evangile ? (set.refs[decade] ?? null) : null;
    const fruit = config.fruit && set.fruits?.[decade] ? `Fruit : ${lowerFirst(set.fruits[decade])}` : null;
    const summary = config.annonce ? set.summaries?.[decade] : undefined;
    const source = summary
      ? { label: `${ROSARY_SOURCE.title}, §${set.sourceParagraph}`, url: ROSARY_SOURCE.url }
      : null;
    return {
      eyebrow: `${ORD_M[decade]} mystère ${set.adjective ?? ''}`.trim(),
      title: mysteryTitle ?? '',
      mystery: ref || fruit ? { ref, fruit } : null,
      paragraphs: summary ? [summary] : [],
      source
    };
  }

  const prayer = prayers[step.prayerKey as PrayerKey];
  let text = prayer.text;
  let eyebrow = 'Ouverture';
  if (step.prayerKey === 'credo') eyebrow = 'Sur la croix';
  else if (step.prayerKey === 'je-vous-salue-marie' && step.aveNumber && decade === null) {
    eyebrow = `${ordinalAve(step.aveNumber)} · ${INTRO_AVE[step.aveNumber - 1]}`;
  } else if (step.prayerKey === 'je-vous-salue-marie' && step.aveNumber && mysteryTitle) {
    eyebrow = `${ordinalAve(step.aveNumber)} · ${mysteryTitle}`;
  } else if (decade !== null && mysteryTitle) eyebrow = `${ORD_F[decade]} dizaine · ${mysteryTitle}`;
  else if (step.phase === 'conclusion') eyebrow = 'Pour conclure';
  else if (step.prayerKey === 'notre-pere' || step.prayerKey === 'gloire-au-pere') eyebrow = 'Introduction';

  if (step.prayerKey === 'je-vous-salue-marie') {
    const clausule = decade !== null ? set.clausules?.[decade] : undefined;
    if (config.clausule && clausule) text = text.replace('est béni.', `est béni,\nJésus ${clausule}.`);
    if (config.abrege && (step.aveNumber ?? 1) > 1) text = ABRIDGED_AVE;
  }

  return { eyebrow, title: prayer.name, mystery: null, paragraphs: text ? text.split('\n\n') : [], source: null };
}

/** Durée estimée de la récitation, à 120 mots par minute. */
export function rosaryMinutes(sequence: RosaryBead[], prayers: Record<PrayerKey, RosaryPrayer>): number {
  const words = sequence.reduce(
    (sum, step) =>
      sum + (step.prayerKey === 'mystere' ? 40 : prayers[step.prayerKey].text.split(/\s+/).length),
    0
  );
  return Math.max(1, Math.round(words / 120));
}
