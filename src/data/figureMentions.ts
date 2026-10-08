// Repérage des figures dans le texte biblique (Bible Crampon) pour rendre
// leur nom cliquable dans le lecteur. Un même prénom désigne souvent
// plusieurs personnes (Marie, Jean, Joseph, Jacques, Anne...) : chaque règle
// porte donc une portée — un testament, ou des livres/chapitres précis où
// l'identification est sûre. Mieux vaut ne pas lier un nom que de renvoyer
// vers la mauvaise figure : les chapitres où plusieurs homonymes se côtoient
// sont volontairement laissés de côté.

import { BOOKS, CATEGORIES, type Testament } from './bible';

/** `true` = tout le livre ; sinon la liste des chapitres concernés. */
type BookScope = Record<string, true | number[]>;

interface MentionRule {
  /** Formes du nom dans le texte, en syntaxe d'expression régulière (un
   * lookahead permet d'exiger un contexte sans le rendre cliquable). */
  names: string[];
  figureId: string;
  scope: Testament | 'tout' | BookScope;
  /** Livres exclus d'une portée par testament (homonymes). */
  except?: string[];
}

const RULES: MentionRule[] = [
  // --- Origines et patriarches ---
  { names: ['Adam'], figureId: 'adam', scope: 'tout' },
  { names: ['Ève', 'Eve'], figureId: 'eve', scope: 'tout' },
  { names: ['Noé'], figureId: 'noe', scope: 'tout' },
  { names: ['Abraham', 'Abram'], figureId: 'abraham', scope: 'tout' },
  { names: ['Sara', 'Saraï'], figureId: 'sarah', scope: 'tout', except: ['tb'] },
  { names: ['Agar'], figureId: 'hagar', scope: 'tout' },
  { names: ['Lot'], figureId: 'lot', scope: 'tout' },
  { names: ['Isaac'], figureId: 'isaac', scope: 'tout' },
  { names: ['Rébecca', 'Rebecca'], figureId: 'rebekah', scope: 'tout' },
  { names: ['Jacob'], figureId: 'jacob', scope: 'tout' },
  { names: ['Lia'], figureId: 'leah', scope: 'ancien' },
  { names: ['Rachel'], figureId: 'rachel', scope: 'tout' },
  {
    names: ['Joseph'],
    figureId: 'joseph-fils-jacob',
    scope: 'ancien',
    except: ['esd', 'ne', '1m', '2m']
  },
  { names: ['Joseph'], figureId: 'joseph-fils-jacob', scope: { jn: [4], ac: [7], he: [11] } },
  { names: ['Joseph'], figureId: 'joseph-epoux-marie', scope: { mt: [1, 2], lc: [1, 2, 3, 4], jn: [1, 6] } },
  { names: ['Job'], figureId: 'job', scope: 'tout' },
  { names: ['Thamar'], figureId: 'tamar', scope: { gn: true, rt: true, mt: [1] } },

  // --- Exode et Juges ---
  { names: ['Moïse'], figureId: 'moise', scope: 'tout' },
  { names: ['Aaron'], figureId: 'aaron', scope: 'tout' },
  { names: ['Marie'], figureId: 'miriam', scope: { ex: true, nb: true, dt: true, '1ch': true, mi: true } },
  { names: ['Séphora'], figureId: 'zipporah', scope: 'ancien' },
  { names: ['Josué'], figureId: 'joshua', scope: 'tout', except: ['ag', 'za'] },
  { names: ['Caleb'], figureId: 'caleb', scope: 'ancien' },
  { names: ['Héli'], figureId: 'eli', scope: { '1s': true, '1r': [2] } },
  { names: ['Anne'], figureId: 'hannah', scope: { '1s': [1, 2] } },
  { names: ['Gédéon'], figureId: 'gideon', scope: 'tout' },
  { names: ['Débora'], figureId: 'deborah', scope: { jg: true } },
  { names: ['Samson'], figureId: 'samson', scope: 'tout' },
  { names: ['Dalila'], figureId: 'delilah', scope: 'ancien' },
  { names: ['Axa'], figureId: 'achsah', scope: 'ancien' },
  { names: ['Ruth'], figureId: 'ruth', scope: 'tout' },
  { names: ['Noémi'], figureId: 'naomi', scope: 'ancien' },
  { names: ['Booz'], figureId: 'boaz', scope: 'tout' },
  { names: ['Rahab'], figureId: 'rahab', scope: 'tout' },

  // --- Royaume ---
  { names: ['Samuel'], figureId: 'samuel', scope: 'tout' },
  { names: ['Saül'], figureId: 'saul', scope: 'tout' },
  { names: ['Jonathas', 'Jonathan'], figureId: 'jonathan', scope: { '1s': true, '2s': true } },
  { names: ['Abigaïl'], figureId: 'abigail', scope: { '1s': true, '2s': true } },
  { names: ['David'], figureId: 'david', scope: 'tout' },
  { names: ['Bethsabée'], figureId: 'bathsheba', scope: 'ancien' },
  { names: ['Salomon'], figureId: 'solomon', scope: 'tout' },
  { names: ['Josaphat'], figureId: 'jehoshaphat', scope: { '1r': true, '2r': true, '2ch': true } },
  { names: ['Ézéchias', 'Ezéchias'], figureId: 'hezekiah', scope: 'tout' },
  { names: ['Josias'], figureId: 'josiah', scope: 'tout' },

  // --- Prophètes ---
  { names: ['Élie', 'Elie'], figureId: 'elijah', scope: 'tout' },
  { names: ['Élisée', 'Elisée'], figureId: 'elisha', scope: 'tout' },
  { names: ['Sunamite'], figureId: 'shunammite', scope: { '2r': true } },
  { names: ['Jonas'], figureId: 'jonah', scope: 'tout' },
  { names: ['Amos'], figureId: 'amos', scope: { am: true } },
  { names: ['Osée'], figureId: 'hosea', scope: { os: true, rm: true } },
  { names: ['Isaïe'], figureId: 'isaiah', scope: 'tout' },
  { names: ['Holda'], figureId: 'huldah', scope: 'ancien' },
  { names: ['Jérémie'], figureId: 'jeremiah', scope: 'tout', except: ['1ch', 'ne'] },

  // --- Exil et retour ---
  { names: ['Nabuchodonosor'], figureId: 'nebuchadnezzar', scope: 'tout' },
  { names: ['Daniel'], figureId: 'daniel', scope: 'tout', except: ['1ch', 'esd', 'ne'] },
  { names: ['Ézéchiel', 'Ezéchiel'], figureId: 'ezekiel', scope: 'tout' },
  { names: ['Cyrus'], figureId: 'cyrus', scope: 'tout' },
  { names: ['Zacharie'], figureId: 'zechariah', scope: { za: true, esd: [5, 6] } },
  { names: ['Vasthi'], figureId: 'vashti', scope: 'ancien' },
  { names: ['Esther'], figureId: 'esther', scope: 'ancien' },
  { names: ['Néhémie'], figureId: 'nehemiah', scope: { ne: true } },

  // --- Évangiles ---
  { names: ['Jésus-Christ', 'Jésus'], figureId: 'jesus', scope: 'nouveau' },
  { names: ['Marie'], figureId: 'mary', scope: { mt: [1, 2, 13], mc: [6], lc: [1, 2], ac: [1] } },
  { names: ['Élisabeth', 'Elisabeth'], figureId: 'elizabeth', scope: { lc: [1] } },
  { names: ['Jean-Baptiste', 'Jean le Baptiste'], figureId: 'jean-baptiste', scope: 'nouveau' },
  {
    names: ['(?<!fils de )Jean'],
    figureId: 'jean-baptiste',
    scope: {
      mt: [3, 9, 11, 14, 21],
      mc: [2, 6, 11],
      lc: [1, 3, 7, 11, 16, 20],
      jn: [1, 3, 4, 5, 10],
      ac: [10, 11, 13, 18, 19]
    }
  },
  { names: ['Anne'], figureId: 'anne-prophetesse', scope: { lc: [2] } },
  { names: ['André'], figureId: 'andre', scope: 'nouveau' },
  { names: ['Simon-Pierre', 'Simon Pierre', 'Pierre', 'Céphas'], figureId: 'pierre', scope: 'nouveau' },
  { names: ['Simon'], figureId: 'pierre', scope: { mt: [4, 16, 17], mc: [1], lc: [4, 5, 22, 24], jn: [1, 21] } },
  { names: ["Jacques(?=,? fils de Zébédée)"], figureId: 'jacques-zebedee', scope: 'nouveau' },
  { names: ['Jacques'], figureId: 'jacques-zebedee', scope: { mt: [17], mc: [1, 5, 9, 10, 13, 14], lc: [5, 8, 9], ac: [12] } },
  { names: ["Jacques(?=,? fils d'Alphée)"], figureId: 'jacques-alphee', scope: 'nouveau' },
  { names: ["Jean(?=,? fils de Zébédée|,? son frère)"], figureId: 'jean-apotre', scope: 'nouveau' },
  {
    names: ['(?<!fils de )Jean'],
    figureId: 'jean-apotre',
    scope: { mt: [10], mc: [3, 5, 9, 10, 13, 14], lc: [6, 8, 22], ac: [3, 4, 8, 12], ga: [2], ap: [1, 22] }
  },
  { names: ['Philippe'], figureId: 'philippe', scope: { mt: [10], mc: [3], lc: [6], jn: [1, 6, 12, 14], ac: [1] } },
  { names: ['Barthélemy', 'Nathanaël'], figureId: 'barthelemy', scope: 'nouveau' },
  { names: ['Matthieu'], figureId: 'matthieu', scope: 'nouveau' },
  { names: ['Lévi'], figureId: 'matthieu', scope: { mc: [2], lc: [5] } },
  { names: ['Thomas'], figureId: 'thomas', scope: 'nouveau' },
  { names: ['Thaddée'], figureId: 'thaddee', scope: 'nouveau' },
  { names: ["Simon(?=,? (?:appelé )?le Zélé)"], figureId: 'simon-zelote', scope: 'nouveau' },
  { names: ['Nicodème'], figureId: 'nicodeme', scope: 'nouveau' },
  { names: ['Lazare'], figureId: 'lazare', scope: { jn: true } },
  { names: ['Marthe'], figureId: 'marthe', scope: 'nouveau' },
  { names: ['Marie'], figureId: 'marie-bethanie', scope: { lc: [10], jn: [11, 12] } },
  { names: ['Marie-Madeleine', 'Madeleine', 'Marie(?=, dite de Magdala)'], figureId: 'marie-madeleine', scope: 'nouveau' },
  { names: ['Marie'], figureId: 'marie-madeleine', scope: { jn: [20] } },
  { names: ['Zachée'], figureId: 'zachee', scope: 'nouveau' },
  { names: ['Jeanne'], figureId: 'jeanne', scope: 'nouveau' },
  { names: ['Salomé'], figureId: 'salome', scope: 'nouveau' },
  { names: ['Suzanne'], figureId: 'susanna', scope: 'nouveau' },
  { names: ['Samaritaine'], figureId: 'photini', scope: { jn: [4] } },

  // --- Église primitive ---
  { names: ['Paul'], figureId: 'paul', scope: 'nouveau' },
  { names: ['Saul'], figureId: 'paul', scope: { ac: true } },
  { names: ['Étienne', 'Etienne'], figureId: 'etienne', scope: { ac: true } },
  { names: ['Matthias'], figureId: 'matthias', scope: 'nouveau' },
  { names: ['Barnabé'], figureId: 'barnabas', scope: 'nouveau' },
  { names: ['Silas'], figureId: 'silas', scope: 'nouveau' },
  { names: ['Timothée'], figureId: 'timothee', scope: 'nouveau' },
  { names: ['Luc'], figureId: 'luc', scope: 'nouveau' },
  { names: ['Apollos', 'Apollo'], figureId: 'apollos', scope: 'nouveau' },
  { names: ['Priscille', 'Prisca'], figureId: 'priscille', scope: 'nouveau' },
  { names: ['Lydie'], figureId: 'lydie', scope: { ac: true } },
  { names: ['Phœbé', 'Phébé'], figureId: 'phoebe', scope: 'nouveau' },
  { names: ['Damaris'], figureId: 'damaris', scope: 'nouveau' },
  { names: ['Eunice'], figureId: 'eunice', scope: 'nouveau' },
  { names: ['Nympha'], figureId: 'nympha', scope: 'nouveau' },
  { names: ['Rhode'], figureId: 'rhode', scope: { ac: true } },
  { names: ['Tabitha', 'Dorcas'], figureId: 'tabitha', scope: 'nouveau' }
];

const BOOK_TESTAMENT = new Map<string, Testament>(
  BOOKS.map((b) => [b.id, CATEGORIES.find((c) => c.key === b.category)?.testament ?? 'ancien'])
);

function ruleApplies(rule: MentionRule, bookId: string, chapter: number): boolean {
  if (rule.except?.includes(bookId)) return false;
  if (rule.scope === 'tout') return true;
  if (typeof rule.scope === 'string') return BOOK_TESTAMENT.get(bookId) === rule.scope;
  const chapters = rule.scope[bookId];
  return chapters === true || (Array.isArray(chapters) && chapters.includes(chapter));
}

// Lettres (accents et ligatures compris) : un nom ne doit pas être pris
// au milieu d'un autre mot ("Lot" dans "Lotan", "Anne" dans "Annexe").
const LETTER = 'A-Za-zÀ-ÖØ-öø-ÿŒœ';

const matcherCache = new Map<string, Array<{ re: RegExp; figureId: string }> | null>();

/** Une expression par figure applicable au chapitre, les formes les plus
 * longues en premier ("Simon-Pierre" avant "Simon", "Jean-Baptiste" avant
 * "Jean") pour que la plus précise l'emporte. */
function matchersFor(bookId: string, chapter: number): Array<{ re: RegExp; figureId: string }> | null {
  const key = `${bookId}:${chapter}`;
  if (matcherCache.has(key)) return matcherCache.get(key) ?? null;

  const alternatives: Array<{ alt: string; figureId: string }> = [];
  RULES.filter((r) => ruleApplies(r, bookId, chapter)).forEach((r) => {
    r.names.forEach((alt) => alternatives.push({ alt, figureId: r.figureId }));
  });
  alternatives.sort((a, b) => b.alt.length - a.alt.length);

  const matchers =
    alternatives.length > 0
      ? alternatives.map(({ alt, figureId }) => ({
          re: new RegExp(`(?<![${LETTER}-])(?:${alt})(?![${LETTER}-])`, 'g'),
          figureId
        }))
      : null;
  matcherCache.set(key, matchers);
  return matchers;
}

export interface FigureMention {
  start: number;
  end: number;
  figureId: string;
}

/** Repère les figures nommées dans un verset, sans chevauchement. */
export function findFigureMentions(text: string, bookId: string, chapter: number): FigureMention[] {
  const matchers = matchersFor(bookId, chapter);
  if (!matchers) return [];

  const mentions: FigureMention[] = [];
  const overlaps = (start: number, end: number) => mentions.some((m) => start < m.end && end > m.start);

  for (const { re, figureId } of matchers) {
    re.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = re.exec(text)) !== null) {
      const start = match.index;
      const end = start + match[0].length;
      if (!overlaps(start, end)) mentions.push({ start, end, figureId });
    }
  }
  return mentions.sort((a, b) => a.start - b.start);
}
