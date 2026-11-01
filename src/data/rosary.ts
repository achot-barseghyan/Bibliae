// Structure du chapelet : les quatre séries de mystères, les prières fixes
// (texte catéchétique universel, pas une traduction liturgique récente) et
// la séquence de grains d'une récitation, réglable (voir RosaryConfig).

import type { ScriptureRef } from './figureDetails';
import { liturgicalYear } from '../services/liturgicalFeasts';

export type MysterySetKey = 'joyeux' | 'lumineux' | 'douloureux' | 'glorieux';

export interface MysterySet {
  key: MysterySetKey;
  label: string;
  /** « 1ᵉʳ mystère joyeux ». */
  adjective: string;
  days: string;
  mysteries: string[];
  // Passage biblique à méditer pour chaque mystère (même ordre que `mysteries`).
  refs: ScriptureRef[];
  /** Grâce à demander pendant la dizaine. */
  fruits: string[];
  /**
   * Rappel du mystère : extraits de Rosarium Virginis Mariae, lus quand
   * « Rappel du mystère » est activé (voir ROSARY_SOURCE).
   */
  summaries: string[];
  /** Paragraphe de Rosarium Virginis Mariae d'où sont tirés les rappels. */
  sourceParagraph: number;
  /** Clausule ajoutée après « Jésus » dans chaque Ave de la dizaine. */
  clausules: string[];
}

// Source des mystères et de leurs rappels : lettre apostolique de saint
// Jean-Paul II sur le Rosaire (16 octobre 2002), §20 à §23 et §38.
export const ROSARY_SOURCE = {
  title: 'Jean-Paul II, Rosarium Virginis Mariae',
  url: 'https://www.vatican.va/content/john-paul-ii/fr/apost_letters/2002/documents/hf_jp-ii_apl_20021016_rosarium-virginis-mariae.html'
};

export const MYSTERY_SETS: Record<MysterySetKey, MysterySet> = {
  joyeux: {
    key: 'joyeux',
    label: 'Mystères Joyeux',
    adjective: 'joyeux',
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
    ],
    fruits: [
      "L'humilité",
      'La charité envers le prochain',
      'La pauvreté du cœur',
      "L'obéissance et la pureté",
      'La recherche de Dieu en toutes choses'
    ],
    summaries: [
      "« Le salut de l'Ange Gabriel à la Vierge de Nazareth rappelle l'invitation à la joie messianique : “Réjouis-toi, Marie”. […] Toute l'humanité se trouve comme contenue dans le fiat par lequel elle correspond avec promptitude à la volonté de Dieu. »",
      "« C'est une note d'exultation qui marque la scène de la rencontre avec Élisabeth, où la voix de Marie et la présence du Christ en son sein font que Jean “tressaille d'allégresse” (cf. Lc 1,44). »",
      "« Une atmosphère de liesse baigne la scène de Bethléem, où la naissance de l'Enfant divin, le Sauveur du monde, est chantée par les anges et annoncée aux bergers justement comme “une grande joie” (Lc 2,10). »",
      "« La présentation au temple, tout en exprimant la joie de la consécration et en plongeant le vieillard Syméon dans l'extase, souligne aussi la prophétie du “signe en butte à la contradiction” que sera l'Enfant pour Israël et de l'épée qui transpercera l'âme de sa Mère (cf. Lc 2,34-35). »",
      "« L'épisode de Jésus au temple, lorsqu'il eut douze ans, est lui aussi tout à la fois joyeux et dramatique. Il se dévoile là dans sa divine sagesse tandis qu'il écoute et interroge ; et il se présente essentiellement comme celui qui “enseigne”. »"
    ],
    sourceParagraph: 20,
    clausules: [
      "que vous avez conçu par l'Esprit Saint",
      'que vous avez porté chez Élisabeth',
      'que vous avez mis au monde à Bethléem',
      'que vous avez présenté au Temple',
      'que vous avez retrouvé au Temple'
    ]
  },
  lumineux: {
    key: 'lumineux',
    label: 'Mystères Lumineux',
    adjective: 'lumineux',
    days: 'Jeudi',
    mysteries: [
      'Le Baptême au Jourdain',
      'Les Noces de Cana',
      "L'Annonce du Royaume de Dieu",
      'La Transfiguration',
      "L'Institution de l'Eucharistie"
    ],
    refs: [
      { display: 'Mt 3, 13-17', bookId: 'mt', chapter: 3, verseStart: 13, verseEnd: 17 },
      { display: 'Jn 2, 1-12', bookId: 'jn', chapter: 2, verseStart: 1, verseEnd: 12 },
      { display: 'Mc 1, 14-15', bookId: 'mc', chapter: 1, verseStart: 14, verseEnd: 15 },
      { display: 'Lc 9, 28-36', bookId: 'lc', chapter: 9, verseStart: 28, verseEnd: 36 },
      { display: 'Mt 26, 26-29', bookId: 'mt', chapter: 26, verseStart: 26, verseEnd: 29 }
    ],
    fruits: [
      'La grâce du baptême pour tous',
      "La confiance et l'intercession de Marie",
      "L'état de grâce et la conversion",
      "La paix de l'âme",
      "L'union parfaite avec Jésus, l'amour de l'Eucharistie"
    ],
    summaries: [
      "« Le Baptême au Jourdain est avant tout un mystère de lumière. En ce lieu, alors que le Christ descend dans les eaux du fleuve comme l'innocent qui se fait “péché” pour nous (cf. 2 Co 5,21), les cieux s'ouvrent, la voix du Père le proclame son Fils bien-aimé (cf. Mt 3,17), tandis que l'Esprit descend sur Lui pour l'investir de la mission qui l'attend. »",
      "« Le début des signes à Cana est un mystère de lumière (cf. Jn 2,1-12), au moment où le Christ, changeant l'eau en vin, ouvre le cœur des disciples à la foi grâce à l'intervention de Marie, la première des croyantes. »",
      "« C'est aussi un mystère de lumière que la prédication par laquelle Jésus annonce l'avènement du Royaume de Dieu et invite à la conversion (cf. Mc 1,15), remettant les péchés de ceux qui s'approchent de Lui avec une foi humble (cf. Mc 2,3-13 ; Lc 7,47-48). »",
      "« La Transfiguration est le mystère de lumière par excellence. […] La gloire de la divinité resplendit sur le visage du Christ, tandis que, aux Apôtres en extase, le Père le donne à reconnaître pour qu'ils “l'écoutent” (cf. Lc 9,35) et qu'ils se préparent à vivre avec Lui le moment douloureux de la Passion […]. »",
      "« Enfin, c'est un mystère de lumière que l'institution de l'Eucharistie dans laquelle le Christ se fait nourriture par son Corps et par son Sang sous les signes du pain et du vin, donnant “jusqu'au bout” le témoignage de son amour pour l'humanité (Jn 13,1). »"
    ],
    sourceParagraph: 21,
    clausules: [
      'baptisé dans le Jourdain',
      'qui se manifeste aux noces de Cana',
      'qui annonce le Royaume de Dieu',
      'transfiguré sur la montagne',
      'qui nous donne son corps et son sang'
    ]
  },
  douloureux: {
    key: 'douloureux',
    label: 'Mystères Douloureux',
    adjective: 'douloureux',
    days: 'Mardi · Vendredi',
    mysteries: [
      "L'Agonie à Gethsémani",
      'La Flagellation',
      "Le Couronnement d'épines",
      'La Montée au Calvaire',
      'La Mort en croix'
    ],
    refs: [
      { display: 'Mt 26, 36-46', bookId: 'mt', chapter: 26, verseStart: 36, verseEnd: 46 },
      { display: 'Jn 19, 1-3', bookId: 'jn', chapter: 19, verseStart: 1, verseEnd: 3 },
      { display: 'Mt 27, 27-31', bookId: 'mt', chapter: 27, verseStart: 27, verseEnd: 31 },
      { display: 'Lc 23, 26-32', bookId: 'lc', chapter: 23, verseStart: 26, verseEnd: 32 },
      { display: 'Lc 23, 33-46', bookId: 'lc', chapter: 23, verseStart: 33, verseEnd: 46 }
    ],
    fruits: [
      'La contrition de nos péchés',
      'La mortification de nos sens',
      "La lutte contre l'orgueil et la gloire du monde",
      'La patience dans les épreuves',
      'La soif de la conversion des pécheurs'
    ],
    summaries: [
      "« Le parcours de la méditation s'ouvre sur Gethsémani, où le Christ vit un moment particulièrement angoissant, confronté à la volonté du Père […] pour dire au Père : “Que ce ne soit pas ma volonté qui se fasse, mais la tienne !” (Lc 22,42). Son “oui” efface le “non” de nos premiers parents au jardin d'Eden. »",
      "« Et ce qu'il doit lui en coûter d'adhérer à la volonté du Père apparaît dans les mystères suivants, la flagellation, le couronnement d'épines, la montée au Calvaire, la mort en croix, par lesquels il est plongé dans la plus grande abjection : Ecce homo ! »",
      "« Dans cette abjection se révèle non seulement l'amour de Dieu mais le sens même de l'homme. »",
      "« Ecce homo : qui veut connaître l'homme doit savoir en reconnaître le sens, l'origine et l'accomplissement dans le Christ, Dieu qui s'abaisse par amour “jusqu'à la mort, et à la mort sur une croix” (Ph 2,8). »",
      "« Les mystères douloureux conduisent le croyant à revivre la mort de Jésus en se mettant au pied de la croix, près de Marie, pour pénétrer avec elle dans les profondeurs de l'amour de Dieu pour l'homme et pour en sentir toute la force régénératrice. »"
    ],
    sourceParagraph: 22,
    clausules: [
      'en agonie au jardin des Oliviers',
      'flagellé pour nous',
      "couronné d'épines",
      'qui porte sa croix',
      'crucifié pour nous'
    ]
  },
  glorieux: {
    key: 'glorieux',
    label: 'Mystères Glorieux',
    adjective: 'glorieux',
    days: 'Mercredi · Dimanche',
    mysteries: [
      'La Résurrection',
      "L'Ascension",
      'La Pentecôte',
      "L'Assomption de Marie",
      'Le Couronnement de Marie'
    ],
    refs: [
      { display: 'Mt 28, 1-10', bookId: 'mt', chapter: 28, verseStart: 1, verseEnd: 10 },
      { display: 'Ac 1, 6-11', bookId: 'ac', chapter: 1, verseStart: 6, verseEnd: 11 },
      { display: 'Ac 2, 1-13', bookId: 'ac', chapter: 2, verseStart: 1, verseEnd: 13 },
      { display: 'Lc 1, 46-55', bookId: 'lc', chapter: 1, verseStart: 46, verseEnd: 55 },
      { display: 'Ap 12, 1-6', bookId: 'ap', chapter: 12, verseStart: 1, verseEnd: 6 }
    ],
    fruits: [
      'La foi',
      "L'espérance du Ciel",
      "L'effusion de l'Esprit Saint",
      "La grâce d'aller au ciel",
      'Une plus grande dévotion envers la très sainte Vierge Marie'
    ],
    summaries: [
      "« En contemplant le Ressuscité, le chrétien redécouvre les raisons de sa propre foi (cf. 1 Co 15,14), et il revit la joie non seulement de ceux à qui le Christ s'est manifesté – les Apôtres, Marie-Madeleine, les disciples d'Emmaüs –, mais aussi la joie de Marie […]. »",
      "« Depuis toujours le Rosaire exprime cette conscience de la foi, invitant le croyant à aller au-delà de l'obscurité de la Passion, pour fixer son regard sur la gloire du Christ dans la Résurrection et dans l'Ascension. »",
      "« Dans le troisième mystère glorieux, le Rosaire place au centre de ce parcours glorieux du Fils et de sa Mère la Pentecôte, qui montre le visage de l'Église comme famille unie à Marie, ravivée par l'effusion puissante de l'Esprit et prête pour la mission évangélisatrice. »",
      "« À cette gloire qui, par l'Ascension, place le Christ à la droite du Père, elle sera elle-même associée par l'Assomption, anticipant, par un privilège très spécial, la destinée réservée à tous les justes par la résurrection de la chair. »",
      "« Enfin, couronnée de gloire – comme on le voit dans le dernier mystère glorieux –, elle brille comme Reine des Anges et des Saints, anticipation et sommet de la condition eschatologique de l'Église. »"
    ],
    sourceParagraph: 23,
    clausules: [
      'ressuscité des morts',
      'monté au ciel',
      "qui nous envoie l'Esprit Saint",
      'qui vous a élevée au ciel',
      'qui vous a couronnée dans le ciel'
    ]
  }
};

export const MYSTERY_ORDER: MysterySetKey[] = ['joyeux', 'lumineux', 'douloureux', 'glorieux'];

// Répartition de saint Jean-Paul II (Rosarium Virginis Mariae, §38) : joyeux lundi et samedi,
// douloureux mardi et vendredi, glorieux mercredi et dimanche, lumineux
// jeudi. Avec `liturgicalSundays`, les dimanches de l'Avent prennent les
// joyeux et ceux du Carême les douloureux.
const DAY_SETS: MysterySetKey[] = ['glorieux', 'joyeux', 'douloureux', 'glorieux', 'lumineux', 'douloureux', 'joyeux'];

export function mysterySetForToday(date: Date = new Date(), liturgicalSundays = true): MysterySetKey {
  const weekday = date.getDay();
  if (liturgicalSundays && weekday === 0) {
    const year = liturgicalYear(date);
    let start = 0;
    for (const season of year.seasons) {
      if (year.dayIndex < start + season.days) {
        if (season.key === 'avent') return 'joyeux';
        if (season.key === 'careme') return 'douloureux';
        break;
      }
      start += season.days;
    }
  }
  return DAY_SETS[weekday];
}

export type PrayerKey =
  | 'signe-croix'
  | 'credo'
  | 'notre-pere'
  | 'je-vous-salue-marie'
  | 'gloire-au-pere'
  | 'fatima'
  | 'intention'
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
  fatima: {
    name: 'Prière de Fatima',
    text:
      "Ô mon Jésus, pardonnez-nous nos péchés,\npréservez-nous du feu de l'enfer,\net conduisez au Ciel toutes les âmes,\nspécialement celles qui ont le plus besoin\nde votre miséricorde."
  },
  intention: {
    name: 'Intention de la dizaine',
    text:
      "Confiez à Marie une intention pour cette dizaine.\n\nPour vous-même, pour votre famille et vos amis, pour ceux qui souffrent, pour le Pape, les évêques et les prêtres, pour les défunts, pour une personne en particulier, pour vos ennemis."
  },
  'salve-regina': {
    name: 'Salve Regina',
    text:
      "Je vous salue, Reine, mère de miséricorde,\nnotre vie, notre douceur, notre espérance, je vous salue.\n\nEnfants d'Ève, exilés, nous crions vers vous ;\nvers vous nous soupirons,\ngémissant et pleurant dans cette vallée de larmes.\n\nÔ vous, notre avocate,\ntournez vers nous votre regard miséricordieux.\nEt, après cet exil, montrez-nous Jésus,\nle fruit béni de vos entrailles.\n\nÔ clémente, ô miséricordieuse, ô douce Vierge Marie."
  }
};

// --- Déroulé réglable (d'après prierlechapelet.com) ---

export interface RosaryConfig {
  signe: boolean;
  credo: boolean;
  introAve: boolean;
  annonce: boolean;
  fruit: boolean;
  evangile: boolean;
  intention: boolean;
  clausule: boolean;
  gloria: boolean;
  fatima: boolean;
  calendrier: boolean;
  salve: boolean;
  signeFin: boolean;
  abrege: boolean;
}

export type RosaryConfigKey = keyof RosaryConfig;

export const DEFAULT_ROSARY_CONFIG: RosaryConfig = {
  signe: true,
  credo: true,
  introAve: true,
  annonce: true,
  fruit: true,
  evangile: false,
  intention: false,
  clausule: false,
  gloria: true,
  fatima: true,
  calendrier: true,
  salve: true,
  signeFin: false,
  abrege: false
};

export interface RosaryConfigOption {
  key: RosaryConfigKey;
  name: string;
  hint: string;
}

export const ROSARY_CONFIG_GROUPS: Array<{ title: string; options: RosaryConfigOption[] }> = [
  {
    title: 'Sur la croix et le pendentif',
    options: [
      { key: 'signe', name: 'Signe de la croix', hint: 'Sur la croix, avant le Credo' },
      { key: 'credo', name: 'Je crois en Dieu', hint: 'Symbole des Apôtres' },
      { key: 'introAve', name: 'Notre Père, 3 Ave et Gloria', hint: 'Les 3 Ave pour les vertus théologales' }
    ]
  },
  {
    title: 'Avant chaque dizaine',
    options: [
      { key: 'annonce', name: 'Rappel du mystère', hint: "Méditation de Jean-Paul II sur l'épisode" },
      { key: 'fruit', name: 'Fruit du mystère', hint: 'À demander tout au long de la dizaine' },
      { key: 'evangile', name: "Passage de l'Évangile", hint: 'Lire quelques versets avant de réciter' },
      { key: 'intention', name: 'Intention de la dizaine', hint: 'Confier une intention à Marie' }
    ]
  },
  {
    title: 'Pendant la dizaine',
    options: [
      { key: 'clausule', name: 'Clausules', hint: 'Un mot sur le mystère ajouté à chaque Ave' },
      { key: 'gloria', name: 'Gloire au Père', hint: 'Après le dixième Ave' },
      { key: 'fatima', name: 'Prière de Fatima', hint: '« Ô mon Jésus… », dite par certains' }
    ]
  },
  {
    title: 'Mystères du jour',
    options: [
      {
        key: 'calendrier',
        name: "Dimanches de l'Avent et du Carême",
        hint: "Joyeux pendant l'Avent, douloureux pendant le Carême"
      }
    ]
  },
  {
    title: 'Pour terminer',
    options: [
      { key: 'salve', name: 'Salut, ô Reine', hint: 'Salve Regina' },
      { key: 'signeFin', name: 'Signe de la croix', hint: 'Pour clore la prière' }
    ]
  },
  {
    title: 'Affichage',
    options: [{ key: 'abrege', name: 'Ave abrégés', hint: 'Premières paroles seulement, après le premier Ave' }]
  }
];

/** Réglages stockés : on ne garde que les clés connues, à valeur booléenne. */
export function sanitizeRosaryConfig(raw: unknown): RosaryConfig {
  const config = { ...DEFAULT_ROSARY_CONFIG };
  if (raw && typeof raw === 'object') {
    for (const key of Object.keys(config) as RosaryConfigKey[]) {
      const value = (raw as Record<string, unknown>)[key];
      if (typeof value === 'boolean') config[key] = value;
    }
  }
  return config;
}

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

export type RosaryPhase = 'ouverture' | 'dizaine' | 'conclusion';

export interface RosaryBead {
  /** 'mystere' : annonce du mystère de la dizaine (pas une prière). */
  prayerKey: PrayerKey | 'mystere';
  // null : étape de prière sans grain (dite sur la chaîne).
  bead: BeadImageKey | null;
  mysteryIndex: number | null;
  phase: RosaryPhase;
  /** Rang de l'Ave (1 à 3 en ouverture, 1 à 10 dans une dizaine). */
  aveNumber?: number;
  // Un bout de chaîne plus long sépare ce grain du précédent.
  gapBefore?: boolean;
}

// La structure de la séquence (prières et couleurs de grains) est la même
// pour les quatre séries ; seuls les noms des mystères diffèrent, et sont
// affichés séparément via MYSTERY_SETS[key].mysteries[mysteryIndex].
export function buildSequence(config: RosaryConfig = DEFAULT_ROSARY_CONFIG): RosaryBead[] {
  const beads: RosaryBead[] = [];

  // Croix : la première prière de l'ouverture (signe de croix ou Credo) se
  // dit sur le crucifix, la suivante sur la chaîne.
  const opening = (['signe-croix', 'credo'] as const).filter((key) =>
    key === 'signe-croix' ? config.signe : config.credo
  );
  opening.forEach((prayerKey, i) => {
    beads.push({ prayerKey, bead: i === 0 ? 'crucifix' : null, mysteryIndex: null, phase: 'ouverture' });
  });

  // Gros grain, puis les 3 petits grains blancs, puis Gloire au Père, chaque
  // groupe séparé du précédent par un espace.
  if (config.introAve) {
    beads.push({ prayerKey: 'notre-pere', bead: 'notre-pere', mysteryIndex: null, phase: 'ouverture', gapBefore: true });
    for (let i = 0; i < 3; i += 1) {
      beads.push({
        prayerKey: 'je-vous-salue-marie',
        bead: 'blanc',
        mysteryIndex: null,
        phase: 'ouverture',
        aveNumber: i + 1,
        gapBefore: i === 0
      });
    }
    beads.push({ prayerKey: 'gloire-au-pere', bead: 'blanc', mysteryIndex: null, phase: 'ouverture', gapBefore: true });
  }

  for (let decade = 0; decade < 5; decade += 1) {
    const color = DECADE_COLORS[decade];
    // Annonce et intention se disent sur la chaîne, avant le Notre Père.
    if (config.annonce || config.evangile) {
      beads.push({ prayerKey: 'mystere', bead: null, mysteryIndex: decade, phase: 'dizaine' });
    }
    if (config.intention) {
      beads.push({ prayerKey: 'intention', bead: null, mysteryIndex: decade, phase: 'dizaine' });
    }
    // Entrée dans la couronne : le Notre Père de la première dizaine se dit
    // au médaillon, les suivants au gros grain de leur dizaine, isolé par un
    // espace de part et d'autre.
    beads.push({
      prayerKey: 'notre-pere',
      bead: decade === 0 ? 'medaille' : 'notre-pere',
      mysteryIndex: decade,
      phase: 'dizaine',
      gapBefore: true
    });
    for (let i = 0; i < 10; i += 1) {
      beads.push({
        prayerKey: 'je-vous-salue-marie',
        bead: color,
        mysteryIndex: decade,
        phase: 'dizaine',
        aveNumber: i + 1,
        gapBefore: i === 0
      });
    }
    // Gloire au Père et prière de Fatima se disent sur la chaîne.
    if (config.gloria) {
      beads.push({ prayerKey: 'gloire-au-pere', bead: null, mysteryIndex: decade, phase: 'dizaine' });
    }
    if (config.fatima) {
      beads.push({ prayerKey: 'fatima', bead: null, mysteryIndex: decade, phase: 'dizaine' });
    }
  }

  // Clôture : la première prière (Salve Regina ou signe de croix) se dit au
  // médaillon (pas de second crucifix dans la couronne), la suivante sur la
  // chaîne.
  const closing = (['salve-regina', 'signe-croix'] as const).filter((key) =>
    key === 'salve-regina' ? config.salve : config.signeFin
  );
  closing.forEach((prayerKey, i) => {
    beads.push({ prayerKey, bead: i === 0 ? 'medaille' : null, mysteryIndex: null, phase: 'conclusion' });
  });

  return beads;
}
