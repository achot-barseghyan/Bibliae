// Structure du chapelet : les quatre séries de mystères, les prières
// fixes (texte catéchétique universel, pas une traduction liturgique
// récente) et la séquence complète de grains pour une récitation.

import type { ScriptureRef } from './figureDetails';

export type MysterySetKey = 'joyeux' | 'douloureux' | 'glorieux' | 'lumineux';

export interface MysterySet {
  key: MysterySetKey;
  label: string;
  days: string;
  mysteries: string[];
  // Passage biblique à méditer pour chaque mystère (même ordre que `mysteries`).
  refs: ScriptureRef[];
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
    ],
    refs: [
      { display: 'Lc 1, 26-38', bookId: 'lc', chapter: 1, verseStart: 26, verseEnd: 38 },
      { display: 'Lc 1, 39-56', bookId: 'lc', chapter: 1, verseStart: 39, verseEnd: 56 },
      { display: 'Lc 2, 1-20', bookId: 'lc', chapter: 2, verseStart: 1, verseEnd: 20 },
      { display: 'Lc 2, 22-38', bookId: 'lc', chapter: 2, verseStart: 22, verseEnd: 38 },
      { display: 'Lc 2, 41-52', bookId: 'lc', chapter: 2, verseStart: 41, verseEnd: 52 }
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
    ],
    refs: [
      { display: 'Mt 26, 36-46', bookId: 'mt', chapter: 26, verseStart: 36, verseEnd: 46 },
      { display: 'Jn 19, 1-3', bookId: 'jn', chapter: 19, verseStart: 1, verseEnd: 3 },
      { display: 'Mt 27, 27-31', bookId: 'mt', chapter: 27, verseStart: 27, verseEnd: 31 },
      { display: 'Lc 23, 26-32', bookId: 'lc', chapter: 23, verseStart: 26, verseEnd: 32 },
      { display: 'Lc 23, 33-46', bookId: 'lc', chapter: 23, verseStart: 33, verseEnd: 46 }
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
    ],
    refs: [
      { display: 'Mt 28, 1-10', bookId: 'mt', chapter: 28, verseStart: 1, verseEnd: 10 },
      { display: 'Ac 1, 6-11', bookId: 'ac', chapter: 1, verseStart: 6, verseEnd: 11 },
      { display: 'Ac 2, 1-13', bookId: 'ac', chapter: 2, verseStart: 1, verseEnd: 13 },
      { display: 'Lc 1, 46-55', bookId: 'lc', chapter: 1, verseStart: 46, verseEnd: 55 },
      { display: 'Ap 12, 1-6', bookId: 'ap', chapter: 12, verseStart: 1, verseEnd: 6 }
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
    ],
    refs: [
      { display: 'Mt 3, 13-17', bookId: 'mt', chapter: 3, verseStart: 13, verseEnd: 17 },
      { display: 'Jn 2, 1-12', bookId: 'jn', chapter: 2, verseStart: 1, verseEnd: 12 },
      { display: 'Mc 1, 14-15', bookId: 'mc', chapter: 1, verseStart: 14, verseEnd: 15 },
      { display: 'Mt 17, 1-8', bookId: 'mt', chapter: 17, verseStart: 1, verseEnd: 8 },
      { display: 'Mt 26, 26-29', bookId: 'mt', chapter: 26, verseStart: 26, verseEnd: 29 }
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
  | 'salve-regina';

interface Prayer {
  name: string;
  text: string;
}

export const PRAYERS: Record<PrayerKey, Prayer> = {
  'signe-croix': {
    name: 'Signe de croix',
    text:
      "Au nom du Père,\net du Fils,\net du Saint-Esprit.\n\nAmen."
  },
  credo: {
    name: 'Credo: Symbole des Apôtres',
    text:
      "Je crois en Dieu, le Père tout-puissant,\nCréateur du ciel et de la terre.\n\nEt en Jésus-Christ, son Fils unique, notre Seigneur,\nqui a été conçu du Saint-Esprit,\nest né de la Vierge Marie,\na souffert sous Ponce Pilate,\na été crucifié, est mort, a été enseveli,\nest descendu aux enfers,\nle troisième jour est ressuscité des morts,\nest monté aux cieux,\nest assis à la droite de Dieu le Père tout-puissant,\nd'où il viendra juger les vivants et les morts.\n\nJe crois en l'Esprit Saint,\nà la sainte Église catholique,\nà la communion des saints,\nà la rémission des péchés,\nà la résurrection de la chair,\nà la vie éternelle.\n\nAmen."
  },
  'notre-pere': {
    name: 'Notre Père',
    text:
      "Notre Père, qui es aux cieux,\nque ton nom soit sanctifié,\nque ton règne vienne,\nque ta volonté soit faite sur la terre comme au ciel.\n\nDonne-nous aujourd'hui notre pain de ce jour.\nPardonne-nous nos offenses,\ncomme nous pardonnons aussi à ceux qui nous ont offensés.\nEt ne nous laisse pas entrer en tentation,\nmais délivre-nous du mal.\n\nAmen."
  },
  'je-vous-salue-marie': {
    name: 'Je vous salue Marie',
    text:
      "Je vous salue, Marie, pleine de grâce ;\nle Seigneur est avec vous.\nVous êtes bénie entre toutes les femmes,\net Jésus, le fruit de vos entrailles, est béni.\n\nSainte Marie, Mère de Dieu,\npriez pour nous, pauvres pécheurs,\nmaintenant et à l'heure de notre mort.\n\nAmen."
  },
  'gloire-au-pere': {
    name: 'Gloire au Père',
    text:
      "Gloire au Père, et au Fils, et au Saint-Esprit,\ncomme il était au commencement, maintenant et toujours,\npour les siècles des siècles.\n\nAmen."
  },
  'salve-regina': {
    name: 'Salve Regina',
    text:
      "Je vous salue, Reine, mère de miséricorde,\nnotre vie, notre douceur, notre espérance, je vous salue.\n\nEnfants d'Ève, exilés, nous crions vers vous ;\nvers vous nous soupirons,\ngémissant et pleurant dans cette vallée de larmes.\n\nÔ vous, notre avocate,\ntournez vers nous votre regard miséricordieux.\nEt, après cet exil, montrez-nous Jésus,\nle fruit béni de vos entrailles.\n\nÔ clémente, ô miséricordieuse, ô douce Vierge Marie."
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
  // null : étape de prière sans grain (dite sur la chaîne).
  bead: BeadImageKey | null;
  mysteryIndex: number | null;
  // Un bout de chaîne plus long sépare ce grain du précédent.
  gapBefore?: boolean;
}

// La structure de la séquence (prières et couleurs de grains) est la même
// pour les quatre séries ; seuls les noms des mystères diffèrent, et sont
// affichés séparément via MYSTERY_SETS[key].mysteries[mysteryIndex].
export function buildSequence(): RosaryBead[] {
  const beads: RosaryBead[] = [];

  // Croix : Credo (le signe de croix se fait sur ce même grain).
  beads.push({ prayerKey: 'credo', bead: 'crucifix', mysteryIndex: null });
  // Gros grain, puis les 3 petits grains blancs, puis Gloire au Père, chaque
  // groupe séparé du précédent par un espace.
  beads.push({ prayerKey: 'notre-pere', bead: 'notre-pere', mysteryIndex: null, gapBefore: true });
  for (let i = 0; i < 3; i += 1) {
    beads.push({
      prayerKey: 'je-vous-salue-marie',
      bead: 'blanc',
      mysteryIndex: null,
      gapBefore: i === 0
    });
  }
  beads.push({ prayerKey: 'gloire-au-pere', bead: 'blanc', mysteryIndex: null, gapBefore: true });

  // Entrée dans la couronne : au médaillon, on annonce le premier mystère et
  // on dit le Notre Père. Les mystères suivants sont annoncés directement au
  // gros grain de leur dizaine (le médaillon ne revient qu'à la clôture).
  beads.push({ prayerKey: 'notre-pere', bead: 'medaille', mysteryIndex: 0, gapBefore: true });

  for (let decade = 0; decade < 5; decade += 1) {
    const color = DECADE_COLORS[decade];
    // Le Notre Père de chaque dizaine est isolé par un espace de part et
    // d'autre (pour la première, c'est le médaillon qui en tient lieu).
    if (decade > 0) {
      beads.push({
        prayerKey: 'notre-pere',
        bead: 'notre-pere',
        mysteryIndex: decade,
        gapBefore: true
      });
    }
    for (let i = 0; i < 10; i += 1) {
      beads.push({
        prayerKey: 'je-vous-salue-marie',
        bead: color,
        mysteryIndex: decade,
        gapBefore: i === 0
      });
    }
    // Le Gloire au Père se dit sur la chaîne, sans grain à lui.
    beads.push({ prayerKey: 'gloire-au-pere', bead: null, mysteryIndex: decade });
  }

  // Clôture : le Salve Regina se dit sur la chaîne, sans grain, puis le signe
  // de croix au médaillon (pas de second crucifix dans la couronne).
  beads.push({ prayerKey: 'salve-regina', bead: null, mysteryIndex: null });
  beads.push({ prayerKey: 'signe-croix', bead: 'medaille', mysteryIndex: null });

  return beads;
}
