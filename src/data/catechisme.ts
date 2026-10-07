// Extraits du Catéchisme de l'Église catholique couvrant les références
// citées par les fiches "Les bases" (src/pages/Eglise.tsx). Ce n'est pas
// l'intégralité du Catéchisme, seulement les paragraphes déjà référencés
// ailleurs dans l'app — à étendre au fil des besoins.
//
// IMPORTANT : ce texte est une reformulation fidèle à l'enseignement de
// chaque paragraphe, rédigée à partir de la structure connue du Catéchisme,
// et non une retranscription vérifiée mot pour mot de la traduction
// officielle. À relire et corriger face au texte officiel (vatican.va)
// avant de le présenter comme une citation exacte.

export interface CatechismParagraph {
  /** Sert de clé de fusion pour les surcharges distantes (voir remoteMerge). */
  id: string;
  number: number;
  text: string;
}

function paragraphs(start: number, texts: string[]): CatechismParagraph[] {
  return texts.map((text, index) => {
    const number = start + index;
    return { id: String(number), number, text };
  });
}

export const CATECHISM_PARAGRAPHS: CatechismParagraph[] = [
  // --- §232-267 : La Sainte Trinité ---
  ...paragraphs(232, [
    "Les chrétiens sont baptisés « au nom » du Père et du Fils et du Saint-Esprit : non pas « aux noms », au pluriel, car il n'y a qu'un seul Dieu, le Père tout-puissant, son Fils unique et le Saint-Esprit : la Très Sainte Trinité.",
    "Ce n'est pas la simple addition de trois noms, mais la confession d'un seul Dieu en trois Personnes distinctes : la Très Sainte Trinité.",
    "Le mystère de la Sainte Trinité est le mystère central de la foi et de la vie chrétiennes. C'est le mystère de Dieu en Lui-même, la source de tous les autres mystères de la foi.",
    "Ce chapitre expose d'abord comment ce mystère a été révélé, puis comment l'Église en a formulé la foi, enfin comment les missions divines du Fils et de l'Esprit déploient la vie de la Trinité dans le temps.",
    "Les Pères distinguent la théologie (le mystère de la vie intime de Dieu) de l'économie (les œuvres par lesquelles Dieu se révèle et se communique).",
    "Ce mystère est inaccessible à la seule raison, ainsi qu'à la foi d'Israël avant l'Incarnation du Fils de Dieu et l'envoi de l'Esprit Saint.",
    "Beaucoup de religions invoquent Dieu comme « Père ». Dieu est souvent perçu comme père et origine de l'univers et de son peuple, une paternité qui exprime surtout l'immanence de Dieu.",
    "Dieu transcende la distinction humaine des sexes : il n'est ni homme ni femme, il est Dieu.",
    "Jésus a révélé que Dieu est Père dans un sens inouï : il ne l'est pas seulement en tant que Créateur, il l'est éternellement en relation à son Fils unique.",
    "Le Fils n'est pas seulement appelé Fils parce qu'il est engendré ; il est le Fils unique, « engendré, non pas créé, de même nature que le Père ».",
    "Le concile de Nicée (325) a confessé le Fils « consubstantiel » au Père (homoousios), contre l'hérésie d'Arius qui niait sa pleine divinité.",
    "Avant sa Pâque, Jésus a annoncé l'envoi d'un « autre Paraclet », l'Esprit Saint.",
    "L'Esprit Saint, envoyé par le Père au nom du Fils et par le Fils « d'auprès du Père », révèle qu'il est lui aussi Dieu, avec le Père et le Fils.",
    "Le Symbole des Apôtres confesse l'Esprit « qui procède du Père » ; la tradition latine ajoute « et du Fils » (Filioque), affirmant qu'il procède du Père et du Fils comme d'un seul principe.",
    "Cette affirmation est légitime et compréhensible pourvu qu'elle ne diminue pas la monarchie du Père comme source première de l'Esprit.",
    "Le Filioque n'a été introduit dans le Symbole en Occident que tardivement et reste un point de dialogue avec les Églises d'Orient.",
    "La tradition orientale exprime d'abord le caractère du Père comme première origine de l'Esprit ; la tradition occidentale met en avant la communion de nature entre le Père et le Fils.",
    "Dès l'origine, la foi de l'Église a confessé et vécu la Trinité, avant même d'en formuler le dogme explicite.",
    "Les premiers siècles ont dû préciser la foi trinitaire, en particulier face aux hérésies qui en déformaient un aspect ou un autre.",
    "L'Église a repris des termes de la philosophie profane — substance, personne, hypostase — pour dire la distinction réelle des Personnes tout en affirmant l'unité de leur nature.",
    "« Personne » désigne la distinction réelle du Père, du Fils et de l'Esprit entre eux ; « substance », « essence » ou « nature » désigne ce qui les unit.",
    "La Trinité est Une : nous ne confessons pas trois Dieux, mais un seul Dieu en trois Personnes, « la Trinité consubstantielle ».",
    "Les Personnes divines sont réellement distinctes entre elles, distinguées par leurs relations d'origine : c'est le Père qui engendre, le Fils qui est engendré, l'Esprit Saint qui procède.",
    "L'Unité divine est Trine. Les relations d'origine ne divisent pas l'unité divine : c'est précisément ce qui la constitue.",
    "Selon la formule de saint Augustin : « en Dieu il y a une seule substance et trois personnes ».",
    "Toute l'économie divine est l'œuvre commune des trois Personnes divines ; la Trinité n'a qu'une seule et même opération.",
    "Chaque Personne divine accomplit l'œuvre commune selon sa propriété personnelle ; ainsi l'Église confesse un seul Dieu, Père, Fils et Esprit, à l'œuvre dans la création, la rédemption et la sanctification.",
    "Toute l'économie divine manifeste le rôle propre de chaque Personne divine dans la création et le salut du monde.",
    "La fin ultime de toute l'économie divine est l'entrée des créatures dans l'unité parfaite de la Bienheureuse Trinité.",
    "Le mystère de la Sainte Trinité est le mystère central de la foi et de la vie chrétiennes, la source de tous les autres mystères de la foi, la lumière qui les éclaire.",
    "Les missions du Fils et de l'Esprit s'accomplissent dans la plénitude des temps par l'Incarnation et la Pentecôte, mais ils étaient déjà présents et agissants depuis le commencement du monde.",
    "Après sa glorification, le Christ envoie l'Esprit Saint, qui poursuit dans le monde et dans l'Église l'œuvre du salut.",
    "La foi de l'Église affirme que l'Esprit procède du Père par le Fils, et que les deux missions sont inséparables l'une de l'autre.",
    "La foi en l'œuvre inséparable de la Trinité explique pourquoi la liturgie de l'Église s'adresse à Dieu le Père, par le Christ, dans l'Esprit Saint.",
    "La foi catholique consiste à honorer un seul Dieu dans la Trinité et la Trinité dans l'unité, sans confondre les Personnes ni séparer la substance.",
    "Dieu tout-puissant, « créateur du ciel et de la terre, de l'univers visible et invisible », donne et a donné l'être à tout ce qui existe en dehors de lui."
  ]),
  // --- §599-618 : La Passion et la mort de Jésus ---
  ...paragraphs(599, [
    "La mort violente de Jésus n'a pas été le fruit du hasard, mais fait partie du mystère du dessein de Dieu, comme l'explique saint Pierre : Jésus a été « livré selon le dessein bien arrêté et la prescience de Dieu ».",
    "Pour réaliser son dessein de salut, Dieu a permis les actes qui découlaient de l'aveuglement de ceux qui ont livré Jésus, tout en connaissant de toute éternité l'acte libre par lequel ils l'accompliraient.",
    "Cette prédestination divine inclut la réponse libre de chacun à sa grâce : Jésus a livré librement sa vie pour racheter les hommes, accomplissant les Écritures qui annonçaient un Messie souffrant.",
    "L'Écriture avait annoncé à l'avance ce dessein divin d'un salut par la Passion rédemptrice du « Serviteur souffrant », comme accomplissement des prophéties.",
    "Jésus n'a pas connu le péché mais s'est identifié à la condition pécheresse des hommes, « l'Agneau de Dieu qui ôte le péché du monde », jusqu'à connaître dans sa mort une forme d'abandon.",
    "En livrant son propre Fils pour nos péchés, Dieu manifeste que son dessein sur nous est un dessein d'amour bienveillant, antérieur à tout mérite de notre part.",
    "Jésus a donné sa vie « en rançon pour la multitude », en s'offrant lui-même librement, sans exclure personne, pas même ceux qui l'ont livré à la mort.",
    "Le Fils de Dieu fait homme a voulu librement, par amour pour son Père et pour les hommes qu'il voulait sauver, offrir sa vie à son Père en sacrifice.",
    "Ce désir d'offrir sa vie en sacrifice pour la réconciliation des hommes avec Dieu anime toute la vie terrestre de Jésus.",
    "En désignant Jésus comme « l'Agneau de Dieu », Jean-Baptiste l'annonce comme le Serviteur souffrant qui se laisse mener à l'abattoir pour le rachat des péchés de la multitude, et comme l'agneau pascal, symbole de la libération d'Israël.",
    "Toute la vie du Christ exprime sa mission : « servir et donner sa vie en rançon pour la multitude ».",
    "Jésus a donné le sens définitif à son offrande en anticipant, lors de la dernière Cène, le don libre de sa vie.",
    "L'eucharistie que Jésus institue alors sera le mémorial de son sacrifice ; il y associe les apôtres à sa propre offrande.",
    "La coupe de la nouvelle Alliance, que Jésus anticipe en donnant librement sa vie par amour, accomplit et dépasse la coupe symbolisant l'acceptation par le Fils de la volonté du Père.",
    "La mort du Christ est le sacrifice pascal unique et définitif qui accomplit et dépasse tous les sacrifices de l'ancienne Alliance : il rachète l'humanité et la réconcilie avec Dieu.",
    "Ce sacrifice du Christ est unique : il accomplit et dépasse tous les autres, étant le don que Dieu le Père fait lui-même en livrant son Fils pour nous réconcilier avec lui.",
    "Par son obéissance jusqu'à la mort, Jésus accomplit la substitution vicaire du Serviteur souffrant qui « justifiera les multitudes en portant leurs fautes ».",
    "C'est l'amour « jusqu'au bout » qui confère au sacrifice du Christ sa valeur de rédemption, de réparation, d'expiation et de satisfaction.",
    "Par sa Passion, le Christ nous délivre du péché ; par sa mort, il nous mérite la justification ; par sa résurrection, il nous acquiert la vie nouvelle.",
    "La croix est l'unique sacrifice du Christ, « seul médiateur entre Dieu et les hommes » ; mais parce que dans sa personne divine incarnée il a uni tout homme à lui, il rend possible à tous l'association à son offrande."
  ]),
  // --- §1131 : Qu'est-ce qu'un sacrement ---
  ...paragraphs(1131, [
    "Les sacrements sont des signes efficaces de la grâce, institués par le Christ et confiés à l'Église, par lesquels nous est dispensée la vie divine. Les rites visibles sous lesquels les sacrements sont célébrés signifient et réalisent les grâces propres à chacun d'eux, portant du fruit dans ceux qui les reçoivent avec les dispositions requises."
  ]),
  // --- §1213-1216 : Le sacrement du Baptême ---
  ...paragraphs(1213, [
    "Le saint Baptême est le fondement de toute la vie chrétienne, le porche de la vie dans l'Esprit et la porte qui ouvre l'accès aux autres sacrements. Par lui nous sommes libérés du péché et régénérés comme fils de Dieu.",
    "Ce sacrement est appelé Baptême à cause du rite central par lequel il s'accomplit : baptiser signifie « plonger » dans l'eau ; ce plongeon symbolise l'ensevelissement du catéchumène dans la mort du Christ, d'où il ressurgit par la résurrection avec lui.",
    "Ce sacrement est encore appelé « bain de la régénération et de la rénovation dans l'Esprit Saint », car il signifie et réalise cette naissance d'eau et d'Esprit sans laquelle nul ne peut entrer dans le Royaume de Dieu.",
    "Ce bain est appelé illumination, car ceux qui reçoivent cet enseignement sont illuminés dans leur intelligence ; ayant reçu dans le Baptême le Verbe, « lumière véritable qui illumine tout homme », le baptisé devient « fils de lumière »."
  ]),
  // --- §2559-2565 : Qu'est-ce que la prière ---
  ...paragraphs(2559, [
    "« La prière est l'élévation de l'âme vers Dieu ou la demande à Dieu des biens convenables. » D'où parlons-nous en priant, de l'orgueil de l'homme, ou de l'humilité de celui qui reconnaît son dénuement ? « L'homme est mendiant de Dieu. »",
    "« Si tu savais le don de Dieu ! » L'émerveillement devant ce don est le commencement de la prière : le puisatier attend l'eau, mais c'est Dieu, le premier, qui cherche l'homme et lui demande à boire.",
    "Dieu a soif que nous ayons soif de lui : la prière naît de la rencontre du désir de Dieu et de notre propre désir.",
    "D'où vient la prière de l'homme ? Quel que soit le langage de la prière, c'est le cœur tout entier qui prie, comme le lieu de la rencontre avec Dieu.",
    "Le cœur est la demeure où je suis, où j'habite, où je décide, où je consens ; c'est le lieu de la vérité, où je choisis la vie ou la mort ; c'est le lieu de la rencontre, car à l'image de Dieu nous vivons en relation.",
    "La prière chrétienne est une relation d'alliance entre Dieu et l'homme dans le Christ ; elle est action de Dieu et de l'homme, jaillissant de l'Esprit Saint et de nous-mêmes, tout entière tournée vers le Père, en union avec la volonté humaine du Fils de Dieu fait homme.",
    "Dans la Nouvelle Alliance, la prière est la relation vivante des enfants de Dieu avec leur Père infiniment bon, avec son Fils Jésus-Christ et avec l'Esprit Saint."
  ]),
  // --- §988-1016 : La résurrection des morts et la vie éternelle ---
  ...paragraphs(988, [
    "Le Symbole chrétien — profession de foi en Dieu Père, Fils et Saint-Esprit et en son œuvre créatrice, rédemptrice et sanctificatrice — culmine dans la proclamation de la résurrection des morts au dernier jour et de la vie éternelle.",
    "Nous croyons fermement, et nous espérons, qu'à l'exemple du Christ ressuscité avec son propre corps pour toujours, les justes ressusciteront après leur mort avec leur propre corps, celui qu'ils ont maintenant, transformé en corps glorieux.",
    "Le terme « chair » désigne l'homme dans sa condition de faiblesse et de mortalité. La « résurrection de la chair » signifie qu'après la mort, non seulement l'âme immortelle survivra, mais que nos « corps mortels » reprendront vie eux aussi.",
    "La foi en la résurrection des morts a été, dès le début, un élément essentiel de la foi chrétienne, incompréhensible et objet de moquerie et de contradiction pour beaucoup.",
    "Dieu a progressivement révélé à son peuple la résurrection des morts, liée à celle du Messie, d'abord de façon voilée, comme un salut qu'il propose à son peuple.",
    "Les pharisiens et beaucoup de contemporains du Seigneur espéraient la résurrection ; Jésus l'enseigne fermement et la relie à sa propre personne : « Je suis la résurrection et la vie. »",
    "C'est Jésus lui-même qui ressuscitera au dernier jour ceux qui auront cru en lui et qui auront mangé son Corps et bu son Sang.",
    "Être témoin du Christ, c'est être témoin de sa résurrection, avoir « mangé et bu avec lui après sa résurrection d'entre les morts ».",
    "Dès l'origine, la foi chrétienne en la résurrection de la chair a rencontré incompréhension et opposition : sur aucun point la foi chrétienne ne rencontre plus de contradictions qu'à ce sujet.",
    "Qu'est-ce que « ressusciter » ? Dans la mort, séparation de l'âme et du corps, le corps de l'homme tombe dans la corruption tandis que son âme va à la rencontre de Dieu, dans l'attente d'être réunie à son corps glorieux.",
    "Qui ressuscitera ? Tous les hommes qui sont morts : « ceux qui auront fait le bien ressusciteront pour la vie, ceux qui auront fait le mal ressusciteront pour la damnation ».",
    "Comment ? Le Christ est ressuscité avec son propre corps ; de même, en lui, « tous ressusciteront avec leur propre corps qu'ils ont maintenant », mais ce corps sera transfiguré en « corps glorieux », en « corps spirituel ».",
    "Ce « comment » dépasse notre imagination et notre entendement ; il n'est accessible que dans la foi. La résurrection de notre chair sera l'œuvre de la Sainte Trinité.",
    "Quand ? Définitivement « au dernier jour », « à la fin du monde ». La résurrection des morts est intimement liée à la venue glorieuse du Christ.",
    "Depuis le Baptême, le chrétien est déjà réellement associé à la mort et à la résurrection du Christ.",
    "Uni au Christ par le Baptême, le croyant participe déjà réellement à la vie céleste du Christ ressuscité, mais cette vie reste « cachée avec le Christ en Dieu ».",
    "« Ressuscités avec le Christ » par le Baptême, les chrétiens participent à la vérité et à la vie du Christ ressuscité ; dans l'attente de ce jour, le corps du croyant sommeille dans la mort en espérance de la résurrection.",
    "Pour ressusciter avec le Christ, il faut mourir avec le Christ, il faut « quitter ce corps pour aller demeurer auprès du Seigneur ».",
    "« C'est dans la mort que Dieu appelle l'homme à lui » ; devant la mort, l'énigme de la condition humaine atteint son sommet.",
    "La mort est la fin de la vie terrestre. Nos vies sont mesurées par le temps, au cours duquel nous changeons et vieillissons ; comme pour tous les êtres vivants, la mort apparaît comme la fin normale de la vie.",
    "La mort est la conséquence du péché ; elle est entrée dans l'histoire humaine à cause du péché : « c'est par le péché qu'est venue la mort ».",
    "La mort est transformée par le Christ : Jésus, Fils de Dieu, a lui aussi connu la mort, inhérente à la condition humaine ; malgré son angoisse devant elle, il l'a assumée dans un acte total et libre de soumission à la volonté de son Père.",
    "Grâce au Christ, la mort chrétienne a un sens positif : « Pour moi, vivre, c'est le Christ, et mourir m'est un gain. » Dans la mort, Dieu appelle l'homme à lui.",
    "Le chrétien peut ainsi éprouver à l'égard de la mort un désir semblable à celui de saint Paul : « désirer s'en aller et être avec le Christ ».",
    "Cette perspective transforme la conception chrétienne de la mort. L'Église, qui a porté sacramentellement le chrétien durant son pèlerinage terrestre comme une mère, l'accompagne au terme de sa route.",
    "La mort est le terme de la vie de l'homme, comme temps offert par Dieu pour réaliser sa vie donnée, selon un dessein d'amour et un plan de salut à son égard.",
    "L'Église invite à se préparer à l'heure de sa mort, à demander à la Mère de Dieu d'intercéder pour nous « à l'heure de notre mort » et à se placer sous la protection de saint Joseph, patron de la bonne mort.",
    "« La chair est le pivot du salut. » Nous croyons en Dieu créateur de la chair ; nous croyons au Verbe fait chair pour racheter la chair ; nous croyons à la résurrection de la chair, accomplissement de la création et de la rédemption de la chair.",
    "Par la mort, l'âme est séparée du corps ; mais dans la résurrection, Dieu rendra la vie incorruptible à notre corps transformé, en le réunissant à notre âme."
  ])
];

/** Parse une référence comme "232-267" ou "1131" en bornes inclusives [début, fin]. */
export function parseCatechismRef(ref: string): { start: number; end: number } | null {
  const match = ref.trim().match(/^(\d+)(?:-(\d+))?$/);
  if (!match) return null;
  const start = Number(match[1]);
  const end = match[2] ? Number(match[2]) : start;
  return { start, end };
}

export function getCatechismParagraphs(
  paragraphs: CatechismParagraph[],
  ref: string
): CatechismParagraph[] {
  const range = parseCatechismRef(ref);
  if (!range) return [];
  return paragraphs
    .filter((p) => p.number >= range.start && p.number <= range.end)
    .sort((a, b) => a.number - b.number);
}
