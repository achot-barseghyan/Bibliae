// Structure du chapelet : les quatre séries de mystères, les prières
// fixes (texte catéchétique universel, pas une traduction liturgique
// récente) et la séquence complète de grains pour une récitation.

export type MysterySetKey = 'joyeux' | 'douloureux' | 'glorieux' | 'lumineux';

export interface MysterySet {
  key: MysterySetKey;
  label: string;
  days: string;
  mysteries: string[];
}

export const MYSTERY_SETS: Record<MysterySetKey, MysterySet> = {
  joyeux: {
    key: 'joyeux',
    label: 'Mystères Joyeux',
    days: 'Lundi · Samedi',
    mysteries: [
      "L'Annonciation",
      'La Visitation',
      'La Nativité',
      'La Présentation au Temple',
      'Le Recouvrement de Jésus au Temple'
    ]
  },
  douloureux: {
    key: 'douloureux',
    label: 'Mystères Douloureux',
    days: 'Mardi · Vendredi',
    mysteries: [
      "L'Agonie de Jésus au jardin des Oliviers",
      'La Flagellation',
      "Le Couronnement d'épines",
      'Le Portement de croix',
      'La Crucifixion et la mort de Jésus'
    ]
  },
  glorieux: {
    key: 'glorieux',
    label: 'Mystères Glorieux',
    days: 'Mercredi · Dimanche',
    mysteries: [
      'La Résurrection',
      "L'Ascension",
      'La Pentecôte',
      'Assomption de Marie',
      'Le Couronnement de Marie'
    ]
  },
  lumineux: {
    key: 'lumineux',
    label: 'Mystères Lumineux',
    days: 'Jeudi',
    mysteries: [
      'Le Baptême de Jésus au Jourdain',
      'Les Noces de Cana',
      'Annonce du Royaume de Dieu',
      'La Transfiguration',
      "L'institution de l'Eucharistie"
    ]
  }
};

export const MYSTERY_ORDER: MysterySetKey[] = ['joyeux', 'douloureux', 'glorieux', 'lumineux'];

export function mysterySetForToday(date: Date = new Date()): MysterySetKey {
  switch (date.getDay()) {
    case 1:
    case 6:
      return 'joyeux';
    case 2:
    case 5:
      return 'douloureux';
    case 3:
    case 0:
      return 'glorieux';
    default:
      return 'lumineux';
  }
}

export type PrayerKey =
  | 'signe-croix'
  | 'credo'
  | 'notre-pere'
  | 'je-vous-salue-marie'
  | 'gloire-au-pere'
  | 'annonce-mystere'
  | 'salve-regina';

interface Prayer {
  name: string;
  text: string;
}

export const PRAYERS: Record<PrayerKey, Prayer> = {
  'signe-croix': {
    name: 'Signe de croix',
    text: 'Au nom du Père, et du Fils, et du Saint-Esprit. Amen.'
  },
  credo: {
    name: 'Credo: Symbole des Apôtres',
    text:
      "Je crois en Dieu, le Père tout-puissant, Créateur du ciel et de la terre. Et en Jésus-Christ, son Fils unique, notre Seigneur, qui a été conçu du Saint-Esprit, est né de la Vierge Marie, a souffert sous Ponce Pilate, a été crucifié, est mort, a été enseveli, est descendu aux enfers, le troisième jour est ressuscité des morts, est monté aux cieux, est assis à la droite de Dieu le Père tout-puissant, d'où il viendra juger les vivants et les morts. Je crois en l'Esprit Saint, à la sainte Église catholique, à la communion des saints, à la rémission des péchés, à la résurrection de la chair, à la vie éternelle. Amen."
  },
  'notre-pere': {
    name: 'Notre Père',
    text:
      "Notre Père, qui es aux cieux, que ton nom soit sanctifié, que ton règne vienne, que ta volonté soit faite sur la terre comme au ciel. Donne-nous aujourd'hui notre pain de ce jour. Pardonne-nous nos offenses, comme nous pardonnons aussi à ceux qui nous ont offensés. Et ne nous laisse pas entrer en tentation, mais délivre-nous du mal. Amen."
  },
  'je-vous-salue-marie': {
    name: 'Je vous salue Marie',
    text:
      'Je vous salue, Marie, pleine de grâce ; le Seigneur est avec vous. Vous êtes bénie entre toutes les femmes, et Jésus, le fruit de vos entrailles, est béni. Sainte Marie, Mère de Dieu, priez pour nous, pauvres pécheurs, maintenant et à l\'heure de notre mort. Amen.'
  },
  'gloire-au-pere': {
    name: 'Gloire au Père',
    text:
      "Gloire au Père, et au Fils, et au Saint-Esprit. Comme il était au commencement, maintenant et toujours, pour les siècles des siècles. Amen."
  },
  'annonce-mystere': {
    name: 'Annoncer le mystère',
    text: ''
  },
  'salve-regina': {
    name: 'Salve Regina',
    text:
      "Je vous salue, Reine, mère de miséricorde, notre vie, notre douceur, notre espérance, je vous salue. Enfants d'Ève, exilés, nous crions vers vous ; vers vous nous soupirons, gémissant et pleurant dans cette vallée de larmes. Ô vous, notre avocate, tournez vers nous votre regard miséricordieux. Et, après cet exil, montrez-nous Jésus, le fruit béni de vos entrailles. Ô clémente, ô miséricordieuse, ô douce Vierge Marie."
  }
};

export type BeadImageKey =
  | 'crucifix'
  | 'medaille'
  | 'notre-pere'
  | 'blanc'
  | 'bleu'
  | 'vert'
  | 'jaune'
  | 'violet'
  | 'rouge';

const DECADE_COLORS: BeadImageKey[] = ['bleu', 'vert', 'jaune', 'violet', 'rouge'];

export interface RosaryBead {
  prayerKey: PrayerKey;
  bead: BeadImageKey;
  mysteryIndex: number | null;
}

// La structure de la séquence (prières et couleurs de grains) est la même
// pour les quatre séries ; seuls les noms des mystères diffèrent, et sont
// affichés séparément via MYSTERY_SETS[key].mysteries[mysteryIndex].
export function buildSequence(): RosaryBead[] {
  const beads: RosaryBead[] = [];

  // Croix : Credo (le signe de croix se fait sur ce même grain).
  beads.push({ prayerKey: 'credo', bead: 'crucifix', mysteryIndex: null });
  // Gros grain, puis les 3 petits grains blancs, puis Gloire au Père.
  beads.push({ prayerKey: 'notre-pere', bead: 'notre-pere', mysteryIndex: null });
  for (let i = 0; i < 3; i += 1) {
    beads.push({ prayerKey: 'je-vous-salue-marie', bead: 'blanc', mysteryIndex: null });
  }
  beads.push({ prayerKey: 'gloire-au-pere', bead: 'blanc', mysteryIndex: null });

  // Entrée dans la couronne : un gros grain, puis le médaillon qui annonce
  // le premier mystère. Les mystères suivants sont annoncés directement au
  // gros grain de leur dizaine (le médaillon ne revient qu'à la clôture).
  beads.push({ prayerKey: 'notre-pere', bead: 'notre-pere', mysteryIndex: null });
  beads.push({ prayerKey: 'annonce-mystere', bead: 'medaille', mysteryIndex: 0 });

  for (let decade = 0; decade < 5; decade += 1) {
    const color = DECADE_COLORS[decade];
    if (decade > 0) {
      beads.push({ prayerKey: 'notre-pere', bead: 'notre-pere', mysteryIndex: decade });
    }
    for (let i = 0; i < 10; i += 1) {
      beads.push({ prayerKey: 'je-vous-salue-marie', bead: color, mysteryIndex: decade });
    }
    beads.push({ prayerKey: 'gloire-au-pere', bead: color, mysteryIndex: decade });
  }

  // Clôture au médaillon : pas de second crucifix dans la couronne.
  beads.push({ prayerKey: 'salve-regina', bead: 'medaille', mysteryIndex: null });
  beads.push({ prayerKey: 'signe-croix', bead: 'medaille', mysteryIndex: null });

  return beads;
}
