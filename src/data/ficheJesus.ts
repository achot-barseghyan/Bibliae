// Textes de la page Jésus de la section Église (maquette « Fiche Jesus v2 »).

export interface JesusParole {
  kind: string;
  title: string;
  quote: string;
  body: string;
  src: string;
}

export interface JesusPart {
  title: string;
  desc: string;
  /** Image dans public/assets/eglise/, sans extension. */
  img: string;
  paras: string[];
  refs?: string[];
  args?: JesusParole[];
}

export const JESUS_PARTS: JesusPart[] = [
  { title: "Un homme, vraiment", desc: "Né, a grandi, a vécu parmi nous", img: "comprendre/jesus",
    paras: ["Jésus a vécu il y a environ deux mille ans, en Galilée puis en Judée. Il est né d'une mère, Marie, a grandi dans une famille, a appris un métier, a eu des amis.",
      "Sur ce point, les historiens, croyants ou non, sont d'accord : Jésus de Nazareth a réellement existé. Des auteurs romains et juifs du Ier et du IIe siècle en parlent."],
    refs: ["Lc 2, 51-52", "Tacite, Annales XV, 44"] },
  { title: "Mais aussi Dieu, vraiment", desc: "Ce que la foi chrétienne dit d'unique", img: "comprendre/dieu",
    paras: ["L'Église enseigne que Jésus n'est pas seulement un grand homme ou un bon enseignant. Il est Dieu lui-même, venu vivre une vie humaine, sans cesser d'être Dieu.",
      "Cette idée peut sembler difficile à comprendre d'un coup. Elle l'a toujours été. L'important, au début, est de comprendre ce que ça change : en Jésus, Dieu s'est rendu proche, visible, touchable."],
    refs: ["Jn 1, 14", "CEC § 464-469"] },
  { title: "Ce qu'il a fait", desc: "Trois ans sur les routes de Galilée", img: "personnes/jesus",
    paras: ["Pendant environ trois ans, Jésus a parcouru la Galilée et la Judée. Il a guéri des malades, mangé avec des gens rejetés par la société, et enseigné avec des histoires simples appelées paraboles.",
      "Il a aussi dérangé. Ses paroles et ses actes ont fini par lui coûter la vie : il a été arrêté, jugé, puis exécuté sur une croix à Jérusalem."],
    refs: ["Mc 1, 14-15", "Lc 15, 1-2"] },
  { title: "Ce qu'il a dit", desc: "4 paroles à connaître", img: "comprendre/questions",
    paras: ["Jésus n'a rien écrit. Ses paroles ont été transmises par ses disciples, puis mises par écrit dans les Évangiles. Voici quatre passages pour commencer."],
    args: [
      { kind: "Le cœur de la morale", title: "Le grand commandement", quote: "Tu aimeras le Seigneur ton Dieu de tout ton cœur, de toute ton âme et de tout ton esprit. Et tu aimeras ton prochain comme toi-même.", body: "Jésus résume toute la Loi en deux commandements inséparables : aimer Dieu et aimer les autres.", src: "Mt 22, 37-39" },
      { kind: "Le chemin du bonheur", title: "Les Béatitudes", quote: "Heureux les pauvres de cœur, car le royaume des Cieux est à eux.", body: "Au début du Sermon sur la montagne, Jésus déclare heureux ceux que le monde oublie : les doux, les affligés, les miséricordieux, les artisans de paix.", src: "Mt 5, 1-12" },
      { kind: "La prière", title: "Le Notre Père", quote: "Notre Père, qui es aux cieux, que ton nom soit sanctifié.", body: "Quand ses disciples lui demandent comment prier, Jésus leur donne cette prière. Elle est récitée à chaque messe depuis les premiers siècles.", src: "Mt 6, 9-13" },
      { kind: "Le pardon", title: "Le fils prodigue", quote: "Il était perdu, et il est retrouvé.", body: "Un fils dilapide l'héritage de son père puis revient, honteux. Le père court vers lui et fait la fête. Jésus montre ainsi comment Dieu accueille celui qui revient.", src: "Lc 15, 11-32" }
    ] },
  { title: "Sa mort et sa résurrection", desc: "Pourquoi la croix n'est pas la fin", img: "foi-raison/christianisme",
    paras: ["Trois jours après sa mort, selon les témoignages des premiers chrétiens, Jésus est ressuscité. Pas revenu comme un fantôme ou un souvenir, mais vivant, dans un corps réel, vu et touché par ses proches.",
      "Pour l'Église, cet événement change tout. Il montre que la mort n'a pas le dernier mot, et que ce que Jésus promettait, la vie éternelle, est possible."],
    refs: ["Lc 24, 36-43", "1 Co 15, 3-8", "CEC § 638-655"] },
  { title: "Pourquoi ça compte aujourd'hui", desc: "Un Christ vivant et accessible", img: "comprendre/vivre",
    paras: ["Croire en Jésus, ce n'est pas seulement croire des faits sur le passé. C'est croire qu'il est vivant aujourd'hui, et qu'il reste accessible : dans la prière, dans les sacrements, et dans la vie de l'Église qu'il a fondée."],
    refs: ["Mt 28, 20", "CEC § 1084"] }
];
