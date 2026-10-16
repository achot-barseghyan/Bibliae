import rawAbbayes from './abbayes.json';

/** Abbayes et monastères catholiques actifs en France (Église › Abbayes &
    monastères). Transcription du tableau Wikipédia « Liste des abbayes et
    monastères catholiques actifs en France » (abbayes.json), avec, pour
    chaque lieu, le type de communauté (couleur de la ligne du tableau),
    l'article et une photo de Wikimedia Commons. Les lieux absents du tableau
    (Paray-le-Monial, d'après le Service des moniales) n'ont ni coordonnées ni
    photo libre. La région et la famille sont déduites ci-dessous. */

export type MonasticFamily = 'Bénédictins' | 'Trappistes' | 'Cisterciens' | 'Chartreux' | 'Autres';
/** H : moines ou frères, F : moniales ou sœurs, M : communauté mixte. */
export type Gender = 'H' | 'F' | 'M';

interface RawAbbey {
  id: string;
  nom: string;
  commune: string;
  departement: string;
  diocese: string;
  /** Ordre ou communauté, tel que dans la source. */
  ordre: string;
  /** Année d'installation (ou de reprise) de la communauté actuelle. */
  annee: number | null;
  /** Absentes pour les lieux ajoutés hors du tableau : l'adresse sert alors. */
  lat: number | null;
  lon: number | null;
  communaute: Gender;
  /** Titre de l'article Wikipédia, quand le lieu en a un. */
  article: string | null;
  photo: AbbeyPhoto | null;
  adresse?: string;
  /** Page du lieu ailleurs que sur Wikipédia, quand il n'a pas d'article. */
  site?: string;
}

export interface AbbeyPhoto {
  /** Vignette de 960 px servie par Wikimedia. */
  url: string;
  /** Page du fichier sur Commons (auteur, licence complète). */
  page: string;
  auteur: string | null;
  licence: string;
}

export interface Abbey {
  id: string;
  name: string;
  commune: string;
  dept: string;
  diocese: string;
  region: string;
  order: string;
  /** Ordre sans les précisions entre parenthèses (« Bénédictins »). */
  orderShort: string;
  family: MonasticFamily;
  gender: Gender;
  year: number | null;
  lat: number | null;
  lon: number | null;
  address: string | null;
  article: string | null;
  site: string | null;
  photo: AbbeyPhoto | null;
}

interface FamilyInfo {
  color: string;
  glyph: string;
  about: string;
}

export const FAMILIES: Record<MonasticFamily, FamilyInfo> = {
  Bénédictins: {
    color: '#1E1B18',
    glyph: '✠︎',
    about: "Les moines suivent la règle de saint Benoît : prière de l'office sept fois par jour, travail et accueil des hôtes."
  },
  Trappistes: {
    color: '#6B1E23',
    glyph: '✚︎',
    about: 'Cisterciens de la stricte observance : vie de silence, de prière et de travail manuel, souvent agricole.'
  },
  Cisterciens: {
    color: '#24406B',
    glyph: '☩︎',
    about: 'Héritiers de Cîteaux et de saint Bernard, ils vivent la règle de saint Benoît dans la simplicité.'
  },
  Chartreux: {
    color: '#8A877F',
    glyph: '†︎',
    about: "Ermites vivant en communauté, chacun dans sa cellule, réunis pour l'office de nuit et la messe."
  },
  Autres: {
    color: '#5A3E2B',
    glyph: '✦︎',
    about:
      'Communauté religieuse active dans ce lieu. La fiche Wikipédia précise son histoire et sa famille spirituelle.'
  }
};

export const FAMILY_FILTERS: ('Tous' | MonasticFamily)[] = [
  'Tous',
  'Bénédictins',
  'Trappistes',
  'Cisterciens',
  'Chartreux',
  'Autres'
];

export const GENDER_LABELS: Record<Gender, string> = { H: 'Moines', F: 'Moniales', M: 'Mixte' };

function familyOf(order: string): MonasticFamily {
  if (/trappist/i.test(order)) return 'Trappistes';
  if (/bénédictin/i.test(order)) return 'Bénédictins';
  if (/cistercien|bernardine/i.test(order)) return 'Cisterciens';
  if (/chartreu/i.test(order)) return 'Chartreux';
  return 'Autres';
}

const REGIONS: Record<string, string> = {
  Ain: 'Auvergne-Rhône-Alpes',
  Allier: 'Auvergne-Rhône-Alpes',
  Ardèche: 'Auvergne-Rhône-Alpes',
  Drôme: 'Auvergne-Rhône-Alpes',
  'Haute-Loire': 'Auvergne-Rhône-Alpes',
  Isère: 'Auvergne-Rhône-Alpes',
  Loire: 'Auvergne-Rhône-Alpes',
  'Puy-de-Dôme': 'Auvergne-Rhône-Alpes',
  Savoie: 'Auvergne-Rhône-Alpes',
  'Côte-d’Or': 'Bourgogne-Franche-Comté',
  Jura: 'Bourgogne-Franche-Comté',
  'Saône-et-Loire': 'Bourgogne-Franche-Comté',
  Yonne: 'Bourgogne-Franche-Comté',
  'Côtes-d’Armor': 'Bretagne',
  Finistère: 'Bretagne',
  Morbihan: 'Bretagne',
  Indre: 'Centre-Val de Loire',
  Loiret: 'Centre-Val de Loire',
  'Bas-Rhin': 'Grand Est',
  Marne: 'Grand Est',
  Moselle: 'Grand Est',
  Vosges: 'Grand Est',
  Nord: 'Hauts-de-France',
  'Pas-de-Calais': 'Hauts-de-France',
  Somme: 'Hauts-de-France',
  Essonne: 'Île-de-France',
  'Seine-et-Marne': 'Île-de-France',
  Calvados: 'Normandie',
  Eure: 'Normandie',
  Manche: 'Normandie',
  Orne: 'Normandie',
  'Seine-Maritime': 'Normandie',
  Charente: 'Nouvelle-Aquitaine',
  'Charente-Maritime': 'Nouvelle-Aquitaine',
  Corrèze: 'Nouvelle-Aquitaine',
  Dordogne: 'Nouvelle-Aquitaine',
  Gironde: 'Nouvelle-Aquitaine',
  'Haute-Vienne': 'Nouvelle-Aquitaine',
  Landes: 'Nouvelle-Aquitaine',
  'Lot-et-Garonne': 'Nouvelle-Aquitaine',
  'Pyrénées-Atlantiques': 'Nouvelle-Aquitaine',
  Vienne: 'Nouvelle-Aquitaine',
  Ariège: 'Occitanie',
  Aude: 'Occitanie',
  Aveyron: 'Occitanie',
  Gard: 'Occitanie',
  Gers: 'Occitanie',
  'Haute-Garonne': 'Occitanie',
  'Hautes-Pyrénées': 'Occitanie',
  'Pyrénées-Orientales': 'Occitanie',
  Tarn: 'Occitanie',
  'Tarn-et-Garonne': 'Occitanie',
  'Loire-Atlantique': 'Pays de la Loire',
  'Maine-et-Loire': 'Pays de la Loire',
  Mayenne: 'Pays de la Loire',
  Sarthe: 'Pays de la Loire',
  Vendée: 'Pays de la Loire',
  'Alpes-de-Haute-Provence': "Provence-Alpes-Côte d'Azur",
  'Alpes-Maritimes': "Provence-Alpes-Côte d'Azur",
  'Bouches-du-Rhône': "Provence-Alpes-Côte d'Azur",
  Var: "Provence-Alpes-Côte d'Azur",
  Vaucluse: "Provence-Alpes-Côte d'Azur"
};

export const ABBAYES: Abbey[] = (rawAbbayes as RawAbbey[]).map((a) => ({
  id: a.id,
  name: a.nom,
  commune: a.commune,
  dept: a.departement,
  diocese: a.diocese,
  region: REGIONS[a.departement] ?? 'Autres régions',
  order: a.ordre,
  orderShort: a.ordre.replace(/\s*\(.*\)\s*$/, ''),
  family: familyOf(a.ordre),
  gender: a.communaute,
  year: a.annee,
  lat: a.lat,
  lon: a.lon,
  address: a.adresse ?? null,
  article: a.article,
  site: a.site ?? null,
  photo: a.photo
}));
