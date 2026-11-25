// Rubrique « Les documents de l'Église » (maquette « Église Mobile v3 ») :
// les 10 textes à connaître, avec leur fiche, leurs idées clés et le lien vers
// le texte intégral. Le résumé chapitre par chapitre est dans egliseDocumentsTexte.ts.

import type { RubriqueArgument } from './egliseTextes';

export interface DocumentChapter {
  /** Repère dans le document : « Prologue · § 1-25 ». */
  ref: string;
  title: string;
  /** Paragraphes ; « # » en tête marque un intertitre. */
  paras: string[];
}

export interface DocumentChapters {
  chapters: DocumentChapter[];
}

export interface EgliseDocument {
  id: string;
  title: string;
  desc: string;
  img: string;
  type: string;
  author: string;
  date: string;
  /** Traduction du titre latin, ou constitution de promulgation. */
  latin: string;
  url: string;
  lead: string;
  args: RubriqueArgument[];
}

const VAT = 'https://www.vatican.va/';

export const EGLISE_DOCUMENTS: EgliseDocument[] = [
  { id: 'catechisme', title: "Le Catéchisme de l'Église catholique", desc: 'La foi catholique en un seul livre · 1992', img: 'livre',
    type: 'Catéchisme', author: 'Promulgué par Jean-Paul II', date: '11 octobre 1992', latin: 'Constitution de promulgation : Fidei depositum', url: VAT + 'archive/FRA0013/_INDEX.HTM',
    lead: "Le résumé officiel de toute la foi catholique, en 2 865 paragraphes numérotés. C'est la référence de tous les autres textes de cette rubrique, et la source des renvois « CEC § » de l'app.",
    args: [
      { kind: 'Plan', title: 'Quatre parties pour toute la foi', body: "La foi que l'on croit (le Credo), la foi que l'on célèbre (les sacrements), la foi que l'on vit (les commandements) et la foi que l'on prie (le Notre Père).", src: 'CEC § 13-17' },
      { kind: 'Origine', title: 'Pourquoi un catéchisme ?', body: "Le synode des évêques de 1985, vingt ans après Vatican II, a demandé un exposé complet et sûr de la foi. Jean-Paul II le présente comme « une norme sûre pour l'enseignement de la foi ».", src: 'Fidei depositum, 1992' },
      { kind: 'Conseil de lecture', title: 'Par où commencer ?', body: "Les paragraphes se lisent séparément : cherche un thème dans l'index. Pour aller plus vite, l'Abrégé du Catéchisme (2005) résume tout en 598 questions et réponses.", src: 'Compendium du CEC, 2005' }
    ] },
  { id: 'dei-verbum', title: 'Dei Verbum', desc: 'La Parole de Dieu · Vatican II, 1965', img: 'rosace',
    type: 'Constitution dogmatique', author: 'Concile Vatican II', date: '18 novembre 1965', latin: '« La Parole de Dieu »', url: VAT + 'archive/hist_councils/ii_vatican_council/documents/vat-ii_const_19651118_dei-verbum_fr.html',
    lead: "Comment Dieu se fait connaître aux hommes, et comment sa Parole nous parvient : par l'Écriture et la Tradition, interprétées par l'Église.",
    args: [
      { kind: 'La Révélation', title: 'Dieu se fait connaître', body: "Dieu a voulu se révéler lui-même, par des actes et des paroles, tout au long de l'histoire du salut. Cette révélation atteint sa plénitude en Jésus Christ.", src: 'Dei Verbum 2-4' },
      { kind: 'Écriture et Tradition', title: 'Une seule source, deux canaux', body: "L'Écriture et la Tradition forment ensemble un unique dépôt de la Parole de Dieu. Le Magistère n'est pas au-dessus de cette Parole : il est à son service.", src: 'Dei Verbum 9-10' },
      { kind: 'La Bible', title: "Lire l'Écriture", body: 'Le Concile demande que tous les fidèles aient largement accès à la Bible et la lisent souvent.', quote: "L'ignorance des Écritures, c'est l'ignorance du Christ.", quoteRef: 'Saint Jérôme, cité par Dei Verbum 25', src: 'Dei Verbum 22-25' }
    ] },
  { id: 'lumen-gentium', title: 'Lumen Gentium', desc: "Ce qu'est l'Église · Vatican II, 1964", img: 'bougie',
    type: 'Constitution dogmatique', author: 'Concile Vatican II', date: '21 novembre 1964', latin: '« La lumière des peuples »', url: VAT + 'archive/hist_councils/ii_vatican_council/documents/vat-ii_const_19641121_lumen-gentium_fr.html',
    lead: "Le grand texte du Concile sur l'Église : ce qu'elle est, comment elle est organisée, la vocation de chaque baptisé et la place de Marie.",
    args: [
      { kind: "L'Église", title: 'Le peuple de Dieu', body: "L'Église est le peuple que Dieu rassemble dans le Christ. Tous les baptisés y partagent la même dignité, avant toute différence de fonction.", src: 'Lumen Gentium 9-13' },
      { kind: 'La vocation', title: 'Tous appelés à la sainteté', body: "La sainteté n'est pas réservée aux prêtres ou aux religieux. Chaque baptisé, quel que soit son état de vie, est appelé à la perfection de la charité.", src: 'Lumen Gentium 39-42' },
      { kind: "L'Eucharistie", title: 'Au cœur de la vie chrétienne', body: "Le Concile décrit le sacrifice eucharistique comme le centre de toute la vie de l'Église.", quote: 'Source et sommet de toute la vie chrétienne.', quoteRef: 'Lumen Gentium 11', src: 'Lumen Gentium 11' },
      { kind: 'Marie', title: "Mère de l'Église", body: "Le dernier chapitre présente Marie dans le mystère du Christ et de l'Église, comme modèle de foi pour tous les croyants.", src: 'Lumen Gentium, chapitre VIII' }
    ] },
  { id: 'sacrosanctum-concilium', title: 'Sacrosanctum Concilium', desc: 'La liturgie · Vatican II, 1963', img: 'croix',
    type: 'Constitution', author: 'Concile Vatican II', date: '4 décembre 1963', latin: '« Ce saint Concile »', url: VAT + 'archive/hist_councils/ii_vatican_council/documents/vat-ii_const_19631204_sacrosanctum-concilium_fr.html',
    lead: "Le premier texte voté par le Concile. Il réforme la liturgie pour que tous les fidèles prennent part à la messe au lieu d'y assister.",
    args: [
      { kind: 'La liturgie', title: 'Le sommet et la source', body: "Tout ce que fait l'Église converge vers la liturgie et en découle.", quote: "La liturgie est le sommet vers lequel tend l'action de l'Église, et en même temps la source d'où découle toute sa vertu.", quoteRef: 'Sacrosanctum Concilium 10', src: 'Sacrosanctum Concilium 10' },
      { kind: 'Les fidèles', title: 'Une participation active', body: 'Le Concile demande que tous les fidèles participent aux célébrations de façon « pleine, consciente et active ».', src: 'Sacrosanctum Concilium 14' },
      { kind: 'Les langues', title: 'Le latin et les langues de chaque pays', body: "Le latin reste la langue de la liturgie latine. Le Concile ouvre aussi une plus large place aux langues de chaque peuple, d'abord pour les lectures.", src: 'Sacrosanctum Concilium 36' }
    ] },
  { id: 'gaudium-et-spes', title: 'Gaudium et Spes', desc: "L'Église dans le monde · Vatican II, 1965", img: 'etagere',
    type: 'Constitution pastorale', author: 'Concile Vatican II', date: '7 décembre 1965', latin: "« La joie et l'espoir »", url: VAT + 'archive/hist_councils/ii_vatican_council/documents/vat-ii_const_19651207_gaudium-et-spes_fr.html',
    lead: "Le dernier grand texte du Concile. L'Église s'adresse à tous les hommes et regarde le monde moderne : la dignité humaine, la famille, l'économie, la politique et la paix.",
    args: [
      { kind: 'La solidarité', title: 'Les joies et les angoisses des hommes', body: "La première phrase du document dit dans quel esprit l'Église regarde le monde.", quote: 'Les joies et les espoirs, les tristesses et les angoisses des hommes de ce temps, des pauvres surtout et de tous ceux qui souffrent, sont aussi les joies et les espoirs, les tristesses et les angoisses des disciples du Christ.', quoteRef: 'Gaudium et Spes 1', src: 'Gaudium et Spes 1' },
      { kind: "L'homme", title: "Le Christ révèle l'homme à lui-même", body: "On ne comprend pleinement qui est l'homme qu'en regardant le Christ.", quote: "En réalité, le mystère de l'homme ne s'éclaire vraiment que dans le mystère du Verbe incarné.", quoteRef: 'Gaudium et Spes 22', src: 'Gaudium et Spes 22' },
      { kind: 'Les questions concrètes', title: 'Famille, travail, paix', body: 'La seconde partie traite du mariage et de la famille, de la culture, de la vie économique et sociale, de la vie politique et de la paix entre les nations.', src: 'Gaudium et Spes 46-90' }
    ] },
  { id: 'rerum-novarum', title: 'Rerum Novarum', desc: 'La question sociale · Léon XIII, 1891', img: 'parchemin',
    type: 'Encyclique', author: 'Léon XIII', date: '15 mai 1891', latin: '« Des choses nouvelles »', url: VAT + 'content/leo-xiii/fr/encyclicals/documents/hf_l-xiii_enc_15051891_rerum-novarum.html',
    lead: "Le premier grand texte de la doctrine sociale de l'Église, écrit face à la misère des ouvriers pendant la révolution industrielle.",
    args: [
      { kind: 'Le travail', title: 'Un salaire juste', body: "Le salaire doit permettre à l'ouvrier de vivre dignement. Un contrat accepté sous la pression de la misère n'est pas juste, même s'il a été signé.", src: 'Rerum Novarum' },
      { kind: 'Les ouvriers', title: "Le droit de s'associer", body: 'Les travailleurs ont le droit de former des associations pour défendre leurs intérêts. Léon XIII soutient la naissance des syndicats chrétiens.', src: 'Rerum Novarum' },
      { kind: "L'équilibre", title: 'Entre libéralisme et socialisme', body: "Léon XIII défend la propriété privée, mais rappelle qu'elle a des devoirs. Il demande à l'État de protéger les plus faibles.", src: 'Rerum Novarum' },
      { kind: 'La suite', title: 'Une longue descendance', body: "D'autres papes ont écrit pour ses anniversaires, notamment Pie XI avec Quadragesimo anno (1931) et Jean-Paul II avec Centesimus annus (1991).", src: "Compendium de la doctrine sociale de l'Église, 2004" }
    ] },
  { id: 'humanae-vitae', title: 'Humanae Vitae', desc: 'Le mariage et la vie · Paul VI, 1968', img: 'enluminure',
    type: 'Encyclique', author: 'Paul VI', date: '25 juillet 1968', latin: '« De la vie humaine »', url: VAT + 'content/paul-vi/fr/encyclicals/documents/hf_p-vi_enc_25071968_humanae-vitae.html',
    lead: "Paul VI y expose l'enseignement de l'Église sur l'amour conjugal et la transmission de la vie. C'est l'une des encycliques les plus discutées du XXe siècle.",
    args: [
      { kind: "L'amour conjugal", title: 'Un amour total', body: "L'amour des époux est pleinement humain, total, fidèle et exclusif, et fécond.", src: 'Humanae Vitae 9' },
      { kind: 'Le principe', title: 'Union et ouverture à la vie', body: "L'acte conjugal a deux significations inséparables : l'union des époux et l'ouverture à la vie. C'est pourquoi l'Église refuse la contraception artificielle.", src: 'Humanae Vitae 12-14' },
      { kind: 'La pratique', title: 'La paternité responsable', body: 'Pour des motifs sérieux, les époux peuvent espacer les naissances en respectant les rythmes naturels de la fécondité.', src: 'Humanae Vitae 10 et 16' }
    ] },
  { id: 'veritatis-splendor', title: 'Veritatis Splendor', desc: 'Les fondements de la morale · Jean-Paul II, 1993', img: 'plume',
    type: 'Encyclique', author: 'Jean-Paul II', date: '6 août 1993', latin: '« La splendeur de la vérité »', url: VAT + 'content/john-paul-ii/fr/encyclicals/documents/hf_jp-ii_enc_06081993_veritatis-splendor.html',
    lead: 'La première encyclique consacrée aux fondements de la morale chrétienne. Elle part de la question du jeune homme riche à Jésus : « Maître, que dois-je faire de bon ? » (Mt 19, 16).',
    args: [
      { kind: 'La liberté', title: 'Liberté et vérité', body: "La liberté ne consiste pas à faire n'importe quoi. Elle s'accomplit en choisissant le vrai bien.", src: 'Veritatis Splendor 31-35' },
      { kind: 'La conscience', title: 'Une conscience à former', body: "La conscience juge ce qu'il faut faire ici et maintenant. Elle doit être éclairée et formée, car elle peut se tromper.", src: 'Veritatis Splendor 54-64' },
      { kind: 'Les actes', title: 'Des actes toujours mauvais', body: "Certains actes sont mauvais en eux-mêmes, quelles que soient l'intention ou les circonstances, par exemple tuer volontairement un innocent.", src: 'Veritatis Splendor 80' }
    ] },
  { id: 'evangelium-vitae', title: 'Evangelium Vitae', desc: 'La valeur de la vie · Jean-Paul II, 1995', img: 'sceau',
    type: 'Encyclique', author: 'Jean-Paul II', date: '25 mars 1995', latin: "« L'Évangile de la vie »", url: VAT + 'content/john-paul-ii/fr/encyclicals/documents/hf_jp-ii_enc_25031995_evangelium-vitae.html',
    lead: 'Jean-Paul II défend la valeur de toute vie humaine, de la conception à la mort naturelle.',
    args: [
      { kind: 'Le message', title: "La vie au cœur de l'Évangile", body: "L'encyclique s'ouvre sur cette affirmation.", quote: "L'Évangile de la vie est au cœur du message de Jésus.", quoteRef: 'Evangelium Vitae 1', src: 'Evangelium Vitae 1' },
      { kind: 'Le constat', title: 'Une culture de mort', body: "Jean-Paul II dénonce l'avortement, l'euthanasie et les autres atteintes à la vie. Il appelle les chrétiens à bâtir une « culture de la vie ».", src: 'Evangelium Vitae 12 et 95' },
      { kind: 'La peine de mort', title: "Une évolution de l'enseignement", body: "L'encyclique limite fortement le recours à la peine de mort. En 2018, le pape François a modifié le Catéchisme pour la déclarer inadmissible.", src: 'Evangelium Vitae 56 · CEC § 2267' }
    ] },
  { id: 'fides-et-ratio', title: 'Fides et Ratio', desc: 'La foi et la raison · Jean-Paul II, 1998', img: 'livres',
    type: 'Encyclique', author: 'Jean-Paul II', date: '14 septembre 1998', latin: '« La foi et la raison »', url: VAT + 'content/john-paul-ii/fr/encyclicals/documents/hf_jp-ii_enc_14091998_fides-et-ratio.html',
    lead: "Croire et réfléchir ne s'opposent pas. Cette encyclique inspire la rubrique « La foi et la raison » de l'app.",
    args: [
      { kind: "L'image", title: 'Les deux ailes', body: "L'encyclique s'ouvre sur cette image devenue célèbre.", quote: "La foi et la raison sont comme les deux ailes qui permettent à l'esprit humain de s'élever vers la contemplation de la vérité.", quoteRef: 'Fides et Ratio, introduction', src: 'Fides et Ratio' },
      { kind: 'Le principe', title: 'Un seul Dieu, une seule vérité', body: 'La foi ne demande pas de renoncer à la raison. Les deux viennent du même Dieu et ne peuvent donc pas se contredire.', src: 'Fides et Ratio, chapitres II et III' },
      { kind: 'Un modèle', title: "Saint Thomas d'Aquin", body: "Jean-Paul II encourage les croyants à étudier la philosophie et propose saint Thomas d'Aquin comme modèle d'accord entre la foi et la raison.", src: 'Fides et Ratio 43-44' }
    ] }
];
