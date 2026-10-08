// Frise chronologique de l'histoire du salut (page Compendium › Frise).
//
// Les dates suivent la chronologie traditionnelle, comme data/figures.ts :
// ce sont des repères indicatifs, souvent discutés par les exégètes
// (préfixe « v. » = vers). Les récits des origines (Gn 1 – 11) ne sont pas
// datés. Avant le Christ, les années sont av. J.-C. sans le préciser (la
// frise se lit « av. J.-C. → apr. ») ; à partir de la période du Christ,
// « av. » est écrit explicitement pour lever l'ambiguïté.

export interface FriseRef {
  /** Affichage, ex. « Gn 1–2 ». */
  display: string;
  bookId: string;
  chapter: number;
}

export interface FriseEvent {
  id: string;
  title: string;
  /** `null` pour les récits non datables (origines). */
  date: string | null;
  ref: FriseRef | null;
  text: string;
  /** Figures (ids de data/figures.ts) liées à l'événement. */
  figureIds?: string[];
}

export interface FrisePeriod {
  id: string;
  numeral: string;
  name: string;
  /** Bornes affichées, ex. « v. 1850 – 1700 ». */
  range: string;
  events: FriseEvent[];
}

function ref(display: string, bookId: string, chapter: number): FriseRef {
  return { display, bookId, chapter };
}

export const FRISE: FrisePeriod[] = [
  {
    id: 'origines',
    numeral: 'I',
    name: 'Les origines',
    range: 'Gn 1 – 11',
    events: [
      { id: 'creation', title: 'La Création', date: null, ref: ref('Gn 1–2', 'gn', 1), text: "Dieu crée le ciel et la terre, et fait l'homme à son image.", figureIds: ['adam', 'eve'] },
      { id: 'eden', title: "Le jardin d'Éden", date: null, ref: ref('Gn 2', 'gn', 2), text: "Dieu place l'homme dans le jardin pour le cultiver et le garder, et lui donne la femme pour compagne.", figureIds: ['adam', 'eve'] },
      { id: 'chute', title: 'La chute', date: null, ref: ref('Gn 3', 'gn', 3), text: "Tentés par le serpent, l'homme et la femme désobéissent ; Dieu promet que la descendance de la femme écrasera la tête du serpent.", figureIds: ['adam', 'eve'] },
      { id: 'cain-abel', title: 'Caïn et Abel', date: null, ref: ref('Gn 4', 'gn', 4), text: "Jaloux de son frère, Caïn tue Abel. Premier meurtre de l'histoire humaine." },
      { id: 'henok', title: 'Hénok enlevé', date: null, ref: ref('Gn 5', 'gn', 5), text: "De la lignée de Seth, Hénok « marche avec Dieu » et disparaît, car Dieu l'a pris." },
      { id: 'deluge', title: 'Le déluge', date: null, ref: ref('Gn 6–8', 'gn', 6), text: "Devant la violence qui remplit la terre, Dieu envoie le déluge ; Noé, juste, est sauvé dans l'arche avec sa famille.", figureIds: ['noe'] },
      { id: 'alliance-noe', title: "L'alliance avec Noé", date: null, ref: ref('Gn 9', 'gn', 9), text: "Dieu promet de ne plus détruire la terre par les eaux ; l'arc-en-ciel en est le signe.", figureIds: ['noe'] },
      { id: 'nations', title: 'La table des peuples', date: null, ref: ref('Gn 10', 'gn', 10), text: "Les descendants de Sem, Cham et Japhet se répandent sur la terre et forment les nations.", figureIds: ['noe'] },
      { id: 'babel', title: 'La tour de Babel', date: null, ref: ref('Gn 11', 'gn', 11), text: "Les hommes veulent se faire un nom en bâtissant une tour jusqu'au ciel ; Dieu confond leur langage et les disperse." }
    ]
  },
  {
    id: 'patriarches',
    numeral: 'II',
    name: 'Les patriarches',
    range: 'v. 1850 – 1565',
    events: [
      { id: 'appel-abram', title: "Appel d'Abram", date: 'v. 1850', ref: ref('Gn 12', 'gn', 12), text: "« Quitte ton pays… je ferai de toi une grande nation. » Abram part d'Harân vers Canaan.", figureIds: ['abraham', 'sarah', 'lot'] },
      { id: 'abram-egypte', title: 'Abram en Égypte', date: 'v. 1850', ref: ref('Gn 12', 'gn', 12), text: "Poussé par la famine, Abram descend en Égypte et fait passer Saraï pour sa sœur.", figureIds: ['abraham', 'sarah'] },
      { id: 'abram-lot', title: 'Abram et Lot se séparent', date: 'v. 1845', ref: ref('Gn 13', 'gn', 13), text: "Pour éviter les querelles, Lot choisit la plaine du Jourdain ; Abram s'établit à Mambré.", figureIds: ['abraham', 'lot'] },
      { id: 'melkisedek', title: 'Melkisédek', date: 'v. 1840', ref: ref('Gn 14', 'gn', 14), text: "Le roi de Salem, prêtre du Dieu Très-Haut, offre le pain et le vin et bénit Abram.", figureIds: ['abraham'] },
      { id: 'alliance-abram', title: 'Alliance avec Abram', date: 'v. 1840', ref: ref('Gn 15', 'gn', 15), text: "« Regarde le ciel et compte les étoiles. » Abram croit, et cela lui est compté comme justice.", figureIds: ['abraham'] },
      { id: 'ismael', title: "Naissance d'Ismaël", date: 'v. 1835', ref: ref('Gn 16', 'gn', 16), text: "Saraï donne sa servante Agar à Abram ; dans le désert, l'ange du Seigneur rencontre Agar enceinte.", figureIds: ['hagar', 'abraham', 'sarah'] },
      { id: 'abraham-nom', title: 'Abram devient Abraham', date: 'v. 1825', ref: ref('Gn 17', 'gn', 17), text: "Dieu change les noms d'Abram et Saraï et donne la circoncision comme signe de l'alliance.", figureIds: ['abraham', 'sarah'] },
      { id: 'mambre', title: 'Les visiteurs de Mambré', date: 'v. 1825', ref: ref('Gn 18', 'gn', 18), text: "Abraham accueille trois visiteurs qui annoncent la naissance d'un fils ; il intercède pour Sodome.", figureIds: ['abraham', 'sarah'] },
      { id: 'sodome', title: 'Sodome et Gomorrhe', date: 'v. 1825', ref: ref('Gn 19', 'gn', 19), text: "Les villes de la plaine sont détruites ; Lot est sauvé, sa femme se retourne et devient statue de sel.", figureIds: ['lot'] },
      { id: 'naissance-isaac', title: "Naissance d'Isaac", date: 'v. 1825', ref: ref('Gn 21', 'gn', 21), text: "Sara enfante dans sa vieillesse le fils de la promesse ; Agar et Ismaël sont renvoyés.", figureIds: ['isaac', 'sarah', 'abraham', 'hagar'] },
      { id: 'sacrifice-isaac', title: "Le sacrifice d'Isaac", date: 'v. 1810', ref: ref('Gn 22', 'gn', 22), text: "Dieu éprouve Abraham sur le mont Moriyya ; au dernier instant, un bélier est offert à la place d'Isaac.", figureIds: ['abraham', 'isaac'] },
      { id: 'mort-sara', title: 'Mort de Sara', date: 'v. 1790', ref: ref('Gn 23', 'gn', 23), text: "Abraham achète la grotte de Makpéla pour y ensevelir Sara : première terre possédée en Canaan.", figureIds: ['sarah', 'abraham'] },
      { id: 'rebecca', title: 'Rébecca épouse Isaac', date: 'v. 1785', ref: ref('Gn 24', 'gn', 24), text: "Le serviteur d'Abraham trouve Rébecca au puits ; elle accepte de partir et devient la femme d'Isaac.", figureIds: ['rebekah', 'isaac'] },
      { id: 'esau-jacob', title: 'Ésaü et Jacob', date: 'v. 1765', ref: ref('Gn 25', 'gn', 25), text: "Rébecca met au monde des jumeaux ; Ésaü vend son droit d'aînesse pour un plat de lentilles.", figureIds: ['jacob', 'rebekah', 'isaac'] },
      { id: 'benediction-volee', title: 'La bénédiction volée', date: 'v. 1690', ref: ref('Gn 27', 'gn', 27), text: "Aidé de Rébecca, Jacob se fait passer pour Ésaü et reçoit la bénédiction d'Isaac aveugle.", figureIds: ['jacob', 'isaac', 'rebekah'] },
      { id: 'echelle-jacob', title: "L'échelle de Jacob", date: 'v. 1690', ref: ref('Gn 28', 'gn', 28), text: "En fuite, Jacob voit en songe une échelle reliant la terre au ciel ; il nomme le lieu Béthel.", figureIds: ['jacob'] },
      { id: 'lea-rachel', title: 'Léa et Rachel', date: 'v. 1680', ref: ref('Gn 29', 'gn', 29), text: "Jacob sert Laban sept ans pour Rachel, reçoit Léa par ruse, puis épouse aussi Rachel.", figureIds: ['jacob', 'leah', 'rachel'] },
      { id: 'jacob-israel', title: 'Jacob devient Israël', date: 'v. 1670', ref: ref('Gn 32', 'gn', 32), text: "Au gué du Yabboq, Jacob lutte toute la nuit ; il reçoit le nom d'Israël, « fort contre Dieu ».", figureIds: ['jacob'] },
      { id: 'reconciliation', title: 'Réconciliation avec Ésaü', date: 'v. 1670', ref: ref('Gn 33', 'gn', 33), text: "Ésaü court au-devant de son frère, l'embrasse et pleure avec lui.", figureIds: ['jacob'] },
      { id: 'joseph-vendu', title: 'Joseph vendu', date: 'v. 1655', ref: ref('Gn 37', 'gn', 37), text: "Jaloux du fils préféré de Jacob, ses frères le vendent à des marchands en route vers l'Égypte.", figureIds: ['joseph-fils-jacob', 'jacob'] },
      { id: 'juda-tamar', title: 'Juda et Tamar', date: 'v. 1650', ref: ref('Gn 38', 'gn', 38), text: "Tamar obtient par ruse la descendance qu'on lui refusait ; de cette union naît Pérès, ancêtre de David.", figureIds: ['tamar'] },
      { id: 'joseph-potiphar', title: 'Joseph chez Potiphar', date: 'v. 1650', ref: ref('Gn 39', 'gn', 39), text: "Faussement accusé par la femme de son maître, Joseph est jeté en prison, mais le Seigneur est avec lui.", figureIds: ['joseph-fils-jacob'] },
      { id: 'songes-pharaon', title: 'Les songes de Pharaon', date: 'v. 1645', ref: ref('Gn 41', 'gn', 41), text: "Joseph annonce sept années d'abondance puis sept de famine ; Pharaon l'établit sur toute l'Égypte.", figureIds: ['joseph-fils-jacob'] },
      { id: 'joseph-reconnu', title: 'Joseph se fait reconnaître', date: 'v. 1635', ref: ref('Gn 45', 'gn', 45), text: "« C'est moi Joseph, votre frère. » Il pardonne : « Dieu m'a envoyé devant vous pour vous sauver. »", figureIds: ['joseph-fils-jacob'] },
      { id: 'descente-egypte', title: 'Israël descend en Égypte', date: 'v. 1635', ref: ref('Gn 46', 'gn', 46), text: "Jacob et ses fils, soixante-dix personnes, s'installent au pays de Goshèn.", figureIds: ['jacob', 'joseph-fils-jacob'] },
      { id: 'benediction-douze', title: 'Bénédiction des douze fils', date: 'v. 1620', ref: ref('Gn 49', 'gn', 49), text: "Avant de mourir, Jacob bénit ses fils, pères des douze tribus ; « le sceptre ne s'écartera pas de Juda ».", figureIds: ['jacob'] },
      { id: 'mort-joseph', title: 'Mort de Joseph', date: 'v. 1565', ref: ref('Gn 50', 'gn', 50), text: "« Vous aviez voulu me faire du mal, Dieu l'a changé en bien. » Joseph meurt à cent dix ans.", figureIds: ['joseph-fils-jacob'] }
    ]
  },
  {
    id: 'exode',
    numeral: 'III',
    name: "L'Exode et la Terre promise",
    range: 'v. 1300 – 1050',
    events: [
      { id: 'oppression', title: "L'oppression en Égypte", date: 'v. 1300', ref: ref('Ex 1', 'ex', 1), text: "Un nouveau pharaon réduit les Hébreux en esclavage et ordonne de jeter au Nil leurs fils nouveau-nés." },
      { id: 'naissance-moise', title: 'Naissance de Moïse', date: 'v. 1290', ref: ref('Ex 2', 'ex', 2), text: "Caché dans une corbeille sur le Nil, l'enfant est recueilli par la fille de Pharaon.", figureIds: ['moise', 'miriam'] },
      { id: 'buisson', title: 'Le buisson ardent', date: 'v. 1250', ref: ref('Ex 3', 'ex', 3), text: "À l'Horeb, Dieu se révèle à Moïse : « Je suis qui je suis » ; il l'envoie délivrer son peuple.", figureIds: ['moise'] },
      { id: 'plaies', title: 'Les dix plaies', date: 'v. 1250', ref: ref('Ex 7–11', 'ex', 7), text: "Pharaon endurcit son cœur ; les fléaux frappent l'Égypte jusqu'à la mort des premiers-nés.", figureIds: ['moise', 'aaron'] },
      { id: 'paque', title: 'La Pâque', date: 'v. 1250', ref: ref('Ex 12', 'ex', 12), text: "Le sang de l'agneau sur les portes préserve les Hébreux ; ils partent en hâte, avec du pain sans levain.", figureIds: ['moise', 'aaron'] },
      { id: 'mer-rouge', title: 'Passage de la mer', date: 'v. 1250', ref: ref('Ex 14', 'ex', 14), text: "Les eaux s'ouvrent devant Israël et se referment sur l'armée de Pharaon ; Miriam chante la victoire.", figureIds: ['moise', 'miriam'] },
      { id: 'manne', title: 'La manne et les cailles', date: 'v. 1250', ref: ref('Ex 16', 'ex', 16), text: "Au désert, Dieu nourrit son peuple du pain venu du ciel, chaque matin, pendant quarante ans.", figureIds: ['moise'] },
      { id: 'jethro', title: 'Conseil de Jéthro', date: 'v. 1250', ref: ref('Ex 18', 'ex', 18), text: "Le beau-père de Moïse lui conseille d'établir des juges pour l'aider à gouverner le peuple.", figureIds: ['moise', 'zipporah'] },
      { id: 'sinai', title: 'Les Dix Paroles au Sinaï', date: 'v. 1250', ref: ref('Ex 19–20', 'ex', 20), text: "Dans le feu et la nuée, Dieu donne sa Loi et scelle l'alliance avec Israël.", figureIds: ['moise'] },
      { id: 'veau-or', title: "Le veau d'or", date: 'v. 1250', ref: ref('Ex 32', 'ex', 32), text: "Pendant que Moïse est sur la montagne, le peuple adore une idole ; Moïse brise les tables puis intercède.", figureIds: ['moise', 'aaron'] },
      { id: 'tente', title: 'La Demeure dressée', date: 'v. 1249', ref: ref('Ex 40', 'ex', 40), text: "La tente de la rencontre est érigée ; la gloire du Seigneur la remplit.", figureIds: ['moise', 'aaron'] },
      { id: 'saintete', title: 'La loi de sainteté', date: 'v. 1249', ref: ref('Lv 19', 'lv', 19), text: "« Soyez saints, car je suis saint… Tu aimeras ton prochain comme toi-même. »" },
      { id: 'explorateurs', title: 'Les explorateurs', date: 'v. 1248', ref: ref('Nb 13–14', 'nb', 13), text: "Effrayé par le rapport des espions, le peuple refuse d'entrer en Canaan ; seuls Josué et Caleb font confiance.", figureIds: ['joshua', 'caleb'] },
      { id: 'quarante-ans', title: 'Quarante ans au désert', date: 'v. 1248 – 1210', ref: ref('Nb 14', 'nb', 14), text: "La génération incrédule ne verra pas la Terre promise ; Israël erre au désert une génération entière.", figureIds: ['moise'] },
      { id: 'serpent', title: "Le serpent d'airain", date: 'v. 1210', ref: ref('Nb 21', 'nb', 21), text: "Mordus par des serpents, ceux qui regardent le serpent de bronze élevé par Moïse sont guéris.", figureIds: ['moise'] },
      { id: 'balaam', title: 'Balaam et son ânesse', date: 'v. 1210', ref: ref('Nb 22–24', 'nb', 22), text: "Appelé pour maudire Israël, le devin Balaam ne peut que le bénir : « Un astre issu de Jacob devient chef. »" },
      { id: 'shema', title: 'Écoute, Israël', date: 'v. 1210', ref: ref('Dt 6', 'dt', 6), text: "Dans ses derniers discours, Moïse rappelle la Loi : « Tu aimeras le Seigneur ton Dieu de tout ton cœur. »", figureIds: ['moise'] },
      { id: 'mort-moise', title: 'Mort de Moïse', date: 'v. 1210', ref: ref('Dt 34', 'dt', 34), text: "Du mont Nébo, Moïse contemple la Terre promise sans y entrer ; Josué lui succède.", figureIds: ['moise', 'joshua'] },
      { id: 'rahab', title: 'Rahab cache les espions', date: 'v. 1210', ref: ref('Jos 2', 'jos', 2), text: "À Jéricho, Rahab abrite les envoyés de Josué ; le cordon écarlate sauvera sa maison.", figureIds: ['rahab', 'joshua'] },
      { id: 'jourdain', title: 'Passage du Jourdain', date: 'v. 1210', ref: ref('Jos 3', 'jos', 3), text: "Les eaux s'arrêtent devant l'arche d'alliance ; Israël entre dans le pays à pied sec.", figureIds: ['joshua'] },
      { id: 'jericho', title: 'La chute de Jéricho', date: 'v. 1210', ref: ref('Jos 6', 'jos', 6), text: "Au septième tour et au son des trompes, les murailles s'écroulent.", figureIds: ['joshua', 'rahab'] },
      { id: 'partage', title: 'Partage du pays', date: 'v. 1200', ref: ref('Jos 13–21', 'jos', 13), text: "Josué répartit la terre entre les tribus ; Caleb reçoit Hébron, et donne sa fille Aksa à Otniel.", figureIds: ['joshua', 'caleb', 'achsah'] },
      { id: 'sichem', title: 'Alliance de Sichem', date: 'v. 1190', ref: ref('Jos 24', 'jos', 24), text: "« Moi et ma maison, nous servirons le Seigneur. » Le peuple renouvelle l'alliance avant la mort de Josué.", figureIds: ['joshua'] },
      { id: 'cycle-juges', title: 'Le temps des Juges', date: 'v. 1200 – 1050', ref: ref('Jg 2', 'jg', 2), text: "Infidélité, oppression, cri vers Dieu, délivrance par un juge : le cycle se répète pendant deux siècles." },
      { id: 'debora', title: 'Débora et Baraq', date: 'v. 1150', ref: ref('Jg 4–5', 'jg', 4), text: "La prophétesse Débora juge Israël et conduit la victoire contre Sisera ; son cantique la célèbre.", figureIds: ['deborah'] },
      { id: 'gedeon', title: 'Gédéon et les trois cents', date: 'v. 1150', ref: ref('Jg 6–7', 'jg', 6), text: "Avec trois cents hommes, des trompes et des torches, Gédéon met en fuite les Madianites.", figureIds: ['gideon'] },
      { id: 'jephte', title: 'Le vœu de Jephté', date: 'v. 1120', ref: ref('Jg 11', 'jg', 11), text: "Vainqueur des Ammonites, Jephté accomplit un vœu imprudent qui coûte la vie à sa fille." },
      { id: 'samson', title: 'Samson et Dalila', date: 'v. 1100', ref: ref('Jg 13–16', 'jg', 13), text: "Consacré à Dieu dès sa naissance, Samson est trahi par Dalila ; il meurt en abattant le temple de Dagon.", figureIds: ['samson', 'delilah'] },
      { id: 'ruth', title: 'Ruth la Moabite', date: 'v. 1100', ref: ref('Rt 1–4', 'rt', 1), text: "« Ton peuple sera mon peuple, ton Dieu sera mon Dieu. » Ruth épouse Booz et devient l'aïeule de David.", figureIds: ['ruth', 'naomi', 'boaz'] },
      { id: 'samuel-naissance', title: 'Naissance de Samuel', date: 'v. 1070', ref: ref('1 S 1–2', '1s', 1), text: "Anne obtient un fils par la prière et le consacre au Seigneur ; son cantique annonce celui de Marie.", figureIds: ['hannah', 'samuel', 'eli'] },
      { id: 'samuel-appel', title: 'Appel de Samuel', date: 'v. 1060', ref: ref('1 S 3', '1s', 3), text: "« Parle, Seigneur, ton serviteur écoute. » Dieu appelle l'enfant dans le sanctuaire de Silo.", figureIds: ['samuel', 'eli'] },
      { id: 'arche-prise', title: "L'arche capturée", date: 'v. 1050', ref: ref('1 S 4', '1s', 4), text: "Les Philistins s'emparent de l'arche à Aphèq ; Éli meurt en apprenant la nouvelle.", figureIds: ['eli'] }
    ]
  },
  {
    id: 'royaume',
    numeral: 'IV',
    name: 'Le royaume',
    range: 'v. 1030 – 587',
    events: [
      { id: 'saul-roi', title: 'Saül, premier roi', date: 'v. 1030', ref: ref('1 S 10', '1s', 10), text: "Le peuple réclame un roi ; Samuel oint Saül, de la tribu de Benjamin.", figureIds: ['saul', 'samuel'] },
      { id: 'david-oint', title: 'David oint à Bethléem', date: 'v. 1025', ref: ref('1 S 16', '1s', 16), text: "« Le Seigneur regarde le cœur. » Samuel oint le plus jeune des fils de Jessé.", figureIds: ['david', 'samuel'] },
      { id: 'goliath', title: 'David et Goliath', date: 'v. 1020', ref: ref('1 S 17', '1s', 17), text: "Armé d'une fronde et de sa foi, le jeune berger abat le géant philistin.", figureIds: ['david', 'saul'] },
      { id: 'david-jonathan', title: 'David et Jonathan', date: 'v. 1015', ref: ref('1 S 18–20', '1s', 18), text: "Le fils de Saül se lie d'amitié avec David et le protège de la jalousie de son père.", figureIds: ['david', 'jonathan', 'saul'] },
      { id: 'abigail', title: 'Abigaïl apaise David', date: 'v. 1012', ref: ref('1 S 25', '1s', 25), text: "Par sa sagesse, Abigaïl empêche David de verser le sang ; elle devient sa femme.", figureIds: ['abigail', 'david'] },
      { id: 'mort-saul', title: 'Mort de Saül', date: 'v. 1010', ref: ref('1 S 31', '1s', 31), text: "Saül et Jonathan tombent sur le mont Gelboé ; David les pleure dans une élégie.", figureIds: ['saul', 'jonathan', 'david'] },
      { id: 'david-hebron', title: 'David roi à Hébron', date: 'v. 1010', ref: ref('2 S 2', '2s', 2), text: "David règne d'abord sur Juda, sept ans et demi.", figureIds: ['david'] },
      { id: 'jerusalem', title: 'Jérusalem capitale', date: 'v. 1003', ref: ref('2 S 5', '2s', 5), text: "Roi de tout Israël, David prend la forteresse de Sion et en fait la cité de David.", figureIds: ['david'] },
      { id: 'arche-jerusalem', title: "L'arche à Jérusalem", date: 'v. 1000', ref: ref('2 S 6', '2s', 6), text: "David danse de toutes ses forces devant l'arche qui monte vers la ville sainte.", figureIds: ['david'] },
      { id: 'promesse-david', title: 'La promesse à David', date: 'v. 1000', ref: ref('2 S 7', '2s', 7), text: "Par le prophète Nathan, Dieu promet à David une dynastie éternelle : racine de l'espérance messianique.", figureIds: ['david'] },
      { id: 'bethsabee', title: 'David et Bethsabée', date: 'v. 995', ref: ref('2 S 11–12', '2s', 11), text: "David prend la femme d'Urie et fait tuer son mari ; Nathan le confronte, David se repent (Ps 50).", figureIds: ['david', 'bathsheba'] },
      { id: 'absalom', title: "Révolte d'Absalom", date: 'v. 980', ref: ref('2 S 15–18', '2s', 15), text: "Le fils de David s'empare du trône ; il meurt pris par les cheveux dans un chêne. « Absalom, mon fils ! »", figureIds: ['david'] },
      { id: 'salomon-roi', title: 'Salomon roi', date: 'v. 970', ref: ref('1 R 1', '1r', 1), text: "À l'instigation de Bethsabée et de Nathan, David désigne Salomon pour lui succéder.", figureIds: ['solomon', 'bathsheba', 'david'] },
      { id: 'sagesse-salomon', title: 'La sagesse de Salomon', date: 'v. 968', ref: ref('1 R 3', '1r', 3), text: "Salomon demande un cœur qui écoute ; le jugement des deux mères révèle sa sagesse.", figureIds: ['solomon'] },
      { id: 'temple', title: 'Dédicace du Temple', date: 'v. 960', ref: ref('1 R 8', '1r', 8), text: "Le Temple achevé, l'arche y est déposée et la nuée de la gloire remplit la maison du Seigneur.", figureIds: ['solomon'] },
      { id: 'saba', title: 'La reine de Saba', date: 'v. 950', ref: ref('1 R 10', '1r', 10), text: "Venue éprouver Salomon par des énigmes, la reine admire sa sagesse et bénit son Dieu.", figureIds: ['solomon'] },
      { id: 'schisme', title: 'Le schisme', date: '931', ref: ref('1 R 12', '1r', 12), text: "À la mort de Salomon, dix tribus se séparent sous Jéroboam : royaume d'Israël au nord, de Juda au sud." },
      { id: 'josaphat', title: 'Règne de Josaphat', date: 'v. 870', ref: ref('2 Ch 17–20', '2ch', 17), text: "Le roi de Juda envoie des lévites enseigner la Loi dans les villes et réforme la justice.", figureIds: ['jehoshaphat'] },
      { id: 'elie-carmel', title: 'Élie au Carmel', date: 'v. 860', ref: ref('1 R 18', '1r', 18), text: "Sous Achab et Jézabel, Élie défie les prophètes de Baal ; le feu du Seigneur consume le sacrifice.", figureIds: ['elijah'] },
      { id: 'elie-horeb', title: "Élie à l'Horeb", date: 'v. 860', ref: ref('1 R 19', '1r', 19), text: "Ni dans l'ouragan, ni dans le séisme, ni dans le feu : Dieu se manifeste dans « le murmure d'une brise légère ».", figureIds: ['elijah', 'elisha'] },
      { id: 'elie-enleve', title: 'Élie enlevé au ciel', date: 'v. 850', ref: ref('2 R 2', '2r', 2), text: "Un char de feu emporte Élie ; Élisée reçoit une double part de son esprit.", figureIds: ['elijah', 'elisha'] },
      { id: 'sunamite', title: 'Élisée et la Sunamite', date: 'v. 845', ref: ref('2 R 4', '2r', 4), text: "Élisée annonce un fils à la femme qui l'accueillait, puis le ramène à la vie.", figureIds: ['elisha', 'shunammite'] },
      { id: 'naaman', title: 'Naaman guéri', date: 'v. 845', ref: ref('2 R 5', '2r', 5), text: "Le général araméen se baigne sept fois dans le Jourdain et sa chair redevient comme celle d'un enfant.", figureIds: ['elisha'] },
      { id: 'jehu', title: 'Révolution de Jéhu', date: '841', ref: ref('2 R 9–10', '2r', 9), text: "Oint par un disciple d'Élisée, Jéhu extermine la maison d'Achab et le culte de Baal en Israël.", figureIds: ['elisha'] },
      { id: 'jonas', title: 'Jonas à Ninive', date: 'v. 780', ref: ref('Jon 1–4', 'jon', 1), text: "Fuyant sa mission, Jonas est avalé par un grand poisson ; Ninive se convertit à sa prédication.", figureIds: ['jonah'] },
      { id: 'amos', title: 'Amos, prophète de la justice', date: 'v. 760', ref: ref('Am 5', 'am', 5), text: "Le berger de Teqoa dénonce l'injustice d'Israël : « Que le droit jaillisse comme les eaux ! »", figureIds: ['amos'] },
      { id: 'osee', title: "Osée et l'amour fidèle", date: 'v. 750', ref: ref('Os 1–3', 'os', 1), text: "Par son mariage avec Gomer, Osée annonce l'amour de Dieu pour son peuple infidèle.", figureIds: ['hosea'] },
      { id: 'isaie-vocation', title: "Vocation d'Isaïe", date: '740', ref: ref('Is 6', 'is', 6), text: "Dans le Temple, Isaïe voit le Seigneur : « Saint, saint, saint ! » — « Me voici, envoie-moi. »", figureIds: ['isaiah'] },
      { id: 'emmanuel', title: "Le signe de l'Emmanuel", date: 'v. 734', ref: ref('Is 7', 'is', 7), text: "« Voici que la jeune femme est enceinte, elle enfantera un fils, Emmanuel. »", figureIds: ['isaiah'] },
      { id: 'michee', title: 'Michée annonce Bethléem', date: 'v. 725', ref: ref('Mi 5', 'mi', 5), text: "« Et toi, Bethléem… de toi sortira celui qui doit gouverner Israël. »" },
      { id: 'samarie', title: 'Chute de Samarie', date: '722', ref: ref('2 R 17', '2r', 17), text: "L'Assyrie détruit le royaume du Nord ; ses habitants sont déportés, c'est la fin des dix tribus." },
      { id: 'sennacherib', title: 'Siège de Jérusalem', date: '701', ref: ref('2 R 18–19', '2r', 18), text: "Assiégé par Sennachérib, Ézéchias prie avec Isaïe ; l'armée assyrienne se retire.", figureIds: ['hezekiah', 'isaiah'] },
      { id: 'ezechias-malade', title: "Guérison d'Ézéchias", date: 'v. 700', ref: ref('2 R 20', '2r', 20), text: "Le roi malade supplie le Seigneur, qui ajoute quinze années à sa vie ; l'ombre recule sur le cadran.", figureIds: ['hezekiah', 'isaiah'] },
      { id: 'tobie', title: 'Tobie en exil', date: 'v. 700', ref: ref('Tb 1–14', 'tb', 1), text: "Déporté à Ninive, Tobit reste fidèle ; son fils Tobie, guidé par l'ange Raphaël, guérit son père." },
      { id: 'sophonie', title: 'Sophonie et le jour du Seigneur', date: 'v. 630', ref: ref('So 3', 'so', 3), text: "Le prophète annonce le jugement, puis la joie : « Le Seigneur ton Dieu est en toi. »" },
      { id: 'jeremie-vocation', title: 'Vocation de Jérémie', date: '627', ref: ref('Jr 1', 'jr', 1), text: "« Avant de te façonner dans le sein de ta mère, je te connaissais. » Jérémie est appelé tout jeune.", figureIds: ['jeremiah'] },
      { id: 'josias-reforme', title: 'Réforme de Josias', date: '622', ref: ref('2 R 22–23', '2r', 22), text: "Le livre de la Loi est retrouvé au Temple ; consultée, Houlda confirme ; Josias purifie le culte.", figureIds: ['josiah', 'huldah'] },
      { id: 'ninive', title: 'Chute de Ninive', date: '612', ref: ref('Na 3', 'na', 3), text: "Nahoum célèbre la chute de la capitale assyrienne, tombée sous les coups des Babyloniens." },
      { id: 'megiddo', title: 'Mort de Josias à Megiddo', date: '609', ref: ref('2 R 23', '2r', 23), text: "Le roi réformateur tombe face au pharaon Néko ; Jérémie compose une lamentation.", figureIds: ['josiah', 'jeremiah'] },
      { id: 'habacuc', title: 'Habacuc interroge Dieu', date: 'v. 605', ref: ref('Ha 1–2', 'ha', 1), text: "Pourquoi le mal triomphe-t-il ? Réponse : « Le juste vivra par sa fidélité. »" },
      { id: 'daniel-deporte', title: 'Daniel à Babylone', date: '605', ref: ref('Dn 1', 'dn', 1), text: "Nabuchodonosor emmène de jeunes nobles de Juda ; Daniel et ses compagnons restent fidèles à la Loi.", figureIds: ['daniel', 'nebuchadnezzar'] },
      { id: 'statue', title: 'Le songe de la statue', date: 'v. 600', ref: ref('Dn 2', 'dn', 2), text: "Daniel explique au roi la statue aux pieds d'argile, brisée par une pierre : le Royaume de Dieu.", figureIds: ['daniel', 'nebuchadnezzar'] },
      { id: 'premiere-deportation', title: 'Première déportation', date: '597', ref: ref('2 R 24', '2r', 24), text: "Nabuchodonosor prend Jérusalem, emmène le roi Joiakin et l'élite à Babylone, dont Ézéchiel.", figureIds: ['nebuchadnezzar'] },
      { id: 'ezechiel-vocation', title: "Vocation d'Ézéchiel", date: '593', ref: ref('Ez 1–3', 'ez', 1), text: "Au bord du Kebar, chez les exilés, le prêtre Ézéchiel voit le char de la gloire de Dieu.", figureIds: ['ezekiel'] },
      { id: 'jeremie-citerne', title: 'Jérémie dans la citerne', date: '588', ref: ref('Jr 38', 'jr', 38), text: "Accusé de démoraliser les défenseurs, le prophète est jeté dans une citerne boueuse.", figureIds: ['jeremiah'] }
    ]
  },
  {
    id: 'exil',
    numeral: 'V',
    name: "L'exil",
    range: '587 – 538',
    events: [
      { id: 'prise-jerusalem', title: 'Prise de Jérusalem', date: '587', ref: ref('2 R 25', '2r', 25), text: "Nabuchodonosor détruit le Temple et déporte le peuple.", figureIds: ['nebuchadnezzar', 'jeremiah'] },
      { id: 'lamentations', title: 'Les Lamentations', date: 'v. 586', ref: ref('Lm 1', 'lm', 1), text: "« Comment ! Elle est assise à l'écart, la ville populeuse ! » Le deuil de Jérusalem en poèmes." },
      { id: 'babylone-psaume', title: 'Au bord des fleuves de Babylone', date: 'v. 585', ref: ref('Ps 136 (137)', 'ps', 137), text: "« Comment chanterions-nous un chant du Seigneur sur une terre étrangère ? »" },
      { id: 'godolias', title: 'Assassinat de Godolias', date: '582', ref: ref('Jr 40–41', 'jr', 40), text: "Le gouverneur laissé par Babylone est tué ; les rescapés fuient en Égypte en emmenant Jérémie.", figureIds: ['jeremiah'] },
      { id: 'ossements', title: 'Les ossements desséchés', date: 'v. 580', ref: ref('Ez 37', 'ez', 37), text: "« Je vais ouvrir vos tombeaux. » Ézéchiel annonce la résurrection du peuple en exil.", figureIds: ['ezekiel'] },
      { id: 'fournaise', title: 'La fournaise ardente', date: 'v. 580', ref: ref('Dn 3', 'dn', 3), text: "Refusant d'adorer la statue d'or, trois jeunes Juifs marchent indemnes dans le feu en bénissant Dieu.", figureIds: ['daniel', 'nebuchadnezzar'] },
      { id: 'temple-futur', title: 'Le Temple de la vision', date: '573', ref: ref('Ez 40–48', 'ez', 40), text: "Ézéchiel voit un Temple nouveau d'où jaillit une source qui assainit la mer Morte.", figureIds: ['ezekiel'] },
      { id: 'consolez', title: 'Consolez mon peuple', date: 'v. 550', ref: ref('Is 40', 'is', 40), text: "Un prophète de l'exil annonce le retour : « Préparez le chemin du Seigneur. »" },
      { id: 'serviteur', title: 'Le Serviteur souffrant', date: 'v. 545', ref: ref('Is 53', 'is', 53), text: "« Il a été transpercé à cause de nos fautes… par ses blessures nous sommes guéris. »" },
      { id: 'balthazar', title: 'Le festin de Balthazar', date: '539', ref: ref('Dn 5', 'dn', 5), text: "Une main écrit sur le mur : « Compté, pesé, divisé. » Babylone tombe la nuit même aux mains des Perses.", figureIds: ['daniel'] },
      { id: 'fosse-lions', title: 'Daniel dans la fosse aux lions', date: 'v. 538', ref: ref('Dn 6', 'dn', 6), text: "Pour avoir prié son Dieu, Daniel est jeté aux lions ; Dieu ferme leur gueule.", figureIds: ['daniel'] },
      { id: 'fils-homme', title: "Vision du Fils de l'homme", date: null, ref: ref('Dn 7', 'dn', 7), text: "Sur les nuées du ciel vient comme un Fils d'homme, à qui est donnée une royauté éternelle.", figureIds: ['daniel'] },
      { id: 'edit-cyrus', title: 'Édit de Cyrus', date: '538', ref: ref('Esd 1', 'esd', 1), text: "Le roi de Perse autorise les exilés à rentrer et à rebâtir le Temple : la fin de l'exil.", figureIds: ['cyrus'] }
    ]
  },
  {
    id: 'retour',
    numeral: 'VI',
    name: 'Le retour et l’attente',
    range: '538 – 37',
    events: [
      { id: 'retour-zorobabel', title: 'Retour à Jérusalem', date: '537', ref: ref('Esd 2–3', 'esd', 2), text: "Avec Zorobabel et le prêtre Josué, une première caravane rentre et rebâtit l'autel." },
      { id: 'aggee', title: 'Aggée et Zacharie', date: '520', ref: ref('Ag 1', 'ag', 1), text: "Les prophètes relancent la reconstruction du Temple, interrompue depuis des années.", figureIds: ['zechariah'] },
      { id: 'roi-ane', title: 'Le roi monté sur un âne', date: 'v. 520', ref: ref('Za 9', 'za', 9), text: "« Exulte, fille de Sion ! Voici ton roi qui vient à toi, humble, monté sur un âne. »", figureIds: ['zechariah'] },
      { id: 'second-temple', title: 'Dédicace du second Temple', date: '515', ref: ref('Esd 6', 'esd', 6), text: "Le Temple reconstruit est dédié dans la joie, et la Pâque célébrée." },
      { id: 'esther', title: 'Esther sauve son peuple', date: 'v. 480', ref: ref('Est 4–7', 'est', 4), text: "Reine de Perse, Esther risque sa vie devant le roi et déjoue le complot d'Aman ; la fête des Pourim en naît.", figureIds: ['esther', 'vashti'] },
      { id: 'esdras', title: 'Esdras, scribe de la Loi', date: '458', ref: ref('Esd 7', 'esd', 7), text: "Le prêtre Esdras arrive de Babylone pour enseigner la Loi et réorganiser la communauté." },
      { id: 'malachie', title: 'Malachie', date: 'v. 450', ref: ref('Ml 3', 'ml', 3), text: "Le dernier des prophètes annonce l'envoi d'un messager, et le retour d'Élie avant le jour du Seigneur." },
      { id: 'murailles', title: 'Les murailles de Néhémie', date: '445', ref: ref('Ne 2–6', 'ne', 2), text: "Échanson du roi de Perse, Néhémie rebâtit les remparts en cinquante-deux jours, la truelle dans une main, l'épée dans l'autre.", figureIds: ['nehemiah'] },
      { id: 'lecture-loi', title: 'Lecture de la Loi', date: 'v. 445', ref: ref('Ne 8', 'ne', 8), text: "Du matin à midi, Esdras lit la Loi au peuple qui pleure ; « La joie du Seigneur est votre force. »", figureIds: ['nehemiah'] },
      { id: 'job', title: 'Le livre de Job', date: null, ref: ref('Jb 38', 'jb', 38), text: "Méditation de sagesse sur la souffrance du juste ; Dieu répond à Job du milieu de la tempête.", figureIds: ['job'] },
      { id: 'alexandre', title: 'Alexandre le Grand', date: '333', ref: ref('1 M 1', '1m', 1), text: "Le Macédonien conquiert l'Orient ; la culture grecque se répand dans tout le monde juif." },
      { id: 'septante', title: 'La Bible en grec', date: 'v. 250', ref: null, text: "À Alexandrie, les Écritures sont traduites en grec : la Septante, que citeront les apôtres." },
      { id: 'profanation', title: 'Profanation du Temple', date: '167', ref: ref('1 M 1', '1m', 1), text: "Antiochus IV interdit la Loi et installe « l'abomination de la désolation » sur l'autel." },
      { id: 'maccabees', title: 'Les Maccabées', date: '167', ref: ref('1 M 2', '1m', 2), text: "Le prêtre Mattathias refuse de sacrifier aux idoles et prend la montagne avec ses fils : début de la révolte." },
      { id: 'sept-freres', title: 'Les sept frères martyrs', date: 'v. 167', ref: ref('2 M 7', '2m', 7), text: "Encouragés par leur mère, sept frères meurent plutôt que de renier la Loi, dans l'espérance de la résurrection." },
      { id: 'hanoucca', title: 'Purification du Temple', date: '164', ref: ref('1 M 4', '1m', 4), text: "Judas Maccabée reprend Jérusalem et consacre de nouveau l'autel : origine de la fête de Hanoukka." },
      { id: 'mort-judas', title: 'Mort de Judas Maccabée', date: '160', ref: ref('1 M 9', '1m', 9), text: "Le héros de la révolte tombe au combat ; ses frères Jonathan puis Simon poursuivent la lutte." },
      { id: 'priere-morts', title: 'La prière pour les morts', date: 'v. 160', ref: ref('2 M 12', '2m', 12), text: "Judas fait offrir un sacrifice pour ses soldats tombés, « pensant à la résurrection »." },
      { id: 'simon', title: 'Indépendance sous Simon', date: '142', ref: ref('1 M 13', '1m', 13), text: "« Le joug des nations fut ôté d'Israël. » Simon devient grand prêtre et chef du peuple." },
      { id: 'pompee', title: 'Pompée prend Jérusalem', date: '63', ref: null, text: "Rome met fin à l'indépendance juive ; la Judée passe sous la tutelle romaine." },
      { id: 'herode', title: 'Hérode le Grand, roi', date: '37', ref: null, text: "Nommé par Rome, Hérode règne sur la Judée et agrandit magnifiquement le Temple." }
    ]
  },
  {
    id: 'jesus',
    numeral: 'VII',
    name: 'Jésus-Christ',
    range: 'v. 7 av. – 30 apr.',
    events: [
      { id: 'annonce-zacharie', title: 'Annonce à Zacharie', date: 'v. 7 av.', ref: ref('Lc 1', 'lc', 1), text: "Au Temple, l'ange Gabriel annonce au prêtre Zacharie la naissance d'un fils, Jean.", figureIds: ['elizabeth'] },
      { id: 'annonciation', title: "L'Annonciation", date: 'v. 7 av.', ref: ref('Lc 1', 'lc', 1), text: "« Je suis la servante du Seigneur. » À Nazareth, Marie accueille la parole de l'ange Gabriel.", figureIds: ['mary'] },
      { id: 'visitation', title: 'La Visitation', date: 'v. 7 av.', ref: ref('Lc 1', 'lc', 1), text: "Marie rend visite à Élisabeth ; l'enfant tressaille, Marie chante le Magnificat.", figureIds: ['mary', 'elizabeth'] },
      { id: 'naissance-jean', title: 'Naissance de Jean-Baptiste', date: 'v. 6 av.', ref: ref('Lc 1', 'lc', 1), text: "Zacharie retrouve la parole et bénit Dieu : c'est le Benedictus.", figureIds: ['jean-baptiste', 'elizabeth'] },
      { id: 'songe-joseph', title: 'Le songe de Joseph', date: 'v. 6 av.', ref: ref('Mt 1', 'mt', 1), text: "« Ne crains pas de prendre chez toi Marie, ton épouse. » Joseph accueille l'enfant et lui donne le nom de Jésus.", figureIds: ['joseph-epoux-marie', 'mary'] },
      { id: 'nativite', title: 'Naissance à Bethléem', date: 'v. 6 av.', ref: ref('Lc 2', 'lc', 2), text: "Le Verbe se fait chair.", figureIds: ['jesus', 'mary', 'joseph-epoux-marie'] },
      { id: 'bergers', title: 'Les bergers', date: 'v. 6 av.', ref: ref('Lc 2', 'lc', 2), text: "Les anges annoncent la bonne nouvelle aux bergers : « Gloire à Dieu au plus haut des cieux. »", figureIds: ['jesus'] },
      { id: 'presentation', title: 'Présentation au Temple', date: 'v. 6 av.', ref: ref('Lc 2', 'lc', 2), text: "Syméon reconnaît le Messie : « Lumière pour éclairer les nations » ; Anne la prophétesse en parle à tous.", figureIds: ['jesus', 'mary', 'anne-prophetesse'] },
      { id: 'mages', title: 'Les mages', date: 'v. 5 av.', ref: ref('Mt 2', 'mt', 2), text: "Guidés par l'étoile, des mages venus d'Orient adorent l'enfant et offrent l'or, l'encens et la myrrhe.", figureIds: ['jesus', 'mary'] },
      { id: 'fuite-egypte', title: 'Fuite en Égypte', date: 'v. 5 av.', ref: ref('Mt 2', 'mt', 2), text: "Averti en songe, Joseph fuit avec l'enfant et sa mère ; Hérode fait massacrer les enfants de Bethléem.", figureIds: ['joseph-epoux-marie', 'mary', 'jesus'] },
      { id: 'mort-herode', title: "Mort d'Hérode", date: '4 av.', ref: ref('Mt 2', 'mt', 2), text: "La Sainte Famille revient d'Égypte et s'installe à Nazareth.", figureIds: ['joseph-epoux-marie'] },
      { id: 'jesus-douze-ans', title: 'Jésus au Temple à douze ans', date: 'v. 6 apr.', ref: ref('Lc 2', 'lc', 2), text: "« Ne saviez-vous pas qu'il me faut être chez mon Père ? » Retrouvé parmi les docteurs.", figureIds: ['jesus', 'mary', 'joseph-epoux-marie'] },
      { id: 'predication-jean', title: 'Prédication de Jean-Baptiste', date: 'v. 27', ref: ref('Lc 3', 'lc', 3), text: "Au désert, Jean appelle à la conversion et baptise dans le Jourdain.", figureIds: ['jean-baptiste'] },
      { id: 'bapteme', title: 'Baptême au Jourdain', date: 'v. 27', ref: ref('Mt 3', 'mt', 3), text: "L'Esprit descend comme une colombe : « Celui-ci est mon Fils bien-aimé. »", figureIds: ['jesus', 'jean-baptiste'] },
      { id: 'tentation', title: 'La tentation au désert', date: 'v. 27', ref: ref('Mt 4', 'mt', 4), text: "Quarante jours de jeûne ; Jésus repousse le tentateur par la parole de l'Écriture.", figureIds: ['jesus'] },
      { id: 'premiers-disciples', title: 'Les premiers disciples', date: 'v. 27', ref: ref('Jn 1', 'jn', 1), text: "« Venez et voyez. » André, Pierre, Philippe et Nathanaël suivent Jésus.", figureIds: ['andre', 'pierre', 'philippe', 'barthelemy'] },
      { id: 'cana', title: 'Les noces de Cana', date: 'v. 28', ref: ref('Jn 2', 'jn', 2), text: "« Faites tout ce qu'il vous dira. » Premier signe : l'eau changée en vin.", figureIds: ['jesus', 'mary'] },
      { id: 'marchands', title: 'Les marchands chassés du Temple', date: 'v. 28', ref: ref('Jn 2', 'jn', 2), text: "« Détruisez ce sanctuaire, et en trois jours je le relèverai. »", figureIds: ['jesus'] },
      { id: 'nicodeme', title: 'Nicodème', date: 'v. 28', ref: ref('Jn 3', 'jn', 3), text: "De nuit, un pharisien vient interroger Jésus : « Dieu a tant aimé le monde qu'il a donné son Fils unique. »", figureIds: ['nicodeme', 'jesus'] },
      { id: 'samaritaine', title: 'La Samaritaine', date: 'v. 28', ref: ref('Jn 4', 'jn', 4), text: "Au puits de Jacob, Jésus promet une eau vive qui devient source jaillissant pour la vie éternelle.", figureIds: ['photini', 'jesus'] },
      { id: 'nazareth', title: 'Rejeté à Nazareth', date: 'v. 28', ref: ref('Lc 4', 'lc', 4), text: "« Aujourd'hui s'accomplit ce passage de l'Écriture. » Les siens veulent le précipiter du haut de la colline.", figureIds: ['jesus'] },
      { id: 'peche-miraculeuse', title: 'La pêche miraculeuse', date: 'v. 28', ref: ref('Lc 5', 'lc', 5), text: "« Avance au large. » Pierre, Jacques et Jean laissent tout pour devenir pêcheurs d'hommes.", figureIds: ['pierre', 'jacques-zebedee', 'jean-apotre'] },
      { id: 'appel-levi', title: 'Appel de Lévi', date: 'v. 28', ref: ref('Mc 2', 'mc', 2), text: "Jésus appelle le collecteur d'impôts et mange avec les pécheurs : « Je suis venu appeler les pécheurs. »", figureIds: ['matthieu'] },
      { id: 'douze', title: 'Le choix des Douze', date: 'v. 28', ref: ref('Lc 6', 'lc', 6), text: "Après une nuit de prière, Jésus choisit douze disciples qu'il nomme apôtres.", figureIds: ['pierre', 'andre', 'jacques-zebedee', 'jean-apotre', 'philippe', 'barthelemy', 'matthieu', 'thomas', 'jacques-alphee', 'simon-zelote', 'thaddee'] },
      { id: 'sermon-montagne', title: 'Le sermon sur la montagne', date: 'v. 28', ref: ref('Mt 5–7', 'mt', 5), text: "Les Béatitudes, le Notre Père, la charte du Royaume : « Heureux les pauvres de cœur. »", figureIds: ['jesus'] },
      { id: 'femmes-disciples', title: 'Les femmes qui suivent Jésus', date: 'v. 28', ref: ref('Lc 8', 'lc', 8), text: "Marie de Magdala, Jeanne, Suzanne et d'autres accompagnent Jésus et le servent de leurs biens.", figureIds: ['marie-madeleine', 'jeanne', 'susanna'] },
      { id: 'paraboles', title: 'Les paraboles du Royaume', date: 'v. 29', ref: ref('Mt 13', 'mt', 13), text: "Le semeur, le grain de moutarde, le trésor caché : Jésus enseigne en paraboles au bord du lac.", figureIds: ['jesus'] },
      { id: 'tempete', title: 'La tempête apaisée', date: 'v. 29', ref: ref('Mc 4', 'mc', 4), text: "« Silence, tais-toi ! » Le vent tombe ; « Qui est-il donc, pour que même le vent et la mer lui obéissent ? »", figureIds: ['jesus'] },
      { id: 'mort-baptiste', title: 'Mort de Jean-Baptiste', date: 'v. 29', ref: ref('Mc 6', 'mc', 6), text: "À la demande de la fille d'Hérodiade, Hérode Antipas fait décapiter Jean.", figureIds: ['jean-baptiste'] },
      { id: 'multiplication', title: 'La multiplication des pains', date: 'v. 29', ref: ref('Jn 6', 'jn', 6), text: "Cinq pains et deux poissons nourrissent une foule ; « Je suis le pain de vie. »", figureIds: ['jesus', 'philippe', 'andre'] },
      { id: 'marche-eaux', title: 'Jésus marche sur les eaux', date: 'v. 29', ref: ref('Mt 14', 'mt', 14), text: "Pierre s'avance vers lui sur la mer, prend peur et s'enfonce : « Homme de peu de foi. »", figureIds: ['jesus', 'pierre'] },
      { id: 'confession-pierre', title: 'La confession de Pierre', date: 'v. 29', ref: ref('Mt 16', 'mt', 16), text: "« Tu es le Christ, le Fils du Dieu vivant. » — « Tu es Pierre, et sur cette pierre je bâtirai mon Église. »", figureIds: ['pierre', 'jesus'] },
      { id: 'transfiguration', title: 'La Transfiguration', date: 'v. 29', ref: ref('Mt 17', 'mt', 17), text: "Sur la montagne, Jésus resplendit entre Moïse et Élie devant Pierre, Jacques et Jean.", figureIds: ['jesus', 'moise', 'elijah', 'pierre', 'jacques-zebedee', 'jean-apotre'] },
      { id: 'marthe-marie', title: 'Chez Marthe et Marie', date: 'v. 29', ref: ref('Lc 10', 'lc', 10), text: "« Marie a choisi la meilleure part. » Assise aux pieds du Seigneur, elle écoute sa parole.", figureIds: ['marthe', 'marie-bethanie'] },
      { id: 'bon-samaritain', title: 'Le bon Samaritain', date: 'v. 29', ref: ref('Lc 10', 'lc', 10), text: "« Qui est mon prochain ? » Un Samaritain prend soin de l'homme laissé pour mort.", figureIds: ['jesus'] },
      { id: 'fils-prodigue', title: "L'enfant prodigue", date: 'v. 30', ref: ref('Lc 15', 'lc', 15), text: "Le père court au-devant du fils perdu et retrouvé : la miséricorde du Père.", figureIds: ['jesus'] },
      { id: 'lazare', title: 'Résurrection de Lazare', date: 'v. 30', ref: ref('Jn 11', 'jn', 11), text: "« Je suis la résurrection et la vie. » Jésus pleure son ami, puis l'appelle hors du tombeau.", figureIds: ['lazare', 'marthe', 'marie-bethanie', 'jesus'] },
      { id: 'zachee', title: 'Zachée', date: 'v. 30', ref: ref('Lc 19', 'lc', 19), text: "Monté sur un sycomore pour voir Jésus, le chef des publicains l'accueille chez lui et se convertit.", figureIds: ['zachee'] },
      { id: 'onction-bethanie', title: "L'onction à Béthanie", date: 'v. 30', ref: ref('Jn 12', 'jn', 12), text: "Six jours avant la Pâque, Marie répand un parfum précieux sur les pieds de Jésus.", figureIds: ['marie-bethanie', 'jesus'] },
      { id: 'rameaux', title: 'Entrée à Jérusalem', date: 'v. 30', ref: ref('Mt 21', 'mt', 21), text: "« Hosanna au fils de David ! » Jésus entre dans la ville monté sur un âne.", figureIds: ['jesus'] },
      { id: 'cene', title: 'La dernière Cène', date: 'v. 30', ref: ref('Lc 22', 'lc', 22), text: "« Ceci est mon corps… Faites cela en mémoire de moi. » Jésus institue l'Eucharistie et lave les pieds des disciples.", figureIds: ['jesus', 'pierre', 'jean-apotre'] },
      { id: 'gethsemani', title: 'Gethsémani', date: 'v. 30', ref: ref('Mt 26', 'mt', 26), text: "« Que ta volonté soit faite. » Jésus prie dans l'angoisse ; Judas le livre par un baiser.", figureIds: ['jesus', 'pierre'] },
      { id: 'reniement', title: 'Le reniement de Pierre', date: 'v. 30', ref: ref('Lc 22', 'lc', 22), text: "Trois fois Pierre nie le connaître ; le coq chante, Jésus se retourne et le regarde.", figureIds: ['pierre'] },
      { id: 'proces', title: 'Le procès devant Pilate', date: 'v. 30', ref: ref('Jn 18', 'jn', 18), text: "« Qu'est-ce que la vérité ? » Pilate livre Jésus pour être crucifié.", figureIds: ['jesus'] },
      { id: 'crucifixion', title: 'La crucifixion', date: 'v. 30', ref: ref('Jn 19', 'jn', 19), text: "Au Golgotha, Jésus meurt sur la croix ; au pied de la croix se tiennent sa mère et le disciple qu'il aimait.", figureIds: ['jesus', 'mary', 'jean-apotre', 'marie-madeleine'] },
      { id: 'mise-tombeau', title: 'La mise au tombeau', date: 'v. 30', ref: ref('Jn 19', 'jn', 19), text: "Joseph d'Arimathie et Nicodème ensevelissent le corps dans un tombeau neuf.", figureIds: ['nicodeme'] },
      { id: 'resurrection', title: 'La Résurrection', date: 'v. 30', ref: ref('Jn 20', 'jn', 20), text: "Au matin de Pâques, le tombeau est vide ; Jésus apparaît à Marie-Madeleine : « Marie ! » — « Rabbouni ! »", figureIds: ['jesus', 'marie-madeleine', 'pierre', 'jean-apotre'] },
      { id: 'emmaus', title: "Les disciples d'Emmaüs", date: 'v. 30', ref: ref('Lc 24', 'lc', 24), text: "« Notre cœur n'était-il pas brûlant ? » Ils le reconnaissent à la fraction du pain.", figureIds: ['jesus'] },
      { id: 'thomas', title: "L'incrédulité de Thomas", date: 'v. 30', ref: ref('Jn 20', 'jn', 20), text: "« Mon Seigneur et mon Dieu ! » — « Heureux ceux qui croient sans avoir vu. »", figureIds: ['thomas', 'jesus'] },
      { id: 'pierre-pardonne', title: "« M'aimes-tu ? »", date: 'v. 30', ref: ref('Jn 21', 'jn', 21), text: "Au bord du lac, Jésus ressuscité demande trois fois à Pierre s'il l'aime : « Sois le berger de mes brebis. »", figureIds: ['pierre', 'jesus'] },
      { id: 'ascension', title: "L'Ascension", date: 'v. 30', ref: ref('Ac 1', 'ac', 1), text: "« Vous serez mes témoins jusqu'aux extrémités de la terre. » Jésus est élevé au ciel.", figureIds: ['jesus'] }
    ]
  },
  {
    id: 'eglise',
    numeral: 'VIII',
    name: "L'Église naissante",
    range: '30 – v. 100',
    events: [
      { id: 'matthias', title: 'Matthias, douzième apôtre', date: 'v. 30', ref: ref('Ac 1', 'ac', 1), text: "En prière avec Marie, les apôtres tirent au sort le remplaçant de Judas.", figureIds: ['matthias', 'mary', 'pierre'] },
      { id: 'pentecote', title: 'La Pentecôte', date: 'v. 30', ref: ref('Ac 2', 'ac', 2), text: "L'Esprit Saint descend en langues de feu ; Pierre prêche et trois mille sont baptisés.", figureIds: ['pierre', 'mary'] },
      { id: 'infirme', title: "Guérison de l'infirme", date: 'v. 31', ref: ref('Ac 3', 'ac', 3), text: "« Je n'ai ni or ni argent, mais ce que j'ai, je te le donne : au nom de Jésus, lève-toi et marche. »", figureIds: ['pierre', 'jean-apotre'] },
      { id: 'communaute', title: 'La première communauté', date: 'v. 32', ref: ref('Ac 4', 'ac', 4), text: "« Ils n'avaient qu'un cœur et qu'une âme » et mettaient tout en commun.", figureIds: ['barnabas'] },
      { id: 'diacres', title: 'Les sept diacres', date: 'v. 33', ref: ref('Ac 6', 'ac', 6), text: "Pour le service des tables, les apôtres imposent les mains à sept hommes, dont Étienne et Philippe.", figureIds: ['etienne'] },
      { id: 'etienne', title: "Martyre d'Étienne", date: 'v. 34', ref: ref('Ac 7', 'ac', 7), text: "Premier martyr, Étienne est lapidé en pardonnant à ses bourreaux ; Saul approuve sa mort.", figureIds: ['etienne', 'paul'] },
      { id: 'eunuque', title: "L'eunuque éthiopien", date: 'v. 34', ref: ref('Ac 8', 'ac', 8), text: "Philippe explique Isaïe à un haut fonctionnaire de la reine d'Éthiopie et le baptise sur la route." },
      { id: 'conversion-paul', title: 'Conversion de Paul', date: 'v. 34', ref: ref('Ac 9', 'ac', 9), text: "Sur le chemin de Damas : « Saul, Saul, pourquoi me persécutes-tu ? » Le persécuteur devient apôtre.", figureIds: ['paul'] },
      { id: 'tabitha', title: 'Tabitha ressuscitée', date: 'v. 38', ref: ref('Ac 9', 'ac', 9), text: "À Joppé, Pierre rend la vie à une disciple connue pour ses aumônes.", figureIds: ['tabitha', 'pierre'] },
      { id: 'corneille', title: 'Le centurion Corneille', date: 'v. 39', ref: ref('Ac 10', 'ac', 10), text: "« Dieu ne fait pas de différence entre les personnes. » Premiers païens baptisés.", figureIds: ['pierre'] },
      { id: 'chretiens', title: '« Chrétiens » à Antioche', date: 'v. 42', ref: ref('Ac 11', 'ac', 11), text: "Barnabé va chercher Paul ; c'est à Antioche que les disciples reçoivent le nom de chrétiens.", figureIds: ['barnabas', 'paul'] },
      { id: 'jacques-martyr', title: 'Martyre de Jacques', date: '44', ref: ref('Ac 12', 'ac', 12), text: "Hérode Agrippa fait mourir par l'épée Jacques, frère de Jean : premier apôtre martyr.", figureIds: ['jacques-zebedee'] },
      { id: 'pierre-delivre', title: 'Pierre délivré de prison', date: '44', ref: ref('Ac 12', 'ac', 12), text: "Un ange libère Pierre ; la servante Rhode, folle de joie, en oublie d'ouvrir la porte.", figureIds: ['pierre', 'rhode'] },
      { id: 'premier-voyage', title: 'Premier voyage de Paul', date: '45 – 48', ref: ref('Ac 13–14', 'ac', 13), text: "Envoyés par l'Église d'Antioche, Paul et Barnabé annoncent l'Évangile à Chypre et en Asie Mineure.", figureIds: ['paul', 'barnabas'] },
      { id: 'jacques-lettre', title: 'Lettre de Jacques', date: 'v. 48', ref: ref('Jc 2', 'jc', 2), text: "« La foi sans les œuvres est morte. »" },
      { id: 'concile-jerusalem', title: 'Le concile de Jérusalem', date: '49', ref: ref('Ac 15', 'ac', 15), text: "Les apôtres et les anciens décident de ne pas imposer la circoncision aux païens convertis.", figureIds: ['pierre', 'paul', 'barnabas', 'silas'] },
      { id: 'second-voyage', title: 'Deuxième voyage de Paul', date: '50 – 52', ref: ref('Ac 16', 'ac', 16), text: "Avec Silas et Timothée, Paul passe en Europe : première communauté à Philippes, chez Lydie.", figureIds: ['paul', 'silas', 'timothee', 'lydie', 'eunice'] },
      { id: 'athenes', title: "Paul à l'Aréopage", date: 'v. 50', ref: ref('Ac 17', 'ac', 17), text: "Devant les philosophes d'Athènes, Paul annonce le « Dieu inconnu » ; Denys et Damaris croient.", figureIds: ['paul', 'damaris'] },
      { id: 'thessaloniciens', title: 'Première lettre aux Thessaloniciens', date: 'v. 51', ref: ref('1 Th 4', '1th', 4), text: "Le plus ancien écrit du Nouveau Testament : l'espérance de la venue du Seigneur.", figureIds: ['paul', 'silas', 'timothee'] },
      { id: 'corinthe', title: 'Paul à Corinthe', date: '51 – 52', ref: ref('Ac 18', 'ac', 18), text: "Paul travaille comme fabricant de tentes chez Aquilas et Priscille et fonde l'Église de Corinthe.", figureIds: ['paul', 'priscille', 'apollos'] },
      { id: 'troisieme-voyage', title: 'Troisième voyage de Paul', date: '53 – 57', ref: ref('Ac 19', 'ac', 19), text: "Long séjour à Éphèse ; l'émeute des orfèvres autour d'Artémis.", figureIds: ['paul', 'timothee'] },
      { id: 'corinthiens', title: "L'hymne à l'amour", date: 'v. 55', ref: ref('1 Co 13', '1co', 13), text: "« L'amour prend patience… La plus grande des trois, c'est la charité. »", figureIds: ['paul', 'apollos'] },
      { id: 'galates', title: 'Lettre aux Galates', date: 'v. 55', ref: ref('Ga 2', 'ga', 2), text: "« Ce n'est plus moi qui vis, c'est le Christ qui vit en moi. »", figureIds: ['paul'] },
      { id: 'romains', title: 'Lettre aux Romains', date: 'v. 57', ref: ref('Rm 8', 'rm', 8), text: "Le grand exposé de la foi : « Rien ne pourra nous séparer de l'amour de Dieu. » Paul recommande Phœbé.", figureIds: ['paul', 'phoebe', 'priscille'] },
      { id: 'arrestation-paul', title: 'Arrestation de Paul', date: '58', ref: ref('Ac 21', 'ac', 21), text: "Pris à partie au Temple, Paul est arrêté puis détenu deux ans à Césarée.", figureIds: ['paul'] },
      { id: 'appel-cesar', title: "« J'en appelle à César »", date: '60', ref: ref('Ac 25', 'ac', 25), text: "Citoyen romain, Paul demande à être jugé par l'empereur.", figureIds: ['paul', 'luc'] },
      { id: 'naufrage', title: 'Le naufrage', date: '60', ref: ref('Ac 27', 'ac', 27), text: "En route vers Rome, le navire se brise près de Malte ; tous les passagers sont sauvés.", figureIds: ['paul', 'luc'] },
      { id: 'paul-rome', title: 'Paul à Rome', date: '61 – 63', ref: ref('Ac 28', 'ac', 28), text: "Assigné à résidence, Paul annonce le Royaume « avec une entière assurance et sans obstacle ».", figureIds: ['paul', 'luc'] },
      { id: 'lettres-captivite', title: 'Lettres de la captivité', date: 'v. 62', ref: ref('Ph 2', 'ph', 2), text: "« Il s'est anéanti, prenant la condition de serviteur. » Paul écrit aux Philippiens, Colossiens, à Philémon.", figureIds: ['paul', 'nympha'] },
      { id: 'pierre-lettre', title: 'Première lettre de Pierre', date: 'v. 64', ref: ref('1 P 2', '1p', 2), text: "« Vous êtes une race choisie, un sacerdoce royal. » Pierre encourage les chrétiens éprouvés.", figureIds: ['pierre', 'silas'] },
      { id: 'martyre-pierre-paul', title: 'Martyre de Pierre et Paul', date: 'v. 64 – 67', ref: ref('2 Tm 4', '2tm', 4), text: "« J'ai combattu le bon combat, j'ai achevé ma course. » Les deux apôtres meurent à Rome sous Néron.", figureIds: ['pierre', 'paul', 'timothee'] },
      { id: 'destruction-temple', title: 'Destruction du Temple', date: '70', ref: ref('Lc 21', 'lc', 21), text: "Les légions de Titus détruisent Jérusalem : « Il n'en restera pas pierre sur pierre », avait annoncé Jésus." },
      { id: 'hebreux', title: 'Lettre aux Hébreux', date: 'v. 80', ref: ref('He 11', 'he', 11), text: "« La foi est le moyen de posséder déjà ce qu'on espère » : la nuée des témoins, d'Abel à Rahab.", figureIds: ['abraham', 'moise', 'rahab'] },
      { id: 'evangile-jean', title: "L'Évangile de Jean", date: 'v. 90', ref: ref('Jn 1', 'jn', 1), text: "« Au commencement était le Verbe… et le Verbe s'est fait chair. »", figureIds: ['jean-apotre'] },
      { id: 'dieu-amour', title: '« Dieu est amour »', date: 'v. 95', ref: ref('1 Jn 4', '1jn', 4), text: "« Celui qui n'aime pas n'a pas connu Dieu, car Dieu est amour. »", figureIds: ['jean-apotre'] },
      { id: 'patmos', title: 'Jean à Patmos', date: 'v. 95', ref: ref('Ap 1', 'ap', 1), text: "Exilé sur l'île, Jean reçoit la Révélation : « Je suis l'Alpha et l'Oméga. »", figureIds: ['jean-apotre'] },
      { id: 'jerusalem-celeste', title: 'La Jérusalem nouvelle', date: 'v. 95', ref: ref('Ap 21–22', 'ap', 21), text: "« Voici que je fais toutes choses nouvelles. » — « Viens, Seigneur Jésus ! »", figureIds: ['jean-apotre', 'jesus'] }
    ]
  }
];

/** Événement accompagné de sa période, dans l'ordre de la frise. */
export interface FlatFriseEvent extends FriseEvent {
  period: FrisePeriod;
  index: number;
}

export const FRISE_EVENTS: FlatFriseEvent[] = FRISE.flatMap((period) =>
  period.events.map((event) => ({ ...event, period }))
).map((event, index) => ({ ...event, index }));
