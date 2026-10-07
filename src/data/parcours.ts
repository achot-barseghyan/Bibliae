// Contenu éditorial du « Parcours pour nouveaux croyants » — les quatre
// fiches accessibles depuis l'onglet Église (Qui est Dieu ? / Qui est
// Jésus-Christ ? / Qu'est-ce que l'Église ? / Comment vivre sa foi ?).

export interface ScriptureRef {
  bookId: string;
  chapter: number;
  verseStart: number;
  verseEnd?: number;
  display: string;
}

export type ParagraphSegment = { type: 'text'; text: string } | { type: 'ref'; ref: ScriptureRef };

export interface ParcoursSection {
  title: string;
  paragraphs: ParagraphSegment[][];
}

export interface ParcoursPullQuote {
  quote: string;
  reference: string;
}

export interface ParcoursTeaching {
  text: string;
  tags: string[];
}

export interface ParcoursFurtherLink {
  kicker: string;
  title: string;
  description: string;
  // Une seule des deux : `stepId` change d'étape dans la même page (le
  // parcours reste sur une unique route), `to` quitte le parcours vers une
  // autre route de l'app (fiche figure, chapitre biblique...).
  stepId?: string;
  to?: string;
}

export interface ParcoursStepContent {
  id: string;
  numeral: string;
  title: string;
  intro: string;
  sections: ParcoursSection[];
  pullQuoteAfterSection: number;
  pullQuote: ParcoursPullQuote;
  teaching: ParcoursTeaching;
  furtherLinks: ParcoursFurtherLink[];
}

function t(text: string): ParagraphSegment {
  return { type: 'text', text };
}

function r(display: string, bookId: string, chapter: number, verseStart: number, verseEnd?: number): ParagraphSegment {
  return { type: 'ref', ref: { display, bookId, chapter, verseStart, verseEnd } };
}

export const PARCOURS_ORDER = ['dieu', 'jesus', 'eglise', 'vivre-sa-foi'];

export const parcoursSteps: Record<string, ParcoursStepContent> = {
  dieu: {
    id: 'dieu',
    numeral: 'I',
    title: 'Qui est Dieu ?',
    intro:
      'Le point de départ de toute la foi chrétienne. Voici une réponse simple, avant d’aller plus loin si tu le souhaites.',
    sections: [
      {
        title: 'Un Dieu, pas plusieurs',
        paragraphs: [
          [
            t(
              'La foi chrétienne hérite de la foi juive : il n’y a qu’un seul Dieu, créateur de toute chose, et non une collection de divinités rivales. C’est l’affirmation la plus ancienne et la plus fondamentale de toute la Bible.'
            )
          ]
        ]
      },
      {
        title: 'Un Dieu en trois personnes',
        paragraphs: [
          [
            t(
              'C’est ici que la foi chrétienne dit quelque chose d’unique. Cet unique Dieu existe en trois personnes distinctes, le Père, le Fils et le Saint-Esprit, unies dans une seule et même nature divine. C’est le mystère de la Trinité '
            ),
            r('Mt 28, 19', 'mt', 28, 19),
            t('.')
          ],
          [
            t(
              'Cette idée peut sembler difficile à comprendre d’un coup. Elle l’a toujours été. L’important, au début, n’est pas de tout expliquer, mais de retenir que Dieu n’est pas solitaire : il est, en lui-même, une relation d’amour.'
            )
          ]
        ]
      },
      {
        title: 'Un Dieu qui crée',
        paragraphs: [
          [
            t('La Bible s’ouvre sur cette affirmation : au commencement, Dieu crée le ciel et la terre '),
            r('Gn 1, 1', 'gn', 1, 1),
            t(
              '. Tout ce qui existe vient de lui et dépend de lui. Créer n’est pas, pour Dieu, un acte du passé : il soutient le monde à chaque instant.'
            )
          ]
        ]
      },
      {
        title: 'Un Dieu qui se révèle',
        paragraphs: [
          [
            t(
              'Dieu ne reste pas caché. Il se fait connaître par la création, par l’histoire d’Israël, puis pleinement par Jésus-Christ, « la Parole qui s’est faite chair » '
            ),
            r('Jn 1, 14', 'jn', 1, 14),
            t('. C’est le sujet de la fiche suivante.')
          ]
        ]
      },
      {
        title: 'Pourquoi ça compte aujourd’hui',
        paragraphs: [
          [
            t(
              'Croire en Dieu, ce n’est pas seulement admettre qu’il existe. C’est croire qu’il s’intéresse à chacun personnellement, et que la vie a un sens et une origine qui dépassent ce que l’on peut voir ou mesurer.'
            )
          ]
        ]
      }
    ],
    pullQuoteAfterSection: 1,
    pullQuote: { quote: 'Dieu est amour.', reference: '1 Jean 4, 8' },
    teaching: {
      text:
        'Dieu est unique, transcendant et proche : il existe de toute éternité en trois personnes distinctes, unies dans une seule nature divine.',
      tags: ['Catéchisme, § 199-231', 'Catéchisme, § 232-267', 'Symbole des Apôtres']
    },
    furtherLinks: [
      {
        kicker: 'Étape suivante du parcours',
        title: 'Qui est Jésus-Christ ?',
        description: 'Vrai Dieu et vrai homme, né de la Vierge Marie, mort et ressuscité pour le salut de tous.',
        stepId: 'jesus'
      }
    ]
  },

  jesus: {
    id: 'jesus',
    numeral: 'II',
    title: 'Qui est Jésus-Christ ?',
    intro:
      'La question la plus importante de toute la foi chrétienne. Voici une réponse simple, avant d’aller plus loin si tu le souhaites.',
    sections: [
      {
        title: 'Un homme, vraiment',
        paragraphs: [
          [
            t(
              'Jésus a vécu il y a environ deux mille ans, en Galilée puis en Judée. Il est né d’une mère, Marie, a grandi dans une famille, a appris un métier, a eu des amis. Sur ce point, les historiens, croyants ou non, sont d’accord : Jésus de Nazareth a réellement existé.'
            )
          ]
        ]
      },
      {
        title: 'Mais aussi Dieu, vraiment',
        paragraphs: [
          [
            t(
              'C’est ici que la foi chrétienne dit quelque chose d’unique. L’Église enseigne que Jésus n’est pas seulement un grand homme ou un bon enseignant. Il est Dieu lui-même, venu vivre une vie humaine, sans cesser d’être Dieu '
            ),
            r('Jn 1, 14', 'jn', 1, 14),
            t('.')
          ],
          [
            t(
              'Cette idée peut sembler difficile à comprendre d’un coup. Elle l’a toujours été. L’important, au début, n’est pas de tout expliquer, mais de comprendre ce que ça change : en Jésus, Dieu s’est rendu proche, visible, touchable.'
            )
          ]
        ]
      },
      {
        title: 'Ce qu’il a fait',
        paragraphs: [
          [
            t(
              'Pendant environ trois ans, Jésus a parcouru la Galilée et la Judée. Il a guéri des malades, mangé avec des gens rejetés par la société, et enseigné avec des histoires simples appelées paraboles. Il parlait d’un Dieu proche, qui pardonne, et qui invite chacun à changer de vie.'
            )
          ],
          [
            t(
              'Il a aussi dérangé. Ses paroles et ses actes ont fini par lui coûter la vie : il a été arrêté, jugé, puis exécuté sur une croix à Jérusalem.'
            )
          ]
        ]
      },
      {
        title: 'Pourquoi sa mort n’est pas la fin',
        paragraphs: [
          [
            t(
              'Trois jours après sa mort, selon les témoignages des premiers chrétiens, Jésus est ressuscité. Pas revenu comme un fantôme ou un souvenir, mais vivant, dans un corps réel, vu et touché par ses proches '
            ),
            r('Lc 24, 36-43', 'lc', 24, 36, 43),
            t('.')
          ],
          [
            t(
              'Pour l’Église, cet événement change tout. Il montre que la mort n’a pas le dernier mot, et que ce que Jésus promettait, la vie éternelle, est réellement possible.'
            )
          ]
        ]
      },
      {
        title: 'Pourquoi ça compte aujourd’hui',
        paragraphs: [
          [
            t(
              'Croire en Jésus, ce n’est pas seulement croire des faits sur le passé. C’est croire qu’il est vivant aujourd’hui, et qu’il reste accessible : dans la prière, dans les sacrements, et dans la vie de l’Église qu’il a fondée.'
            )
          ]
        ]
      }
    ],
    pullQuoteAfterSection: 1,
    pullQuote: { quote: 'Qui m’a vu a vu le Père.', reference: 'Jean 14, 9' },
    teaching: {
      text: 'Jésus-Christ est vrai Dieu et vrai homme, venu par amour sauver l’humanité par sa mort et sa résurrection.',
      tags: ['Catéchisme, § 422-451', 'Catéchisme, § 638-655', 'Symbole de Nicée-Constantinople']
    },
    furtherLinks: [
      {
        kicker: 'Fiche biographique',
        title: 'Jésus-Christ',
        description: 'Sa vie complète, sa généalogie, les lieux qu’il a parcourus et les versets qui le concernent.',
        to: '/figures/jesus'
      },
      {
        kicker: 'Étape suivante du parcours',
        title: 'Qu’est-ce que l’Église ?',
        description: 'La communauté fondée par le Christ, guidée par les apôtres et leurs successeurs.',
        stepId: 'eglise'
      }
    ]
  },

  eglise: {
    id: 'eglise',
    numeral: 'III',
    title: 'Qu’est-ce que l’Église ?',
    intro:
      'Après Dieu et le Christ, la troisième question que se posent la plupart des nouveaux croyants. Voici une réponse simple, avant d’aller plus loin si tu le souhaites.',
    sections: [
      {
        title: 'Un peuple, pas seulement un bâtiment',
        paragraphs: [
          [
            t(
              'Dans le langage courant, « l’Église » évoque souvent un bâtiment. Pour les chrétiens, c’est d’abord autre chose : une communauté de personnes rassemblées par leur foi en Jésus-Christ, présente partout dans le monde depuis deux mille ans.'
            )
          ]
        ]
      },
      {
        title: 'Fondée par le Christ',
        paragraphs: [
          [
            t('L’Église n’est pas une association que des croyants auraient créée entre eux. Selon les évangiles, c’est Jésus lui-même qui l’a voulue et bâtie, en s’appuyant sur l’apôtre Pierre '),
            r('Mt 16, 18', 'mt', 16, 18),
            t('.')
          ],
          [
            t(
              'Cette idée peut sembler difficile à comprendre d’un coup. Elle l’a toujours été. L’important, au début, n’est pas de tout expliquer, mais de retenir que l’Église n’appartient à personne : elle vient du Christ, et elle lui reste rattachée.'
            )
          ]
        ]
      },
      {
        title: 'Guidée par les apôtres et leurs successeurs',
        paragraphs: [
          [
            t(
              'Dès les premiers temps, les croyants se sont rassemblés régulièrement autour de l’enseignement des apôtres, du partage du pain et de la prière '
            ),
            r('Ac 2, 42', 'ac', 2, 42),
            t(
              '. Aujourd’hui encore, l’Église est guidée par les évêques, successeurs des apôtres, et par le pape, successeur de Pierre.'
            )
          ]
        ]
      },
      {
        title: 'Une, sainte, catholique et apostolique',
        paragraphs: [
          [
            t(
              'C’est ainsi que le Credo décrit l’Église : une, malgré la diversité de ses membres ; sainte, parce qu’elle vient de Dieu ; catholique, c’est-à-dire universelle ; et apostolique, parce qu’elle transmet fidèlement la foi reçue des apôtres.'
            )
          ]
        ]
      },
      {
        title: 'Pourquoi ça compte aujourd’hui',
        paragraphs: [
          [
            t(
              'Faire partie de l’Église, ce n’est pas seulement assister à la messe de temps en temps. C’est appartenir à une famille de croyants, dans laquelle on est accompagné, formé et soutenu tout au long de la vie de foi.'
            )
          ]
        ]
      }
    ],
    pullQuoteAfterSection: 1,
    pullQuote: { quote: 'Que tous soient un.', reference: 'Jean 17, 21' },
    teaching: {
      text:
        'L’Église est le peuple que Dieu rassemble dans le monde entier, fondé par le Christ et guidé par les apôtres et leurs successeurs, les évêques.',
      tags: ['Catéchisme, § 751-773', 'Catéchisme, § 811-870', 'Symbole des Apôtres']
    },
    furtherLinks: [
      {
        kicker: 'Fiche biographique',
        title: 'Pierre',
        description: 'L’apôtre sur lequel le Christ a bâti son Église, premier des évêques de Rome.',
        to: '/figures/pierre'
      },
      {
        kicker: 'Étape suivante du parcours',
        title: 'Comment vivre sa foi ?',
        description: 'La prière, les sacrements et la vie quotidienne d’un catholique, sans jargon.',
        stepId: 'vivre-sa-foi'
      }
    ]
  },

  'vivre-sa-foi': {
    id: 'vivre-sa-foi',
    numeral: 'IV',
    title: 'Comment vivre sa foi ?',
    intro:
      'La dernière question, la plus concrète : une fois qu’on croit, qu’est-ce que ça change vraiment au quotidien ?',
    sections: [
      {
        title: 'La prière, un dialogue avec Dieu',
        paragraphs: [
          [
            t(
              'Prier, ce n’est pas réciter des formules dans une langue à part. C’est parler à Dieu, l’écouter, lui confier ce que l’on vit. Jésus lui-même a appris à ses disciples une prière simple, le Notre Père '
            ),
            r('Mt 6, 9', 'mt', 6, 9),
            t('.')
          ]
        ]
      },
      {
        title: 'Les sacrements, des signes qui donnent la grâce',
        paragraphs: [
          [
            t(
              'Les sacrements sont des gestes concrets, institués par le Christ, à travers lesquels Dieu agit réellement : le baptême, l’Eucharistie, la réconciliation, entre autres. Le Christ lui-même a demandé à ses disciples de renouveler le repas qu’il a partagé avant sa mort '
            ),
            r('Lc 22, 19', 'lc', 22, 19),
            t('.')
          ],
          [
            t(
              'Cette idée peut sembler difficile à comprendre d’un coup. Elle l’a toujours été. L’important, au début, n’est pas de tout comprendre, mais de commencer à y participer, même modestement.'
            )
          ]
        ]
      },
      {
        title: 'La vie quotidienne, aimer Dieu et son prochain',
        paragraphs: [
          [
            t('Jésus a résumé toute la Loi en deux commandements : aimer Dieu de tout son cœur, et aimer son prochain comme soi-même '),
            r('Mt 22, 37-39', 'mt', 22, 37, 39),
            t('. C’est ce qui, concrètement, doit orienter les choix de chaque jour.')
          ]
        ]
      },
      {
        title: 'Faire partie d’une communauté',
        paragraphs: [
          [
            t('La foi chrétienne ne se vit pas seul dans son coin. Elle se vit avec d’autres, dans une paroisse, en ne désertant pas les assemblées '),
            r('He 10, 25', 'he', 10, 25),
            t(', et en trouvant des personnes pour accompagner les questions et les doutes.')
          ]
        ]
      },
      {
        title: 'Pourquoi ça compte aujourd’hui',
        paragraphs: [
          [
            t(
              'Vivre sa foi n’est pas une case à cocher une fois pour toutes. C’est un chemin qui se poursuit toute la vie, fait de hauts et de bas, mais jamais parcouru seul.'
            )
          ]
        ]
      }
    ],
    pullQuoteAfterSection: 1,
    pullQuote: { quote: 'Faites ceci en mémoire de moi.', reference: 'Luc 22, 19' },
    teaching: {
      text:
        'Vivre sa foi, c’est prier, recevoir les sacrements et aimer Dieu et son prochain au quotidien, en communauté avec l’Église.',
      tags: ['Catéchisme, § 2558-2565', 'Catéchisme, § 1113-1134', 'Catéchisme, § 2041-2043']
    },
    furtherLinks: [
      {
        kicker: 'Pour commencer à lire',
        title: 'Évangile selon saint Marc',
        description: 'Le plus court des quatre évangiles, souvent conseillé en premier pour découvrir Jésus.',
        to: '/bible/mc/1'
      }
    ]
  }
};
