// Textes de la section Église (maquette « Église Mobile v3 »).

export interface RubriqueArgument {
  kind?: string;
  title: string;
  /** Étapes du raisonnement : [libellé éventuel, texte]. */
  steps?: [string, string][];
  body?: string;
  quote?: string;
  quoteRef?: string;
  concl?: string;
  friend?: string;
  src?: string;
}

export interface FoiRaisonChapter {
  short: string;
  glyph: string;
  title: string;
  lead: string;
  args: RubriqueArgument[];
}

/** La foi et la raison : 5 chapitres. */
export const FOI_RAISON: FoiRaisonChapter[] = [
  { short: "Dieu", glyph: "✹", title: "L'existence de Dieu",
    lead: "L'Église enseigne que l'on peut connaître Dieu avec certitude à partir du monde créé, par la seule raison. « Depuis la création du monde, on peut voir avec l'intelligence ce qu'il y a d'invisible en lui » (Rm 1, 20).",
    args: [
      { kind: "Argument philosophique", title: "La cause première",
        steps: [["", "Tout ce qui commence d'exister a une cause. Rien ne sort de rien."], ["", "Selon le modèle du Big Bang, proposé par le prêtre et physicien Georges Lemaître, l'univers a eu un commencement."], ["", "Une chaîne de causes ne peut pas remonter à l'infini sans point de départ."]],
        concl: "L'univers a une cause première, extérieure à l'espace, au temps et à la matière.",
        friend: "Si l'univers a commencé, quelque chose l'a fait commencer. Ce quelque chose ne peut pas faire partie de l'univers.",
        src: "Saint Thomas d'Aquin, Somme théologique I, q. 2, a. 3 · CEC § 32" },
      { kind: "Argument philosophique", title: "Pourquoi quelque chose plutôt que rien ?",
        steps: [["", "Chaque chose qui existe aurait pu ne pas exister : toi, la Terre, les étoiles."], ["", "Une chose qui aurait pu ne pas exister ne contient pas en elle-même la raison de son existence."], ["", "Additionner des choses qui ne s'expliquent pas elles-mêmes n'explique toujours rien."]],
        concl: "Il faut un être qui existe par lui-même, nécessairement. C'est ce que nous appelons Dieu.",
        friend: "Tout ce qu'on voit dépend d'autre chose pour exister. Au bout de la chaîne, il faut quelqu'un qui ne dépend de rien.",
        src: "Saint Thomas d'Aquin, troisième voie · G. W. Leibniz · CEC § 34" },
      { kind: "Argument de l'ordre", title: "Un univers réglé pour la vie",
        steps: [["", "Les lois de la physique et ses constantes permettent l'existence de la vie dans des marges très étroites."], ["", "Le monde est intelligible : il obéit à des lois que l'esprit humain peut comprendre et formuler en mathématiques."], ["", "Le hasard seul explique mal qu'un tel ordre existe et qu'il soit compréhensible."]],
        concl: "L'ordre du monde désigne une intelligence qui l'a ordonné.",
        friend: "La grandeur et la beauté des créatures font contempler, par analogie, celui qui les a créées.",
        src: "Sg 13, 5 · Saint Thomas d'Aquin, cinquième voie · CEC § 32" },
      { kind: "Argument de la conscience", title: "Le bien et le mal",
        steps: [["", "Chacun sait que certaines choses sont mal, comme torturer un enfant, quelles que soient l'époque ou la culture."], ["", "Une loi morale qui s'impose à tous ne vient pas d'une simple convention humaine."], ["", "L'homme entend en lui la voix de sa conscience, qui l'appelle au bien."]],
        concl: "Une loi morale universelle renvoie à un législateur qui en est la source.",
        friend: "Si le bien et le mal sont réels et pas seulement des opinions, il faut que quelqu'un en soit la mesure.",
        src: "CEC § 33 · CEC § 1776 · Rm 2, 14-15" }
    ] },
  { short: "Christianisme", glyph: "☧", title: "La vérité du christianisme",
    lead: "Le christianisme repose sur un fait : Jésus de Nazareth est mort et ressuscité. Saint Paul le dit sans détour : « si le Christ n'est pas ressuscité, votre foi est sans valeur » (1 Co 15, 17).",
    args: [
      { kind: "Sources non chrétiennes", title: "Jésus a existé : ce qu'en disent les historiens antiques",
        steps: [["Tacite · vers 116", "Historien romain hostile aux chrétiens. Il écrit que leur nom vient de « Christ », exécuté sous Tibère par le procurateur Ponce Pilate."], ["Flavius Josèphe · vers 93", "Historien juif. Il mentionne Jésus et parle de « Jacques, frère de Jésus appelé Christ »."], ["Pline le Jeune · vers 112", "Gouverneur romain. Il décrit à l'empereur Trajan des chrétiens qui chantent un hymne « au Christ comme à un dieu »."]],
        concl: "L'existence de Jésus est attestée par des auteurs qui n'avaient aucun intérêt à la défendre.",
        friend: "Même des historiens romains qui méprisaient les chrétiens parlent de Jésus et de sa crucifixion sous Pilate.",
        src: "Tacite, Annales XV, 44 · Josèphe, Antiquités juives XVIII, 63 et XX, 200 · Pline, Lettres X, 96" },
      { kind: "Sources chrétiennes", title: "Des textes proches des événements",
        steps: [["Années 50", "Les lettres de saint Paul sont écrites une vingtaine d'années après la mort de Jésus."], ["Avant Paul", "En 1 Co 15, 3-8, Paul cite un credo qu'il dit avoir lui-même reçu, ce qui le fait remonter plus tôt encore."], ["Vers 65 à 100", "Les quatre Évangiles sont rédigés alors que des témoins oculaires sont encore vivants."], ["Les manuscrits", "On conserve plus de 5 800 manuscrits grecs du Nouveau Testament, et près de 24 000 en comptant les traductions anciennes. L'Iliade d'Homère, l'œuvre antique la mieux conservée après lui, en compte moins de 2 000. Pour la plupart des auteurs antiques, on n'en a que quelques dizaines."], ["Le plus ancien", "Le papyrus P52, un fragment de l'Évangile selon saint Jean, date de la première moitié du IIe siècle, quelques décennies seulement après la rédaction du texte."]],
        concl: "Aucun personnage de l'Antiquité n'est connu par des textes aussi proches des faits ni par autant de manuscrits que Jésus.",
        friend: "Si l'on doute de ce qu'on sait sur Jésus, il faut douter encore plus de tout ce qu'on sait sur Jules César ou sur Homère.",
        src: "1 Co 15, 3-8 · Lc 1, 1-4 · CEC § 126 · Papyrus P52, John Rylands Library, Manchester" },
      { kind: "La résurrection", title: "Ce qui s'est passé après la croix",
        steps: [["Le tombeau vide", "Des femmes trouvent le tombeau vide. Les adversaires ne le contestent pas : ils disent que les disciples ont volé le corps (Mt 28, 11-15)."], ["Les apparitions", "Jésus apparaît à Pierre, aux Douze, puis à plus de cinq cents frères à la fois, dont la plupart vivent encore quand Paul écrit (1 Co 15, 6)."], ["Des disciples transformés", "Des hommes qui s'étaient enfuis et cachés annoncent publiquement la résurrection, au prix de la prison et de la mort."], ["Des adversaires convertis", "Paul, qui persécutait les chrétiens, devient apôtre après avoir rencontré le Ressuscité (Ac 9)."]],
        concl: "La résurrection est l'explication qui rend compte de tous ces faits à la fois.",
        friend: "Les apôtres ont donné leur vie pour dire qu'ils l'avaient vu vivant. On ne meurt pas pour ce qu'on sait être un mensonge.",
        src: "CEC § 639-644 · 1 Co 15, 3-8 · Ac 9, 1-19" },
      { kind: "La résurrection", title: "Et si c'était autre chose ?",
        steps: [["Le corps a été volé", "Les disciples auraient alors donné leur vie pour un mensonge qu'ils savaient faux."], ["Des hallucinations", "Une hallucination est individuelle. Jésus est apparu à des groupes, et le tombeau restait vide."], ["Il n'était pas mort", "Les soldats romains savaient exécuter. L'Évangile rapporte qu'un soldat lui a percé le côté (Jn 19, 34)."]],
        concl: "Aucune de ces hypothèses n'explique l'ensemble des faits.",
        friend: "Chaque explication alternative résout un problème et en crée deux autres.",
        src: "CEC § 643-644 · Jn 19, 33-35" },
      { kind: "Ses paroles", title: "Ce que Jésus a dit de lui-même",
        steps: [["Jn 8, 58", "« Avant qu'Abraham fût, moi, JE SUIS. » Il reprend le nom que Dieu révèle à Moïse (Ex 3, 14)."], ["Jn 10, 30", "« Le Père et moi, nous sommes UN. » Ses auditeurs veulent le lapider parce qu'il se fait Dieu."], ["Mc 2, 5-7", "Il pardonne les péchés. Les scribes réagissent : « Qui donc peut pardonner les péchés, sinon Dieu seul ? »"]],
        concl: "Jésus s'est attribué ce qui n'appartient qu'à Dieu.",
        friend: "Jésus n'a pas dit seulement « Dieu vous aime ». Il a dit « Je suis », et il a pardonné les péchés à la place de Dieu.",
        src: "Jn 8, 58 · Jn 10, 30-33 · Mc 2, 5-12 · Mc 14, 61-62" },
      { kind: "Le raisonnement", title: "Menteur, fou ou Seigneur",
        steps: [["Menteur ?", "S'il savait qu'il n'était pas Dieu, il a trompé ses disciples jusqu'à les envoyer à la mort. Cela contredit tout son enseignement."], ["Fou ?", "S'il se croyait Dieu à tort, il était gravement dérangé. Sa sagesse et sa maîtrise face à ses juges disent l'inverse."], ["Seigneur", "Reste la troisième possibilité : il disait vrai."]],
        concl: "On ne peut pas faire de Jésus seulement un grand sage. Ce qu'il a dit de lui interdit cette option.",
        friend: "Un homme qui se dit Dieu n'est pas un simple sage. Soit il ment, soit il délire, soit il dit vrai.",
        src: "C. S. Lewis, Les Fondements du christianisme, 1952" }
    ] },
  { short: "Catholicisme", glyph: "⚷", title: "La vérité du catholicisme",
    lead: "Jésus n'a pas écrit de livre. Il a fondé une Église, l'a confiée aux apôtres et a placé Pierre à leur tête. L'Église catholique se reconnaît comme cette Église, gardée sans interruption depuis les apôtres.",
    args: [
      { kind: "L'Écriture", title: "Pierre, le roc choisi par Jésus",
        steps: [["Mt 16, 18-19", "« Tu es Pierre, et sur cette pierre je bâtirai mon Église. Je te donnerai les clés du Royaume des cieux. »"], ["Lc 22, 32", "« J'ai prié pour toi, afin que ta foi ne défaille pas. Toi, affermis tes frères. »"], ["Jn 21, 15-17", "Après la résurrection, Jésus lui confie trois fois : « Sois le pasteur de mes brebis. »"]],
        concl: "Jésus a confié à Pierre une charge unique : garder l'unité de son Église.",
        friend: "Jésus a donné les clés à un seul apôtre. Une maison a besoin de quelqu'un qui en garde les clés.",
        src: "CEC § 552-553 · CEC § 881" },
      { kind: "L'histoire", title: "Une chaîne jamais rompue",
        steps: [["Vers 96", "Clément, évêque de Rome, écrit aux chrétiens de Corinthe pour régler un conflit. Il le fait avec autorité, alors que l'apôtre Jean vit encore."], ["Vers 180", "Saint Irénée de Lyon donne la liste des évêques de Rome depuis Pierre. Il écrit que toute Église doit s'accorder avec celle de Rome."], ["Aujourd'hui", "Le pape Léon XIV, élu en mai 2025, est le 267e évêque de Rome depuis saint Pierre."]],
        concl: "L'Église catholique est reliée aux apôtres par une succession continue d'évêques, unis autour du successeur de Pierre.",
        friend: "On peut remonter la liste des papes, nom après nom, jusqu'à Pierre.",
        src: "Clément de Rome, Lettre aux Corinthiens · Irénée, Contre les hérésies III, 3 · CEC § 77, 861-862" },
      { kind: "Les premiers chrétiens", title: "Ils croyaient déjà ce que croient les catholiques",
        steps: [["Ignace d'Antioche · vers 110", "Il écrit que l'Eucharistie est « la chair de notre Sauveur Jésus-Christ ». Il est le premier à employer l'expression « Église catholique »."], ["Justin · vers 155", "Il décrit la messe du dimanche : lectures, homélie, prière, pain et vin consacrés, communion."], ["Les martyrs", "Ces témoins des premiers siècles sont morts pour cette foi, celle que l'Église catholique professe toujours."]],
        concl: "La foi catholique d'aujourd'hui est celle des premiers chrétiens, disciples directs des apôtres.",
        friend: "Les chrétiens de l'an 100 croyaient déjà à la présence réelle du Christ dans l'Eucharistie et parlaient d'Église catholique.",
        src: "Ignace, Lettre aux Smyrniotes 7-8 · Justin, Première Apologie 65-67 · CEC § 1345" },
      { kind: "La Bible", title: "Qui a donné la Bible ?",
        steps: [["", "Le Nouveau Testament ne contient pas la liste de ses propres livres."], ["", "Ce sont des évêques réunis en conciles, à Hippone en 393 et à Carthage en 397, qui ont fixé la liste des 27 livres."], ["", "Jésus a promis à ses apôtres l'Esprit qui les conduirait dans la vérité tout entière (Jn 16, 13)."]],
        concl: "Accepter la Bible, c'est faire confiance à l'Église qui l'a reconnue et transmise.",
        friend: "La Bible n'est pas tombée du ciel reliée. C'est l'Église qui a choisi quels livres en font partie.",
        src: "CEC § 120 · 1 Tm 3, 15 · Jn 16, 13" }
    ] },
  { short: "Objections", glyph: "⚖︎", title: "Répondre aux objections",
    lead: "« Soyez toujours prêts à rendre raison de l'espérance qui est en vous, avec douceur et respect » (1 P 3, 15). Voici les critiques les plus fréquentes et la réponse de l'Église.",
    args: [
      { kind: "Science", title: "« La science a prouvé que Dieu n'existe pas. »", body: "La science étudie comment fonctionne l'univers. Elle ne dit pas pourquoi il existe. La théorie du Big Bang a été proposée par un prêtre, Georges Lemaître, et la génétique fondée par un moine, Gregor Mendel. L'Église enseigne que la foi et la raison ne peuvent pas se contredire, car elles viennent du même Dieu.", src: "CEC § 159 · Jean-Paul II, Fides et ratio" },
      { kind: "Le mal", title: "« Si Dieu existe, pourquoi le mal ? »", body: "Dieu n'est pas la cause du mal. Il a créé des êtres libres, capables d'aimer, donc aussi de refuser. Il ne regarde pas la souffrance de loin : en Jésus, il l'a traversée jusqu'à la croix, et il en tire un plus grand bien, la résurrection.", src: "CEC § 309-314" },
      { kind: "La Bible", title: "« Les Évangiles ont été inventés ou modifiés. »", body: "Ils ont été rédigés quelques décennies après les faits, quand des témoins vivaient encore. On conserve plus de 5 800 manuscrits grecs du Nouveau Testament, bien plus que pour tout autre texte de l'Antiquité. Leur comparaison permet de vérifier que le texte n'a pas été changé sur le fond.", src: "Lc 1, 1-4 · CEC § 126" },
      { kind: "Jésus", title: "« Jésus était juste un grand sage. »", body: "Un sage ne prétend pas être Dieu ni pardonner les péchés. Ce que Jésus a dit de lui-même oblige à choisir : soit il mentait, soit il se trompait gravement, soit il disait vrai.", src: "Voir chapitre 2" },
      { kind: "Marie et les saints", title: "« Les catholiques adorent Marie et les saints. »", body: "Non. L'adoration est réservée à Dieu seul. Les catholiques honorent Marie et les saints et leur demandent de prier pour eux, comme on demande à un ami de prier pour soi.", src: "CEC § 971 · CEC § 2132 · Jc 5, 16" },
      { kind: "Le pape", title: "« Le pape se croit infaillible en tout. »", body: "L'infaillibilité ne concerne que les définitions solennelles sur la foi et la morale. Elle a servi deux fois de façon solennelle : pour l'Immaculée Conception en 1854 et pour l'Assomption en 1950. Dans ses opinions personnelles, le pape peut se tromper comme tout le monde.", src: "Concile Vatican I, 1870 · CEC § 891" },
      { kind: "La confession", title: "« Pourquoi avouer ses péchés à un prêtre ? »", body: "Jésus a donné ce pouvoir aux apôtres : « Ceux à qui vous remettrez ses péchés, ils leur seront remis » (Jn 20, 23). Le prêtre agit au nom du Christ. Il est tenu à un secret absolu, sans aucune exception.", src: "CEC § 1461 · CEC § 1467" },
      { kind: "L'histoire", title: "« Croisades, Inquisition : l'Église a du sang sur les mains. »", body: "Des catholiques, y compris des responsables, ont commis de graves fautes. L'Église les reconnaît : le 12 mars 2000, Jean-Paul II a demandé pardon publiquement pour les péchés commis par des chrétiens au cours de l'histoire. Les fautes des membres ne rendent pas fausse la doctrine du Christ, qui les condamne.", src: "Jean-Paul II, Journée du pardon, 12 mars 2000" },
      { kind: "Les abus", title: "« Les scandales d'abus prouvent que l'Église est fausse. »", body: "Ces crimes sont réels et graves. En France, le rapport de la CIASE (2021) estime à 216 000 le nombre de mineurs victimes de clercs depuis 1950, et les évêques ont reconnu la responsabilité de l'institution. Ces actes trahissent l'enseignement de l'Église. Ils ne le réfutent pas. Jésus lui-même condamne durement ceux qui font tomber les petits :",
        quote: "Celui qui est un scandale, une occasion de chute, pour un seul de ces petits qui croient en moi, il est préférable pour lui qu'on lui accroche au cou une de ces meules que tournent les ânes, et qu'il soit englouti en pleine mer.", quoteRef: "Évangile selon saint Matthieu 18, 6", src: "Rapport de la CIASE, octobre 2021 · Mt 18, 6" },
      { kind: "Les religions", title: "« Toutes les religions se valent. »", body: "Les religions se contredisent sur des points précis : Jésus est-il Dieu ? est-il ressuscité ? Elles ne peuvent pas toutes avoir raison sur ces points. L'Église reconnaît ce qui est vrai et saint dans les autres religions, et annonce le Christ, qui est « le chemin, la vérité et la vie » (Jn 14, 6).", src: "Concile Vatican II, Nostra aetate 2 · CEC § 843" },
      { kind: "La foi", title: "« Tu crois parce qu'on t'a élevé comme ça. »", body: "La façon dont on reçoit une conviction ne dit rien de sa vérité. C'est justement pourquoi il vaut la peine d'examiner les raisons de croire, pour que la foi reçue devienne une foi personnelle.", src: "CEC § 154-155 · 1 P 3, 15" }
    ] },
  { short: "Miracles", glyph: "✺", title: "Les miracles",
    lead: "Un miracle est un signe que Dieu donne pour confirmer sa parole. L'Église ne reconnaît un miracle qu'après une enquête longue, médicale et scientifique, et elle en rejette la très grande majorité.",
    args: [
      { kind: "Évangiles", title: "Les miracles de Jésus",
        steps: [["Les Évangiles", "Ils rapportent des guérisons, des multiplications de pains et des résurrections, faites devant des foules."], ["Flavius Josèphe", "Cet historien juif présente Jésus comme un homme qui accomplissait « des œuvres extraordinaires »."], ["Ses adversaires", "Ils ne nient pas ses miracles. Ils l'accusent de les faire par le pouvoir du démon (Mc 3, 22)."]],
        concl: "Même ceux qui rejetaient Jésus reconnaissaient qu'il faisait des choses inexplicables.",
        src: "Josèphe, Antiquités juives XVIII, 63 · Mc 3, 22 · CEC § 547-548" },
      { kind: "Guérisons", title: "Les guérisons de Lourdes",
        steps: [["Depuis 1858", "Après les apparitions de la Vierge à Bernadette Soubirous, des milliers de guérisons sont déclarées au sanctuaire."], ["Le Bureau médical", "Fondé en 1883, il examine chaque dossier avec des médecins, croyants ou non. Un comité médical international vérifie ensuite que la guérison est complète, durable et inexplicable par la médecine."], ["72 miracles", "Sur des milliers de dossiers, l'Église n'en a reconnu que 72. Le 70e, en 2018, est sœur Bernadette Moriau, guérie d'une paralysie après 40 ans de maladie."]],
        concl: "La sévérité des critères donne du poids à chaque miracle reconnu.",
        friend: "À Lourdes, des médecins non croyants examinent les dossiers. Sur plus de 7 000 guérisons déclarées, seules 72 sont reconnues comme miracles.",
        src: "Sanctuaire Notre-Dame de Lourdes · Comité médical international de Lourdes" },
      { kind: "Phénomène public", title: "Le soleil de Fatima",
        steps: [["13 octobre 1917", "Près de 70 000 personnes réunies à Fatima, au Portugal, voient le soleil tourner et changer de couleur. Trois enfants l'avaient annoncé trois mois plus tôt."], ["Un témoin hostile", "Le journaliste Avelino de Almeida, du journal anticlérical O Século, en publie le récit en première page."], ["1930", "Après enquête, l'évêque de Leiria déclare les apparitions dignes de foi."]],
        concl: "Un phénomène annoncé à l'avance et vu par des dizaines de milliers de témoins, y compris des sceptiques.",
        src: "O Século, 15 octobre 1917 · Évêché de Leiria-Fatima, 1930" },
      { kind: "Image miraculeuse", title: "Le manteau de Guadalupe",
        steps: [["1531", "Au Mexique, la Vierge apparaît à un Indien, Juan Diego. Son image s'imprime sur son manteau, la tilma."], ["Un tissu fragile", "La tilma est faite de fibres d'agave, qui se dégradent en quelques décennies. Elle est toujours intacte, près de 500 ans plus tard."], ["Une conversion", "Dans les années qui suivent, des millions d'Indiens du Mexique demandent le baptême."]],
        concl: "L'image et sa conservation restent sans explication naturelle.",
        src: "Basilique Notre-Dame de Guadalupe, Mexico · Juan Diego canonisé en 2002" },
      { kind: "Eucharistie", title: "Le miracle eucharistique de Lanciano",
        steps: [["VIIIe siècle", "En Italie, un moine doute de la présence réelle. Pendant la messe, l'hostie devient chair et le vin devient sang."], ["1970-1971", "Le professeur Odoardo Linoli analyse les reliques. Il identifie du tissu de muscle cardiaque humain et du sang du groupe AB."], ["Aujourd'hui", "Les reliques sont toujours exposées dans l'église Saint-François de Lanciano."]],
        concl: "Ce signe confirme ce que l'Église enseigne : le Christ est réellement présent dans l'Eucharistie.",
        src: "Sanctuaire du Miracle eucharistique de Lanciano · CEC § 1374" },
      { kind: "Les saints", title: "Les miracles pour devenir saint",
        steps: [["La règle", "Pour déclarer quelqu'un saint, l'Église demande en général deux miracles obtenus par sa prière, un pour la béatification et un pour la canonisation."], ["L'enquête", "Une commission de médecins examine chaque guérison au Dicastère pour les causes des saints, à Rome."], ["Le critère", "La guérison doit être rapide, complète, durable et sans explication médicale."]],
        concl: "Chaque canonisation repose sur des faits examinés par des experts.",
        src: "Jean-Paul II, Divinus perfectionis Magister, 1983" }
    ] }
];

/** Par où commencer : [numéro, titre, résumé, lien de la maquette]. */
export const STARTER_STEPS_RAW: [string, string, string, string][] = [
  ["I", "Qui est Dieu ?", "Un seul Dieu en trois personnes, le Père, le Fils et le Saint-Esprit.", "#"],
  ["II", "Qui est Jésus-Christ ?", "Vrai Dieu et vrai homme, né de la Vierge Marie, mort et ressuscité.", "Fiche Jesus v2.dc.html"],
  ["III", "Qu'est-ce que l'Église ?", "La communauté fondée par le Christ, guidée par les apôtres et leurs successeurs.", "#"],
  ["IV", "Comment vivre sa foi ?", "La prière, les sacrements et la vie quotidienne d'un catholique.", "#"]
];

/** Questions de base : [question, réponse, référence au Catéchisme]. */
export const FAQ_BASES: [string, string, string][] = [
  ["C'est quoi la Trinité ?", "Un seul Dieu qui existe en trois personnes distinctes, le Père, le Fils et le Saint-Esprit, unis dans une seule nature divine.", "Catéchisme, § 232-267"],
  ["Pourquoi Jésus est mort sur la croix ?", "Pour racheter les péchés de l'humanité et ouvrir le chemin vers la vie éternelle, par amour.", "Catéchisme, § 599-618"],
  ["C'est quoi un sacrement ?", "Un signe concret institué par le Christ, comme le baptême ou l'Eucharistie, qui donne réellement la grâce de Dieu.", "Catéchisme, § 1131"],
  ["Faut-il être baptisé pour croire ?", "On peut croire avant d'être baptisé. Le baptême est le sacrement qui fait officiellement entrer dans l'Église.", "Catéchisme, § 1213-1216"],
  ["Comment prier quand on débute ?", "En parlant à Dieu simplement, avec ses propres mots, ou en s'appuyant sur des prières comme le Notre Père.", "Catéchisme, § 2559-2565"],
  ["Que se passe-t-il après la mort ?", "L'Église enseigne la résurrection des corps et la vie éternelle, promise à ceux qui vivent dans l'amour de Dieu.", "Catéchisme, § 988-1016"]
];

/** Questions pratiques : [question, réponse]. */
export const FAQ_PRATIQUES: [string, string][] = [
  ["Je ne suis pas baptisé, puis-je quand même aller à la messe ?", "Oui, tout le monde est le bienvenu à la messe. Seule la communion est réservée aux catholiques baptisés."],
  ["Comment se déroule une messe, concrètement ?", "Elle suit toujours la même structure : accueil, lectures bibliques, homélie, prière eucharistique, communion, envoi."],
  ["Je n'ai jamais lu la Bible, par où commencer ?", "L'Évangile selon saint Marc est conseillé en premier, car il est court et direct."],
  ["Dois-je tout comprendre avant de croire ?", "Non. La foi grandit avec le temps et les questions. Beaucoup de croyants continuent d'apprendre toute leur vie."]
];

/** Chemin vers le baptême : [étape, titre, texte, position sur l'arc en degrés]. */
export const CHEMIN_BAPTEME: [string, string, string, number][] = [
  ["Étape 1", "Entrée en Église", "Premier accueil dans la communauté, à l'automne en général.", 18],
  ["Étape 2", "Temps de formation", "Rencontres régulières pour découvrir la foi, la Bible et la vie de l'Église.", 66],
  ["Étape 3", "Appel décisif", "Au début du Carême, l'évêque appelle officiellement les catéchumènes au baptême.", 114],
  ["Étape 4", "Baptême à Pâques", "Le baptême est célébré lors de la veillée pascale, avec la première communion et la confirmation.", 162]
];
