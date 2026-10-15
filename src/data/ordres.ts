/** Ordres religieux et communautés nouvelles (Église › Ordres & communautés).
    Liste d'après Wikipédia, « Liste des congrégations catholiques » ; les
    familles les plus connues ont une fiche enrichie (règle, devise, charisme,
    habit, maisons en France). */

/** Couleurs d'habit, reprises dans les médaillons. */
const NOIR = '#1E1B18';
const BLANC = '#F4EFE4';
const BRUN = '#5A3E2B';
const BURE = '#7A5A3C';
const GRIS = '#8A877F';
const BLEU = '#2F4A7A';
const POURPRE = '#6B1E23';
const OR = '#F0D58E';

export interface ReligiousFamily {
  id: string;
  kind: 'ordre' | 'communaute';
  /** Famille (ordres) ou forme de vie (communautés) : sert aux filtres. */
  cat: string;
  sigle: string;
  name: string;
  year: number | null;
  founder: string;
  place: string;
  /** Ordre éteint. */
  gone: boolean;
  /** Statut canonique (communautés). */
  status: string;
  rule: string;
  motto: string;
  charism: string;
  habit: string;
  /** Teintes du médaillon : habit, puis scapulaire ou voile. */
  colors: [string, string];
  houses: string[];
}

// "famille|sigle|nom|année|fondateur|lieu|d(isparu)"
const RAW_ORDRES = `Monastiques|OSB|Bénédictins|529|Benoît de Nursie|Mont-Cassin|
Monastiques||Ordre de Cluny|910|Guillaume le Pieux|Cluny|d
Monastiques||Camaldules|1012|Romuald de Ravenne|Camaldoli|
Monastiques||Congrégation de La Chaise-Dieu|1043|Robert de Turlande|La Chaise-Dieu|d
Monastiques||Ordre de Grandmont|1074|Étienne de Muret|Grandmont|d
Monastiques|OCart|Chartreux|1084|Bruno de Cologne|Chartreuse|
Monastiques|SOCist|Cisterciens|1098|Robert de Molesme|Cîteaux|
Monastiques||Ordre de Fontevraud|1101|Robert d'Arbrissel|Fontevraud|d
Monastiques||Bernardins||Réforme de Bernard de Clairvaux||
Monastiques||Ordre de Chalais|1142|Hugues de Châteauneuf|Chalais|d
Monastiques||Célestins|1248|Pierre de Morrone||d
Monastiques||Congrégation de Saint-Vanne et Saint-Hydulphe|1604|Didier de La Cour|Verdun|d
Monastiques||Mauristes|1618|Louis XIII|Paris|d
Monastiques|OCSO|Trappistes|1892||La Trappe|
Monastiques|BSCM|Bénédictines du Sacré-Cœur de Montmartre||||
Monastiques|OSB|Adoratrices du Sacré-Cœur de Montmartre||||
Monastiques||Bénédictines de l'Adoration perpétuelle||||
Monastiques||Fraternité monastique Saint-Jean-de-la-Croix||||
Moniales|OSC|Clarisses|1212|Claire d'Assise|Assise|
Moniales|OAnnM|Annonciades||||
Moniales|OSsA|Annonciades célestes||||
Moniales|OCarm|Carmélites||||
Moniales|OIC|Conceptionnistes||||
Moniales|OSCCap|Clarisses capucines||||
Moniales|OSH|Hiéronymites||||
Moniales|OSU|Ursulines||||
Moniales|ODV|Visitandines|1610|François de Sales|Annecy|
Moniales||Carmélites de Saint-Joseph|1872|Léontine Jarre||
Hospitaliers||Hospitaliers de Saint-Jean de Jérusalem|1070|||
Hospitaliers||Templiers|1129|||d
Hospitaliers|OSS|Hospitaliers du Saint-Esprit|1180|||
Hospitaliers||Confrérie de l'Arche|1189|Guy de Montpellier|Montpellier|
Hospitaliers||Ordre Teutonique|1190|||
Hospitaliers|OH|Ordre hospitalier de Saint-Jean-de-Dieu|1539|Jean de Dieu|Grenade|
Hospitaliers||Ordre de Malte|1961|Jean XXIII||
Mendiants|OCarm|Grands Carmes|1185|Berthold du mont Carmel|Mont Carmel|
Mendiants|OFM|Franciscains|1210|François d'Assise|Assise|
Mendiants|OP|Dominicains|1215|Dominique de Guzmán|Toulouse|
Mendiants|OFS|Ordre franciscain séculier|1222|||
Mendiants|TOR|Tiers-Ordre régulier franciscain||||
Mendiants|OSA|Augustins|1243|||
Mendiants|OFMCap|Capucins|1525|Matthieu de Baschi|Italie|
Mendiants|OFMConv|Frères mineurs conventuels||||
Mendiants|OCD|Carmes déchaux|1562|Thérèse d'Avila et Jean de la Croix|Ávila|
Mendiants|OCDS|Carmes déchaux séculiers||||
Mendiants|OCDJ|Carmes du Désert de Jésus||||
Mendiants||Ermites du Mont Carmel||||
Mendiants|OAR|Augustins récollets|1588|||
Mendiants|OAD|Augustins déchaux|1593|||
Mendiants||Guillemites||||d
Mendiants|OSsT|Trinitaires||||
Mendiants|OdeM|Mercédaires||||
Mendiants|DMC|Dominicaines missionnaires des campagnes|1907|Mère Marie Saint-Jean||
Mendiants||Communauté de l'Agneau|1983|||
Chanoines||Chanoines du Grand-Saint-Bernard|1050|Bernard de Menthon|Grand-Saint-Bernard|
Chanoines|OPraem|Prémontrés|1120|Norbert de Xanten|Prémontré|
Chanoines|CRSV|Chanoines réguliers de Saint-Victor||Guillaume de Champeaux|Paris|
Chanoines||Congrégation de Windesheim|1386||Langquaid|
Chanoines||Congrégation de Groenendael|1402|||d
Chanoines|CRL|Chanoines réguliers du Latran|||Rome|
Chanoines||Congrégation d'Autriche|||Sankt Florian|
Chanoines||Frères de la Vie commune|||Weilheim|
Chanoines|CRMR|Chanoines réguliers de Marie Mère du Rédempteur|||Bazougers|
Chanoines||Chanoines réguliers de la Mère de Dieu|1969|||
Chanoines||Congrégation de Saint-Maurice d'Agaune|||Saint-Maurice|
Chanoines||Chanoines réguliers de l'Immaculée Conception|||Rome|
Chanoines||Chanoines de la Sainte-Croix de Coïmbre||||
Chanoines||Chanoines de l'Étoile Rouge||||
Chanoines||Chanoines réguliers de la Sainte-Croix||||
Chanoines||Congrégation de Notre-Sauveur||Pierre Fourier||d
Chanoines||Antonins||||d
Chanoines||Chanoines de Saint-Ruf||||d
Chanoines||Congrégation d'Arrouaise||||d
Chanoines||Génovéfains|||Paris|d
Clercs réguliers|CR|Théatins|1524|Gaétan de Thiène et Pietro Carafa|Rome|
Clercs réguliers|CRSP|Barnabites|1530|Antoine-Marie Zaccaria|Milan|
Clercs réguliers|CRS|Somasques|1535|Jérôme Émilien|Somasca|
Clercs réguliers|SJ|Jésuites|1539|Ignace de Loyola|Rome|
Clercs réguliers|OMD|Léonardiens|1574|Jean Leonardi||
Clercs réguliers|MI|Camilliens|1586|Camille de Lellis|Rome|
Clercs réguliers|CRM|Caracciolins|1588|François Caracciolo||
Clercs réguliers|SchP|Piaristes|1597|Joseph Calasanz||
Prêtres & missions|CM|Lazaristes|1625|Vincent de Paul|Paris|
Prêtres & missions|CO|Oratoriens||||
Prêtres & missions|CJM|Eudistes||||
Prêtres & missions|PSS|Sulpiciens||||
Prêtres & missions|MEP|Missions étrangères de Paris|||Paris|
Prêtres & missions|SMM|Montfortains||||
Prêtres & missions|CP|Passionistes||||
Prêtres & missions|CSsR|Rédemptoristes||||
Prêtres & missions|CSSp|Spiritains||||
Prêtres & missions|SSCC|Pères de Picpus||||
Prêtres & missions|SM|Pères maristes|1816||Lyon|
Prêtres & missions|SM|Marianistes|1817|Guillaume-Joseph Chaminade|Bordeaux|
Prêtres & missions|CMI|Marianistes polonais||||
Prêtres & missions|AA|Assomptionnistes||||
Prêtres & missions|OMI|Oblats de Marie-Immaculée||||
Prêtres & missions|SAC|Pallottins||||
Prêtres & missions|CSC|Congrégation de Sainte-Croix|1837|Basile Moreau|Le Mans|
Prêtres & missions|SDB|Salésiens de Don Bosco|1859|Jean Bosco|Turin|
Prêtres & missions||Société du Prado|1860|Antoine Chevrier|Lyon|
Prêtres & missions|PB|Pères blancs||||
Prêtres & missions|CICM|Scheutistes||||
Prêtres & missions|CMF|Clarétains||||
Prêtres & missions|MCCJ|Comboniens||||
Prêtres & missions|SVD|Société du Verbe Divin||||
Prêtres & missions|CSP|Paulistes||||
Prêtres & missions|MM|Missionnaires de Maryknoll||||
Prêtres & missions|CS|Scalabriniens||||
Prêtres & missions|LC|Légion du Christ||||
Prêtres & missions|SJM|Serviteurs de Jésus et de Marie|1930|Jean-Édouard Lamy||
Prêtres & missions|FSJ|Communauté Saint-Jean||||
Prêtres & missions|MC|Frères Missionnaires de la Charité||||
Prêtres & missions|ICRSP|Institut du Christ-Roi Souverain Prêtre|1990|||
Prêtres & missions||Missionnaires du Chemin||Frère Faustino et frère Umile||
Frères enseignants|FSC|Frères des écoles chrétiennes||||
Frères enseignants|FMS|Frères maristes des écoles||||
Frères enseignants|CSV|Clercs de Saint-Viateur|||Vourles|
Frères enseignants|FICP|Frères de l'instruction chrétienne de Ploërmel|||Ploërmel|
Frères enseignants||Frères de Saint-Gabriel|||Saint-Laurent-sur-Sèvre|
Frères enseignants||Frères de Saint-Antoine|1709|Abbé Tabourin|Paris|d
Frères enseignants|SC|Frères du Sacré-Cœur|1821|André Coindre||
Frères enseignants||Frères de Saint-Joseph de Saint-Fuscien|1825|Abbé Lardeur|Saint-Fuscien|
Frères enseignants||Frères de Saint-Joseph d'Oullins|1835|Joseph Rey|Oullins|
Frères enseignants|FSF|Frères de la Sainte-Famille|1835|Gabriel Taborin|Belley|
Frères enseignants||Frères agriculteurs de Saint-François d'Assise|1840|Gabriel Deshayes||
Frères enseignants||Frères de la doctrine chrétienne de Strasbourg|1845|Eugène Mertian|Strasbourg|
Frères enseignants||Frères de l'Assomption de Butembo-Beni|1952|Henri Piérard|Butembo|
Congrégations féminines||Augustines du Précieux Sang|1226||Arras|
Congrégations féminines||Franciscaines du Christ Roi|1471||Venise|
Congrégations féminines|ODN|Compagnie de Marie Notre-Dame|1607|Jeanne de Lestonnac|Bordeaux|
Congrégations féminines||Hospitalières de l'Hôtel-Dieu de Caen|1629||Caen|
Congrégations féminines|FdC|Filles de la Charité|1633|Vincent de Paul et Louise de Marillac|Paris|
Congrégations féminines||Filles de Saint-Joseph|1638|Marie Delpech de L'Estang|Bordeaux|
Congrégations féminines||Union-Chrétienne de Saint-Chaumond|1652|Vincent de Paul et Marie Lumague|Paris|
Congrégations féminines||Sœurs de Saint-Joseph|1650|||
Congrégations féminines|CND|Congrégation de Notre-Dame de Montréal|1659|Marguerite Bourgeoys|Montréal|
Congrégations féminines||Sœurs de Saint-Thomas de Villeneuve|1661|Ange Le Proust|Lamballe|
Congrégations féminines||Sœurs de l'Enfant-Jésus – Nicolas Barré|1662|Nicolas Barré||
Congrégations féminines||Sœurs de l'Enfant-Jésus du Puy|1667|Anne-Marie Martel|Le Puy-en-Velay|
Congrégations féminines||Filles de la Retraite de Vannes|1675|Catherine de Francheville|Vannes|
Congrégations féminines||Sœurs du Saint Enfant Jésus de Reims|1676|Nicolas Roland|Reims|
Congrégations féminines||Sœurs de Saint-Charles de Lyon|1680|Charles Démia|Lyon|
Congrégations féminines||Sœurs de la Charité de Nevers|1680|Jean-Baptiste Delaveyne|Saint-Saulge|
Congrégations féminines|SCE|Sœurs de la charité d'Évron|1682|Perrine Thulard|Évron|
Congrégations féminines||Sœurs de la Providence de Lisieux|1683|Jeanne-Françoise et Marie-Thérèse Jouen|Lisieux|
Congrégations féminines||Hospitalières de Notre-Dame de la Charité|1683|Bénigne Joly|Dijon|
Congrégations féminines|OP|Dominicaines de la Présentation|1696|Marie Poussepin|Sainville|
Congrégations féminines|SPC|Sœurs de Saint-Paul de Chartres|1696|Louis Chauvet et Marie-Anne de Tilly|Chartres|
Congrégations féminines||Filles de la Sagesse|1703|Louis-Marie Grignion de Montfort et Marie-Louise Trichet||
Congrégations féminines||Notre-Dame de Charité de Rouen|1714|Marie-Barbe Pellerin de la Coudraye|Rouen|
Congrégations féminines||Religieuses du Très-Saint-Sacrement|1732|Louis Agut|Mâcon|
Congrégations féminines|PM|Sœurs de la Présentation de Marie|1796|Marie Rivier||
Congrégations féminines||Sœurs de la charité de Jeanne-Antide Thouret|1799|Jeanne-Antide Thouret|Besançon|
Congrégations féminines|RSCJ|Société du Sacré-Cœur|1800|Madeleine-Sophie Barat|Paris|
Congrégations féminines|SNJ|Dominicaines du Saint Nom de Jésus|1800|François Vincent|Toulouse|
Congrégations féminines||Sœurs de la Sainte-Famille de Besançon|1803|Jeanne-Claude Jacoulet|Besançon|
Congrégations féminines||Sœurs de la Charité de Saint-Louis|1803|Mère Saint-Louis|Vannes|
Congrégations féminines||Sœurs de la Providence de Peltre|1806|Antoine Gapp|Peltre|
Congrégations féminines|FDLC|Filles de la Croix|1807|André-Hubert Fournet et Jeanne-Élisabeth Bichier des Ages|Saint-Pierre-de-Maillé|
Congrégations féminines|SSCh|Sœurs de Sainte-Chrétienne|1807|Anne-Victoire et Alexis de Méjanès|Argancy|
Congrégations féminines||Sœurs de Saint-Joseph de Cluny|1807|Anne-Marie Javouhey||
Congrégations féminines||Sœurs de Saint-Joseph de Chambéry|1812||Chambéry|
Congrégations féminines||Filles de Marie Immaculée|1816|Adèle de Trenquelléon|Agen|
Congrégations féminines||Sœurs de la Sainte-Famille de Villefranche|1816|Émilie de Rodat|Villefranche-de-Rouergue|
Congrégations féminines||Filles de la Providence de Saint-Brieuc|1818|Jean-Marie de La Mennais|Saint-Brieuc|
Congrégations féminines|RJM|Religieuses de Jésus-Marie|1818|Claudine Thévenet|Lyon|
Congrégations féminines||Sœurs de l'instruction chrétienne de Saint-Gildas|1820|Gabriel Deshayes et Michelle Guillaume|Saint-Gildas-des-Bois|
Congrégations féminines||Sœurs de Sainte-Clotilde|1821|Antoinette Desfontaines et Jean-Baptiste Rauzan||
Congrégations féminines||Sœurs de la Retraite|1823||Redon|
Congrégations féminines|FCSCJ|Filles de la Charité du Sacré-Cœur|1823|Jean-Maurice Catroux et Rose Giet|La Salle-de-Vihiers|
Congrégations féminines||Sœurs de la Miséricorde de Sées|1823|Jean-Jacques Bazin|Sées|
Congrégations féminines||Sœurs du Christ Rédempteur|1827|Anne Boivent|Fougères|
Congrégations féminines|SMP|Filles de Sainte-Marie de la Présentation|1828|Louise et Laurence Lemarchand|Broons|
Congrégations féminines||Sœurs des Saints Anges|1831|Mère Marie Saint-Michel|Lons-le-Saunier|
Congrégations féminines|SJA|Sœurs de Saint-Joseph-de-l'Apparition|1832|Émilie de Vialar|Gaillac|
Congrégations féminines||Sœurs de Notre-Dame du Calvaire|1833|Pierre Bonhomme|Gramat|
Congrégations féminines||Filles de Jésus de Kermaria|1834|Perrine Samson|Kermaria|
Congrégations féminines||Sœurs de Notre-Dame du Bon Secours|1835|Étiennette Chavent|Lyon|
Congrégations féminines||Sœurs de la Croix de Strasbourg|1848|Adèle de Glaubitz|Strasbourg|
Congrégations féminines||Religieuses du Sacré-Cœur de Marie|1849|Jean Gailhac et Apollonie Pélissier|Béziers|
Congrégations féminines|SSA|Sœurs de Sainte-Anne|1850|Marie-Anne Blondin|Vaudreuil|
Congrégations féminines||Dominicaines de Sainte-Catherine de Sienne|1852|Gérine Fabre|Albi|
Congrégations féminines||Sœurs de Marie-Auxiliatrice|1854|Marie-Thérèse de Soubiran||
Congrégations féminines||Franciscaines missionnaires de Notre-Dame|1854|Louise Mabille et Adolphe Duchenne|Calais|
Congrégations féminines||Franciscaines filles de la Miséricorde|1856||Majorque|
Congrégations féminines|REJ|Sœurs de l'Enfant-Jésus de Chauffailles|1859|Reine Antier|Chauffailles|
Congrégations féminines|INSL|Sœurs de l'Immaculée Conception de Lourdes|1863|Eugénie Ducombs|Lourdes|
Congrégations féminines||Sœurs de Notre-Dame de la Merci|1864|Thérèse Bacq|Nancy|
Congrégations féminines||Petites Sœurs de l'Assomption|1865|Étienne Pernet et Antoinette Fage|Paris|
Congrégations féminines||Dominicaines de la Sainte-Famille|1879|Thérèse Émilie Bourget||
Congrégations féminines||Franciscaines des Sacrés-Cœurs d'Antequera|1884||Antequera|
Congrégations féminines||Hospitalières du Sacré-Cœur de Jésus||Benoît Menni|Ciempozuelos|
Congrégations féminines||Filles du Cœur Immaculé de Marie|1934|Paul-Marie Molin|Bamako|
Congrégations féminines||Dominicaines du Saint-Esprit|1943|Victor-Alain Berto||
Congrégations féminines|MC|Missionnaires de la Charité|1950|Mère Teresa|Calcutta|
Congrégations féminines||Sœurs de l'Alliance|2002|||
Congrégations féminines||Sœurs de Jésus Serviteur|2007|||
Congrégations féminines|FSP|Filles de Saint-Paul||||
Congrégations féminines||Notre-Dame du Cénacle||||
Congrégations féminines||Sœurs de la Foi||||
Congrégations féminines||Dominicaines de Béthanie||Jean-Joseph Lataste||
Orientales|OLM|Ordre libanais maronite||||
Orientales|OMM|Ordre mariamite maronite||||
Orientales|OAM|Ordre antonin maronite||||
Orientales||Ordre basilien salvatorien||||
Orientales|BC|Ordre basilien choueirite||||
Orientales|MSU|Studites||||`;

type Rich = [rule: string, motto: string, charism: string, c1: string, c2: string, habit: string, houses: string[]];

const RICH: Record<string, Rich> = {
  Bénédictins: [
    'Règle de saint Benoît',
    'Ora et labora',
    "Vie commune sous un abbé, partagée entre l'office divin chanté, la lectio divina et le travail. Hospitalité offerte à tout hôte comme au Christ.",
    NOIR,
    NOIR,
    'Coule noire',
    ['Solesmes', 'Ligugé', 'Fontgombault', 'En-Calcat']
  ],
  Chartreux: [
    'Statuts cartusiens',
    'Stat crux dum volvitur orbis',
    "Solitude en cellule, silence et prière nocturne. Les moines ne se retrouvent qu'à l'office et au chapitre.",
    BLANC,
    BLANC,
    'Coule blanche',
    ['Grande Chartreuse', 'Portes', 'Montrieux']
  ],
  Trappistes: [
    'Règle de saint Benoît',
    '',
    'Stricte observance de la règle bénédictine : simplicité, travail manuel, silence.',
    BLANC,
    NOIR,
    'Coule blanche, scapulaire noir',
    ['La Trappe', 'Sept-Fons', 'Aiguebelle']
  ],
  Prémontrés: [
    'Règle de saint Augustin',
    '',
    'Chanoines réguliers unissant vie liturgique en abbaye et ministère paroissial auprès des fidèles.',
    BLANC,
    BLANC,
    'Habit blanc',
    ['Mondaye', 'Frigolet', 'Conques']
  ],
  Franciscains: [
    'Règle de saint François',
    'Pax et bonum',
    'Pauvreté évangélique, fraternité et prédication itinérante. Proches des pauvres et de la création.',
    BURE,
    BURE,
    'Bure brune, cordon à trois nœuds',
    ['Paris', 'Lyon', 'Bordeaux']
  ],
  Clarisses: [
    'Règle de sainte Claire',
    '',
    "Branche féminine contemplative de la famille franciscaine : clôture, pauvreté et prière d'intercession.",
    BRUN,
    NOIR,
    'Habit brun, voile noir',
    ['Cormontreuil', 'Nantes', 'Lourdes']
  ],
  Dominicains: [
    'Règle de saint Augustin',
    'Laudare, benedicere, praedicare',
    'Ordre des Prêcheurs : étude, prédication et vie commune au service de la vérité.',
    BLANC,
    NOIR,
    'Habit blanc, chape noire',
    ['Toulouse', 'Paris', 'Lille', 'Prouilhe']
  ],
  Capucins: [
    'Règle de saint François',
    '',
    'Réforme franciscaine tournée vers la prière, la pauvreté stricte et la prédication populaire.',
    BRUN,
    BRUN,
    'Bure brune à long capuce',
    ['Paris', 'Marseille', 'Lyon']
  ],
  Jésuites: [
    'Constitutions ignatiennes',
    'Ad maiorem Dei gloriam',
    'Compagnie de Jésus : missions, éducation, accompagnement par les Exercices spirituels.',
    NOIR,
    NOIR,
    'Soutane noire',
    ['Paris', 'Manrèse', 'Lyon']
  ],
  'Carmes déchaux': [
    'Règle du Carmel',
    'Zelo zelatus sum',
    'Réforme du Carmel : oraison silencieuse, vie cachée et amitié avec le Christ.',
    BRUN,
    BLANC,
    'Habit brun, manteau blanc',
    ['Lisieux', 'Avon', 'Toulouse']
  ],
  'Filles de la Charité': [
    'Règles communes',
    'Caritas Christi urget nos',
    "Service corporel et spirituel des pauvres, à domicile, à l'hôpital et dans la rue.",
    BLEU,
    BLANC,
    'Habit bleu, voile blanc',
    ['Paris, rue du Bac', 'Dax']
  ],
  'Salésiens de Don Bosco': [
    'Constitutions salésiennes',
    'Da mihi animas, cetera tolle',
    'Éducation des jeunes, surtout les plus pauvres, par la raison, la religion et la bienveillance.',
    NOIR,
    NOIR,
    'Soutane ou clergyman',
    ['Lyon', 'Caen', 'Nice']
  ],
  'Missionnaires de la Charité': [
    'Constitutions MC',
    '',
    'Service gratuit des plus pauvres parmi les pauvres, mourants, malades et abandonnés.',
    BLANC,
    BLEU,
    'Sari blanc bordé de bleu',
    ['Paris', 'Marseille', 'Lyon']
  ]
};

const FAMILY_COLORS: Record<string, [string, string]> = {
  Monastiques: [NOIR, NOIR],
  Moniales: [NOIR, BLANC],
  Mendiants: [BURE, BURE],
  Chanoines: [BLANC, BLANC],
  'Clercs réguliers': [NOIR, GRIS],
  Hospitaliers: [NOIR, BLANC],
  'Prêtres & missions': [NOIR, POURPRE],
  'Frères enseignants': [GRIS, BLANC],
  'Congrégations féminines': [BLEU, BLANC],
  Orientales: [POURPRE, OR]
};

const COMMUNITY_COLORS: Record<string, [string, string]> = {
  Œcuménique: ['#E9DFC6', POURPRE],
  Monastiques: [GRIS, BLANC],
  Prêtres: [NOIR, BLANC],
  'Instituts séculiers': [BLEU, OR]
};

const byYear = (a: ReligiousFamily, b: ReligiousFamily) => (a.year ?? 9999) - (b.year ?? 9999);

export const ORDRES: ReligiousFamily[] = RAW_ORDRES.split('\n')
  .map((line, i): ReligiousFamily => {
    const [cat, sigle, name, year, founder, place, gone] = line.split('|');
    const r = RICH[name];
    return {
      id: `o${i}`,
      kind: 'ordre',
      cat,
      sigle,
      name,
      year: year ? Number(year) : null,
      founder,
      place,
      gone: gone === 'd',
      status: '',
      rule: r?.[0] ?? '',
      motto: r?.[1] ?? '',
      charism: r?.[2] ?? '',
      colors: r ? [r[3], r[4]] : FAMILY_COLORS[cat],
      habit: r?.[5] ?? '',
      houses: r?.[6] ?? []
    };
  })
  .sort(byYear);

type CommunityRow = [
  name: string,
  year: number | null,
  place: string,
  founder: string,
  cat: string,
  status: string,
  charism: string,
  houses: string[]
];

const COMMUNITY_ROWS: CommunityRow[] = [
  [
    'Communauté de Taizé',
    1940,
    'Taizé',
    'Frère Roger',
    'Œcuménique',
    'Communauté monastique',
    "Frères de plusieurs confessions chrétiennes. Accueil des jeunes du monde entier autour d'une prière chantée.",
    ['Taizé']
  ],
  [
    'Mouvement des Focolari',
    1943,
    'Trente',
    'Chiara Lubich',
    'Laïcs & consacrés',
    'Association de fidèles',
    "Œuvre de l'unité : vivre l'Évangile au quotidien pour bâtir la fraternité universelle.",
    ['Paris', 'Arny']
  ],
  [
    'Communion et Libération',
    1954,
    'Milan',
    'Luigi Giussani',
    'Laïcs',
    'Association de fidèles',
    'Éducation à la foi comme rencontre qui touche toute la vie : études, travail, culture.',
    ['Paris', 'Lyon']
  ],
  [
    'Chemin néocatéchuménal',
    1964,
    'Madrid',
    'Kiko Argüello et Carmen Hernández',
    'Laïcs',
    'Itinéraire de formation',
    "Itinéraire d'initiation chrétienne vécu en petites communautés au sein des paroisses.",
    ['Paris', 'Toulon']
  ],
  [
    "Communauté de Sant'Egidio",
    1968,
    'Rome',
    'Andrea Riccardi',
    'Laïcs',
    'Association de fidèles',
    'Prière, amitié avec les pauvres et travail pour la paix entre les peuples.',
    ['Paris', 'Lyon', 'Grenoble']
  ],
  [
    "Communauté de l'Emmanuel",
    1972,
    'Paris',
    'Pierre Goursat et Martine Laffitte-Catta',
    'Laïcs & consacrés',
    'Association de fidèles',
    'Adoration, compassion et évangélisation. Laïcs, prêtres et consacrés vivant dans le monde.',
    ['Paray-le-Monial', 'Paris']
  ],
  [
    'Communauté du Chemin Neuf',
    1973,
    'Lyon',
    'Laurent Fabre',
    'Œcuménique',
    'Communauté de vie',
    'Communauté catholique à vocation œcuménique : familles, célibataires consacrés et prêtres.',
    ['Les Dombes', 'Hautecombe', 'Lyon']
  ],
  [
    'Fraternités monastiques de Jérusalem',
    1975,
    'Paris',
    'Pierre-Marie Delfieux',
    'Monastiques',
    'Institut religieux',
    'Moines et moniales au cœur des villes, vivant de travail salarié à mi-temps et de liturgie ouverte.',
    ['Saint-Gervais, Paris', 'Vézelay', 'Strasbourg']
  ],
  [
    'Communauté Saint-Martin',
    1976,
    'Gênes',
    'Jean-François Guérin',
    'Prêtres',
    'Association de clercs',
    'Prêtres et diacres vivant en communauté au service des diocèses qui les appellent.',
    ['Évron', 'Blois']
  ],
  [
    'Foyers de Charité',
    1936,
    'Châteauneuf-de-Galaure',
    'Marthe Robin et Georges Finet',
    'Laïcs & consacrés',
    'Association de fidèles',
    "Laïcs consacrés autour d'un prêtre, proposant des retraites de silence.",
    ['Châteauneuf-de-Galaure', 'Tressaint']
  ],
  ['Petits Frères de Jésus', 1933, '', 'René Voillaume', 'Monastiques', 'Fraternité', '', []],
  ['Fraternité Saint-Vincent-Ferrier', 1979, '', '', 'Prêtres', "D'inspiration dominicaine", '', []],
  ['Fraternité sacerdotale Saint-Pierre', 1988, '', '', 'Prêtres', 'Société de vie apostolique', '', []],
  ['Opus Dei', 1928, '', 'Josemaría Escrivá de Balaguer', 'Instituts séculiers', 'Prélature personnelle', '', []],
  [
    'Notre-Dame du Travail',
    1904,
    'Lyon',
    'Aimée Novo et Andrée Butillard',
    'Instituts séculiers',
    'Institut séculier',
    '',
    []
  ],
  [
    'Institution thérésienne',
    1911,
    'Espagne',
    'Pedro Poveda Castroverde',
    'Instituts séculiers',
    'Institut séculier',
    '',
    []
  ],
  ['Missionnaires de la Royauté du Christ', 1919, 'Assise', '', 'Instituts séculiers', 'Institut séculier', '', []],
  ['Filles de la Reine des Apôtres', 1921, '', 'Elena Da Persico', 'Instituts séculiers', 'Institut séculier', '', []],
  ['Union des Filles de Dieu', 1924, 'Trévise', '', 'Instituts séculiers', 'Institut séculier', '', []],
  [
    'Missionnaires de la paternité divine',
    1933,
    'Le Mans',
    'Jeanne-Berthe Laurà',
    'Instituts séculiers',
    'Institut séculier',
    '',
    []
  ],
  [
    'Ouvrières de la Croix',
    1934,
    'Valence',
    'Vicente Garrido Pastor',
    'Instituts séculiers',
    'Institut séculier',
    '',
    []
  ],
  ['Missionnaires des malades', 1936, 'Milan', 'Germana Sommaruga', 'Instituts séculiers', 'Institut séculier', '', []],
  [
    'Fidèles Servantes de Jésus',
    1938,
    'Bogota',
    'Andrés Basset et Mercedes Ricaurte',
    'Instituts séculiers',
    'Institut séculier',
    '',
    []
  ],
  [
    'Vie et Paix dans le Christ Jésus',
    1940,
    'Pampelune',
    'Cornelio Urtasun Irisarri',
    'Instituts séculiers',
    'Institut séculier',
    '',
    []
  ],
  [
    'Missionnaires du Sacerdoce royal',
    1945,
    'Milan',
    'Ezia Fiorentino',
    'Instituts séculiers',
    'Institut séculier',
    '',
    []
  ],
  ['Institut Notre-Dame de Vie', null, 'Avignon', '', 'Instituts séculiers', 'Institut séculier', '', []],
  ['Caritas Christi', null, 'Paris', '', 'Instituts séculiers', 'Institut séculier', '', []]
];

export const COMMUNAUTES: ReligiousFamily[] = COMMUNITY_ROWS.map(
  ([name, year, place, founder, cat, status, charism, houses], i): ReligiousFamily => ({
    id: `c${i}`,
    kind: 'communaute',
    cat,
    sigle: '',
    name,
    year,
    founder,
    place,
    gone: false,
    status,
    rule: '',
    motto: '',
    charism,
    habit: '',
    colors: COMMUNITY_COLORS[cat] ?? [OR, POURPRE],
    houses
  })
).sort(byYear);

/** Ordres montrés par défaut (filtre « Principaux »). */
export const MAJOR_ORDERS = new Set([
  ...Object.keys(RICH),
  'Cisterciens',
  'Grands Carmes',
  'Augustins',
  'Ursulines',
  'Visitandines',
  'Lazaristes',
  'Missions étrangères de Paris',
  'Spiritains',
  'Assomptionnistes',
  'Rédemptoristes',
  'Oblats de Marie-Immaculée',
  'Frères des écoles chrétiennes',
  'Société du Sacré-Cœur'
]);

export const ORDER_FILTERS = [
  'Principaux',
  'Tous',
  'Monastiques',
  'Moniales',
  'Mendiants',
  'Chanoines',
  'Clercs réguliers',
  'Hospitaliers',
  'Prêtres & missions',
  'Frères enseignants',
  'Congrégations féminines',
  'Orientales',
  'Disparus'
];

export const COMMUNITY_FILTERS = [
  'Principales',
  'Toutes',
  'Laïcs',
  'Laïcs & consacrés',
  'Prêtres',
  'Monastiques',
  'Œcuménique',
  'Instituts séculiers'
];
