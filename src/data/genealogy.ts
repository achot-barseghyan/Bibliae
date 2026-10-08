// Liens familiaux des figures bibliques, pour l'arbre généalogique des
// fiches (section « Généalogie et relations »).
//
// Un seul graphe pour toute la Bible : une figure (id identique à
// data/figures.ts) y côtoie les proches que l'Écriture nomme sans qu'ils
// aient leur propre fiche (id préfixé `g-`).
//
// PRINCIPES :
// - Seuls les liens pouvant être établis à partir du texte biblique sont
//   représentés.
// - Les traditions ultérieures (parents de Marie : Joachim/Anne, etc.)
//   ne sont pas ajoutées comme des faits bibliques.
// - Les homonymes sont séparés lorsqu'il est nécessaire de ne pas créer
//   de faux liens.
// - Les relations sont déclarées dans un seul sens (parents, conjoints) :
//   les enfants et la réciprocité sont déduits par `buildGenealogy`.
//
// IMPORTANT :
// Le champ `parents` représente une relation familiale attestée par
// l'Écriture. Pour Jésus, Joseph est explicitement indiqué comme son
// père légal et non comme son père selon la chair. La propriété
// `legalParents` permet de conserver cette distinction.

export interface GenealogyPerson {
  id: string;
  name: string;
  gender: 'M' | 'F';
  parents?: string[];
  legalParents?: string[];
  spouses?: string[];
  /** Personne réelle dont l'Écriture tait le nom. */
  unnamed?: boolean;
  /** Précision affichée sous le nom quand le lien seul induirait en erreur. */
  note?: string;
}

const PEOPLE: GenealogyPerson[] = [
  // ============================================================
  // ORIGINES — Gn 4–5
  // ============================================================

  { id: 'adam', name: 'Adam', gender: 'M', spouses: ['eve'] },
  { id: 'eve', name: 'Ève', gender: 'F' },

  { id: 'g-cain', name: 'Caïn', gender: 'M', parents: ['adam', 'eve'] },
  { id: 'g-abel', name: 'Abel', gender: 'M', parents: ['adam', 'eve'] },
  { id: 'g-seth', name: 'Seth', gender: 'M', parents: ['adam', 'eve'] },

  // Lamek descendant de Caïn — Gn 4,18-24
  { id: 'g-enoch-cain', name: 'Hénok', gender: 'M', parents: ['g-cain'] },
  { id: 'g-irad', name: 'Irad', gender: 'M', parents: ['g-enoch-cain'] },
  { id: 'g-mehuyael', name: 'Mehouyaël', gender: 'M', parents: ['g-irad'] },
  { id: 'g-metushael', name: 'Metoushaël', gender: 'M', parents: ['g-mehuyael'] },
  {
    id: 'g-lamek-cain',
    name: 'Lamek',
    gender: 'M',
    parents: ['g-metushael'],
    spouses: ['g-ada-cain', 'g-cilla-cain']
  },
  { id: 'g-ada-cain', name: 'Ada', gender: 'F' },
  { id: 'g-cilla-cain', name: 'Cilla', gender: 'F' },
  { id: 'g-jabal', name: 'Jabal', gender: 'M', parents: ['g-lamek-cain', 'g-ada-cain'] },
  { id: 'g-jubal', name: 'Jubal', gender: 'M', parents: ['g-lamek-cain', 'g-ada-cain'] },
  { id: 'g-tubal-cain', name: 'Tubal-Caïn', gender: 'M', parents: ['g-lamek-cain', 'g-cilla-cain'] },
  { id: 'g-naama-cain', name: 'Naama', gender: 'F', parents: ['g-lamek-cain', 'g-cilla-cain'] },

  // Lamek père de Noé — Gn 5,25-31
  // À ne surtout pas confondre avec Lamek descendant de Caïn.
  { id: 'g-enosh', name: 'Énosh', gender: 'M', parents: ['g-seth'] },
  { id: 'g-kenan', name: 'Qénân', gender: 'M', parents: ['g-enosh'] },
  { id: 'g-mahalalel', name: 'Mahalalel', gender: 'M', parents: ['g-kenan'] },
  { id: 'g-jared', name: 'Yared', gender: 'M', parents: ['g-mahalalel'] },
  { id: 'g-enoch-jared', name: 'Hénok', gender: 'M', parents: ['g-jared'] },
  { id: 'g-methuselah', name: 'Mathusalem', gender: 'M', parents: ['g-enoch-jared'] },
  { id: 'g-lamek-noe', name: 'Lamek', gender: 'M', parents: ['g-methuselah'] },

  { id: 'noe', name: 'Noé', gender: 'M', parents: ['g-lamek-noe'] },

  // Fils de Noé — Gn 5,32 ; 6–10
  { id: 'g-sem', name: 'Sem', gender: 'M', parents: ['noe'] },
  { id: 'g-cham', name: 'Cham', gender: 'M', parents: ['noe'] },
  { id: 'g-japhet', name: 'Japhet', gender: 'M', parents: ['noe'] },

  // ============================================================
  // DESCENDANCE DE SEM JUSQU'À TÉRAH — Gn 10–11
  // ============================================================

  { id: 'g-arpachshad', name: 'Arpaxad', gender: 'M', parents: ['g-sem'] },
  { id: 'g-shelah', name: 'Shélah', gender: 'M', parents: ['g-arpachshad'] },
  { id: 'g-eber', name: 'Éber', gender: 'M', parents: ['g-shelah'] },
  { id: 'g-peleg', name: 'Péleg', gender: 'M', parents: ['g-eber'] },
  { id: 'g-reu', name: 'Réou', gender: 'M', parents: ['g-peleg'] },
  { id: 'g-serug', name: 'Seroug', gender: 'M', parents: ['g-reu'] },

  // Nahor, père de Térah — Gn 11,22-26.
  // À distinguer de Nahor, frère d'Abraham.
  {
    id: 'g-nahor-ancetre',
    name: 'Nahor',
    gender: 'M',
    parents: ['g-serug']
  },

  { id: 'g-terah', name: 'Térah', gender: 'M', parents: ['g-nahor-ancetre'] },

  // ============================================================
  // PATRIARCHES — Gn 11–50
  // ============================================================

  {
    id: 'abraham',
    name: 'Abraham',
    gender: 'M',
    parents: ['g-terah'],
    spouses: ['sarah', 'hagar', 'g-keturah']
  },

  { id: 'sarah', name: 'Sara', gender: 'F' },
  { id: 'hagar', name: 'Agar', gender: 'F' },
  { id: 'g-keturah', name: 'Qetoura', gender: 'F' },

  // Nahor, frère d'Abraham — Gn 11,27-29
  {
    id: 'g-nahor',
    name: 'Nahor',
    gender: 'M',
    parents: ['g-terah'],
    spouses: ['g-milka']
  },

  { id: 'g-haran', name: 'Harân', gender: 'M', parents: ['g-terah'] },

  { id: 'g-milka', name: 'Milka', gender: 'F', parents: ['g-haran'] },
  { id: 'lot', name: 'Lot', gender: 'M', parents: ['g-haran'] },

  // Enfants d'Abraham
  {
    id: 'g-ismael',
    name: 'Ismaël',
    gender: 'M',
    parents: ['abraham', 'hagar']
  },

  {
    id: 'isaac',
    name: 'Isaac',
    gender: 'M',
    parents: ['abraham', 'sarah'],
    spouses: ['rebekah']
  },

  // Enfants de Qetoura — Gn 25,1-4
  { id: 'g-zimran', name: 'Zimrân', gender: 'M', parents: ['abraham', 'g-keturah'] },
  { id: 'g-yokshan', name: 'Yoqshân', gender: 'M', parents: ['abraham', 'g-keturah'] },
  { id: 'g-medan', name: 'Medân', gender: 'M', parents: ['abraham', 'g-keturah'] },
  { id: 'g-midian', name: 'Madian', gender: 'M', parents: ['abraham', 'g-keturah'] },
  { id: 'g-ishbak', name: 'Yishbaq', gender: 'M', parents: ['abraham', 'g-keturah'] },
  { id: 'g-shuah', name: 'Shouah', gender: 'M', parents: ['abraham', 'g-keturah'] },

  // Rébecca
  {
    id: 'g-bethuel',
    name: 'Bethuel',
    gender: 'M',
    parents: ['g-nahor', 'g-milka']
  },

  {
    id: 'rebekah',
    name: 'Rébecca',
    gender: 'F',
    parents: ['g-bethuel']
  },

  { id: 'g-laban', name: 'Laban', gender: 'M', parents: ['g-bethuel'] },

  {
    id: 'g-esau',
    name: 'Ésaü',
    gender: 'M',
    parents: ['isaac', 'rebekah']
  },

  {
    id: 'jacob',
    name: 'Jacob',
    gender: 'M',
    parents: ['isaac', 'rebekah'],
    spouses: ['leah', 'rachel', 'g-bilha', 'g-zilpa']
  },

  { id: 'leah', name: 'Léa', gender: 'F', parents: ['g-laban'] },
  { id: 'rachel', name: 'Rachel', gender: 'F', parents: ['g-laban'] },
  { id: 'g-bilha', name: 'Bilha', gender: 'F' },
  { id: 'g-zilpa', name: 'Zilpa', gender: 'F' },

  // Enfants de Jacob et Léa
  { id: 'g-ruben', name: 'Ruben', gender: 'M', parents: ['jacob', 'leah'] },
  { id: 'g-simeon', name: 'Siméon', gender: 'M', parents: ['jacob', 'leah'] },
  { id: 'g-levi', name: 'Lévi', gender: 'M', parents: ['jacob', 'leah'] },
  {
    id: 'g-juda',
    name: 'Juda',
    gender: 'M',
    parents: ['jacob', 'leah'],
    spouses: ['tamar']
  },
  { id: 'g-issachar', name: 'Issachar', gender: 'M', parents: ['jacob', 'leah'] },
  { id: 'g-zabulon', name: 'Zabulon', gender: 'M', parents: ['jacob', 'leah'] },
  { id: 'g-dina', name: 'Dina', gender: 'F', parents: ['jacob', 'leah'] },

  // Enfants de Jacob et Bilha
  { id: 'g-dan', name: 'Dan', gender: 'M', parents: ['jacob', 'g-bilha'] },
  { id: 'g-nephtali', name: 'Nephtali', gender: 'M', parents: ['jacob', 'g-bilha'] },

  // Enfants de Jacob et Zilpa
  { id: 'g-gad', name: 'Gad', gender: 'M', parents: ['jacob', 'g-zilpa'] },
  { id: 'g-asher', name: 'Asher', gender: 'M', parents: ['jacob', 'g-zilpa'] },

  // Enfants de Jacob et Rachel
  {
    id: 'joseph-fils-jacob',
    name: 'Joseph',
    gender: 'M',
    parents: ['jacob', 'rachel'],
    spouses: ['g-asenath']
  },

  { id: 'g-benjamin', name: 'Benjamin', gender: 'M', parents: ['jacob', 'rachel'] },

  { id: 'g-asenath', name: 'Asenath', gender: 'F' },
  {
    id: 'g-manasse',
    name: 'Manassé',
    gender: 'M',
    parents: ['joseph-fils-jacob', 'g-asenath']
  },
  {
    id: 'g-ephraim',
    name: 'Éphraïm',
    gender: 'M',
    parents: ['joseph-fils-jacob', 'g-asenath']
  },

  // Juda et Tamar — Gn 38
  {
    id: 'g-er',
    name: 'Er',
    gender: 'M',
    parents: ['g-juda'],
    spouses: ['tamar']
  },

  {
    id: 'g-onan',
    name: 'Onan',
    gender: 'M',
    parents: ['g-juda'],
    spouses: ['tamar']
  },

  { id: 'tamar', name: 'Tamar', gender: 'F' },

  {
    id: 'g-shelah-juda',
    name: 'Shéla',
    gender: 'M',
    parents: ['g-juda']
  },

  {
    id: 'g-peres',
    name: 'Pérès',
    gender: 'M',
    parents: ['g-juda', 'tamar']
  },

  {
    id: 'g-zerah',
    name: 'Zérah',
    gender: 'M',
    parents: ['g-juda', 'tamar']
  },

  // Job — filles nommées à la fin du livre
  { id: 'job', name: 'Job', gender: 'M' },
  { id: 'g-yemima', name: 'Yemima', gender: 'F', parents: ['job'] },
  { id: 'g-qecia', name: 'Qeçia', gender: 'F', parents: ['job'] },
  { id: 'g-qeren', name: 'Qéren-Happouk', gender: 'F', parents: ['job'] },

  // ============================================================
  // EXODE / LÉVITES — Ex 2 ; 6 ; Nb 26
  // ============================================================

  { id: 'g-qehath', name: 'Qehath', gender: 'M', parents: ['g-levi'] },

  {
    id: 'g-amram',
    name: 'Amram',
    gender: 'M',
    parents: ['g-qehath'],
    spouses: ['g-jokebed']
  },

  { id: 'g-jokebed', name: 'Jokébed', gender: 'F' },

  {
    id: 'aaron',
    name: 'Aaron',
    gender: 'M',
    parents: ['g-amram', 'g-jokebed'],
    spouses: ['g-elisheba']
  },

  {
    id: 'moise',
    name: 'Moïse',
    gender: 'M',
    parents: ['g-amram', 'g-jokebed'],
    spouses: ['zipporah']
  },

  {
    id: 'miriam',
    name: 'Miriam',
    gender: 'F',
    parents: ['g-amram', 'g-jokebed']
  },

  { id: 'g-jethro', name: 'Jéthro', gender: 'M' },

  {
    id: 'zipporah',
    name: 'Séphora',
    gender: 'F',
    parents: ['g-jethro']
  },

  { id: 'g-gershom', name: 'Gershom', gender: 'M', parents: ['moise', 'zipporah'] },
  { id: 'g-eliezer', name: 'Éliézer', gender: 'M', parents: ['moise', 'zipporah'] },

  { id: 'g-elisheba', name: 'Élishéba', gender: 'F' },

  { id: 'g-nadab', name: 'Nadab', gender: 'M', parents: ['aaron', 'g-elisheba'] },
  { id: 'g-abihou', name: 'Abihou', gender: 'M', parents: ['aaron', 'g-elisheba'] },
  { id: 'g-eleazar', name: 'Éléazar', gender: 'M', parents: ['aaron', 'g-elisheba'] },
  { id: 'g-itamar', name: 'Itamar', gender: 'M', parents: ['aaron', 'g-elisheba'] },

  // Josué
  { id: 'g-noun', name: 'Noun', gender: 'M' },
  { id: 'joshua', name: 'Josué', gender: 'M', parents: ['g-noun'] },

  // Caleb
  { id: 'g-jephunne', name: 'Jephunné', gender: 'M' },
  { id: 'caleb', name: 'Caleb', gender: 'M', parents: ['g-jephunne'] },

  { id: 'achsah', name: 'Aksa', gender: 'F', parents: ['caleb'], spouses: ['g-othniel'] },
  { id: 'g-othniel', name: 'Otniel', gender: 'M' },

  // ============================================================
  // JUGES / RUTH / SAMUEL
  // ============================================================

  { id: 'g-joas-abiezrite', name: 'Joas', gender: 'M' },
  { id: 'gideon', name: 'Gédéon', gender: 'M', parents: ['g-joas-abiezrite'] },
  { id: 'g-abimelek', name: 'Abimélek', gender: 'M', parents: ['gideon'] },

  { id: 'deborah', name: 'Débora', gender: 'F', spouses: ['g-lappidoth'] },
  { id: 'g-lappidoth', name: 'Lappidoth', gender: 'M' },

  { id: 'g-manoah', name: 'Manoah', gender: 'M' },
  { id: 'samson', name: 'Samson', gender: 'M', parents: ['g-manoah'] },

  { id: 'eli', name: 'Éli', gender: 'M' },
  { id: 'g-hophni', name: 'Hophni', gender: 'M', parents: ['eli'] },
  { id: 'g-pinhas', name: 'Pinhas', gender: 'M', parents: ['eli'] },

  // Elqana / Anne / Samuel
  { id: 'g-elqana', name: 'Elqana', gender: 'M', spouses: ['hannah'] },
  { id: 'hannah', name: 'Anne', gender: 'F' },

  // Ascendance d'Elqana — 1 S 1,1
  { id: 'g-jeroham', name: 'Yeroham', gender: 'M' },
  { id: 'g-elihou-elqana', name: 'Élihou', gender: 'M', parents: ['g-jeroham'] },
  { id: 'g-tohou', name: 'Tohou', gender: 'M', parents: ['g-elihou-elqana'] },
  { id: 'g-souph', name: 'Souph', gender: 'M', parents: ['g-tohou'] },

  {
    id: 'g-elqana',
    name: 'Elqana',
    gender: 'M',
    parents: ['g-souph'],
    spouses: ['hannah']
  },

  {
    id: 'samuel',
    name: 'Samuel',
    gender: 'M',
    parents: ['g-elqana', 'hannah']
  },

  { id: 'g-joel-samuel', name: 'Joël', gender: 'M', parents: ['samuel'] },
  { id: 'g-abiya-samuel', name: 'Abiya', gender: 'M', parents: ['samuel'] },

  // Ruth
  { id: 'g-elimelek', name: 'Élimélek', gender: 'M', spouses: ['naomi'] },
  { id: 'naomi', name: 'Noémi', gender: 'F' },

  {
    id: 'g-mahlon',
    name: 'Mahlôn',
    gender: 'M',
    parents: ['g-elimelek', 'naomi'],
    spouses: ['ruth']
  },

  {
    id: 'g-kilion',
    name: 'Kilyôn',
    gender: 'M',
    parents: ['g-elimelek', 'naomi'],
    spouses: ['g-orpa']
  },

  { id: 'g-orpa', name: 'Orpa', gender: 'F' },

  // ============================================================
  // JUDA → DAVID — Rt 4 ; 1 Ch 2 ; Mt 1
  // ============================================================

  { id: 'g-hesron', name: 'Hesrôn', gender: 'M', parents: ['g-peres'] },
  { id: 'g-ram', name: 'Ram', gender: 'M', parents: ['g-hesron'] },
  { id: 'g-aminadab', name: 'Aminadab', gender: 'M', parents: ['g-ram'] },
  { id: 'g-nahshon', name: 'Nahshôn', gender: 'M', parents: ['g-aminadab'] },

  {
    id: 'g-salmon',
    name: 'Salmôn',
    gender: 'M',
    parents: ['g-nahshon'],
    spouses: ['rahab']
  },

  { id: 'rahab', name: 'Rahab', gender: 'F' },

  {
    id: 'boaz',
    name: 'Booz',
    gender: 'M',
    parents: ['g-salmon', 'rahab'],
    spouses: ['ruth']
  },

  { id: 'ruth', name: 'Ruth', gender: 'F' },

  {
    id: 'g-obed',
    name: 'Obed',
    gender: 'M',
    parents: ['boaz', 'ruth']
  },

  {
    id: 'g-jesse',
    name: 'Jessé',
    gender: 'M',
    parents: ['g-obed']
  },

  // ============================================================
  // ROYAUME — SAÜL / DAVID
  // ============================================================

  { id: 'g-kish', name: 'Qish', gender: 'M' },

  {
    id: 'saul',
    name: 'Saül',
    gender: 'M',
    parents: ['g-kish'],
    spouses: ['g-ahinoam']
  },

  { id: 'g-ahinoam', name: 'Ahinoam', gender: 'F' },

  {
    id: 'jonathan',
    name: 'Jonathan',
    gender: 'M',
    parents: ['saul', 'g-ahinoam']
  },

  {
    id: 'g-mikal',
    name: 'Mikal',
    gender: 'F',
    parents: ['saul', 'g-ahinoam']
  },

  { id: 'g-mephibosheth', name: 'Mephibosheth', gender: 'M', parents: ['jonathan'] },

  {
    id: 'david',
    name: 'David',
    gender: 'M',
    parents: ['g-jesse'],
    spouses: ['g-mikal', 'abigail', 'bathsheba']
  },

  { id: 'g-nabal', name: 'Nabal', gender: 'M', spouses: ['abigail'] },
  { id: 'abigail', name: 'Abigaïl', gender: 'F' },

  {
    id: 'g-kileab',
    name: 'Kiléab',
    gender: 'M',
    parents: ['david', 'abigail']
  },

  { id: 'g-eliam', name: 'Éliam', gender: 'M' },

  {
    id: 'bathsheba',
    name: 'Bethsabée',
    gender: 'F',
    parents: ['g-eliam'],
    spouses: ['g-urie', 'david']
  },

  { id: 'g-urie', name: 'Urie', gender: 'M' },

  {
    id: 'solomon',
    name: 'Salomon',
    gender: 'M',
    parents: ['david', 'bathsheba']
  },

  {
    id: 'g-nathan',
    name: 'Nathan',
    gender: 'M',
    parents: ['david', 'bathsheba']
  },

  // ============================================================
  // LIGNÉE ROYALE DE SALOMON — 1 Ch 3
  // ============================================================

  { id: 'g-roboam', name: 'Roboam', gender: 'M', parents: ['solomon'] },
  { id: 'g-abiyam', name: 'Abiyam', gender: 'M', parents: ['g-roboam'] },
  { id: 'g-asa', name: 'Asa', gender: 'M', parents: ['g-abiyam'] },

  { id: 'jehoshaphat', name: 'Josaphat', gender: 'M', parents: ['g-asa'] },
  { id: 'g-joram', name: 'Joram', gender: 'M', parents: ['jehoshaphat'] },
  { id: 'g-ochozias', name: 'Ochozias', gender: 'M', parents: ['g-joram'] },
  { id: 'g-joas-roi', name: 'Joas', gender: 'M', parents: ['g-ochozias'] },
  { id: 'g-amasias', name: 'Amasias', gender: 'M', parents: ['g-joas-roi'] },
  { id: 'g-ozias', name: 'Ozias', gender: 'M', parents: ['g-amasias'] },
  { id: 'g-yotam', name: 'Yotam', gender: 'M', parents: ['g-ozias'] },
  { id: 'g-achaz', name: 'Achaz', gender: 'M', parents: ['g-yotam'] },

  { id: 'hezekiah', name: 'Ézéchias', gender: 'M', parents: ['g-achaz'] },
  { id: 'g-manasse-roi', name: 'Manassé', gender: 'M', parents: ['hezekiah'] },
  { id: 'g-amon', name: 'Amon', gender: 'M', parents: ['g-manasse-roi'] },
  { id: 'josiah', name: 'Josias', gender: 'M', parents: ['g-amon'] },

  { id: 'g-joachaz', name: 'Joachaz', gender: 'M', parents: ['josiah'] },
  { id: 'g-joiaqim', name: 'Joiaqim', gender: 'M', parents: ['josiah'] },
  { id: 'g-sedecias', name: 'Sédécias', gender: 'M', parents: ['josiah'] },

  // ============================================================
  // GÉNÉALOGIE DE MATTHIEU — Mt 1,11-16
  //
  // Après Josias, Matthieu suit :
  // Josias → Jéconias → Salathiel → Zorobabel → ...
  // jusqu'à Jacob → Joseph.
  //
  // Cette chaîne est distincte de la liste des rois donnée par
  // 1 Chroniques : Matthieu abrège sa généalogie et ne reprend pas
  // nécessairement tous les descendants intermédiaires.
  // ============================================================

  {
    id: 'g-jeconias',
    name: 'Jéconias',
    gender: 'M',
    parents: ['josiah']
  },

  {
    id: 'g-salathiel',
    name: 'Salathiel',
    gender: 'M',
    parents: ['g-jeconias']
  },

  {
    id: 'g-zorobabel',
    name: 'Zorobabel',
    gender: 'M',
    parents: ['g-salathiel']
  },

  {
    id: 'g-abiud',
    name: 'Abiud',
    gender: 'M',
    parents: ['g-zorobabel']
  },

  {
    id: 'g-eliakim',
    name: 'Éliakim',
    gender: 'M',
    parents: ['g-abiud']
  },

  {
    id: 'g-azor',
    name: 'Azor',
    gender: 'M',
    parents: ['g-eliakim']
  },

  {
    id: 'g-sadoc',
    name: 'Sadoc',
    gender: 'M',
    parents: ['g-azor']
  },

  {
    id: 'g-achim',
    name: 'Achim',
    gender: 'M',
    parents: ['g-sadoc']
  },

  {
    id: 'g-eliud',
    name: 'Éliud',
    gender: 'M',
    parents: ['g-achim']
  },

  {
    id: 'g-eleazar-mt',
    name: 'Éléazar',
    gender: 'M',
    parents: ['g-eliud']
  },

  {
    id: 'g-mattan',
    name: 'Mattan',
    gender: 'M',
    parents: ['g-eleazar-mt']
  },

  {
    id: 'g-jacob-pere-joseph',
    name: 'Jacob',
    gender: 'M',
    parents: ['g-mattan']
  },

  // ============================================================
  // PROPHÈTES
  // ============================================================

  { id: 'g-shaphat', name: 'Shaphat', gender: 'M' },
  { id: 'elisha', name: 'Élisée', gender: 'M', parents: ['g-shaphat'] },

  { id: 'g-amittai', name: 'Amittaï', gender: 'M' },
  { id: 'jonah', name: 'Jonas', gender: 'M', parents: ['g-amittai'] },

  { id: 'g-beeri', name: 'Beéri', gender: 'M' },

  {
    id: 'hosea',
    name: 'Osée',
    gender: 'M',
    parents: ['g-beeri'],
    spouses: ['g-gomer']
  },

  { id: 'g-gomer', name: 'Gomer', gender: 'F' },
  { id: 'g-yizreel', name: 'Yizréel', gender: 'M', parents: ['hosea', 'g-gomer'] },
  { id: 'g-lo-rouhama', name: 'Lo-Rouhama', gender: 'F', parents: ['hosea', 'g-gomer'] },
  { id: 'g-lo-ammi', name: 'Lo-Ammi', gender: 'M', parents: ['hosea', 'g-gomer'] },

  { id: 'g-amots', name: 'Amots', gender: 'M' },
  { id: 'isaiah', name: 'Ésaïe', gender: 'M', parents: ['g-amots'] },
  { id: 'g-shear-yashoub', name: 'Shear-Yashoub', gender: 'M', parents: ['isaiah'] },

  { id: 'g-shalloum', name: 'Shalloum', gender: 'M', spouses: ['huldah'] },
  { id: 'huldah', name: 'Houlda', gender: 'F' },

  { id: 'g-hilqiya', name: 'Hilqiya', gender: 'M' },
  { id: 'jeremiah', name: 'Jérémie', gender: 'M', parents: ['g-hilqiya'] },

  // ============================================================
  // EXIL / RETOUR
  // ============================================================

  { id: 'g-bouzi', name: 'Bouzi', gender: 'M' },
  { id: 'ezekiel', name: 'Ézéchiel', gender: 'M', parents: ['g-bouzi'] },

  { id: 'nebuchadnezzar', name: 'Nabuchodonosor', gender: 'M' },
  {
    id: 'g-balthazar',
    name: 'Balthazar',
    gender: 'M',
    parents: ['nebuchadnezzar']
  },

  { id: 'g-iddo', name: 'Iddo', gender: 'M' },
  { id: 'g-berekya', name: 'Bérékya', gender: 'M', parents: ['g-iddo'] },
  { id: 'zechariah', name: 'Zacharie', gender: 'M', parents: ['g-berekya'] },

  { id: 'g-assuerus', name: 'Assuérus', gender: 'M', spouses: ['vashti', 'esther'] },
  { id: 'vashti', name: 'Vasthi', gender: 'F' },

  { id: 'g-abihail', name: 'Abihaïl', gender: 'M' },
  { id: 'esther', name: 'Esther', gender: 'F', parents: ['g-abihail'] },

  { id: 'g-hakalia', name: 'Hakalia', gender: 'M' },
  { id: 'nehemiah', name: 'Néhémie', gender: 'M', parents: ['g-hakalia'] },

  // ============================================================
  // ÉVANGILES — ZACHARIE / ÉLISABETH / JEAN-BAPTISTE
  // ============================================================

  {
    id: 'g-zacharie-pretre',
    name: 'Zacharie',
    gender: 'M',
    spouses: ['elizabeth']
  },

  { id: 'elizabeth', name: 'Élisabeth', gender: 'F' },

  {
    id: 'jean-baptiste',
    name: 'Jean-Baptiste',
    gender: 'M',
    parents: ['g-zacharie-pretre', 'elizabeth']
  },

  // ============================================================
  // JOSEPH / MARIE / JÉSUS
  // ============================================================

  // Mt 1,16 : Jacob engendra Joseph, l'époux de Marie.
  {
    id: 'joseph-epoux-marie',
    name: 'Joseph',
    gender: 'M',
    parents: ['g-jacob-pere-joseph'],
    spouses: ['mary'],
    note: 'Père légal de Jésus ; Mt 1,16 le présente comme fils de Jacob.'
  },

  {
    id: 'mary',
    name: 'Vierge Marie',
    gender: 'F',
    spouses: ['joseph-epoux-marie']
  },

  // Jésus :
  // - Marie est sa mère selon la chair.
  // - Joseph est son père légal.
  //
  // On ne représente PAS Joseph comme père biologique.
  {
    id: 'jesus',
    name: 'Jésus-Christ',
    gender: 'M',
    parents: ['mary'],
    legalParents: ['joseph-epoux-marie'],
    note: 'Fils de Marie ; Joseph est son père légal. Conçu du Saint-Esprit.'
  },

  // ============================================================
  // ANNE LA PROPHÉTESSE
  // ============================================================

  { id: 'g-phanuel', name: 'Phanuel', gender: 'M' },

  {
    id: 'anne-prophetesse',
    name: 'Anne',
    gender: 'F',
    parents: ['g-phanuel']
  },

  // ============================================================
  // APÔTRES
  // ============================================================

  { id: 'g-jean-pere-pierre', name: 'Jean', gender: 'M' },
  { id: 'pierre', name: 'Pierre', gender: 'M', parents: ['g-jean-pere-pierre'] },
  { id: 'andre', name: 'André', gender: 'M', parents: ['g-jean-pere-pierre'] },

  { id: 'g-zebedee', name: 'Zébédée', gender: 'M' },
  { id: 'jacques-zebedee', name: 'Jacques', gender: 'M', parents: ['g-zebedee'] },
  { id: 'jean-apotre', name: 'Jean', gender: 'M', parents: ['g-zebedee'] },

  { id: 'g-alphee', name: 'Alphée', gender: 'M' },
  { id: 'jacques-alphee', name: 'Jacques', gender: 'M', parents: ['g-alphee'] },

  // Alphée père de Matthieu/Lévi est traité comme une personne distincte :
  // l'Écriture ne dit pas qu'il s'agit du même Alphée que celui de Jacques.
  { id: 'g-alphee-pere-levi', name: 'Alphée', gender: 'M' },
  {
    id: 'matthieu',
    name: 'Matthieu',
    gender: 'M',
    parents: ['g-alphee-pere-levi']
  },

  { id: 'g-jacques-pere-jude', name: 'Jacques', gender: 'M' },
  {
    id: 'thaddee',
    name: 'Thaddée',
    gender: 'M',
    parents: ['g-jacques-pere-jude']
  },

  // ============================================================
  // BÉTHANIE
  //
  // L'Écriture présente Marthe, Marie et Lazare comme une famille,
  // mais ne donne pas les noms de leurs parents.
  // On ne prétend donc pas connaître leurs noms.
  // ============================================================

  {
    id: 'g-pere-bethanie',
    name: 'Père de Marthe, Marie et Lazare',
    gender: 'M',
    unnamed: true
  },

  {
    id: 'g-mere-bethanie',
    name: 'Mère de Marthe, Marie et Lazare',
    gender: 'F',
    unnamed: true
  },

  {
    id: 'marthe',
    name: 'Marthe',
    gender: 'F',
    parents: ['g-pere-bethanie', 'g-mere-bethanie']
  },

  {
    id: 'marie-bethanie',
    name: 'Marie',
    gender: 'F',
    parents: ['g-pere-bethanie', 'g-mere-bethanie']
  },

  {
    id: 'lazare',
    name: 'Lazare',
    gender: 'M',
    parents: ['g-pere-bethanie', 'g-mere-bethanie']
  },

  // ============================================================
  // JEANNE / CHOUZA
  // ============================================================

  { id: 'jeanne', name: 'Jeanne', gender: 'F', spouses: ['g-chouza'] },
  { id: 'g-chouza', name: 'Chouza', gender: 'M' },

  // ============================================================
  // ÉGLISE PRIMITIVE
  // ============================================================

  { id: 'priscille', name: 'Priscille', gender: 'F', spouses: ['g-aquilas'] },
  { id: 'g-aquilas', name: 'Aquilas', gender: 'M' },

  // Loïs → Eunice → Timothée — 2 Tm 1,5
  { id: 'g-lois', name: 'Loïs', gender: 'F' },

  {
    id: 'eunice',
    name: 'Eunice',
    gender: 'F',
    parents: ['g-lois']
  },

  // Actes 16 indique que le père de Timothée était grec,
  // mais son nom n'est pas donné.
  { id: 'g-pere-timothee', name: 'Père de Timothée', gender: 'M', unnamed: true },

  {
    id: 'timothee',
    name: 'Timothée',
    gender: 'M',
    parents: ['eunice', 'g-pere-timothee']
  }
];

// ============================================================
// TYPES / CONSTRUCTION DU GRAPHE
// ============================================================

export interface FamilyChartDatum {
  id: string;
  data: {
    gender: 'M' | 'F';
    name: string;
    unnamed?: boolean;
    note?: string;
  };
  rels: {
    parents: string[];
    spouses: string[];
    children: string[];
    legalParents: string[];
    legalChildren: string[];
  };
}

let cached: FamilyChartDatum[] | null = null;

/**
 * Graphe complet au format de family-chart.
 *
 * Les relations sont rendues réciproques :
 * - les enfants sont déduits des parents ;
 * - les conjoints sont réciproques ;
 * - les enfants légaux sont déduits des parents légaux.
 */
export function buildGenealogy(): FamilyChartDatum[] {
  if (cached) return cached;

  const byId = new Map<string, FamilyChartDatum>(
    PEOPLE.map((p) => [
      p.id,
      {
        id: p.id,
        data: {
          gender: p.gender,
          name: p.name,
          unnamed: p.unnamed,
          note: p.note
        },
        rels: {
          parents: [],
          spouses: [],
          children: [],
          legalParents: [],
          legalChildren: []
        }
      }
    ])
  );

  const link = (list: string[], id: string) => {
    if (!list.includes(id)) list.push(id);
  };

  PEOPLE.forEach((p) => {
    const self = byId.get(p.id)!;

    // Parents selon la filiation familiale indiquée par le texte.
    p.parents?.forEach((parentId) => {
      const parent = byId.get(parentId);
      if (!parent) return;

      link(self.rels.parents, parentId);
      link(parent.rels.children, p.id);
    });

    // Parents légaux.
    p.legalParents?.forEach((parentId) => {
      const parent = byId.get(parentId);
      if (!parent) return;

      link(self.rels.legalParents, parentId);
      link(parent.rels.legalChildren, p.id);
    });

    // Conjoints.
    p.spouses?.forEach((spouseId) => {
      const spouse = byId.get(spouseId);
      if (!spouse) return;

      link(self.rels.spouses, spouseId);
      link(spouse.rels.spouses, p.id);
    });
  });

  cached = Array.from(byId.values());

  return cached;
}

/**
 * Une figure n'a d'arbre que si l'Écriture lui connaît au moins
 * une relation familiale représentée dans le graphe.
 */
export function hasGenealogy(figureId: string): boolean {
  const person = buildGenealogy().find((d) => d.id === figureId);

  if (!person) return false;

  const {
    parents,
    spouses,
    children,
    legalParents,
    legalChildren
  } = person.rels;

  return (
    parents.length +
      spouses.length +
      children.length +
      legalParents.length +
      legalChildren.length >
    0
  );
}