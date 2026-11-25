// Prières du matin et du soir : textes proposés, étapes de la prière, plages
// horaires et rotation quotidienne. La carte de l'Accueil suit l'heure ; le
// matin, une des prières est proposée chaque jour à tour de rôle (le soir de
// même), et l'on peut en changer — ou écrire la sienne — dans l'écran de prière.

export type PrayerMoment = 'matin' | 'soir';

/** Prières de base insérables dans le déroulé d'une prière personnelle. */
export type BasePrayerKey = 'croix' | 'pater' | 'ave' | 'gloria' | 'credo';
export type PrayerBlockKind = BasePrayerKey | 'mine';

export interface PrayerBlock {
  id: string;
  k: PrayerBlockKind;
  /** Nombre de récitations (toujours 1 pour « Ma prière »). */
  n: number;
}

export interface CustomPrayer {
  id: string;
  moment: PrayerMoment;
  title: string;
  text: string;
  blocks: PrayerBlock[];
  createdAt: string;
  updatedAt: string;
}

export interface DailyPrayerSettings {
  /** Heures pleines (0-23). Une plage peut passer minuit (20 h – 1 h). */
  morningStart: number;
  morningEnd: number;
  eveningStart: number;
  eveningEnd: number;
  /** Encart « Les étapes de la prière » en tête de l'écran de prière. */
  showSteps: boolean;
}

export const DEFAULT_DAILY_PRAYER_SETTINGS: DailyPrayerSettings = {
  morningStart: 5,
  morningEnd: 10,
  eveningStart: 20,
  eveningEnd: 1,
  showSteps: true
};

const isHour = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v >= 0 && v < 24;

export function sanitizeDailyPrayerSettings(raw: unknown): DailyPrayerSettings {
  const d = DEFAULT_DAILY_PRAYER_SETTINGS;
  const v = (typeof raw === 'object' && raw !== null ? raw : {}) as Partial<Record<keyof DailyPrayerSettings, unknown>>;
  return {
    morningStart: isHour(v.morningStart) ? v.morningStart : d.morningStart,
    morningEnd: isHour(v.morningEnd) ? v.morningEnd : d.morningEnd,
    eveningStart: isHour(v.eveningStart) ? v.eveningStart : d.eveningStart,
    eveningEnd: isHour(v.eveningEnd) ? v.eveningEnd : d.eveningEnd,
    showSteps: typeof v.showSteps === 'boolean' ? v.showSteps : d.showSteps
  };
}

const BLOCK_KINDS: PrayerBlockKind[] = ['croix', 'pater', 'ave', 'gloria', 'credo', 'mine'];

function isCustomPrayerShape(value: unknown): value is CustomPrayer {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    (v.moment === 'matin' || v.moment === 'soir') &&
    typeof v.title === 'string' &&
    typeof v.text === 'string' &&
    typeof v.createdAt === 'string' &&
    typeof v.updatedAt === 'string'
  );
}

export function sanitizeCustomPrayers(value: unknown): CustomPrayer[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isCustomPrayerShape).map((p) => {
    const blocks = Array.isArray(p.blocks)
      ? p.blocks.filter(
          (b): b is PrayerBlock =>
            typeof b === 'object' &&
            b !== null &&
            typeof b.id === 'string' &&
            BLOCK_KINDS.includes(b.k) &&
            typeof b.n === 'number'
        )
      : [];
    // « Ma prière » doit figurer une fois dans le déroulé.
    return { ...p, blocks: blocks.some((b) => b.k === 'mine') ? blocks : defaultBlocks() };
  });
}

// --- Textes ------------------------------------------------------------------

export const BASE_PRAYERS: Record<BasePrayerKey, { label: string; text: string }> = {
  croix: { label: 'Signe de croix', text: 'Au nom du Père, et du Fils, et du Saint-Esprit. Amen.' },
  pater: {
    label: 'Notre Père',
    text: 'Notre Père, qui es aux cieux, que ton nom soit sanctifié, que ton règne vienne, que ta volonté soit faite sur la terre comme au ciel. Donne-nous aujourd’hui notre pain de ce jour. Pardonne-nous nos offenses, comme nous pardonnons aussi à ceux qui nous ont offensés. Et ne nous laisse pas entrer en tentation, mais délivre-nous du Mal. Amen.'
  },
  ave: {
    label: 'Je vous salue Marie',
    text: 'Je vous salue, Marie, pleine de grâce. Le Seigneur est avec vous. Vous êtes bénie entre toutes les femmes et Jésus, le fruit de vos entrailles, est béni. Sainte Marie, Mère de Dieu, priez pour nous, pauvres pécheurs, maintenant et à l’heure de notre mort. Amen.'
  },
  gloria: {
    label: 'Gloire au Père',
    text: 'Gloire au Père, et au Fils, et au Saint-Esprit, comme il était au commencement, maintenant et toujours, pour les siècles des siècles. Amen.'
  },
  credo: {
    label: 'Credo',
    text: 'Je crois en Dieu, le Père tout-puissant, Créateur du ciel et de la terre. Et en Jésus-Christ, son Fils unique, notre Seigneur, qui a été conçu du Saint-Esprit, est né de la Vierge Marie, a souffert sous Ponce Pilate, a été crucifié, est mort et a été enseveli, est descendu aux enfers, le troisième jour est ressuscité des morts, est monté aux cieux, est assis à la droite de Dieu le Père tout-puissant, d’où il viendra juger les vivants et les morts. Je crois en l’Esprit-Saint, à la sainte Église catholique, à la communion des saints, à la rémission des péchés, à la résurrection de la chair, à la vie éternelle. Amen.'
  }
};

export const BASE_PRAYER_KEYS = Object.keys(BASE_PRAYERS) as BasePrayerKey[];

/**
 * Prière proposée. Le matin, chaque paragraphe peut porter une réponse
 * (« – … », en italique) et une reprise (« | … »). Le soir, le texte est en
 * strophes de vers.
 */
export interface DailyPrayer {
  label: string;
  title: string;
  rubric: string;
  dur: string;
  paragraphs?: string[];
  stanzas?: string[][];
}

export const MORNING_PRAYERS: DailyPrayer[] = [
  {
    label: 'St François',
    title: 'Saint François d’Assise',
    rubric: 'Prière de saint François d’Assise',
    dur: '2 min',
    paragraphs: [
      'Seigneur, dans le silence de ce jour naissant, je viens te demander la paix, la sagesse et la force. Je veux regarder aujourd’hui le monde avec des yeux tout remplis de charité ; être patient, compréhensif, doux et humble ; voir tes enfants au-delà des apparences, comme tu les vois toi-même, et ainsi, ne voir que le bien en chacun. Ferme mes oreilles à toute calomnie, garde ma langue de toute malveillance et que seules les pensées qui bénissent demeurent en mon esprit. Que je sois si bienveillant et si joyeux que tous ceux qui m’approchent sentent ta puissance et ta présence. Revêts-moi de ta beauté, Seigneur, et qu’au long du jour je te révèle. Ainsi soit-il.'
    ]
  },
  {
    label: 'Ste Thérèse',
    title: 'Sainte Thérèse de Lisieux',
    rubric: 'Prière de sainte Thérèse de Lisieux',
    dur: '2 min',
    paragraphs: [
      'Mon Dieu, je t’offre toutes les actions que je vais faire aujourd’hui, dans les intentions et pour la gloire du cœur sacré de Jésus ; je veux sanctifier les battements de mon cœur, mes pensées et mes œuvres les plus simples en les unissant à ses mérites infinis, et réparer mes fautes en les jetant dans la fournaise de son amour miséricordieux.',
      'Ô mon Dieu ! Je te demande pour moi et pour ceux qui me sont chers la grâce d’accomplir parfaitement ta sainte volonté, d’accepter pour ton amour les joies et les peines de cette vie passagère afin que nous soyons un jour réunis dans les cieux pendant toute l’éternité. Amen.'
    ]
  },
  {
    label: 'Angélus',
    title: 'L’Angélus',
    rubric: 'Angélus',
    dur: '3 min',
    paragraphs: [
      'L’ange du Seigneur apporta l’annonce à Marie. – Et elle a conçu du Saint-Esprit.',
      'Je vous salue, Marie, pleine de Grâce. Le Seigneur est avec vous. Vous êtes bénie entre toutes les femmes et Jésus, le fruit de vos entrailles est béni. Sainte Marie, mère de Dieu, priez pour nous pauvres pécheurs, maintenant et à l’heure de notre mort. Amen.',
      'Voici la servante du Seigneur. – Qu’il me soit fait selon ta parole. | Je vous salue, Marie …',
      'Et le Verbe s’est fait chair. – Et il a habité parmi nous. | Je vous salue, Marie …',
      'Prie pour nous, Sainte Mère de Dieu. – Afin que nous soyons rendus dignes des promesses du Christ.',
      'Prions. Que ta grâce, Seigneur, se répande en nos cœurs. Par le message de l’ange, tu nous a fait connaître l’Incarnation de ton Fils bien aimé, conduis-nous, par sa passion et par sa croix jusqu’à la gloire de la résurrection. Par le Christ, notre Seigneur. Amen.'
    ]
  }
];

export const EVENING_PRAYERS: DailyPrayer[] = [
  {
    label: 'Le jour',
    title: 'Le jour s’achève',
    rubric: 'Prière',
    dur: '2 min',
    stanzas: [
      [
        'Seigneur,',
        'le jour s’achève, et je viens à Toi dans le silence.',
        'Merci pour tout ce que j’ai vécu,',
        'merci pour ce que j’ai compris,',
        'et même pour ce que je n’ai pas encore saisi.'
      ],
      [
        'Je Te confie ceux que j’aime,',
        'ceux que j’ai rencontrés,',
        'ceux que j’ai peut-être blessés.',
        'Pardonne mes manques d’amour,',
        'mes impatiences, mes oublis.'
      ],
      [
        'Je Te remets mes projets, mes doutes, mes pensées.',
        'Et je Te demande de veiller sur moi cette nuit,',
        'comme un Père veille sur son enfant endormi.',
        'Rends mon cœur paisible,',
        'et fais de ce repos un temps de régénération dans Ta paix.'
      ],
      ['Demain, je Te le confie déjà.', 'Mais pour ce soir, je Te dis simplement :', 'Je T’aime, et je me repose en Toi.', 'Amen.']
    ]
  },
  {
    label: 'Ste Thérèse',
    title: 'Sainte Thérèse de Lisieux',
    rubric: 'Prière du soir de sainte Thérèse de Lisieux',
    dur: '4 min',
    stanzas: [
      [
        'Ô Dieu caché dans la prison du tabernacle ! C’est avec bonheur que je reviens près de vous chaque soir, afin de vous remercier des grâces que vous m’avez accordées et d’implorer mon pardon pour les fautes que j’ai commises pendant la journée qui vient de s’écouler comme un songe. Ô Jésus ! Que je serais heureuse si j’avais été bien fidèle, mais hélas ! Souvent le soir je suis triste car je sens que j’aurais pu mieux répondre à vos grâces…'
      ],
      [
        'Si j’étais plus unie à vous, plus charitable avec mes sœurs, plus humble et plus mortifiée, j’aurais moins de peine à m’entretenir avec vous dans l’oraison. Cependant, ô mon Dieu ! Bien loin de me décourager par la vue de mes misères, je viens à vous avec confiance, me souvenant que : “Ce ne sont pas ceux qui se portent bien qui ont besoin de médecin, mais les malades”. Je vous supplie donc de me guérir, de me pardonner, et moi je me souviendrai, Seigneur, “que l’âme à laquelle vous avez remis davantage doit aussi vous aimer plus que les autres !” Je vous offre tous les battements de mon cœur comme autant d’actes d’amour et de réparation et je les unis à vos mérites infinis.'
      ],
      [
        'Je vous supplie, ô mon divin époux, d’être vous-même le réparateur de mon âme, d’agir en moi sans tenir compte de mes résistances, enfin je ne veux plus avoir d’autre volonté que la vôtre ; et demain, avec le secours de votre grâce, je recommencerai une nouvelle vie dont chaque instant sera un acte d’amour et de renoncement. Après être ainsi venue chaque soir au pied de votre autel, j’arriverai enfin au dernier soir de ma vie, alors commencera pour moi le jour sans couchant de l’éternité où je me reposerai sur votre divin cœur des luttes de l’exil ! Amen.'
      ]
    ]
  },
  {
    label: 'Curé d’Ars',
    title: 'À son Ange Gardien',
    rubric: 'Prière du soir à son Ange Gardien, du saint Curé d’Ars',
    dur: '1 min',
    stanzas: [
      [
        'Mon Dieu, je vous offre mon cœur, mon esprit, mes pensées, mes paroles, mes actions, tout moi-même, pour ne servir que votre gloire. Je renouvelle les promesses de mon baptême. Mon Ange gardien, je vous remercie de m’avoir gardé pendant ce jour ; offrez à Dieu tous les battements de mon cœur pendant que je dormirai.'
      ]
    ]
  },
  {
    label: 'Siméon',
    title: 'Le cantique de Siméon',
    rubric: 'Prière du soir tirée du cantique de Siméon (Luc, 29-32)',
    dur: '1 min',
    stanzas: [
      [
        'Maintenant, ô Maître souverain, tu peux laisser ton serviteur s’en aller en paix, selon ta parole.',
        'Car mes yeux ont vu le salut que tu préparais à la face des peuples :',
        'lumière qui se révèle aux nations et donne gloire à ton peuple Israël. »'
      ],
      [
        'Gloire au Père, au Fils et au Saint Esprit',
        'Comme il était au commencement, maintenant et toujours, et dans les siècles des siècles'
      ],
      ['Amen.']
    ]
  }
];

export const PRAYERS_BY_MOMENT: Record<PrayerMoment, DailyPrayer[]> = {
  matin: MORNING_PRAYERS,
  soir: EVENING_PRAYERS
};

export interface PrayerStep {
  t: string;
  a: string;
  /** Passage mis en relief au milieu du texte (« examen de conscience »). */
  em?: string;
  b?: string;
}

const LAST_STEP: PrayerStep = {
  t: 'Réciter une prière :',
  a: 'pour terminer votre moment avec Dieu, récitez la prière ci-dessous. Vous pouvez en choisir une autre avec les onglets en haut de l’écran… et pourquoi pas, aussi, l’écrire vous-même ?'
};

export const PRAYER_STEPS: Record<PrayerMoment, PrayerStep[]> = {
  matin: [
    {
      t: 'Remercier Dieu :',
      a: 'pour commencer ce temps avec Dieu, on peut le remercier pour la nuit passée, pour le jour qui commence, pour les personnes que l’on va rencontrer… Commencer la prière du matin par cela permet de disposer le cœur à voir l’œuvre de Dieu dans notre vie.'
    },
    {
      t: 'Demander Pardon :',
      a: 'on peut confier à Dieu ce qui pèse encore sur le cœur et lui demander la force de mieux aimer aujourd’hui. C’est aussi le moment de prendre une résolution pour la journée.'
    },
    {
      t: 'Demander des grâces :',
      a: 'il ne faut pas hésiter à demander à Dieu de guérir telle personne malade, de réconforter telle autre, de nous aider dans telle entreprise, de veiller sur telle personne… Nous avons tous des choses à demander au Seigneur.'
    },
    LAST_STEP
  ],
  soir: [
    {
      t: 'Remercier Dieu :',
      a: 'pour commencer ce temps avec Dieu, on peut le remercier de tous les beaux moments vécus dans la journée, des personnes rencontrées, des projets réalisés… Chaque jour peut contenir une multitude de moments pour lesquels dire Merci à Dieu. Commencer la prière du soir par cela permet de disposer le cœur à voir l’œuvre de Dieu dans notre vie.'
    },
    {
      t: 'Demander Pardon :',
      a: 'sous forme d’',
      em: 'examen de conscience',
      b: ' ou simplement d’intériorisation personnelle des étapes du jour, on peut se souvenir des moments pour lesquels on veut demander pardon à Dieu. Les moments où l’on a blessé une personne, critiqué, manqué de justice… La prière du soir est ainsi un moment pour regretter les fautes qu’on a faites dans la journée. On peut aussi prendre des résolutions pour le lendemain.'
    },
    {
      t: 'Demander des grâces :',
      a: 'enfin, la dernière étape de la prière du soir est celle des « s’il-te-plait ». Il ne faut pas hésiter à demander à Dieu de guérir telle personne malade, de réconforter telle autre, de nous aider dans telle entreprise, de veiller sur telle personne… Nous avons tous des choses à demander au Seigneur. La prière du soir est un moment privilégié pour le faire.'
    },
    LAST_STEP
  ]
};

// --- Prières personnelles ----------------------------------------------------

let blockSeq = 0;
export function newBlock(k: PrayerBlockKind, n = 1): PrayerBlock {
  return { id: `blk-${Date.now().toString(36)}-${(blockSeq++).toString(36)}`, k, n };
}

/** Déroulé proposé à la création : signe de croix, sa prière, Notre Père, Je vous salue, signe de croix. */
export function defaultBlocks(): PrayerBlock[] {
  return [newBlock('croix'), newBlock('mine'), newBlock('pater'), newBlock('ave'), newBlock('croix')];
}

export function blockLabel(block: PrayerBlock, title: string): string {
  return block.k === 'mine' ? title.trim() || 'Ma prière' : BASE_PRAYERS[block.k].label;
}

const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

/** Durée indicative, à 130 mots par minute. */
export function customPrayerDuration(prayer: Pick<CustomPrayer, 'text' | 'blocks'>): string {
  const words = prayer.blocks.reduce(
    (sum, b) => sum + wordCount(b.k === 'mine' ? prayer.text : BASE_PRAYERS[b.k].text) * b.n,
    0
  );
  return `${Math.max(1, Math.round(words / 130))} min`;
}

export interface ExpandedBlock {
  key: string;
  label: string;
  times: string;
  paragraphs: string[];
}

export function expandCustomPrayer(prayer: CustomPrayer): ExpandedBlock[] {
  return prayer.blocks.map((b) => ({
    key: b.id,
    label: b.k === 'mine' ? 'Ma prière' : BASE_PRAYERS[b.k].label,
    times: b.n > 1 ? `${b.n} fois` : '',
    paragraphs: b.k === 'mine' ? prayer.text.split(/\n\s*\n/) : [BASE_PRAYERS[b.k].text]
  }));
}

// --- Heure et rotation -------------------------------------------------------

export type PrayerPhase = PrayerMoment | 'jour';

export const mod24 = (x: number) => ((x % 24) + 24) % 24;

/** Plage [start, end[ en heures, éventuellement à cheval sur minuit. */
export function inRange(h: number, start: number, end: number): boolean {
  return start <= end ? h >= start && h < end : h >= start || h < end;
}

export function decimalHour(now: Date): number {
  return now.getHours() + now.getMinutes() / 60;
}

export function prayerPhase(now: Date, s: DailyPrayerSettings): PrayerPhase {
  const h = decimalHour(now);
  if (inRange(h, s.morningStart, s.morningEnd)) return 'matin';
  if (inRange(h, s.eveningStart, s.eveningEnd)) return 'soir';
  return 'jour';
}

/** Hors des plages : la prochaine prière et le temps qui la sépare de maintenant. */
export function nextPrayer(now: Date, s: DailyPrayerSettings): { moment: PrayerMoment; inHours: number } {
  const h = decimalHour(now);
  const toMorning = mod24(s.morningStart - h);
  const toEvening = mod24(s.eveningStart - h);
  return toEvening < toMorning ? { moment: 'soir', inHours: toEvening } : { moment: 'matin', inHours: toMorning };
}

/** « dans 3 h 05 » */
export function formatDelay(hours: number): string {
  const total = Math.round(hours * 60);
  return `dans ${Math.floor(total / 60)} h ${String(total % 60).padStart(2, '0')}`;
}

function dayOfYear(now: Date): number {
  return Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 864e5);
}

/** Prière proposée aujourd'hui, à tour de rôle. */
export function todayPrayerIndex(moment: PrayerMoment, now: Date): number {
  return dayOfYear(now) % PRAYERS_BY_MOMENT[moment].length;
}

/** « Lundi 3 novembre » */
export function capitalizedDate(now: Date): string {
  const label = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}
