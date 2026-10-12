import rawEvents from './events/index.json';
import type { FeastId } from '../services/liturgicalFeasts';

// Grands épisodes de l'Écriture (onglet Événements). La liste vit dans
// events/index.json, versionné avec l'app ; les illustrations sont dans
// src/assets/events et référencées par leur chemin relatif à ce dossier.

export type EventPeriod = 'Ancien Testament' | 'Nouveau Testament';

export interface EventCardStyle {
  /** Chemin dans src/assets/events, ou null : carte à chiffre romain. */
  image: string | null;
  /** Fond (couleur ou dégradé), utilisé sans illustration. */
  bg: string;
  numeral: string;
  /** Couleur du halo animé. */
  glow: string;
  /** Couleur du titre. */
  ink: string;
  /** Couleur de la période. */
  kicker: string;
  /** Couleur du dégradé bas, derrière le titre. */
  fade: string;
}

export interface BibleEvent {
  id: string;
  title: string;
  /** Libellé sous la frise. */
  short: string;
  refs: string;
  period: EventPeriod;
  order: number;
  /** Position sur la frise, en % (0–100). */
  timelineX: number;
  feast: FeastId | null;
  /** Nombre de tableaux de la fiche (affiché sur le bouton). */
  tableaux: number | null;
  /** La fiche existe. */
  published: boolean;
  card: EventCardStyle;
}

/** Séparation Ancien / Nouveau Testament sur la frise, en %. */
export const TESTAMENT_SPLIT_X = 38;

const IMAGES = import.meta.glob<string>('../assets/events/**/*.webp', {
  eager: true,
  import: 'default'
});

/** URL bundlée d'une illustration de src/assets/events. */
export function eventImageUrl(path: string | null): string | null {
  return path ? (IMAGES[`../assets/events/${path}`] ?? null) : null;
}

export const EVENTS: BibleEvent[] = (rawEvents as BibleEvent[]).slice().sort((a, b) => a.order - b.order);

/** Route de la fiche d'un événement. */
export const eventPath = (id: string) => `/evenements/${id}`;

// --- Fiche d'un événement (events/<id>.json) ---

export interface VerseRef {
  bookId: string;
  chapter: number;
  verseStart: number;
  verseEnd: number;
}

export type LayerEnter = 'left' | 'right' | 'up' | 'float';

/** Illustration posée dans un tableau ; position et taille en % du cadre. */
export interface EventLayer {
  asset: string;
  alt: string;
  x: number;
  y: number;
  w: number;
  h: number;
  opacity: number;
  enter: LayerEnter;
  /** Délai d'entrée, en ms. */
  delay: number;
  /** Image retournée horizontalement (l'âne de la crèche). */
  flip?: boolean;
}

export interface Tableau {
  numeral: string;
  place: string;
  title: string;
  /** Citation exacte (Bible Crampon) : un ou deux versets du passage. */
  quote: string;
  /** Passage complet, ouvert par la pastille de référence. */
  ref: VerseRef;
  layers: EventLayer[];
  /** Deux couleurs du halo derrière les illustrations. */
  glow: [string, string];
  /** Côté du chiffre romain. */
  side: 'left' | 'right';
}

export interface Chorus {
  label: string;
  quote: string;
  ref: VerseRef;
  asset: string;
}

export interface EventCharacter {
  name: string;
  role: string;
  asset: string;
  /** Point de l'image (en %) centré dans le médaillon, et grossissement. */
  crop: { x: number; y: number; scale: number };
  /** Fiche Figure ouverte au toucher. */
  personId?: string;
}

export interface EventRoute {
  from: { name: string; region: string };
  to: { name: string; region: string };
  /** Tracé SVG, dans un repère de 300 × 200. */
  path: string;
  walker: string;
  caption: string;
}

export interface EventScene {
  title: string;
  subtitle: string;
  layers: EventLayer[];
  quote: string;
  ref: VerseRef;
}

export interface EventDetail {
  id: string;
  title: string;
  kicker: string;
  refs: string;
  /** Illustration de l'en-tête et position (en %) des deux halos animés. */
  hero: { asset: string; star: { x: number; y: number }; warm: { x: number; y: number } };
  facts: { label: string; value: string }[];
  tableaux: Tableau[];
  chorus: Chorus | null;
  /** Index (à partir de 0) du tableau après lequel insérer le chorus. */
  chorusAfter: number;
  characters: EventCharacter[];
  route: EventRoute | null;
  scene: EventScene | null;
  liturgy: { day: number; month: number; label: string; highlight: boolean }[];
}

const DETAILS = import.meta.glob<EventDetail>(['./events/*.json', '!./events/index.json'], {
  eager: true,
  import: 'default'
});

export function getEventDetail(id: string): EventDetail | null {
  return DETAILS[`./events/${id}.json`] ?? null;
}

/** Transition de la carte de la liste vers l'en-tête de la fiche : position
 * de la carte à l'écran au moment du toucher, lue une fois par la fiche. */
let pendingCardRect: { id: string; rect: DOMRect } | null = null;

export function setEventCardRect(id: string, rect: DOMRect) {
  pendingCardRect = { id, rect };
}

export function takeEventCardRect(id: string): DOMRect | null {
  const pending = pendingCardRect;
  pendingCardRect = null;
  return pending && pending.id === id ? pending.rect : null;
}
