import { WIKI_SAINTS } from './saintsWikipedia';

/** Saints : fiches détaillées du calendrier général, complétées par la liste
    de Wikipédia. Une partie des saints n'a pas de date de fête connue. */

export interface CalendarSaint {
  id: number;
  name: string;
  /** Qualificatif court : « Évêque et docteur de l'Église »… */
  qual: string;
  /** Dates de vie, telles qu'affichées. */
  dates: string;
  /** Année repère pour la frise (mort ou floruit), si connue. */
  year: number | null;
  /** Mois de la fête, 0 à 11 ; null si la fête n'est pas connue. */
  month: number | null;
  day: number | null;
  cat: string;
  patronage: string;
}

type Row = [string, string, string, number, number, number, string, string];

const ROWS: Row[] = [
  ['André', 'Apôtre, frère de Pierre', 'iᵉʳ s.', 60, 10, 30, 'Apôtres', 'pêcheurs'],
  ['Agnès de Rome', 'Vierge et martyre', '† 304', 304, 0, 21, 'Martyrs', 'jeunes filles'],
  ['Albert le Grand', "Dominicain, évêque et docteur de l'Église", 'v. 1200-1280', 1280, 10, 15, 'Docteurs', 'scientifiques'],
  ['Ambroise de Milan', "Évêque et docteur de l'Église", '339-397', 397, 11, 7, 'Docteurs', ''],
  ['Anne', 'Mère de la Vierge Marie', 'iᵉʳ s. av. J.-C.', 0, 6, 26, 'Famille', 'grands-mères'],
  ['Antoine le Grand', 'Abbé, père des moines', '251-356', 356, 0, 17, 'Fondateurs', 'ermites'],
  ['Antoine de Padoue', "Franciscain, docteur de l'Église", '1195-1231', 1231, 5, 13, 'Docteurs', 'objets perdus'],
  ["Augustin d'Hippone", "Évêque et docteur de l'Église", '354-430', 430, 7, 28, 'Docteurs', 'théologiens'],
  ['Benoît de Nursie', "Abbé, patriarche des moines d'Occident", '480-547', 547, 6, 11, 'Fondateurs', "l'Europe"],
  ['Bernadette Soubirous', 'Voyante de Lourdes', '1844-1879', 1879, 3, 16, 'Mystiques', 'malades'],
  ['Bernard de Clairvaux', "Abbé et docteur de l'Église", '1090-1153', 1153, 7, 20, 'Docteurs', ''],
  ['Blandine de Lyon', 'Martyre', '† 177', 177, 5, 2, 'Martyrs', ''],
  ['Bonaventure', "Franciscain, évêque et docteur de l'Église", '1221-1274', 1274, 6, 15, 'Docteurs', ''],
  ['Catherine de Sienne', "Vierge, docteur de l'Église", '1347-1380', 1380, 3, 29, 'Docteurs', "l'Europe, l'Italie"],
  ['Cécile de Rome', 'Vierge et martyre', '† 230', 230, 10, 22, 'Martyrs', 'musiciens'],
  ['Charles Borromée', 'Archevêque de Milan', '1538-1584', 1584, 10, 4, 'Évêques', 'catéchistes'],
  ['Clotilde', 'Reine des Francs', '475-545', 545, 5, 4, 'France', ''],
  ['Dominique de Guzmán', 'Fondateur des frères prêcheurs', '1170-1221', 1221, 7, 8, 'Fondateurs', 'prédicateurs'],
  ['Élisabeth de Hongrie', 'Tertiaire franciscaine', '1207-1231', 1231, 10, 17, 'Mystiques', 'œuvres de charité'],
  ['Étienne', 'Diacre, premier martyr', '† v. 36', 36, 11, 26, 'Martyrs', 'diacres'],
  ["François d'Assise", 'Fondateur des frères mineurs', '1182-1226', 1226, 9, 4, 'Fondateurs', "l'Italie, l'écologie"],
  ['François de Sales', "Évêque et docteur de l'Église", '1567-1622', 1622, 0, 24, 'Docteurs', 'journalistes'],
  ['François Xavier', 'Jésuite, missionnaire en Asie', '1506-1552', 1552, 11, 3, 'Missionnaires', 'missions'],
  ['Geneviève', 'Vierge', 'v. 423-502', 502, 0, 3, 'France', 'Paris'],
  ['Grégoire le Grand', "Pape et docteur de l'Église", '540-604', 604, 8, 3, 'Papes', 'chantres'],
  ["Ignace d'Antioche", 'Évêque et martyr', '† v. 107', 107, 9, 17, 'Martyrs', ''],
  ['Ignace de Loyola', 'Fondateur de la Compagnie de Jésus', '1491-1556', 1556, 6, 31, 'Fondateurs', 'retraites spirituelles'],
  ['Irénée de Lyon', "Évêque et docteur de l'Église", 'v. 130-202', 202, 5, 28, 'Docteurs', ''],
  ['Jean', 'Apôtre et évangéliste', 'iᵉʳ s.', 100, 11, 27, 'Apôtres', 'théologiens'],
  ['Jean-Baptiste', 'Précurseur du Christ', 'iᵉʳ s.', 30, 5, 24, 'Prophètes', ''],
  ['Jean de la Croix', "Carme, docteur de l'Église", '1542-1591', 1591, 11, 14, 'Docteurs', 'poètes'],
  ['Jean-Marie Vianney', "Curé d'Ars", '1786-1859', 1859, 7, 4, 'France', 'curés de paroisse'],
  ["Jeanne d'Arc", "Vierge, libératrice d'Orléans", '1412-1431', 1431, 4, 30, 'France', 'la France'],
  ['Jérôme', "Prêtre et docteur de l'Église", '347-420', 420, 8, 30, 'Docteurs', 'traducteurs, exégètes'],
  ['Joseph', 'Époux de la Vierge Marie', 'iᵉʳ s.', 20, 2, 19, 'Famille', "travailleurs, l'Église"],
  ['Louis', 'Roi de France', '1214-1270', 1270, 7, 25, 'France', ''],
  ['Luc', 'Évangéliste', 'iᵉʳ s.', 84, 9, 18, 'Évangélistes', 'médecins'],
  ['Marc', 'Évangéliste', 'iᵉʳ s.', 68, 3, 25, 'Évangélistes', 'Venise'],
  ['Marie-Madeleine', 'Disciple, apôtre des apôtres', 'iᵉʳ s.', 50, 6, 22, 'Disciples', 'pénitents'],
  ['Martin de Tours', 'Évêque', '316-397', 397, 10, 11, 'Évêques', 'la France'],
  ['Maximilien Kolbe', "Franciscain, martyr d'Auschwitz", '1894-1941', 1941, 7, 14, 'Martyrs', 'prisonniers'],
  ['Monique', 'Mère de saint Augustin', '331-387', 387, 7, 27, 'Famille', 'mères'],
  ['Nicolas de Myre', 'Évêque', 'v. 270-343', 343, 11, 6, 'Évêques', 'enfants, marins'],
  ['Pio de Pietrelcina', 'Capucin, « Padre Pio »', '1887-1968', 1968, 8, 23, 'Mystiques', 'confesseurs'],
  ['Patrick', "Évêque, apôtre de l'Irlande", 'v. 385-461', 461, 2, 17, 'Missionnaires', "l'Irlande"],
  ['Paul', 'Apôtre des nations', '† v. 67', 67, 5, 29, 'Apôtres', 'missionnaires'],
  ['Pierre', 'Apôtre, premier pape', '† v. 64', 64, 5, 29, 'Apôtres', "l'Église"],
  ['Rita de Cascia', 'Religieuse augustine', '1381-1457', 1457, 4, 22, 'Mystiques', 'causes désespérées'],
  ["Thérèse d'Avila", "Carmélite, docteur de l'Église", '1515-1582', 1582, 9, 15, 'Docteurs', "l'Espagne"],
  ['Thérèse de Lisieux', "Carmélite, docteur de l'Église", '1873-1897', 1897, 9, 1, 'Docteurs', 'missions, la France'],
  ["Thomas d'Aquin", "Dominicain, docteur de l'Église", '1225-1274', 1274, 0, 28, 'Docteurs', 'étudiants'],
  ['Vincent de Paul', 'Fondateur des lazaristes', '1581-1660', 1660, 8, 27, 'Fondateurs', 'œuvres de charité']
];

const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const firstWord = (s: string) => fold(s).split(/[\s'-]/)[0];

/** Une entrée de Wikipédia double une fiche détaillée : même nom, ou même
    fête et même prénom (« Augustin » le 28 août = « Augustin d'Hippone »). */
const isDuplicate = (row: Row | (typeof WIKI_SAINTS)[number]) => {
  const [name, , , , month, day] = row;
  return ROWS.some(
    ([n, , , , m, d]) =>
      fold(n) === fold(name) || (month != null && m === month && d === day && firstWord(n) === firstWord(name))
  );
};

const ALL_ROWS = [...ROWS, ...WIKI_SAINTS.filter((r) => !isDuplicate(r))];

export const CALENDAR_SAINTS: CalendarSaint[] = ALL_ROWS.map(
  ([name, qual, dates, year, month, day, cat, patronage], id) => ({
    id,
    name,
    qual,
    dates,
    year,
    month,
    day,
    cat,
    patronage
  })
);

export const SAINT_CATEGORIES = [
  'Tous',
  'Apôtres',
  'Docteurs',
  'Martyrs',
  'Fondateurs',
  'Mystiques',
  'Évêques',
  'Papes',
  'Moines',
  'Missionnaires',
  'France',
  'Famille'
];
