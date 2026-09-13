// Contenu éditorial de la page d'accueil (textes du bandeau + figures en
// vedette). Les images restent des imports locaux : le contenu distant ne
// peut surcharger que les champs texte, jamais `image`.

import jesusImg from '../assets/images/men/Jesus_Christ.png';
import moiseImg from '../assets/images/men/Moses.png';
import marieImg from '../assets/images/women/Mary and Baby Jesus.png';
import abrahamImg from '../assets/images/men/Abraham.png';
import davidImg from '../assets/images/men/David.png';
import eveImg from '../assets/images/women/Eve.png';
import sarahImg from '../assets/images/women/Sarah.png';
import noeImg from '../assets/images/men/Noah.png';
import estherImg from '../assets/images/women/Esther.png';
import marieMadeleineImg from '../assets/images/women/Mary Magdalene.png';

export interface FeaturedFigure {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
}

export interface AccueilHero {
  wordmarkPrefix: string;
  wordmarkAccent: string;
  kicker: string;
  headline: string;
  bibliaeText: string;
  figuresKicker: string;
  figuresTitle: string;
  figuresSubtitle: string;
}

export const ACCUEIL_HERO: AccueilHero = {
  wordmarkPrefix: 'Bibli',
  wordmarkAccent: 'ae',
  kicker: 'Compendium de la Bible, dans la tradition catholique',
  headline:
    'Chaque figure, chaque lieu, chaque récit des Écritures, à portée de recherche.',
  bibliaeText:
    "Bibliae relie les personnages, les généalogies, les lieux et les événements bibliques dans un seul espace de lecture. Chaque fiche cite les versets, les commentaires des Pères de l'Église et l'enseignement du Catéchisme.",
  figuresKicker: "À l'affiche",
  figuresTitle: 'Figures en vedette',
  figuresSubtitle: 'Quatre figures parmi les dix mises en avant, relues chaque semaine.'
};

export const FEATURED_FIGURES: FeaturedFigure[] = [
  {
    id: 'jesus',
    name: 'Jésus-Christ',
    category: 'Évangiles · Ier siècle apr. J.-C.',
    description:
      "Fils de Dieu incarné ; sa vie, sa mort et sa résurrection fondent la foi chrétienne.",
    image: jesusImg
  },
  {
    id: 'moise',
    name: 'Moïse',
    category: 'Exode · XIIIe siècle av. J.-C.',
    description:
      "Libérateur d'Israël, législateur, médiateur de l'Alliance au Sinaï.",
    image: moiseImg
  },
  {
    id: 'mary',
    name: 'Marie',
    category: 'Évangiles · Ier siècle av. J.-C.',
    description:
      "Mère de Jésus, modèle de foi vénéré dans la tradition mariale catholique.",
    image: marieImg
  },
  {
    id: 'abraham',
    name: 'Abraham',
    category: 'Genèse · XIXe siècle av. J.-C.',
    description:
      "Père des croyants, appelé par Dieu à quitter son pays pour la Terre promise.",
    image: abrahamImg
  },
  {
    id: 'david',
    name: 'David',
    category: '1-2 Samuel · Xe siècle av. J.-C.',
    description:
      "Roi d'Israël, poète des psaumes, ancêtre du Messie selon la généalogie davidique.",
    image: davidImg
  },
  {
    id: 'eve',
    name: 'Ève',
    category: 'Genèse · Origines',
    description:
      "Première femme, mère de l'humanité selon le récit de la Création.",
    image: eveImg
  },
  {
    id: 'sarah',
    name: 'Sarah',
    category: 'Genèse · XIXe siècle av. J.-C.',
    description:
      "Épouse d'Abraham, mère d'Isaac malgré son grand âge, figure de la promesse.",
    image: sarahImg
  },
  {
    id: 'noe',
    name: 'Noé',
    category: 'Genèse · Origines',
    description:
      "Constructeur de l'arche, sauvé du déluge pour renouveler l'alliance avec Dieu.",
    image: noeImg
  },
  {
    id: 'esther',
    name: 'Esther',
    category: "Livre d'Esther · Ve siècle av. J.-C.",
    description:
      "Reine de Perse qui sauva son peuple de l'extermination par son courage.",
    image: estherImg
  },
  {
    id: 'marie-madeleine',
    name: 'Marie-Madeleine',
    category: 'Évangiles · Ier siècle apr. J.-C.',
    description: "Disciple de Jésus, première témoin de sa résurrection.",
    image: marieMadeleineImg
  }
];
