/** Contenu de la page « Pourquoi croire » (apologétique). */

export interface ArgumentStep {
  /** Intitulé facultatif de l'étape (source, date, hypothèse…). */
  label?: string;
  text: string;
}

export interface Argument {
  kind: string;
  title: string;
  steps: ArgumentStep[];
  conclusion: string;
  /** Formulation simple, pour l'expliquer à un ami. */
  friend: string;
  sources: string;
}

export interface Chapter {
  short: string;
  question: string;
  lead: string;
  args: Argument[];
}

export interface Objection {
  objection: string;
  reponse: string;
  sources: string;
}

export const HERO_QUESTIONS = [
  'Dieu existe-t-il ?',
  'Jésus a-t-il vraiment existé ?',
  'Est-il vraiment ressuscité ?',
  'Comment un homme peut-il être Dieu ?',
  'Pourquoi est-ce que je crois ?'
];

export const FIDES_ET_RATIO =
  "La foi et la raison sont comme les deux ailes qui permettent à l'esprit humain de s'élever vers la contemplation de la vérité.";

export const ROMAN = ['I', 'II', 'III', 'IV'];

const s = (text: string, label?: string): ArgumentStep => ({ text, label });

export const CHAPTERS: Chapter[] = [
  {
    short: 'Dieu',
    question: 'Dieu existe-t-il ?',
    lead: "L'Église enseigne que l'on peut connaître Dieu avec certitude à partir du monde créé. « Depuis la création du monde, on peut voir avec l'intelligence ce qu'il y a d'invisible en lui » (Rm 1, 20).",
    args: [
      {
        kind: 'Argument philosophique',
        title: 'La cause première',
        steps: [
          s("Tout ce qui commence d'exister a une cause. Rien ne sort de rien."),
          s("Selon le modèle du Big Bang, proposé par le prêtre et physicien Georges Lemaître, l'univers a eu un commencement."),
          s("Une chaîne de causes ne peut pas remonter à l'infini sans point de départ.")
        ],
        conclusion: "L'univers a une cause première, extérieure à l'espace, au temps et à la matière.",
        friend: "Si l'univers a commencé, quelque chose l'a fait commencer. Ce quelque chose ne peut pas faire partie de l'univers.",
        sources: "Saint Thomas d'Aquin, Somme théologique I, q. 2, a. 3 · CEC § 32"
      },
      {
        kind: 'Argument philosophique',
        title: 'Pourquoi quelque chose plutôt que rien ?',
        steps: [
          s('Chaque chose qui existe aurait pu ne pas exister : toi, la Terre, les étoiles.'),
          s('Une chose qui aurait pu ne pas exister ne contient pas en elle-même la raison de son existence.'),
          s("Additionner des choses qui ne s'expliquent pas elles-mêmes n'explique toujours rien.")
        ],
        conclusion: "Il faut un être qui existe par lui-même, nécessairement. C'est ce que nous appelons Dieu.",
        friend: "Tout ce qu'on voit dépend d'autre chose pour exister. Au bout de la chaîne, il faut quelqu'un qui ne dépend de rien.",
        sources: "Saint Thomas d'Aquin, troisième voie · G. W. Leibniz · CEC § 34"
      },
      {
        kind: "Argument de l'ordre",
        title: 'Un univers réglé pour la vie',
        steps: [
          s("Les lois de la physique et ses constantes permettent l'existence de la vie dans des marges très étroites."),
          s("Le monde est intelligible : il obéit à des lois que l'esprit humain peut comprendre et formuler en mathématiques."),
          s("Le hasard seul explique mal qu'un tel ordre existe et qu'il soit compréhensible.")
        ],
        conclusion: "L'ordre du monde désigne une intelligence qui l'a ordonné.",
        friend: 'La grandeur et la beauté des créatures font contempler, par analogie, celui qui les a créées.',
        sources: "Sg 13, 5 · Saint Thomas d'Aquin, cinquième voie · CEC § 32"
      },
      {
        kind: 'Argument de la conscience',
        title: 'Le bien et le mal',
        steps: [
          s("Chacun sait que certaines choses sont vraiment mal, comme torturer un enfant, quelles que soient l'époque ou la culture."),
          s("Une loi morale qui s'impose à tous ne vient pas d'une simple convention humaine."),
          s("L'homme entend en lui la voix de sa conscience, qui l'appelle au bien.")
        ],
        conclusion: 'Une loi morale universelle renvoie à un législateur qui en est la source.',
        friend: "Si le bien et le mal sont réels et pas seulement des opinions, il faut que quelqu'un en soit la mesure.",
        sources: 'CEC § 33 · CEC § 1776 · Rm 2, 14-15'
      }
    ]
  },
  {
    short: 'Jésus historique',
    question: 'Jésus a-t-il vraiment existé ?',
    lead: "Presque tous les historiens, croyants ou non, admettent que Jésus de Nazareth a existé et qu'il a été crucifié sous Ponce Pilate. Les sources ne viennent pas seulement de la Bible.",
    args: [
      {
        kind: 'Sources non chrétiennes',
        title: "Ce qu'en disent les historiens antiques",
        steps: [
          s(
            'Historien romain hostile aux chrétiens. Il écrit que leur nom vient de « Christ », exécuté sous Tibère par le procurateur Ponce Pilate.',
            'Tacite · vers 116'
          ),
          s(
            'Historien juif. Il mentionne Jésus et parle de « Jacques, frère de Jésus appelé Christ ».',
            'Flavius Josèphe · vers 93'
          ),
          s(
            "Gouverneur romain. Il décrit à l'empereur Trajan des chrétiens qui chantent un hymne « au Christ comme à un dieu ».",
            'Pline le Jeune · vers 112'
          )
        ],
        conclusion: "L'existence de Jésus est attestée par des auteurs qui n'avaient aucun intérêt à la défendre.",
        friend: 'Même des historiens romains qui méprisaient les chrétiens parlent de Jésus et de sa crucifixion sous Pilate.',
        sources: 'Tacite, Annales XV, 44 · Josèphe, Antiquités juives XVIII, 63 et XX, 200 · Pline, Lettres X, 96'
      },
      {
        kind: 'Sources chrétiennes',
        title: 'Des textes proches des événements',
        steps: [
          s("Les lettres de saint Paul sont écrites une vingtaine d'années après la mort de Jésus.", 'Années 50'),
          s(
            "En 1 Co 15, 3-8, Paul cite un credo qu'il dit avoir lui-même reçu, ce qui le fait remonter plus tôt encore.",
            'Avant Paul'
          ),
          s('Les quatre Évangiles sont rédigés alors que des témoins oculaires sont encore vivants.', 'Vers 65 à 100')
        ],
        conclusion:
          "Les écrits sur Jésus sont très proches des faits, bien plus que pour la plupart des personnages de l'Antiquité.",
        friend:
          "Les premiers textes sur Jésus datent d'une génération après lui, quand on pouvait encore interroger ceux qui l'avaient connu.",
        sources: '1 Co 15, 3-8 · Lc 1, 1-4 · CEC § 126'
      }
    ]
  },
  {
    short: 'Résurrection',
    question: 'Jésus est-il vraiment ressuscité ?',
    lead: "C'est le cœur de la foi. Saint Paul le dit sans détour : « si le Christ n'est pas ressuscité, votre foi est sans valeur » (1 Co 15, 17).",
    args: [
      {
        kind: 'Les faits',
        title: "Ce qui s'est passé après la croix",
        steps: [
          s(
            'Des femmes trouvent le tombeau vide. Même les adversaires ne le contestent pas : ils disent que les disciples ont volé le corps (Mt 28, 11-15).',
            'Le tombeau vide'
          ),
          s(
            'Jésus apparaît à Pierre, aux Douze, puis à plus de cinq cents frères à la fois, dont la plupart vivent encore quand Paul écrit (1 Co 15, 6).',
            'Les apparitions'
          ),
          s(
            "Des hommes qui s'étaient enfuis et cachés annoncent publiquement la résurrection, au prix de la prison et de la mort.",
            'Des disciples transformés'
          ),
          s(
            'Paul, qui persécutait les chrétiens, devient apôtre après avoir rencontré le Ressuscité (Ac 9).',
            'Des adversaires convertis'
          )
        ],
        conclusion: "La résurrection est l'explication qui rend compte de tous ces faits à la fois.",
        friend:
          "Les apôtres ont donné leur vie pour dire qu'ils l'avaient vu vivant. On ne meurt pas pour ce qu'on sait être un mensonge.",
        sources: 'CEC § 639-644 · 1 Co 15, 3-8 · Ac 9, 1-19'
      },
      {
        kind: 'Les autres explications',
        title: "Et si c'était autre chose ?",
        steps: [
          s("Les disciples auraient alors donné leur vie pour un mensonge qu'ils savaient faux.", 'Le corps a été volé'),
          s(
            'Une hallucination est individuelle. Jésus est apparu à des groupes, et le tombeau restait vide.',
            'Des hallucinations'
          ),
          s(
            "Les soldats romains savaient exécuter. L'Évangile rapporte qu'un soldat lui a percé le côté (Jn 19, 34).",
            "Il n'était pas vraiment mort"
          )
        ],
        conclusion: "Aucune de ces hypothèses n'explique l'ensemble des faits.",
        friend: 'Chaque explication alternative résout un problème et en crée deux autres.',
        sources: 'CEC § 643-644 · Jn 19, 33-35'
      }
    ]
  },
  {
    short: 'Dieu fait homme',
    question: 'Comment Jésus peut-il être Dieu et homme ?',
    lead: "Jésus ne s'est pas présenté comme un simple sage. L'Église professe qu'il est une seule personne, vrai Dieu et vrai homme, en deux natures unies sans confusion ni séparation.",
    args: [
      {
        kind: 'Ses paroles',
        title: 'Ce que Jésus a dit de lui-même',
        steps: [
          s("« Avant qu'Abraham fût, moi, JE SUIS. » Il reprend le nom que Dieu révèle à Moïse (Ex 3, 14).", 'Jn 8, 58'),
          s("« Le Père et moi, nous sommes UN. » Ses auditeurs veulent le lapider parce qu'il se fait Dieu.", 'Jn 10, 30'),
          s(
            'Il pardonne les péchés. Les scribes réagissent : « Qui donc peut pardonner les péchés, sinon Dieu seul ? »',
            'Mc 2, 5-7'
          )
        ],
        conclusion: "Jésus s'est attribué ce qui n'appartient qu'à Dieu.",
        friend:
          "Jésus n'a pas dit seulement « Dieu vous aime ». Il a dit « Je suis », et il a pardonné les péchés à la place de Dieu.",
        sources: 'Jn 8, 58 · Jn 10, 30-33 · Mc 2, 5-12 · Mc 14, 61-62'
      },
      {
        kind: 'Le raisonnement',
        title: 'Menteur, fou ou Seigneur',
        steps: [
          s(
            "S'il savait qu'il n'était pas Dieu, il a trompé ses disciples jusqu'à les envoyer à la mort. Cela contredit tout son enseignement.",
            'Menteur ?'
          ),
          s(
            "S'il se croyait Dieu à tort, il était gravement dérangé. Sa sagesse, son équilibre et sa maîtrise face à ses juges disent l'inverse.",
            'Fou ?'
          ),
          s('Reste la troisième possibilité : il disait vrai.', 'Seigneur')
        ],
        conclusion: "On ne peut pas faire de Jésus seulement un grand sage. Ce qu'il a dit de lui interdit cette option.",
        friend: "Un homme qui se dit Dieu n'est pas un simple sage. Soit il ment, soit il délire, soit il dit vrai.",
        sources: 'C. S. Lewis, Les Fondements du christianisme, 1952'
      },
      {
        kind: "La foi de l'Église",
        title: 'Vrai Dieu et vrai homme',
        steps: [
          s('Il a eu faim (Mt 4, 2), il a pleuré son ami Lazare (Jn 11, 35), il a souffert et il est mort.', 'Vrai homme'),
          s(
            'Il calme la tempête, ressuscite les morts et ressuscite lui-même. Thomas le confesse : « Mon Seigneur et mon Dieu ! » (Jn 20, 28).',
            'Vrai Dieu'
          ),
          s("Seul Dieu peut sauver l'homme, et il fallait être homme pour le faire en notre nom.", 'Pourquoi les deux')
        ],
        conclusion: 'Une seule personne, le Fils de Dieu, en deux natures : divine et humaine.',
        friend: "Dieu ne nous a pas sauvés de loin. Il est devenu l'un de nous, sans cesser d'être Dieu.",
        sources: "Concile de Chalcédoine, 451 · CEC § 464-469 · Saint Anselme, Pourquoi Dieu s'est fait homme"
      }
    ]
  }
];

export const OBJECTIONS: Objection[] = [
  {
    objection: "La science a prouvé que Dieu n'existe pas.",
    reponse:
      "La science étudie comment fonctionne l'univers ; elle ne dit pas pourquoi il existe. La théorie du Big Bang a d'ailleurs été proposée par un prêtre, Georges Lemaître. L'Église enseigne que la foi et la raison ne peuvent jamais se contredire, car elles viennent du même Dieu.",
    sources: 'CEC § 159 · Fides et ratio'
  },
  {
    objection: 'Si Dieu existe, pourquoi le mal ?',
    reponse:
      "Dieu n'est pas la cause du mal. Il a créé des êtres libres, capables d'aimer, donc aussi de refuser. Il ne regarde pas la souffrance de loin : en Jésus, il l'a traversée jusqu'à la croix, et il en tire un plus grand bien, la résurrection.",
    sources: 'CEC § 309-314'
  },
  {
    objection: 'Les Évangiles ont été inventés bien après.',
    reponse:
      "Ils ont été rédigés quelques décennies après les faits, quand des témoins vivaient encore. On en conserve des milliers de manuscrits anciens, bien plus que pour n'importe quel autre texte de l'Antiquité.",
    sources: 'Lc 1, 1-4 · CEC § 126'
  },
  {
    objection: 'Jésus était juste un grand sage.',
    reponse:
      'Un sage ne prétend pas être Dieu ni pardonner les péchés. Ce que Jésus a dit de lui-même oblige à choisir : soit il mentait, soit il se trompait gravement, soit il disait vrai.',
    sources: 'Voir question IV'
  },
  {
    objection: "Tu crois parce qu'on t'a élevé comme ça.",
    reponse:
      "La façon dont on reçoit une conviction ne dit rien de sa vérité. C'est justement pourquoi il vaut la peine d'examiner les raisons de croire, pour que la foi reçue devienne une foi personnelle.",
    sources: 'CEC § 154-155 · 1 P 3, 15'
  }
];

/* --- Répondre plutôt que réagir : l'attitude en conversation --- */

export type ConseilTheme = 'clair' | 'sombre' | 'nuit';

export interface Conseil {
  titre: string;
  /** Paragraphes avant la bulle (ou tout le texte s'il n'y en a pas). */
  texte: string[];
  /** Question mise en bulle de dialogue, suivie de `apresBulle`. */
  bulle?: string;
  apresBulle?: string[];
  /** Phrase en italique sous un filet, ou encadré bordeaux ✦. */
  accent?: { type: 'phrase' | 'encadre'; texte: string };
  theme: ConseilTheme;
}

export const CONSEILS_INTRO =
  'Voici 4 conseils pour que vous puissiez répondre plutôt que réagir lorsque des objections sont soulevées :';

export const CONSEILS: Conseil[] = [
  {
    titre: 'Ne soyez pas surpris',
    texte: [
      "Si des questions difficiles sont soulevées, ne présumez pas que vous êtes attaqué. Il y a de nombreuses raisons pour lesquelles des objections à Jésus et à la Bible sont soulevées. Ils peuvent provenir d'un lieu de blessure, d'incompréhension ou de visions du monde concurrentes. Et souvent, la façon la plus aliénante de réagir est la surprise ou l'alarme."
    ],
    accent: { type: 'phrase', texte: 'Ne soyez pas surpris : invitez la conversation.' },
    theme: 'clair'
  },
  {
    titre: 'Engagez-vous',
    texte: [
      "N'évitez pas les objections lorsqu'elles sont soulevées, engagez-vous avec elles. Les bonnes questions sont votre superpuissance. Ils sont un excellent outil de conversation que vous pouvez faire ressortir lorsqu'une objection est soulevée. Demandez souvent :"
    ],
    bulle: "Qu'est-ce qui te fait dire ça ?",
    apresBulle: [
      'Cela ralentit la conversation et rend le processus de pensée plus un dialogue.',
      'Cela vous donne également un espace pour écouter, réfléchir et prier. Disons que quelqu\'un dit "Je ne comprends tout simplement pas comment un Dieu bon peut permettre tant de douleur dans ce monde." En demandant "Qu\'est-ce qui te fait dire ça?" vous découvrirez le cœur derrière l\'objection. Vous découvrirez peut-être qu\'ils ont une maladie ou qu\'un être cher est décédé récemment. En fin de compte,'
    ],
    accent: { type: 'phrase', texte: 'vous ne répondez pas à une question, vous répondez à une personne.' },
    theme: 'sombre'
  },
  {
    titre: 'Apprenez au fur et à mesure',
    texte: [
      "Être complètement perplexe dans une conversation est une occasion d'apprendre. N'essayez pas d'être un expert ou de « le rendre parfait ». Admettre que vous ne connaissez pas la réponse peut parfois être la meilleure réponse à donner. Dites que vous allez vous renseigner et que vous leur reviendrez. Cela permet de maintenir la conversation, de faire preuve d'humilité et de développer vos connaissances et vos ressources."
    ],
    accent: {
      type: 'encadre',
      texte:
        "N'oubliez pas qu'il se passe plus dans les coulisses qu'une simple conversation. Le Saint-Esprit est toujours à l'œuvre. Soyez honnête et faites-lui confiance."
    },
    theme: 'clair'
  },
  {
    titre: 'Soyez prêt',
    texte: [
      "La Bible dit d'être prêt à « défendre contre quiconque vous demande la raison de l'espérance qui est en vous » (1 Pierre 3:15). Partager Jésus et aimer son prochain signifie s'engager dans des conversations difficiles."
    ],
    theme: 'nuit'
  }
];
