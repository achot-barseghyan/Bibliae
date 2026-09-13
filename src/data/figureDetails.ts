// Contenu éditorial enrichi pour les fiches de figures (biographie,
// chronologie, liens). Contrairement à data/figures.ts (métadonnées pour
// les 100+ figures), ce fichier n'est rempli qu'au fur et à mesure —
// seules les figures ayant une entrée ici affichent les sections
// Biographie / Chronologie / Que dit l'Église / Figures liées.

export interface Repere {
  label: string;
  value: string;
}

export type BiographySegment =
  | { type: 'text'; text: string }
  | { type: 'ref'; ref: ScriptureRef };

export interface ScriptureRef {
  bookId: string;
  chapter: number;
  verseStart: number;
  verseEnd?: number;
  display: string;
}

export interface TimelineEntry {
  dateLabel: string;
  text: string;
}

export interface RelatedFigure {
  figureId: string;
  relation: string;
}

export interface ChurchTeaching {
  text: string;
  // ids référençant data/councils.ts
  councilIds: string[];
}

export interface FigureDetail {
  alternateNames?: string;
  reperes?: Repere[];
  biography?: BiographySegment[][];
  timeline?: TimelineEntry[];
  regionLabel?: string;
  locationsSummary?: string;
  churchTeaching?: ChurchTeaching;
  relatedFigures?: RelatedFigure[];
}

function text(t: string): BiographySegment {
  return { type: 'text', text: t };
}

function ref(display: string, bookId: string, chapter: number, verseStart: number, verseEnd?: number): BiographySegment {
  return { type: 'ref', ref: { display, bookId, chapter, verseStart, verseEnd } };
}

export const figureDetails: Record<string, FigureDetail> = {
  jesus: {
    alternateNames: 'Yeshua bar Yosef · Ἰησοῦς Χριστός · Iesus Christus',
    reperes: [
      { label: 'Période', value: '1er siècle, Palestine romaine' },
      { label: 'Naissance', value: 'Bethléem, entre 7 et 4 av. J.-C.' },
      { label: 'Mort', value: "Jérusalem, vers l'an 30 ou 33" },
      { label: 'Tribu', value: 'Juda, lignée de David' },
      { label: 'Fête liturgique', value: 'Noël · Pâques' },
      {
        label: 'Prononciation',
        value: 'je-zü kri (français) · yeh-SHOO-ah (hébreu reconstitué)'
      },
      {
        label: 'Nom',
        value: "Jésus, du grec Iēsous, transcription de l'hébreu Yeshua, « YHWH sauve »"
      },
      {
        label: 'Titre',
        value: "Christ, du grec Christos, « l'Oint », traduction du messie hébreu Mashiach"
      },
      { label: 'Occurrences', value: '1200+ versets liés' }
    ],
    biography: [
      [
        text(
          "Jésus naît à Bethléem, en Judée, d'une mère vierge, Marie, épouse de Joseph le charpentier. Son enfance se déroule à Nazareth, en Galilée, dans une famille juive pratiquante."
        )
      ],
      [
        text(
          "Vers l'âge de trente ans, il reçoit le baptême de Jean au Jourdain, puis commence une prédication publique de trois ans environ "
        ),
        ref('Lc 3, 21-23', 'lc', 3, 21, 23),
        text(
          '. Il enseigne dans les synagogues, rassemble douze apôtres, et accomplit des guérisons et des miracles rapportés dans les quatre Évangiles.'
        )
      ],
      [
        text(
          'Arrêté à Jérusalem après la Cène, il est condamné et crucifié sous le préfet romain Ponce Pilate '
        ),
        ref('Mt 27, 11-26', 'mt', 27, 11, 26),
        text('. Les Évangiles rapportent sa résurrection le troisième jour, puis son ascension quarante jours plus tard '),
        ref('Ac 1, 9-11', 'ac', 1, 9, 11),
        text('.')
      ]
    ],
    timeline: [
      { dateLabel: 'Entre 7 et 4 av. J.-C.', text: "Naissance à Bethléem sous le règne d'Hérode le Grand." },
      { dateLabel: "Vers l'an 12", text: 'Jésus au Temple de Jérusalem parmi les docteurs de la Loi.' },
      {
        dateLabel: "Vers l'an 28",
        text: 'Baptême au Jourdain par Jean-Baptiste ; début de la vie publique.'
      },
      { dateLabel: '28 – 30', text: 'Prédication en Galilée, appel des douze apôtres, guérisons et miracles.' },
      { dateLabel: "An 30 ou 33", text: 'Passion, crucifixion et résurrection à Jérusalem.' }
    ],
    regionLabel: 'Galilée & Judée',
    locationsSummary:
      'Naissance à Bethléem, enfance à Nazareth, ministère public autour du lac de Galilée, mort et résurrection à Jérusalem.',
    churchTeaching: {
      text: "Le concile de Nicée (325) puis celui de Chalcédoine (451) confessent le Christ vrai Dieu et vrai homme, une seule personne en deux natures. Cette formulation demeure la référence commune des Églises catholique, orthodoxe et protestantes.",
      councilIds: ['nicee-325', 'chalcedoine-451']
    },
    relatedFigures: [
      { figureId: 'mary', relation: 'Mère' },
      { figureId: 'joseph-epoux-marie', relation: 'Père légal' },
      { figureId: 'david', relation: 'Ancêtre royal' },
      { figureId: 'jean-baptiste', relation: 'Précurseur' }
    ]
  }
};
