// Liens familiaux des figures bibliques, pour l'arbre généalogique des
// fiches (section « Généalogie et relations »). Un seul graphe pour toute
// la Bible : une figure (id identique à data/figures.ts) y côtoie les
// proches que l'Écriture nomme sans qu'ils aient leur propre fiche (id
// préfixé `g-`), ce qui permet de relier les lignées entre elles (Juda →
// Pérès → … → Booz → Obed → Jessé → David).
//
// Seuls les liens attestés par le texte biblique figurent ici — pas les
// traditions ultérieures (parents de Marie, etc.). Les relations sont
// déclarées dans un seul sens (parents, conjoints) : les enfants et la
// réciprocité sont déduits par `buildGenealogy`.

export interface GenealogyPerson {
  id: string;
  name: string;
  gender: 'M' | 'F';
  parents?: string[];
  spouses?: string[];
  /** Personne réelle dont l'Écriture tait le nom (ex. parents de Lazare). */
  unnamed?: boolean;
  /** Précision affichée sous le nom quand le lien seul induirait en erreur. */
  note?: string;
}

const PEOPLE: GenealogyPerson[] = [
  // --- Origines ---
  { id: 'adam', name: 'Adam', gender: 'M', spouses: ['eve'] },
  { id: 'eve', name: 'Ève', gender: 'F' },
  { id: 'g-cain', name: 'Caïn', gender: 'M', parents: ['adam', 'eve'] },
  { id: 'g-abel', name: 'Abel', gender: 'M', parents: ['adam', 'eve'] },
  { id: 'g-seth', name: 'Seth', gender: 'M', parents: ['adam', 'eve'] },
  { id: 'g-lamek', name: 'Lamek', gender: 'M' },
  { id: 'noe', name: 'Noé', gender: 'M', parents: ['g-lamek'] },
  { id: 'g-sem', name: 'Sem', gender: 'M', parents: ['noe'] },
  { id: 'g-cham', name: 'Cham', gender: 'M', parents: ['noe'] },
  { id: 'g-japhet', name: 'Japhet', gender: 'M', parents: ['noe'] },

  // --- Patriarches (Gn 11 – 50) ---
  { id: 'g-terah', name: 'Térah', gender: 'M' },
  { id: 'abraham', name: 'Abraham', gender: 'M', parents: ['g-terah'], spouses: ['sarah', 'hagar'] },
  { id: 'sarah', name: 'Sara', gender: 'F' },
  { id: 'hagar', name: 'Agar', gender: 'F' },
  { id: 'g-nahor', name: 'Nahor', gender: 'M', parents: ['g-terah'], spouses: ['g-milka'] },
  { id: 'g-haran', name: 'Harân', gender: 'M', parents: ['g-terah'] },
  { id: 'g-milka', name: 'Milka', gender: 'F', parents: ['g-haran'] },
  { id: 'lot', name: 'Lot', gender: 'M', parents: ['g-haran'] },
  { id: 'g-ismael', name: 'Ismaël', gender: 'M', parents: ['abraham', 'hagar'] },
  { id: 'isaac', name: 'Isaac', gender: 'M', parents: ['abraham', 'sarah'], spouses: ['rebekah'] },
  { id: 'g-bethuel', name: 'Bethuel', gender: 'M', parents: ['g-nahor', 'g-milka'] },
  { id: 'rebekah', name: 'Rébecca', gender: 'F', parents: ['g-bethuel'] },
  { id: 'g-laban', name: 'Laban', gender: 'M', parents: ['g-bethuel'] },
  { id: 'g-esau', name: 'Ésaü', gender: 'M', parents: ['isaac', 'rebekah'] },
  { id: 'jacob', name: 'Jacob', gender: 'M', parents: ['isaac', 'rebekah'], spouses: ['leah', 'rachel', 'g-bilha', 'g-zilpa'] },
  { id: 'leah', name: 'Léa', gender: 'F', parents: ['g-laban'] },
  { id: 'rachel', name: 'Rachel', gender: 'F', parents: ['g-laban'] },
  { id: 'g-bilha', name: 'Bilha', gender: 'F' },
  { id: 'g-zilpa', name: 'Zilpa', gender: 'F' },
  { id: 'g-ruben', name: 'Ruben', gender: 'M', parents: ['jacob', 'leah'] },
  { id: 'g-simeon', name: 'Siméon', gender: 'M', parents: ['jacob', 'leah'] },
  { id: 'g-levi', name: 'Lévi', gender: 'M', parents: ['jacob', 'leah'] },
  { id: 'g-juda', name: 'Juda', gender: 'M', parents: ['jacob', 'leah'], spouses: ['tamar'] },
  { id: 'g-issachar', name: 'Issachar', gender: 'M', parents: ['jacob', 'leah'] },
  { id: 'g-zabulon', name: 'Zabulon', gender: 'M', parents: ['jacob', 'leah'] },
  { id: 'g-dina', name: 'Dina', gender: 'F', parents: ['jacob', 'leah'] },
  { id: 'g-dan', name: 'Dan', gender: 'M', parents: ['jacob', 'g-bilha'] },
  { id: 'g-nephtali', name: 'Nephtali', gender: 'M', parents: ['jacob', 'g-bilha'] },
  { id: 'g-gad', name: 'Gad', gender: 'M', parents: ['jacob', 'g-zilpa'] },
  { id: 'g-asher', name: 'Asher', gender: 'M', parents: ['jacob', 'g-zilpa'] },
  { id: 'joseph-fils-jacob', name: 'Joseph', gender: 'M', parents: ['jacob', 'rachel'], spouses: ['g-asenath'] },
  { id: 'g-benjamin', name: 'Benjamin', gender: 'M', parents: ['jacob', 'rachel'] },
  { id: 'g-asenath', name: 'Asenath', gender: 'F' },
  { id: 'g-manasse', name: 'Manassé', gender: 'M', parents: ['joseph-fils-jacob', 'g-asenath'] },
  { id: 'g-ephraim', name: 'Éphraïm', gender: 'M', parents: ['joseph-fils-jacob', 'g-asenath'] },
  { id: 'g-er', name: 'Er', gender: 'M', parents: ['g-juda'], spouses: ['tamar'] },
  { id: 'tamar', name: 'Tamar', gender: 'F' },
  { id: 'g-peres', name: 'Pérès', gender: 'M', parents: ['g-juda', 'tamar'] },
  { id: 'g-zerah', name: 'Zérah', gender: 'M', parents: ['g-juda', 'tamar'] },
  { id: 'job', name: 'Job', gender: 'M' },
  { id: 'g-yemima', name: 'Yemima', gender: 'F', parents: ['job'] },
  { id: 'g-qecia', name: 'Qeçia', gender: 'F', parents: ['job'] },
  { id: 'g-qeren', name: 'Qéren-Happouk', gender: 'F', parents: ['job'] },

  // --- Exode (Ex 2 ; 6 ; Nb 26, 59) ---
  { id: 'g-qehath', name: 'Qehath', gender: 'M', parents: ['g-levi'] },
  { id: 'g-amram', name: 'Amram', gender: 'M', parents: ['g-qehath'], spouses: ['g-jokebed'] },
  { id: 'g-jokebed', name: 'Jokébed', gender: 'F' },
  { id: 'aaron', name: 'Aaron', gender: 'M', parents: ['g-amram', 'g-jokebed'], spouses: ['g-elisheba'] },
  { id: 'moise', name: 'Moïse', gender: 'M', parents: ['g-amram', 'g-jokebed'], spouses: ['zipporah'] },
  { id: 'miriam', name: 'Miriam', gender: 'F', parents: ['g-amram', 'g-jokebed'] },
  { id: 'g-jethro', name: 'Jéthro', gender: 'M' },
  { id: 'zipporah', name: 'Séphora', gender: 'F', parents: ['g-jethro'] },
  { id: 'g-gershom', name: 'Gershom', gender: 'M', parents: ['moise', 'zipporah'] },
  { id: 'g-eliezer', name: 'Éliézer', gender: 'M', parents: ['moise', 'zipporah'] },
  { id: 'g-elisheba', name: 'Élishéba', gender: 'F' },
  { id: 'g-nadab', name: 'Nadab', gender: 'M', parents: ['aaron', 'g-elisheba'] },
  { id: 'g-abihou', name: 'Abihou', gender: 'M', parents: ['aaron', 'g-elisheba'] },
  { id: 'g-eleazar', name: 'Éléazar', gender: 'M', parents: ['aaron', 'g-elisheba'] },
  { id: 'g-itamar', name: 'Itamar', gender: 'M', parents: ['aaron', 'g-elisheba'] },
  { id: 'g-noun', name: 'Noun', gender: 'M' },
  { id: 'joshua', name: 'Josué', gender: 'M', parents: ['g-noun'] },
  { id: 'g-jephunne', name: 'Jephunné', gender: 'M' },
  { id: 'caleb', name: 'Caleb', gender: 'M', parents: ['g-jephunne'] },
  { id: 'achsah', name: 'Aksa', gender: 'F', parents: ['caleb'], spouses: ['g-othniel'] },
  { id: 'g-othniel', name: 'Otniel', gender: 'M' },

  // --- Juges (Jg ; Rt ; 1 S 1 – 2) ---
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
  { id: 'g-elqana', name: 'Elqana', gender: 'M', spouses: ['hannah'] },
  { id: 'hannah', name: 'Anne', gender: 'F' },
  { id: 'samuel', name: 'Samuel', gender: 'M', parents: ['g-elqana', 'hannah'] },
  { id: 'g-joel-samuel', name: 'Joël', gender: 'M', parents: ['samuel'] },
  { id: 'g-abiya-samuel', name: 'Abiya', gender: 'M', parents: ['samuel'] },
  { id: 'g-elimelek', name: 'Élimélek', gender: 'M', spouses: ['naomi'] },
  { id: 'naomi', name: 'Noémi', gender: 'F' },
  { id: 'g-mahlon', name: 'Mahlôn', gender: 'M', parents: ['g-elimelek', 'naomi'], spouses: ['ruth'] },
  { id: 'g-kilion', name: 'Kilyôn', gender: 'M', parents: ['g-elimelek', 'naomi'], spouses: ['g-orpa'] },
  { id: 'g-orpa', name: 'Orpa', gender: 'F' },

  // --- Lignée de Juda jusqu'à David (Rt 4, 18-22 ; Mt 1, 3-6) ---
  { id: 'g-hesron', name: 'Hesrôn', gender: 'M', parents: ['g-peres'] },
  { id: 'g-ram', name: 'Ram', gender: 'M', parents: ['g-hesron'] },
  { id: 'g-aminadab', name: 'Aminadab', gender: 'M', parents: ['g-ram'] },
  { id: 'g-nahshon', name: 'Nahshôn', gender: 'M', parents: ['g-aminadab'] },
  { id: 'g-salmon', name: 'Salmôn', gender: 'M', parents: ['g-nahshon'], spouses: ['rahab'] },
  { id: 'rahab', name: 'Rahab', gender: 'F' },
  { id: 'boaz', name: 'Booz', gender: 'M', parents: ['g-salmon', 'rahab'], spouses: ['ruth'] },
  { id: 'ruth', name: 'Ruth', gender: 'F' },
  { id: 'g-obed', name: 'Obed', gender: 'M', parents: ['boaz', 'ruth'] },
  { id: 'g-jesse', name: 'Jessé', gender: 'M', parents: ['g-obed'] },

  // --- Royaume (1 – 2 S ; 1 – 2 R ; 1 Ch 3) ---
  { id: 'g-kish', name: 'Qish', gender: 'M' },
  { id: 'saul', name: 'Saül', gender: 'M', parents: ['g-kish'], spouses: ['g-ahinoam'] },
  { id: 'g-ahinoam', name: 'Ahinoam', gender: 'F' },
  { id: 'jonathan', name: 'Jonathan', gender: 'M', parents: ['saul', 'g-ahinoam'] },
  { id: 'g-mikal', name: 'Mikal', gender: 'F', parents: ['saul', 'g-ahinoam'] },
  { id: 'g-mephibosheth', name: 'Mephibosheth', gender: 'M', parents: ['jonathan'] },
  { id: 'david', name: 'David', gender: 'M', parents: ['g-jesse'], spouses: ['g-mikal', 'abigail', 'bathsheba'] },
  { id: 'g-nabal', name: 'Nabal', gender: 'M', spouses: ['abigail'] },
  { id: 'abigail', name: 'Abigaïl', gender: 'F' },
  { id: 'g-kileab', name: 'Kiléab', gender: 'M', parents: ['david', 'abigail'] },
  { id: 'g-eliam', name: 'Éliam', gender: 'M' },
  { id: 'bathsheba', name: 'Bethsabée', gender: 'F', parents: ['g-eliam'], spouses: ['g-urie'] },
  { id: 'g-urie', name: 'Urie', gender: 'M' },
  { id: 'solomon', name: 'Salomon', gender: 'M', parents: ['david', 'bathsheba'] },
  { id: 'g-nathan', name: 'Nathan', gender: 'M', parents: ['david', 'bathsheba'] },
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

  // --- Prophètes ---
  { id: 'g-shaphat', name: 'Shaphat', gender: 'M' },
  { id: 'elisha', name: 'Élisée', gender: 'M', parents: ['g-shaphat'] },
  { id: 'g-amittai', name: 'Amittaï', gender: 'M' },
  { id: 'jonah', name: 'Jonas', gender: 'M', parents: ['g-amittai'] },
  { id: 'g-beeri', name: 'Beéri', gender: 'M' },
  { id: 'hosea', name: 'Osée', gender: 'M', parents: ['g-beeri'], spouses: ['g-gomer'] },
  { id: 'g-gomer', name: 'Gomer', gender: 'F' },
  { id: 'g-yizreel', name: 'Yizréel', gender: 'M', parents: ['hosea', 'g-gomer'] },
  { id: 'g-lo-rouhama', name: 'Lo-Rouhama', gender: 'F', parents: ['g-gomer'] },
  { id: 'g-lo-ammi', name: 'Lo-Ammi', gender: 'M', parents: ['g-gomer'] },
  { id: 'g-amots', name: 'Amots', gender: 'M' },
  { id: 'isaiah', name: 'Ésaïe', gender: 'M', parents: ['g-amots'] },
  { id: 'g-shear-yashoub', name: 'Shear-Yashoub', gender: 'M', parents: ['isaiah'] },
  { id: 'g-shalloum', name: 'Shalloum', gender: 'M', spouses: ['huldah'] },
  { id: 'huldah', name: 'Houlda', gender: 'F' },
  { id: 'g-hilqiya', name: 'Hilqiya', gender: 'M' },
  { id: 'jeremiah', name: 'Jérémie', gender: 'M', parents: ['g-hilqiya'] },

  // --- Exil et retour ---
  { id: 'g-bouzi', name: 'Bouzi', gender: 'M' },
  { id: 'ezekiel', name: 'Ézéchiel', gender: 'M', parents: ['g-bouzi'] },
  { id: 'nebuchadnezzar', name: 'Nabuchodonosor', gender: 'M' },
  { id: 'g-balthazar', name: 'Balthazar', gender: 'M', parents: ['nebuchadnezzar'] },
  { id: 'g-iddo', name: 'Iddo', gender: 'M' },
  { id: 'g-berekya', name: 'Bérékya', gender: 'M', parents: ['g-iddo'] },
  { id: 'zechariah', name: 'Zacharie', gender: 'M', parents: ['g-berekya'] },
  { id: 'g-assuerus', name: 'Assuérus', gender: 'M', spouses: ['vashti', 'esther'] },
  { id: 'vashti', name: 'Vasthi', gender: 'F' },
  { id: 'g-abihail', name: 'Abihaïl', gender: 'M' },
  { id: 'esther', name: 'Esther', gender: 'F', parents: ['g-abihail'] },
  { id: 'g-hakalia', name: 'Hakalia', gender: 'M' },
  { id: 'nehemiah', name: 'Néhémie', gender: 'M', parents: ['g-hakalia'] },

  // --- Évangiles ---
  { id: 'g-zacharie-pretre', name: 'Zacharie', gender: 'M', spouses: ['elizabeth'] },
  { id: 'elizabeth', name: 'Élisabeth', gender: 'F' },
  { id: 'jean-baptiste', name: 'Jean-Baptiste', gender: 'M', parents: ['g-zacharie-pretre', 'elizabeth'] },
  { id: 'g-jacob-pere-joseph', name: 'Jacob', gender: 'M' },
  {
    id: 'joseph-epoux-marie',
    name: 'Joseph',
    gender: 'M',
    parents: ['g-jacob-pere-joseph'],
    spouses: ['mary'],
    note: 'Père légal de Jésus'
  },
  { id: 'mary', name: 'Vierge Marie', gender: 'F' },
  // Joseph est le père légal de Jésus, non son père selon la chair
  // (Mt 1, 18-25) ; les deux généalogies évangéliques passent pourtant par
  // lui (Mt 1, 16 ; Lc 3, 23), d'où sa place de parent dans l'arbre —
  // précisée par la mention « Père légal » sur sa carte.
  { id: 'jesus', name: 'Jésus-Christ', gender: 'M', parents: ['mary', 'joseph-epoux-marie'] },
  { id: 'g-phanuel', name: 'Phanuel', gender: 'M' },
  { id: 'anne-prophetesse', name: 'Anne', gender: 'F', parents: ['g-phanuel'] },
  { id: 'g-jean-pere-pierre', name: 'Jean', gender: 'M' },
  { id: 'pierre', name: 'Pierre', gender: 'M', parents: ['g-jean-pere-pierre'] },
  { id: 'andre', name: 'André', gender: 'M', parents: ['g-jean-pere-pierre'] },
  { id: 'g-zebedee', name: 'Zébédée', gender: 'M' },
  { id: 'jacques-zebedee', name: 'Jacques', gender: 'M', parents: ['g-zebedee'] },
  { id: 'jean-apotre', name: 'Jean', gender: 'M', parents: ['g-zebedee'] },
  { id: 'g-alphee', name: 'Alphée', gender: 'M' },
  { id: 'jacques-alphee', name: 'Jacques', gender: 'M', parents: ['g-alphee'] },
  // Alphée père de Lévi (Mc 2, 14) : rien ne dit qu'il s'agisse du même
  // qu'Alphée père de Jacques, d'où une personne distincte.
  { id: 'g-alphee-pere-levi', name: 'Alphée', gender: 'M' },
  { id: 'matthieu', name: 'Matthieu', gender: 'M', parents: ['g-alphee-pere-levi'] },
  { id: 'g-jacques-pere-jude', name: 'Jacques', gender: 'M' },
  { id: 'thaddee', name: 'Thaddée', gender: 'M', parents: ['g-jacques-pere-jude'] },
  { id: 'g-parents-bethanie', name: 'Parents', gender: 'M', unnamed: true },
  { id: 'marthe', name: 'Marthe', gender: 'F', parents: ['g-parents-bethanie'] },
  { id: 'marie-bethanie', name: 'Marie', gender: 'F', parents: ['g-parents-bethanie'] },
  { id: 'lazare', name: 'Lazare', gender: 'M', parents: ['g-parents-bethanie'] },
  { id: 'jeanne', name: 'Jeanne', gender: 'F', spouses: ['g-chouza'] },
  { id: 'g-chouza', name: 'Chouza', gender: 'M' },

  // --- Église primitive ---
  { id: 'priscille', name: 'Priscille', gender: 'F', spouses: ['g-aquilas'] },
  { id: 'g-aquilas', name: 'Aquilas', gender: 'M' },
  { id: 'eunice', name: 'Eunice', gender: 'F' },
  { id: 'timothee', name: 'Timothée', gender: 'M', parents: ['eunice'] }
];

export interface FamilyChartDatum {
  id: string;
  data: { gender: 'M' | 'F'; name: string; unnamed?: boolean; note?: string };
  rels: { parents: string[]; spouses: string[]; children: string[] };
}

let cached: FamilyChartDatum[] | null = null;

/** Graphe complet au format de family-chart, relations rendues
 * réciproques (enfants déduits des parents, conjoints dans les deux sens). */
export function buildGenealogy(): FamilyChartDatum[] {
  if (cached) return cached;

  const byId = new Map<string, FamilyChartDatum>(
    PEOPLE.map((p) => [
      p.id,
      {
        id: p.id,
        data: { gender: p.gender, name: p.name, unnamed: p.unnamed, note: p.note },
        rels: { parents: [], spouses: [], children: [] }
      }
    ])
  );
  const link = (list: string[], id: string) => {
    if (!list.includes(id)) list.push(id);
  };

  PEOPLE.forEach((p) => {
    const self = byId.get(p.id)!;
    p.parents?.forEach((parentId) => {
      const parent = byId.get(parentId);
      if (!parent) return;
      link(self.rels.parents, parentId);
      link(parent.rels.children, p.id);
    });
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

/** Une figure n'a d'arbre que si l'Écriture lui connaît au moins un proche. */
export function hasGenealogy(figureId: string): boolean {
  const person = buildGenealogy().find((d) => d.id === figureId);
  if (!person) return false;
  const { parents, spouses, children } = person.rels;
  return parents.length + spouses.length + children.length > 0;
}
