import { EGLISE_DOCUMENTS, type EgliseDocument } from './egliseDocuments';
import { CHEMIN_BAPTEME, FAQ_BASES, FAQ_PRATIQUES, FOI_RAISON, type RubriqueArgument } from './egliseTextes';

export type RubriqueKey = 'raison' | 'comprendre' | 'documents' | 'personnes' | 'lieux' | 'bapteme';

/** Glyphe en texte (U+FE0E) : Android l'afficherait sinon en emoji. */
const glyph = (g: string) => `${g.replace('︎', '')}︎`;

/**
 * Images de la section, dans public/assets/eglise/. Si un fichier manque, la
 * page affiche le vitrail et le glyphe placés dessous.
 */
export const egliseImg = (path: string) => `${import.meta.env.BASE_URL}assets/eglise/${path}.jpg`;
const img = egliseImg;

export interface PartLink {
  path: string;
  state?: unknown;
}

export interface RubriquePart {
  /** Segment d'URL de la page de la partie. */
  id: string;
  title: string;
  desc: string;
  glyph: string;
  img: string;
  lead: string;
  /** Page existante de l'app : la partie y mène directement. */
  link?: PartLink;
  /** `jesus` : page complète à part (FicheJesus), sans le gabarit des parties. */
  content?: 'args' | 'steps' | 'chemin' | 'contact' | 'jesus' | 'document';
  args?: RubriqueArgument[];
  /** Fiche du document, pour `content: 'document'`. */
  doc?: EgliseDocument;
  /** Rang dans EGLISE_DOCUMENTS, pour retrouver son résumé chapitre par chapitre. */
  docIndex?: number;
}

export interface Rubrique {
  key: RubriqueKey;
  roman: string;
  title: string;
  desc: string;
  count: string;
  intro: string;
  banner: string;
  quote: string;
  quoteSrc: string;
  tipLabel: string;
  tip: string;
  /** Note sous la liste des pages. */
  outro?: string;
  parts: RubriquePart[];
}

const raisonIds = ['dieu', 'christianisme', 'catholicisme', 'objections', 'miracles'];
const raisonDesc = [
  '4 preuves par la raison',
  'Jésus, sa vie, sa résurrection',
  'Pierre, les apôtres, la Bible',
  '11 critiques et leurs réponses',
  'Lourdes, Fatima, Guadalupe...'
];

const faqArgs: RubriqueArgument[] = [
  ...FAQ_BASES.map(([title, body, src]) => ({ kind: 'Les bases', title, body, src })),
  ...FAQ_PRATIQUES.map(([title, body]) => ({ kind: 'Questions pratiques', title, body }))
];

const COMMON_TIP = 'Comment lire cette rubrique';

export const RUBRIQUES: Rubrique[] = [
  {
    key: 'raison',
    roman: 'I',
    title: 'La foi et la raison',
    desc: 'Les preuves de la foi, les objections, les miracles',
    count: '5 chapitres',
    intro:
      "Croire n'oblige pas à renoncer à réfléchir. Voici les raisons de croire en Dieu, au Christ et à l'Église catholique, pour les comprendre et savoir les expliquer.",
    banner: img('foi-raison/banniere'),
    quote:
      "La foi et la raison sont comme les deux ailes qui permettent à l'esprit humain de s'élever vers la contemplation de la vérité.",
    quoteSrc: 'Jean-Paul II · Fides et ratio, 1998',
    tipLabel: "Pourquoi l'étudier en priorité",
    tip: "Saint Pierre demande à chaque chrétien d'être « toujours prêt à rendre raison de l'espérance » qui est en lui (1 P 3, 15). Ces 5 chapitres t'y préparent. Lis-les dans l'ordre : chacun s'appuie sur le précédent.",
    parts: FOI_RAISON.map((chapter, i) => ({
      id: raisonIds[i],
      title: chapter.title,
      desc: raisonDesc[i],
      glyph: glyph(chapter.glyph),
      img: img(`foi-raison/${raisonIds[i]}`),
      lead: chapter.lead,
      content: 'args',
      args: chapter.args
    }))
  },
  {
    key: 'comprendre',
    roman: 'II',
    title: 'Comprendre la foi',
    desc: 'Les bases et tes questions',
    count: '4 étapes · 10 questions',
    intro: "Quatre étapes dans l'ordre et les réponses aux questions des débutants.",
    banner: img('comprendre/banniere'),
    quote: 'Je suis le Chemin, la Vérité et la Vie.',
    quoteSrc: 'Jésus · Évangile selon saint Jean 14, 6',
    tipLabel: COMMON_TIP,
    tip: "Suis les 4 étapes dans l'ordre. Les questions fréquentes complètent selon tes besoins, et chaque réponse renvoie au Catéchisme.",
    parts: [
      {
        id: 'commencer',
        title: 'Par où commencer',
        desc: "4 étapes, dans l'ordre",
        glyph: glyph('✧'),
        img: img('comprendre/commencer'),
        lead: "Quatre questions dans l'ordre où elles se posent naturellement, chacune reliée à une fiche plus complète.",
        content: 'steps'
      },
      {
        id: 'questions',
        title: 'Questions fréquentes',
        desc: '10 réponses courtes',
        glyph: glyph('❝'),
        img: img('comprendre/questions'),
        lead: "Les réponses courtes aux questions des débutants. Les bases d'abord, puis les questions pratiques.",
        content: 'args',
        args: faqArgs
      }
    ]
  },
  {
    key: 'documents',
    roman: 'III',
    title: "Les documents de l'Église",
    desc: 'Conciles, encycliques, catéchisme',
    count: `${EGLISE_DOCUMENTS.length} documents`,
    intro:
      "Conciles, encycliques, catéchisme : les textes où l'Église catholique expose officiellement sa foi. Voici les 10 plus importants à connaître, chacun résumé en quelques minutes.",
    banner: img('documents/banniere'),
    quote: "Celui qui vous écoute m'écoute.",
    quoteSrc: 'Jésus · Évangile selon saint Luc 10, 16',
    tipLabel: COMMON_TIP,
    tip: "Ces textes sont la voix officielle de l'Église. Commence par le Catéchisme, qui les résume tous. Chaque page donne l'essentiel du document, ses idées clés et le lien vers le texte intégral.",
    outro:
      "D'autres documents de l'Église seront ajoutés au fil du temps : chacun demande d'être lu, résumé et mis en forme avec soin, ce qui prend un peu de temps.",
    parts: EGLISE_DOCUMENTS.map((doc, i) => ({
      id: doc.id,
      title: doc.title,
      desc: doc.desc,
      glyph: glyph('❦'),
      img: img(`documents/${doc.img}`),
      lead: doc.lead,
      content: 'document',
      args: doc.args,
      doc,
      docIndex: i
    }))
  },
  {
    key: 'personnes',
    roman: 'IV',
    title: 'Les personnes',
    desc: 'Jésus, les saints, les communautés',
    count: '3 rubriques',
    intro: "Ceux qui ont fait et font vivre l'Église, de Jésus aux moines d'aujourd'hui.",
    banner: img('personnes/banniere'),
    quote: "Nous sommes entourés d'une immense nuée de témoins.",
    quoteSrc: 'Lettre aux Hébreux 12, 1',
    tipLabel: COMMON_TIP,
    tip: 'Commence par Jésus : tous les autres, saints, moines et religieuses, ont cherché à le suivre. Chaque partie ouvre une page complète.',
    parts: [
      {
        id: 'jesus',
        title: 'Jésus',
        desc: "Qui il est, ce qu'il a dit",
        glyph: glyph('✚'),
        img: img('personnes/jesus'),
        lead: '',
        content: 'jesus'
      },
      {
        id: 'saints',
        title: 'Les saints',
        desc: 'Un saint pour chaque jour',
        glyph: glyph('✦'),
        img: img('personnes/saints'),
        lead: '',
        link: { path: '/saints' }
      },
      {
        id: 'ordres',
        title: 'Ordres & communautés',
        desc: 'Moines, frères et sœurs',
        glyph: glyph('☩'),
        img: img('personnes/ordres'),
        lead: '',
        link: { path: '/ordres' }
      }
    ]
  },
  {
    key: 'lieux',
    roman: 'V',
    title: 'Les lieux',
    desc: 'Paroisses, abbayes et monastères',
    count: '2 rubriques',
    intro: 'Où aller à la messe, prier ou faire une retraite en France.',
    banner: img('lieux/banniere'),
    quote: "Quand deux ou trois sont réunis en mon nom, je suis là, au milieu d'eux.",
    quoteSrc: 'Jésus · Évangile selon saint Matthieu 18, 20',
    tipLabel: COMMON_TIP,
    tip: 'La paroisse est le lieu de la vie chrétienne de tous les jours. Les abbayes et monastères accueillent pour un temps de prière ou une retraite.',
    parts: [
      {
        id: 'paroisses',
        title: 'Trouver une paroisse',
        desc: 'Messes et accueil près de toi',
        glyph: glyph('⌂'),
        img: img('lieux/paroisse'),
        lead: '',
        link: { path: '/paroisses' }
      },
      {
        id: 'abbayes',
        title: 'Abbayes & monastères',
        desc: 'Lieux de prière en France',
        glyph: glyph('✠'),
        img: img('lieux/abbayes'),
        lead: '',
        link: { path: '/abbayes' }
      }
    ]
  },
  {
    key: 'bapteme',
    roman: 'VI',
    title: 'Devenir chrétien',
    desc: 'Le chemin vers le baptême',
    count: '4 étapes',
    intro:
      "Pour qui souhaite être baptisé, l'Église propose un parcours appelé catéchuménat, réparti sur plusieurs mois.",
    banner: img('bapteme/banniere'),
    quote: 'Allez ! De toutes les nations faites des disciples : baptisez-les au nom du Père, et du Fils, et du Saint-Esprit.',
    quoteSrc: 'Jésus · Évangile selon saint Matthieu 28, 19',
    tipLabel: COMMON_TIP,
    tip: "Il n'est jamais trop tard pour demander le baptême. Le premier pas est une simple rencontre avec une paroisse, sans engagement.",
    parts: [
      {
        id: 'chemin',
        title: 'Le chemin du baptême',
        desc: '4 étapes sur plusieurs mois',
        glyph: glyph('✙'),
        img: img('bapteme/chemin'),
        lead: "Pour un adulte, l'Église propose un parcours appelé catéchuménat, réparti sur plusieurs mois. Touche une étape pour la découvrir.",
        content: 'chemin'
      },
      {
        id: 'parler',
        title: 'Parler à une paroisse',
        desc: 'Être accompagné près de chez toi',
        glyph: glyph('✉'),
        img: img('bapteme/parler'),
        lead: "Une paroisse peut répondre à tes questions et t'accompagner, que tu envisages le baptême ou non.",
        content: 'contact'
      }
    ]
  }
];

/** Chiffre romain de la dernière rubrique, pour le compteur « III / VI ». */
export const LAST_ROMAN = RUBRIQUES[RUBRIQUES.length - 1].roman;

export const findRubrique = (key: string | undefined) => RUBRIQUES.find((r) => r.key === key);

export const rubriquePath = (key: RubriqueKey, partId?: string) =>
  partId ? `/eglise/${key}/${partId}` : `/eglise/${key}`;

/** Nombre total d'arguments de « La foi et la raison ». */
export const FOI_RAISON_ARGS = FOI_RAISON.reduce((sum, chapter) => sum + chapter.args.length, 0);

/** Étapes de « Par où commencer » : le parcours de l'app, et la page Jésus pour l'étape II. */
export const STARTER_STEPS: { link: PartLink; img: string }[] = [
  { link: { path: '/parcours', state: { stepId: 'dieu' } }, img: img('comprendre/dieu') },
  { link: { path: rubriquePath('personnes', 'jesus') }, img: img('comprendre/jesus') },
  { link: { path: '/parcours', state: { stepId: 'eglise' } }, img: img('comprendre/eglise') },
  { link: { path: '/parcours', state: { stepId: 'vivre-sa-foi' } }, img: img('comprendre/vivre') }
];

export { CHEMIN_BAPTEME };
