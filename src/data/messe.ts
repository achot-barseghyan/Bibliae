// Les prières de la messe (section III de Prier) : le déroulé de la messe
// dominicale, moment par moment, dans la traduction du Missel romain de 2021.
// Chaque moment dit qui parle, ce que l'assemblée répond, l'attitude, le geste
// éventuel et pourquoi ce moment existe.

/**
 * Qui parle :
 * P prêtre · L lecteur · D diacre ou prêtre · M prêtre ou ministre de la communion ·
 * A assemblée · T tous ensemble · R remarque (rubrique, explication).
 */
export type MassRole = 'P' | 'L' | 'D' | 'M' | 'A' | 'T' | 'R';

export interface MassLine {
  role: MassRole;
  text: string;
}

export type MassPart = 'Ouverture' | 'Parole de Dieu' | 'Eucharistie' | 'Communion' | 'Envoi';

export interface MassMoment {
  id: string;
  part: MassPart;
  name: string;
  posture: string;
  lines: MassLine[];
  why: string;
  gesture?: string;
  /** Réponse ou prière à savoir par cœur. */
  essential: boolean;
}

export const MASS_PARTS: MassPart[] = ['Ouverture', 'Parole de Dieu', 'Eucharistie', 'Communion', 'Envoi'];

const l = (role: MassRole, text: string): MassLine => ({ role, text });

export const MASS_MOMENTS: MassMoment[] = [
  {
    id: 'signe-de-croix',
    part: 'Ouverture',
    name: 'Le signe de croix',
    posture: 'Debout',
    lines: [l('P', 'Au nom du Père, et du Fils, et du Saint-Esprit.'), l('A', 'Amen.')],
    why: "La messe commence comme toute prière chrétienne : au nom de la Trinité. Le « Amen » de l'assemblée veut dire « Oui, c'est vrai, je m'engage ».",
    gesture: 'Chacun fait le signe de croix en même temps que le prêtre : front, poitrine, épaule gauche, épaule droite.',
    essential: true
  },
  {
    id: 'salutation',
    part: 'Ouverture',
    name: 'La salutation',
    posture: 'Debout',
    lines: [l('P', 'Le Seigneur soit avec vous.'), l('A', 'Et avec votre esprit.')],
    why: 'Le prêtre rappelle que le Christ est présent au milieu de ceux qui sont rassemblés en son nom. Ce dialogue revient plusieurs fois pendant la messe.',
    essential: true
  },
  {
    id: 'je-confesse',
    part: 'Ouverture',
    name: 'Je confesse à Dieu',
    posture: 'Debout',
    lines: [
      l('P', "Frères et sœurs, préparons-nous à célébrer le mystère de l'Eucharistie, en reconnaissant que nous avons péché."),
      l(
        'T',
        "Je confesse à Dieu tout-puissant,\nje reconnais devant vous, frères et sœurs,\nque j'ai péché\nen pensée, en parole, par action et par omission.\nOui, j'ai vraiment péché.\nC'est pourquoi je supplie la bienheureuse Vierge Marie,\nles anges et tous les saints,\net vous aussi, frères et sœurs,\nde prier pour moi le Seigneur notre Dieu."
      ),
      l('P', "Que Dieu tout-puissant nous fasse miséricorde ; qu'il nous pardonne nos péchés et nous conduise à la vie éternelle."),
      l('A', 'Amen.')
    ],
    why: "Avant de rencontrer Dieu, on reconnaît ses fautes devant lui et devant les autres. Ce n'est pas encore le sacrement de la confession, mais une demande de pardon de toute l'assemblée.",
    gesture: 'À « Oui, j\'ai vraiment péché », on peut se frapper la poitrine, signe biblique du repentir (Lc 18, 13).',
    essential: true
  },
  {
    id: 'kyrie',
    part: 'Ouverture',
    name: 'Seigneur, prends pitié',
    posture: 'Debout',
    lines: [
      l('P', 'Seigneur, prends pitié.'),
      l('A', 'Seigneur, prends pitié.'),
      l('P', 'Ô Christ, prends pitié.'),
      l('A', 'Ô Christ, prends pitié.'),
      l('P', 'Seigneur, prends pitié.'),
      l('A', 'Seigneur, prends pitié.'),
      l('R', 'Il est parfois chanté en grec : « Kyrie, eleison. Christe, eleison. Kyrie, eleison. »')
    ],
    why: 'Une des plus anciennes acclamations de la liturgie, gardée en grec dans de nombreuses paroisses. On acclame le Christ qui fait miséricorde.',
    essential: true
  },
  {
    id: 'gloria',
    part: 'Ouverture',
    name: 'Gloire à Dieu',
    posture: 'Debout',
    lines: [
      l(
        'T',
        "Gloire à Dieu, au plus haut des cieux,\net paix sur la terre aux hommes qu'il aime.\nNous te louons, nous te bénissons, nous t'adorons,\nnous te glorifions, nous te rendons grâce,\npour ton immense gloire,\nSeigneur Dieu, Roi du ciel,\nDieu le Père tout-puissant.\n\nSeigneur, Fils unique, Jésus Christ,\nSeigneur Dieu, Agneau de Dieu, le Fils du Père ;\ntoi qui enlèves les péchés du monde, prends pitié de nous ;\ntoi qui enlèves les péchés du monde, reçois notre prière ;\ntoi qui es assis à la droite du Père, prends pitié de nous.\n\nCar toi seul es saint,\ntoi seul es Seigneur,\ntoi seul es le Très-Haut :\nJésus Christ, avec le Saint-Esprit,\ndans la gloire de Dieu le Père.\nAmen."
      ),
      l('R', "Chanté ou dit les dimanches et les jours de fête, sauf pendant l'Avent et le Carême.")
    ],
    why: 'Ce chant reprend le chant des anges à la naissance de Jésus (Lc 2, 14). C\'est une louange pure : on ne demande rien, on rend gloire.',
    essential: true
  },
  {
    id: 'collecte',
    part: 'Ouverture',
    name: "La prière d'ouverture",
    posture: 'Debout',
    lines: [
      l('P', 'Prions le Seigneur.'),
      l('R', 'Un court silence, puis le prêtre dit la prière du jour, appelée « collecte ».'),
      l('A', 'Amen.')
    ],
    why: 'Le prêtre rassemble en une seule prière les intentions silencieuses de chacun. Le texte change à chaque messe.',
    essential: false
  },
  {
    id: 'premiere-lecture',
    part: 'Parole de Dieu',
    name: 'La première lecture',
    posture: 'Assis',
    lines: [
      l('R', "Un lecteur lit un passage de l'Ancien Testament, ou des Actes des Apôtres au temps pascal."),
      l('L', 'Parole du Seigneur.'),
      l('A', 'Nous rendons grâce à Dieu.')
    ],
    why: "Dieu parle à son peuple. L'Ancien Testament prépare et éclaire l'Évangile du jour.",
    essential: true
  },
  {
    id: 'psaume',
    part: 'Parole de Dieu',
    name: 'Le psaume',
    posture: 'Assis',
    lines: [l('R', 'Un chantre chante les versets du psaume.'), l('A', "L'assemblée reprend le refrain après chaque strophe.")],
    why: 'Le peuple répond à la Parole de Dieu avec les mots mêmes de la Bible : les psaumes sont les prières que Jésus priait.',
    essential: false
  },
  {
    id: 'deuxieme-lecture',
    part: 'Parole de Dieu',
    name: 'La deuxième lecture',
    posture: 'Assis',
    lines: [
      l('R', "Les dimanches et les jours de fête, un passage d'une lettre des apôtres."),
      l('L', 'Parole du Seigneur.'),
      l('A', 'Nous rendons grâce à Dieu.')
    ],
    why: "Les lettres des apôtres montrent comment les premiers chrétiens vivaient de l'Évangile.",
    essential: false
  },
  {
    id: 'alleluia',
    part: 'Parole de Dieu',
    name: "L'acclamation de l'Évangile",
    posture: 'Debout',
    lines: [
      l('A', 'Alléluia, alléluia, alléluia !'),
      l(
        'R',
        "Pendant le Carême, l'Alléluia est remplacé par une autre acclamation, par exemple : « Ta parole, Seigneur, est vérité, et ta loi, délivrance. »"
      )
    ],
    why: "« Alléluia » signifie en hébreu « Louez Dieu ». On se lève pour accueillir le Christ qui va parler dans l'Évangile.",
    essential: true
  },
  {
    id: 'evangile',
    part: 'Parole de Dieu',
    name: "L'Évangile",
    posture: 'Debout',
    lines: [
      l('D', 'Le Seigneur soit avec vous.'),
      l('A', 'Et avec votre esprit.'),
      l('D', 'Évangile de Jésus Christ selon saint N.'),
      l('A', 'Gloire à toi, Seigneur.'),
      l('R', "Lecture de l'Évangile."),
      l('D', 'Acclamons la Parole de Dieu.'),
      l('A', 'Louange à toi, Seigneur Jésus.')
    ],
    why: "C'est le sommet de la liturgie de la Parole : le Christ lui-même parle. C'est pourquoi on l'écoute debout.",
    gesture:
      "À l'annonce de l'Évangile, on trace avec le pouce une petite croix sur le front, sur les lèvres et sur le cœur, pour que la Parole soit dans notre esprit, sur nos lèvres et dans notre cœur.",
    essential: true
  },
  {
    id: 'homelie',
    part: 'Parole de Dieu',
    name: "L'homélie",
    posture: 'Assis',
    lines: [l('R', 'Le prêtre ou le diacre explique les lectures et montre comment en vivre aujourd\'hui.')],
    why: "L'homélie fait le lien entre la Parole de Dieu et la vie concrète de ceux qui l'écoutent.",
    essential: false
  },
  {
    id: 'credo',
    part: 'Parole de Dieu',
    name: 'Je crois en Dieu',
    posture: 'Debout',
    lines: [
      l('R', 'Deux formes sont possibles. La plus courante en paroisse est le Symbole des Apôtres :'),
      l(
        'T',
        "Je crois en Dieu,\nle Père tout-puissant,\ncréateur du ciel et de la terre.\n\nEt en Jésus Christ, son Fils unique, notre Seigneur,\nqui a été conçu du Saint-Esprit,\nest né de la Vierge Marie,\na souffert sous Ponce Pilate,\na été crucifié, est mort et a été enseveli,\nest descendu aux enfers,\nle troisième jour est ressuscité des morts,\nest monté aux cieux,\nest assis à la droite de Dieu le Père tout-puissant,\nd'où il viendra juger les vivants et les morts.\n\nJe crois en l'Esprit Saint,\nà la sainte Église catholique,\nà la communion des saints,\nà la rémission des péchés,\nà la résurrection de la chair,\nà la vie éternelle.\nAmen."
      ),
      l('R', "L'autre forme, plus longue, est le Symbole de Nicée-Constantinople. Elle est dite surtout aux grandes fêtes :"),
      l(
        'T',
        "Je crois en un seul Dieu,\nle Père tout-puissant,\ncréateur du ciel et de la terre,\nde l'univers visible et invisible.\n\nJe crois en un seul Seigneur, Jésus Christ,\nle Fils unique de Dieu,\nné du Père avant tous les siècles :\nil est Dieu, né de Dieu,\nlumière, née de la lumière,\nvrai Dieu, né du vrai Dieu,\nengendré, non pas créé,\nconsubstantiel au Père,\net par lui tout a été fait.\nPour nous les hommes, et pour notre salut,\nil descendit du ciel ;\npar l'Esprit Saint, il a pris chair de la Vierge Marie,\net s'est fait homme.\nCrucifié pour nous sous Ponce Pilate,\nil souffrit sa passion et fut mis au tombeau.\nIl ressuscita le troisième jour,\nconformément aux Écritures,\net il monta au ciel ;\nil est assis à la droite du Père.\nIl reviendra dans la gloire,\npour juger les vivants et les morts ;\net son règne n'aura pas de fin.\n\nJe crois en l'Esprit Saint,\nqui est Seigneur et qui donne la vie ;\nil procède du Père et du Fils ;\navec le Père et le Fils,\nil reçoit même adoration et même gloire ;\nil a parlé par les prophètes.\n\nJe crois en l'Église,\nune, sainte, catholique et apostolique.\nJe reconnais un seul baptême\npour le pardon des péchés.\nJ'attends la résurrection des morts,\net la vie du monde à venir.\nAmen."
      ),
      l('R', 'Le Credo est dit les dimanches et les jours de fête.')
    ],
    why: "Le Credo résume toute la foi de l'Église. Le Symbole des Apôtres est l'ancienne profession de foi du baptême à Rome. Le Symbole de Nicée-Constantinople a été fixé par les conciles de Nicée (325) et de Constantinople (381).",
    gesture:
      "On s'incline profondément aux mots qui disent l'Incarnation : « qui a été conçu du Saint-Esprit, est né de la Vierge Marie » dans le Symbole des Apôtres, ou « par l'Esprit Saint, il a pris chair de la Vierge Marie, et s'est fait homme » dans le Symbole de Nicée-Constantinople.",
    essential: true
  },
  {
    id: 'priere-universelle',
    part: 'Parole de Dieu',
    name: 'La prière universelle',
    posture: 'Debout',
    lines: [
      l('R', "Un lecteur propose des intentions pour l'Église, le monde, les personnes qui souffrent et la communauté."),
      l('A', "L'assemblée répond par un refrain, par exemple : « Seigneur, écoute-nous, Seigneur, exauce-nous. »")
    ],
    why: "On prie pour tous, pas seulement pour soi. C'est la prière des baptisés pour le monde entier.",
    essential: false
  },
  {
    id: 'presentation-des-dons',
    part: 'Eucharistie',
    name: 'La présentation des dons',
    posture: 'Assis',
    lines: [
      l('R', "Le pain et le vin sont apportés à l'autel. Le prêtre dit à voix basse ou à voix haute :"),
      l('P', "Tu es béni, Seigneur, Dieu de l'univers, toi qui nous donnes ce pain, fruit de la terre et du travail des hommes."),
      l('A', 'Béni soit Dieu, maintenant et toujours !'),
      l('R', 'Pendant ce temps a souvent lieu la quête.')
    ],
    why: 'Le pain et le vin, fruits du travail humain, sont offerts à Dieu. Ils vont devenir le Corps et le Sang du Christ.',
    essential: false
  },
  {
    id: 'orate-fratres',
    part: 'Eucharistie',
    name: 'Priez, frères et sœurs',
    posture: 'Debout',
    lines: [
      l('P', 'Priez, frères et sœurs : que mon sacrifice, qui est aussi le vôtre, soit agréable à Dieu le Père tout-puissant.'),
      l(
        'A',
        'Que le Seigneur reçoive de vos mains ce sacrifice\nà la louange et à la gloire de son nom,\npour notre bien\net celui de toute sa sainte Église.'
      ),
      l('R', 'Puis le prêtre dit la prière sur les offrandes.'),
      l('A', 'Amen.')
    ],
    why: "Le sacrifice est offert par le prêtre, mais toute l'assemblée s'y unit. On se lève à « Priez, frères et sœurs ».",
    essential: true
  },
  {
    id: 'preface',
    part: 'Eucharistie',
    name: 'Élevons notre cœur',
    posture: 'Debout',
    lines: [
      l('P', 'Le Seigneur soit avec vous.'),
      l('A', 'Et avec votre esprit.'),
      l('P', 'Élevons notre cœur.'),
      l('A', 'Nous le tournons vers le Seigneur.'),
      l('P', 'Rendons grâce au Seigneur notre Dieu.'),
      l('A', 'Cela est juste et bon.')
    ],
    why: 'Ce dialogue ouvre la grande prière eucharistique. Il est attesté depuis le IIIe siècle, presque mot pour mot.',
    essential: true
  },
  {
    id: 'sanctus',
    part: 'Eucharistie',
    name: 'Saint, saint, saint',
    posture: 'Debout',
    lines: [
      l(
        'T',
        "Saint ! Saint ! Saint, le Seigneur, Dieu de l'univers !\nLe ciel et la terre sont remplis de ta gloire.\nHosanna au plus haut des cieux.\nBéni soit celui qui vient au nom du Seigneur.\nHosanna au plus haut des cieux."
      )
    ],
    why: "L'assemblée s'unit au chant des anges que le prophète Isaïe a entendu (Is 6, 3), puis à l'acclamation de la foule qui accueillait Jésus à Jérusalem (Mt 21, 9).",
    essential: true
  },
  {
    id: 'consecration',
    part: 'Eucharistie',
    name: 'La consécration',
    posture: 'À genoux ou debout',
    lines: [
      l('R', 'Le prêtre redit les paroles de Jésus à la Cène :'),
      l('P', 'Ceci est mon Corps livré pour vous.'),
      l(
        'P',
        "Ceci est la coupe de mon Sang, le Sang de l'Alliance nouvelle et éternelle, qui sera versé pour vous et pour la multitude en rémission des péchés. Vous ferez cela en mémoire de moi."
      ),
      l('R', "Le prêtre élève l'hostie, puis le calice. On les regarde en silence.")
    ],
    why: "C'est le cœur de la messe. L'Église croit que, par ces paroles et l'action de l'Esprit Saint, le pain et le vin deviennent réellement le Corps et le Sang du Christ.",
    gesture:
      "Selon l'usage du lieu, on se met à genoux ou on reste debout. Quand le prêtre élève l'hostie, on peut dire intérieurement : « Mon Seigneur et mon Dieu » (Jn 20, 28).",
    essential: false
  },
  {
    id: 'anamnese',
    part: 'Eucharistie',
    name: 'Il est grand, le mystère de la foi',
    posture: 'Debout',
    lines: [
      l('P', 'Il est grand, le mystère de la foi :'),
      l('A', 'Nous annonçons ta mort, Seigneur Jésus,\nnous proclamons ta résurrection,\nnous attendons ta venue dans la gloire.')
    ],
    why: 'Cette acclamation, appelée anamnèse, résume le mystère pascal : la mort, la résurrection et le retour du Christ.',
    essential: true
  },
  {
    id: 'doxologie',
    part: 'Eucharistie',
    name: 'Par lui, avec lui et en lui',
    posture: 'Debout',
    lines: [
      l(
        'P',
        "Par lui, avec lui et en lui,\nà toi, Dieu le Père tout-puissant,\ndans l'unité du Saint-Esprit,\ntout honneur et toute gloire,\npour les siècles des siècles."
      ),
      l('A', 'Amen.')
    ],
    why: "La prière eucharistique se termine par cette louange à la Trinité. Le « Amen » de l'assemblée est le plus important de la messe : il ratifie toute la prière.",
    essential: true
  },
  {
    id: 'notre-pere',
    part: 'Communion',
    name: 'Notre Père',
    posture: 'Debout',
    lines: [
      l('P', 'Comme nous l\'avons appris du Sauveur, et selon son commandement, nous osons dire :'),
      l(
        'T',
        "Notre Père, qui es aux cieux,\nque ton nom soit sanctifié,\nque ton règne vienne,\nque ta volonté soit faite\nsur la terre comme au ciel.\nDonne-nous aujourd'hui\nnotre pain de ce jour.\nPardonne-nous nos offenses,\ncomme nous pardonnons aussi\nà ceux qui nous ont offensés.\nEt ne nous laisse pas entrer en tentation,\nmais délivre-nous du Mal."
      ),
      l(
        'P',
        "Délivre-nous de tout mal, Seigneur, et donne la paix à notre temps… nous qui attendons que se réalise cette bienheureuse espérance : l'avènement de Jésus Christ, notre Sauveur."
      ),
      l('A', "Car c'est à toi qu'appartiennent\nle règne, la puissance et la gloire,\npour les siècles des siècles !")
    ],
    why: 'La prière que Jésus a lui-même enseignée (Mt 6, 9-13). Avant de communier, on demande le pain de ce jour et le pardon.',
    gesture: "Certains prient les mains ouvertes, d'autres les mains jointes.",
    essential: true
  },
  {
    id: 'geste-de-paix',
    part: 'Communion',
    name: 'Le geste de paix',
    posture: 'Debout',
    lines: [
      l('P', 'La paix du Seigneur soit toujours avec vous.'),
      l('A', 'Et avec votre esprit.'),
      l('D', 'Dans la charité du Christ, donnez-vous la paix.')
    ],
    why: 'Avant de communier au Christ, on se réconcilie avec ses frères (Mt 5, 23-24).',
    gesture: 'On échange un signe de paix avec ses voisins : une poignée de main ou un signe de tête, en disant par exemple « La paix du Christ ».',
    essential: true
  },
  {
    id: 'agnus-dei',
    part: 'Communion',
    name: 'Agneau de Dieu',
    posture: 'Debout',
    lines: [
      l(
        'T',
        'Agneau de Dieu, qui enlèves les péchés du monde,\nprends pitié de nous.\nAgneau de Dieu, qui enlèves les péchés du monde,\nprends pitié de nous.\nAgneau de Dieu, qui enlèves les péchés du monde,\ndonne-nous la paix.'
      )
    ],
    why: "Ces mots reprennent ceux de Jean-Baptiste en voyant Jésus : « Voici l'Agneau de Dieu, qui enlève le péché du monde » (Jn 1, 29). Pendant ce chant, le prêtre rompt l'hostie.",
    essential: true
  },
  {
    id: 'domine-non-sum-dignus',
    part: 'Communion',
    name: 'Seigneur, je ne suis pas digne',
    posture: 'À genoux ou debout',
    lines: [
      l(
        'P',
        "Voici l'Agneau de Dieu, voici celui qui enlève les péchés du monde. Heureux les invités au repas des noces de l'Agneau !"
      ),
      l('A', 'Seigneur, je ne suis pas digne de te recevoir ;\nmais dis seulement une parole,\net je serai guéri.')
    ],
    why: 'Ces mots sont ceux du centurion romain qui demandait à Jésus de guérir son serviteur (Mt 8, 8). On reconnaît son humilité avant de recevoir le Christ.',
    essential: true
  },
  {
    id: 'communion',
    part: 'Communion',
    name: 'La communion',
    posture: 'Debout',
    lines: [
      l('M', 'Le Corps du Christ.'),
      l('A', 'Amen.'),
      l(
        'R',
        'La communion est réservée aux catholiques baptisés qui ont fait leur première communion et qui ne sont pas en état de péché grave.'
      ),
      l(
        'R',
        "Si tu n'es pas baptisé ou ne communies pas, tu peux t'avancer les bras croisés sur la poitrine pour recevoir une bénédiction, ou rester à ta place pour prier."
      )
    ],
    why: 'Celui qui communie reçoit le Christ lui-même. Le « Amen » veut dire : « Oui, je crois que c\'est le Corps du Christ ».',
    gesture:
      "On reçoit l'hostie dans la main, la main gauche posée sur la droite, puis on communie aussitôt devant le ministre. On peut aussi la recevoir directement sur la langue.",
    essential: true
  },
  {
    id: 'priere-apres-la-communion',
    part: 'Communion',
    name: 'La prière après la communion',
    posture: 'Debout',
    lines: [
      l('R', "Après un temps de silence et d'action de grâce :"),
      l('P', 'Prions le Seigneur.'),
      l('R', 'Le prêtre dit la prière après la communion.'),
      l('A', 'Amen.')
    ],
    why: "Un moment pour remercier Dieu en silence de ce que l'on vient de recevoir.",
    gesture: 'Après avoir communié, on regagne sa place et on prie en silence, assis ou à genoux.',
    essential: false
  },
  {
    id: 'benediction',
    part: 'Envoi',
    name: 'La bénédiction',
    posture: 'Debout',
    lines: [
      l('P', 'Le Seigneur soit avec vous.'),
      l('A', 'Et avec votre esprit.'),
      l('P', 'Que Dieu tout-puissant vous bénisse, le Père, et le Fils, et le Saint-Esprit.'),
      l('A', 'Amen.')
    ],
    why: 'La messe se termine comme elle a commencé, au nom de la Trinité.',
    gesture: "On fait le signe de croix pendant que le prêtre bénit l'assemblée.",
    essential: true
  },
  {
    id: 'envoi',
    part: 'Envoi',
    name: "L'envoi",
    posture: 'Debout',
    lines: [l('D', 'Allez, dans la paix du Christ.'), l('A', 'Nous rendons grâce à Dieu.')],
    why: 'Le mot « messe » vient du latin « missa », l\'envoi. Chacun est envoyé vivre ce qu\'il a reçu dans sa vie de tous les jours.',
    essential: true
  }
];

export interface MassPrayer {
  part: MassPart;
  name: string;
  subtitle?: string;
  text: string;
}

/** k-ième texte dit par l'assemblée ou par tous, dans le moment donné. */
const said = (id: string, k: number): string => {
  const moment = MASS_MOMENTS.find((m) => m.id === id);
  const lines = moment?.lines.filter((x) => x.role === 'T' || x.role === 'A') ?? [];
  return lines[k]?.text ?? '';
};

/** Les dix prières de l'assemblée, à lire d'un trait (onglet « Les prières »). */
export const MASS_PRAYERS: MassPrayer[] = [
  { part: 'Ouverture', name: 'Je confesse à Dieu', text: said('je-confesse', 0) },
  {
    part: 'Ouverture',
    name: 'Seigneur, prends pitié',
    subtitle: 'Kyrie · en français et dans sa forme ancienne',
    text: 'Seigneur, prends pitié.\nÔ Christ, prends pitié.\nSeigneur, prends pitié.\n\nKyrie, eleison.\nChriste, eleison.\nKyrie, eleison.'
  },
  { part: 'Ouverture', name: 'Gloire à Dieu', subtitle: 'Gloria', text: said('gloria', 0) },
  { part: 'Parole de Dieu', name: 'Je crois en Dieu', subtitle: 'Symbole des Apôtres', text: said('credo', 0) },
  { part: 'Parole de Dieu', name: 'Je crois en un seul Dieu', subtitle: 'Symbole de Nicée-Constantinople', text: said('credo', 1) },
  { part: 'Eucharistie', name: 'Saint, saint, saint', subtitle: 'Sanctus', text: said('sanctus', 0) },
  {
    part: 'Eucharistie',
    name: 'Nous annonçons ta mort',
    subtitle: 'Après « Il est grand, le mystère de la foi »',
    text: said('anamnese', 0)
  },
  { part: 'Communion', name: 'Notre Père', text: `${said('notre-pere', 0)}\n\n${said('notre-pere', 1)}` },
  { part: 'Communion', name: 'Agneau de Dieu', subtitle: 'Agnus Dei', text: said('agnus-dei', 0) },
  { part: 'Communion', name: 'Seigneur, je ne suis pas digne', subtitle: 'Avant la communion', text: said('domine-non-sum-dignus', 0) }
];

/**
 * Signe de l'attitude, affiché dans la pastille du moment. Le sélecteur
 * de variante texte (U+FE0E) évite l'affichage en émoji sur iPhone.
 */
export const POSTURE_GLYPHS: Record<string, string> = {
  Debout: '↑︎',
  Assis: '⌒︎',
  'À genoux ou debout': '✚︎',
  'Assis ou à genoux': '⌒︎'
};

export const MASS_SOURCE = 'Missel romain · traduction 2021';
