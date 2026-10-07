// Registre des conciles/symboles cités dans les fiches (contenu doctrinal
// fixe, indépendant des figures). Le texte intégral n'est pas encore
// intégré — voir pages/CouncilText.tsx.

export interface Council {
  id: string;
  display: string;
  header: string;
  title: string;
  quote: string;
  actionLabel: string;
}

export const COUNCILS: Council[] = [
  {
    id: 'nicee-325',
    display: 'Nicée, 325',
    header: 'Concile de Nicée, 325',
    title: 'Symbole de Nicée',
    quote:
      'Nous croyons en un seul Seigneur Jésus-Christ, Fils unique de Dieu, engendré du Père avant tous les siècles, Dieu né de Dieu, lumière née de la lumière.',
    actionLabel: 'Lire le symbole'
  },
  {
    id: 'chalcedoine-451',
    display: 'Chalcédoine, 451',
    header: 'Concile de Chalcédoine, 451',
    title: 'Définition de Chalcédoine',
    quote:
      'Un seul et même Christ, reconnu en deux natures, sans confusion, sans changement, sans division, sans séparation.',
    actionLabel: 'Lire la définition'
  },
  {
    id: 'ephese-431',
    display: 'Éphèse, 431',
    header: "Concile d'Éphèse, 431",
    title: 'Définition de la Theotokos',
    quote:
      "Si quelqu'un ne confesse pas que l'Emmanuel est véritablement Dieu, et qu'à ce titre la sainte Vierge est Mère de Dieu — puisqu'elle a enfanté selon la chair le Verbe de Dieu fait chair —, qu'il soit anathème.",
    actionLabel: 'Lire la définition'
  },
  {
    id: 'vatican-1-1870',
    display: 'Vatican I, 1870',
    header: 'Concile Vatican I, 1870',
    title: 'Constitution Pastor Aeternus',
    quote:
      "Le Pontife Romain, lorsqu'il parle ex cathedra, jouit, par l'assistance divine promise à saint Pierre, de cette infaillibilité dont le divin Rédempteur a voulu munir son Église.",
    actionLabel: 'Lire la définition'
  }
];

export function getCouncil(id: string): Council | undefined {
  return COUNCILS.find((c) => c.id === id);
}
