import { Preferences } from '@capacitor/preferences';
import type { MysterySetKey } from '../data/rosary';
import { MYSTERY_ORDER, mysterySetForToday } from '../data/rosary';
import type { PrayerLanguage } from '../data/prayers';
import { BOOKS, booksByTestament } from '../data/bible';
import { PLAN_DAYS, PLAN_ID, PLAN_LENGTH } from '../data/readingPlan';

export const APP_DATA_VERSION = 3;

// Types canoniques des réglages : les hooks (useAccessibility, useBibleReadingPrefs)
// les ré-exportent pour ne pas casser leurs consommateurs existants, mais ce module
// est la source de vérité afin d'éviter toute dépendance circulaire avec les hooks.
export type TextScale = 1 | 2 | 3 | 4;
export type BibleFont = 'cormorant' | 'garamond' | 'inter';
export type BibleTheme = 'papier' | 'sepia' | 'nuit' | 'contraste';

export interface AccessibilitySettings {
  textScale: TextScale;
  lineSpacing: boolean;
  contrast: boolean;
  reduceMotion: boolean;
}

export interface BibleReadingPrefs {
  font: BibleFont;
  theme: BibleTheme;
}

export interface RosaryProgress {
  mysterySet: MysterySetKey;
  stepIndex: number;
}

export interface AppDataSettings {
  accessibility: AccessibilitySettings;
  bibleReading: BibleReadingPrefs;
  rosaryProgress: RosaryProgress;
}

// Annotations de texte : surlignage/soulignage/note ancrés sur le contenu
// (jamais sur une position d'écran). Voir la spec "Annotations de texte".
export type HighlightColor = 'or' | 'oxblood' | 'olive' | 'bleu-encre' | 'sanguine';

export type AnnotationTargetKind = 'verse' | 'chapter' | 'prayer' | 'saint' | 'figure-prose';

export interface AnnotationTarget {
  kind: AnnotationTargetKind;
  sourceId: string;
  lang?: PrayerLanguage;
  blockIndex: number;
  start: number;
  end: number;
  quote: string;
}

export interface AnnotationStyle {
  highlight: HighlightColor | null;
  underline: boolean;
}

export interface Annotation {
  id: string;
  createdAt: string;
  updatedAt: string;
  target: AnnotationTarget;
  style: AnnotationStyle;
  note: string | null;
  groupId?: string;
  orphaned?: boolean;
}

// Parcours de lecture : suivi de progression sur les 73 livres, plusieurs
// parcours simultanés et étanches (un chapitre lu dans l'un ne l'est pas
// dans les autres). Voir la spec "Parcours de lecture".
export type ReadingScope = 'bible' | 'ancien' | 'nouveau' | 'custom';
export type ReadingSource = 'reading' | 'manual' | 'audio';

export interface Parcours {
  id: string;
  name: string;
  // Palette fermée partagée avec les couleurs de surlignage des annotations.
  color: HighlightColor;
  scope: ReadingScope;
  scopeBooks: string[];
  createdAt: string;
  completedAt: string | null;
  archived: boolean;
  isActive: boolean;
}

export interface ChapterRead {
  parcoursId: string;
  bookId: string;
  chapter: number;
  readAt: string;
  source: ReadingSource;
}

export interface ReadingPosition {
  parcoursId: string;
  bookId: string;
  chapter: number;
  scrollRatio: number;
  updatedAt: string;
}

// Plans de lecture datés par numéro de jour (« La Bible en 1 an ») : progression
// séparée des parcours, sans lien avec les `ChapterRead`. Voir la spec
// « Plan de lecture ».
export interface PlanRun {
  startedAt: string;
  completedAt: string;
}

export interface PlanProgress {
  planId: string;
  /** null = jamais commencé (ou archivé) : la carte de la page Bible propose de commencer. */
  startedAt: string | null;
  completedAt: string | null;
  /** Premier jour non entièrement lu ; recalculé à chaque écriture. */
  currentDay: number;
  /** L'écran « Félicitations » s'affiche une seule fois par achèvement. */
  celebrated: boolean;
  /** Carte masquée sur la page Bible ; le plan reste accessible depuis la feuille des parcours. */
  cardHidden: boolean;
  /** Plans achevés puis recommencés ou archivés. */
  history: PlanRun[];
}

export interface PlanRead {
  planId: string;
  day: number;
  refIndex: number;
  readAt: string;
  source: 'reading' | 'manual';
}

export interface AppData {
  version: 3;
  bookmarks: string[];
  annotations: Annotation[];
  parcours: Parcours[];
  chapterReads: ChapterRead[];
  readingPositions: ReadingPosition[];
  planProgress: PlanProgress[];
  planReads: PlanRead[];
  settings: AppDataSettings;
}

export const defaultAccessibilitySettings: AccessibilitySettings = {
  textScale: 2,
  lineSpacing: false,
  contrast: false,
  reduceMotion: false
};

export const defaultBibleReadingPrefs: BibleReadingPrefs = {
  font: 'cormorant',
  theme: 'papier'
};

function defaultRosaryProgress(): RosaryProgress {
  return { mysterySet: mysterySetForToday(), stepIndex: 0 };
}

/** Série inconnue (ex. « lumineux », retiré) : on repart sur celle du jour. */
function sanitizeRosaryProgress(raw: Partial<RosaryProgress> | undefined): RosaryProgress {
  const progress = { ...defaultRosaryProgress(), ...raw };
  return MYSTERY_ORDER.includes(progress.mysterySet) ? progress : defaultRosaryProgress();
}

function generateParcoursId(): string {
  return `prc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Recréé chaque fois qu'il faut un parcours par défaut (premier lancement, dernier parcours supprimé). */
function defaultParcours(): Parcours {
  return {
    id: generateParcoursId(),
    name: 'Première lecture',
    color: 'or',
    scope: 'bible',
    scopeBooks: [],
    createdAt: new Date().toISOString(),
    completedAt: null,
    archived: false,
    isActive: true
  };
}

function defaultAppData(): AppData {
  return {
    version: APP_DATA_VERSION,
    bookmarks: [],
    annotations: [],
    parcours: [defaultParcours()],
    chapterReads: [],
    readingPositions: [],
    planProgress: [],
    planReads: [],
    settings: {
      accessibility: { ...defaultAccessibilitySettings },
      bibleReading: { ...defaultBibleReadingPrefs },
      rosaryProgress: defaultRosaryProgress()
    }
  };
}

const PREFERENCES_KEY = 'bibliae:appdata';
const MIGRATION_FLAG_KEY = 'bibliae:appdata:migrated';

// Anciennes clés localStorage (pré-store-centralisé), conservées ici uniquement
// pour la migration one-shot des utilisateurs déjà installés.
const LEGACY_BOOKMARKS_KEY = 'bibliae:bookmarks';
const LEGACY_ACCESSIBILITY_KEY = 'bibliae:accessibility';
const LEGACY_BIBLE_READING_KEY = 'bibliae:bible-reading';
const LEGACY_ROSARY_PROGRESS_KEY = 'bibliae:rosary-progress';

let cache: AppData = defaultAppData();
const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

function persist(): void {
  Preferences.set({ key: PREFERENCES_KEY, value: JSON.stringify(cache) }).catch(() => {
    // stockage indisponible : on continue en mémoire pour cette session
  });
}

function isAppDataShape(value: unknown): value is AppData {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.version === 'number' &&
    Array.isArray(v.bookmarks) &&
    v.bookmarks.every((k) => typeof k === 'string') &&
    typeof v.settings === 'object' &&
    v.settings !== null
  );
}

function isAnnotationShape(value: unknown): value is Annotation {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  const target = v.target as Record<string, unknown> | undefined;
  const style = v.style as Record<string, unknown> | undefined;
  return (
    typeof v.id === 'string' &&
    typeof v.createdAt === 'string' &&
    typeof v.updatedAt === 'string' &&
    typeof target === 'object' &&
    target !== null &&
    typeof target.kind === 'string' &&
    typeof target.sourceId === 'string' &&
    typeof target.blockIndex === 'number' &&
    typeof target.start === 'number' &&
    typeof target.end === 'number' &&
    typeof target.quote === 'string' &&
    typeof style === 'object' &&
    style !== null &&
    (style.highlight === null || typeof style.highlight === 'string') &&
    typeof style.underline === 'boolean'
  );
}

function sanitizeAnnotations(value: unknown): Annotation[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isAnnotationShape);
}

function isParcoursShape(value: unknown): value is Parcours {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.name === 'string' &&
    typeof v.color === 'string' &&
    typeof v.scope === 'string' &&
    Array.isArray(v.scopeBooks) &&
    v.scopeBooks.every((b) => typeof b === 'string') &&
    typeof v.createdAt === 'string' &&
    (v.completedAt === null || typeof v.completedAt === 'string') &&
    typeof v.archived === 'boolean' &&
    typeof v.isActive === 'boolean'
  );
}

/** Garantit exactement un parcours actif non archivé ; en recrée un si la liste est vide. */
function ensureSingleActiveParcours(list: Parcours[]): Parcours[] {
  if (list.length === 0) return [defaultParcours()];
  const activeOnes = list.filter((p) => p.isActive && !p.archived);
  if (activeOnes.length === 1) return list;
  const fallback = activeOnes[0] ?? list.find((p) => !p.archived) ?? list[0];
  return list.map((p) => ({ ...p, isActive: p.id === fallback.id }));
}

function sanitizeParcoursList(value: unknown): Parcours[] {
  const list = Array.isArray(value) ? value.filter(isParcoursShape) : [];
  return ensureSingleActiveParcours(list);
}

function isChapterReadShape(value: unknown): value is ChapterRead {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.parcoursId === 'string' &&
    typeof v.bookId === 'string' &&
    typeof v.chapter === 'number' &&
    typeof v.readAt === 'string' &&
    typeof v.source === 'string'
  );
}

function sanitizeChapterReads(value: unknown): ChapterRead[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isChapterReadShape);
}

function isReadingPositionShape(value: unknown): value is ReadingPosition {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.parcoursId === 'string' &&
    typeof v.bookId === 'string' &&
    typeof v.chapter === 'number' &&
    typeof v.scrollRatio === 'number' &&
    typeof v.updatedAt === 'string'
  );
}

function sanitizeReadingPositions(value: unknown): ReadingPosition[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isReadingPositionShape);
}

function isPlanProgressShape(value: unknown): value is PlanProgress {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.planId === 'string' &&
    (v.startedAt === null || typeof v.startedAt === 'string') &&
    (v.completedAt === null || typeof v.completedAt === 'string') &&
    typeof v.currentDay === 'number'
  );
}

function sanitizePlanProgress(value: unknown): PlanProgress[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isPlanProgressShape).map((p) => ({
    ...p,
    celebrated: typeof p.celebrated === 'boolean' ? p.celebrated : p.completedAt !== null,
    cardHidden: typeof p.cardHidden === 'boolean' ? p.cardHidden : false,
    history: Array.isArray(p.history)
      ? p.history.filter(
          (r): r is PlanRun =>
            typeof r === 'object' && r !== null && typeof r.startedAt === 'string' && typeof r.completedAt === 'string'
        )
      : []
  }));
}

function isPlanReadShape(value: unknown): value is PlanRead {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.planId === 'string' &&
    typeof v.day === 'number' &&
    typeof v.refIndex === 'number' &&
    typeof v.readAt === 'string' &&
    (v.source === 'reading' || v.source === 'manual')
  );
}

function sanitizePlanReads(value: unknown): PlanRead[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isPlanReadShape);
}

// v1 (pré-annotations), v2 (pré-parcours) et v3 sont tous acceptés : un document
// plus ancien est simplement complété avec les valeurs par défaut au passage
// dans sanitize().
export function isKnownVersion(version: number): boolean {
  return version === 1 || version === 2 || version === 3;
}

function sanitize(value: unknown): AppData {
  if (!isAppDataShape(value) || !isKnownVersion(value.version)) {
    return defaultAppData();
  }
  const settings = value.settings as Partial<AppDataSettings>;
  const rawAnnotations = (value as { annotations?: unknown }).annotations;
  const rawParcours = (value as { parcours?: unknown }).parcours;
  const rawChapterReads = (value as { chapterReads?: unknown }).chapterReads;
  const rawReadingPositions = (value as { readingPositions?: unknown }).readingPositions;
  const rawPlanProgress = (value as { planProgress?: unknown }).planProgress;
  const rawPlanReads = (value as { planReads?: unknown }).planReads;
  return {
    version: APP_DATA_VERSION,
    bookmarks: Array.from(new Set(value.bookmarks)),
    annotations: sanitizeAnnotations(rawAnnotations),
    parcours: sanitizeParcoursList(rawParcours),
    chapterReads: sanitizeChapterReads(rawChapterReads),
    readingPositions: sanitizeReadingPositions(rawReadingPositions),
    planProgress: sanitizePlanProgress(rawPlanProgress),
    planReads: sanitizePlanReads(rawPlanReads),
    settings: {
      accessibility: { ...defaultAccessibilitySettings, ...settings.accessibility },
      bibleReading: { ...defaultBibleReadingPrefs, ...settings.bibleReading },
      rosaryProgress: sanitizeRosaryProgress(settings.rosaryProgress)
    }
  };
}

function migrateFromLocalStorage(): AppData {
  const data = defaultAppData();

  try {
    const raw = localStorage.getItem(LEGACY_BOOKMARKS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        data.bookmarks = Array.from(new Set(parsed.filter((k): k is string => typeof k === 'string')));
      }
    }
  } catch {
    // clé absente ou corrompue : on garde le défaut
  }

  try {
    const raw = localStorage.getItem(LEGACY_ACCESSIBILITY_KEY);
    if (raw) {
      data.settings.accessibility = { ...defaultAccessibilitySettings, ...JSON.parse(raw) };
    }
  } catch {
    // clé absente ou corrompue : on garde le défaut
  }

  try {
    const raw = localStorage.getItem(LEGACY_BIBLE_READING_KEY);
    if (raw) {
      data.settings.bibleReading = { ...defaultBibleReadingPrefs, ...JSON.parse(raw) };
    }
  } catch {
    // clé absente ou corrompue : on garde le défaut
  }

  try {
    const raw = localStorage.getItem(LEGACY_ROSARY_PROGRESS_KEY);
    if (raw) {
      data.settings.rosaryProgress = sanitizeRosaryProgress(JSON.parse(raw));
    }
  } catch {
    // clé absente ou corrompue : on garde le défaut
  }

  return data;
}

export async function initAppDataStore(): Promise<void> {
  try {
    const migrated = await Preferences.get({ key: MIGRATION_FLAG_KEY });
    if (migrated.value === 'true') {
      const stored = await Preferences.get({ key: PREFERENCES_KEY });
      cache = stored.value ? sanitize(JSON.parse(stored.value)) : defaultAppData();
      return;
    }

    cache = migrateFromLocalStorage();
    await Preferences.set({ key: PREFERENCES_KEY, value: JSON.stringify(cache) });
    await Preferences.set({ key: MIGRATION_FLAG_KEY, value: 'true' });
  } catch {
    // Preferences indisponible : on démarre avec les valeurs par défaut en mémoire
    cache = defaultAppData();
  }
}

export function getAppData(): AppData {
  return cache;
}

export function getAppDataSnapshot(): AppData {
  return cache;
}

export function subscribeAppData(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setAppData(updater: (prev: AppData) => AppData): void {
  cache = updater(cache);
  persist();
  notify();
}

/** Remplace entièrement favoris et réglages par ceux fournis (utilisé par l'import "Remplacer"). */
export function replaceAppData(next: AppData): void {
  cache = sanitize(next);
  persist();
  notify();
}

/** Remet le store à l'état d'une première installation (favoris, annotations, parcours, réglages). */
export function resetAppData(): void {
  replaceAppData(defaultAppData());
}

function chapterReadKey(c: { parcoursId: string; bookId: string; chapter: number }): string {
  return `${c.parcoursId}:${c.bookId}:${c.chapter}`;
}

/**
 * Fusionne un import avec l'état courant : union dédupliquée des favoris, des
 * annotations (par id) et des parcours (par id, jamais activés par l'import —
 * le parcours actif courant n'est jamais changé silencieusement) ; pour les
 * chapitres lus et les positions de lecture, l'entrée la plus récente
 * (`readAt`/`updatedAt`) l'emporte à clé égale. Réglages de l'appareil
 * conservés tels quels.
 */
export function mergeAppData(incoming: AppData): {
  importedBookmarksCount: number;
  importedAnnotationsCount: number;
  importedParcoursCount: number;
  importedChapterReadsCount: number;
} {
  const sanitized = sanitize(incoming);
  const before = new Set(cache.bookmarks);
  const merged = new Set([...cache.bookmarks, ...sanitized.bookmarks]);
  const importedBookmarksCount = merged.size - before.size;

  const existingAnnotationIds = new Set(cache.annotations.map((a) => a.id));
  const newAnnotations = sanitized.annotations.filter((a) => !existingAnnotationIds.has(a.id));

  const existingParcoursIds = new Set(cache.parcours.map((p) => p.id));
  const newParcours = sanitized.parcours
    .filter((p) => !existingParcoursIds.has(p.id))
    .map((p) => ({ ...p, isActive: false }));

  const chapterReadMap = new Map(cache.chapterReads.map((c) => [chapterReadKey(c), c]));
  let importedChapterReadsCount = 0;
  for (const incomingRead of sanitized.chapterReads) {
    const key = chapterReadKey(incomingRead);
    const existing = chapterReadMap.get(key);
    if (!existing) importedChapterReadsCount++;
    if (!existing || incomingRead.readAt > existing.readAt) {
      chapterReadMap.set(key, incomingRead);
    }
  }

  const readingPositionMap = new Map(cache.readingPositions.map((p) => [p.parcoursId, p]));
  for (const incomingPos of sanitized.readingPositions) {
    const existing = readingPositionMap.get(incomingPos.parcoursId);
    if (!existing || incomingPos.updatedAt > existing.updatedAt) {
      readingPositionMap.set(incomingPos.parcoursId, incomingPos);
    }
  }

  // Plans : lectures fusionnées comme les chapitres (la plus récente l'emporte) ;
  // la progression importée ne remplace la locale que si celle-ci n'a jamais
  // démarré.
  const planReadMap = new Map(cache.planReads.map((r) => [planReadKey(r), r]));
  for (const incomingRead of sanitized.planReads) {
    const key = planReadKey(incomingRead);
    const existing = planReadMap.get(key);
    if (!existing || incomingRead.readAt > existing.readAt) planReadMap.set(key, incomingRead);
  }
  const planProgressMap = new Map(cache.planProgress.map((p) => [p.planId, p]));
  for (const incomingProgress of sanitized.planProgress) {
    const existing = planProgressMap.get(incomingProgress.planId);
    if (!existing || (!existing.startedAt && incomingProgress.startedAt)) {
      planProgressMap.set(incomingProgress.planId, incomingProgress);
    }
  }
  const planReads = Array.from(planReadMap.values());
  const planProgress = Array.from(planProgressMap.values()).map((p) => ({
    ...p,
    currentDay: computeCurrentDay(planReads, p.planId)
  }));

  cache = {
    version: APP_DATA_VERSION,
    bookmarks: Array.from(merged),
    annotations: [...cache.annotations, ...newAnnotations],
    parcours: [...cache.parcours, ...newParcours],
    chapterReads: Array.from(chapterReadMap.values()),
    readingPositions: Array.from(readingPositionMap.values()),
    planProgress,
    planReads,
    settings: cache.settings
  };
  persist();
  notify();
  return {
    importedBookmarksCount,
    importedAnnotationsCount: newAnnotations.length,
    importedParcoursCount: newParcours.length,
    importedChapterReadsCount
  };
}

// --- Annotations : mutateurs (à consommer via le hook useAnnotations pour la réactivité) ---

function generateAnnotationId(): string {
  return `ann-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export interface NewAnnotationInput {
  target: AnnotationTarget;
  style: AnnotationStyle;
  groupId?: string;
  note?: string | null;
}

export function addAnnotation(input: NewAnnotationInput): Annotation {
  const now = new Date().toISOString();
  const annotation: Annotation = {
    id: generateAnnotationId(),
    createdAt: now,
    updatedAt: now,
    target: input.target,
    style: input.style,
    note: input.note ?? null,
    groupId: input.groupId
  };
  setAppData((prev) => ({ ...prev, annotations: [...prev.annotations, annotation] }));
  return annotation;
}

export function updateAnnotationStyle(id: string, patch: Partial<AnnotationStyle>): void {
  setAppData((prev) => ({
    ...prev,
    annotations: prev.annotations.map((a) =>
      a.id === id
        ? { ...a, style: { ...a.style, ...patch }, updatedAt: new Date().toISOString() }
        : a
    )
  }));
}

export function updateAnnotationNote(id: string, note: string | null): void {
  setAppData((prev) => ({
    ...prev,
    annotations: prev.annotations.map((a) =>
      a.id === id ? { ...a, note, updatedAt: new Date().toISOString() } : a
    )
  }));
}

export function deleteAnnotation(id: string): void {
  setAppData((prev) => ({ ...prev, annotations: prev.annotations.filter((a) => a.id !== id) }));
}

export function deleteAnnotationGroup(groupId: string): void {
  setAppData((prev) => ({
    ...prev,
    annotations: prev.annotations.filter((a) => a.groupId !== groupId)
  }));
}

export function deleteAnnotationsForSource(kind: AnnotationTargetKind, sourceId: string): void {
  setAppData((prev) => ({
    ...prev,
    annotations: prev.annotations.filter((a) => !(a.target.kind === kind && a.target.sourceId === sourceId))
  }));
}

// --- Annotations : sélecteurs purs (le hook useAnnotations les applique à un
// snapshot réactif ; ne pas les appeler directement sur `cache` depuis un
// composant, ce qui ne déclencherait pas de re-render). ---

export function filterAnnotationsForBlock(
  annotations: Annotation[],
  kind: AnnotationTargetKind,
  sourceId: string,
  blockIndex: number,
  lang?: PrayerLanguage
): Annotation[] {
  return annotations.filter(
    (a) =>
      a.target.kind === kind &&
      a.target.sourceId === sourceId &&
      a.target.blockIndex === blockIndex &&
      a.target.lang === lang
  );
}

export function findExactAnnotation(
  annotations: Annotation[],
  kind: AnnotationTargetKind,
  sourceId: string,
  blockIndex: number,
  start: number,
  end: number,
  lang?: PrayerLanguage
): Annotation | undefined {
  return annotations.find(
    (a) =>
      a.target.kind === kind &&
      a.target.sourceId === sourceId &&
      a.target.blockIndex === blockIndex &&
      a.target.lang === lang &&
      a.target.start === start &&
      a.target.end === end
  );
}

// --- Parcours de lecture : sélecteurs purs ---

const READING_COLOR_ORDER: HighlightColor[] = ['or', 'bleu-encre', 'olive', 'sanguine', 'oxblood'];

/** Première couleur de la palette fermée non utilisée par un parcours actif (non archivé). */
export function nextAvailableParcoursColor(existing: Parcours[]): HighlightColor {
  const used = new Set(existing.filter((p) => !p.archived).map((p) => p.color));
  return READING_COLOR_ORDER.find((c) => !used.has(c)) ?? READING_COLOR_ORDER[0];
}

export function totalChaptersForScope(scope: ReadingScope, scopeBooks: string[]): number {
  if (scope === 'bible') return BOOKS.reduce((sum, b) => sum + b.chapters, 0);
  if (scope === 'ancien' || scope === 'nouveau') {
    return booksByTestament(scope).reduce((sum, b) => sum + b.chapters, 0);
  }
  const ids = new Set(scopeBooks);
  return BOOKS.filter((b) => ids.has(b.id)).reduce((sum, b) => sum + b.chapters, 0);
}

export function isChapterInScope(scope: ReadingScope, scopeBooks: string[], bookId: string): boolean {
  if (scope === 'bible') return true;
  if (scope === 'ancien' || scope === 'nouveau') {
    return booksByTestament(scope).some((b) => b.id === bookId);
  }
  return scopeBooks.includes(bookId);
}

export function progressForParcours(
  parcours: Parcours,
  chapterReads: ChapterRead[]
): { read: number; total: number; percent: number } {
  const total = totalChaptersForScope(parcours.scope, parcours.scopeBooks);
  const read = chapterReads.filter((c) => c.parcoursId === parcours.id).length;
  const percent = total > 0 ? Math.round((read / total) * 100) : 0;
  return { read, total, percent };
}

export function getActiveParcours(data: AppData): Parcours | undefined {
  return data.parcours.find((p) => p.isActive);
}

export function chapterReadsForParcours(data: AppData, parcoursId: string): ChapterRead[] {
  return data.chapterReads.filter((c) => c.parcoursId === parcoursId);
}

export function isChapterRead(data: AppData, parcoursId: string, bookId: string, chapter: number): boolean {
  return data.chapterReads.some(
    (c) => c.parcoursId === parcoursId && c.bookId === bookId && c.chapter === chapter
  );
}

export function readingPositionForParcours(data: AppData, parcoursId: string): ReadingPosition | undefined {
  return data.readingPositions.find((p) => p.parcoursId === parcoursId);
}

/** Le parcours (autre que `excludeParcoursId`) ayant le plus récemment lu ce chapitre, s'il en existe un. */
export function mostRecentOtherReader(
  data: AppData,
  bookId: string,
  chapter: number,
  excludeParcoursId: string
): { parcours: Parcours; readAt: string } | undefined {
  const candidates = data.chapterReads.filter(
    (c) => c.bookId === bookId && c.chapter === chapter && c.parcoursId !== excludeParcoursId
  );
  if (candidates.length === 0) return undefined;
  const mostRecent = candidates.reduce((latest, c) => (c.readAt > latest.readAt ? c : latest));
  const parcours = data.parcours.find((p) => p.id === mostRecent.parcoursId);
  if (!parcours) return undefined;
  return { parcours, readAt: mostRecent.readAt };
}

// --- Parcours de lecture : mutateurs (à consommer via un hook réactif) ---

export function createParcours(input: {
  name: string;
  color: HighlightColor;
  scope: ReadingScope;
  scopeBooks?: string[];
}): Parcours {
  const parcours: Parcours = {
    id: generateParcoursId(),
    name: input.name,
    color: input.color,
    scope: input.scope,
    scopeBooks: input.scope === 'custom' ? (input.scopeBooks ?? []) : [],
    createdAt: new Date().toISOString(),
    completedAt: null,
    archived: false,
    isActive: false
  };
  setAppData((prev) => ({ ...prev, parcours: [...prev.parcours, parcours] }));
  return parcours;
}

export function setActiveParcours(id: string): void {
  setAppData((prev) => ({
    ...prev,
    parcours: prev.parcours.map((p) => ({ ...p, isActive: p.id === id }))
  }));
}

export function renameParcours(id: string, name: string): void {
  setAppData((prev) => ({
    ...prev,
    parcours: prev.parcours.map((p) => (p.id === id ? { ...p, name } : p))
  }));
}

export function recolorParcours(id: string, color: HighlightColor): void {
  setAppData((prev) => ({
    ...prev,
    parcours: prev.parcours.map((p) => (p.id === id ? { ...p, color } : p))
  }));
}

/** Conserve le parcours et sa couleur, supprime les lectures — distinct de la suppression. */
export function resetParcoursProgress(id: string): void {
  setAppData((prev) => ({
    ...prev,
    chapterReads: prev.chapterReads.filter((c) => c.parcoursId !== id),
    readingPositions: prev.readingPositions.filter((p) => p.parcoursId !== id),
    parcours: prev.parcours.map((p) => (p.id === id ? { ...p, completedAt: null } : p))
  }));
}

/** Active le parcours non archivé le plus récemment créé ; en recrée un par défaut s'il n'en reste aucun. */
function activateFallback(list: Parcours[]): Parcours[] {
  const candidates = list.filter((p) => !p.archived);
  if (candidates.length === 0) {
    return [...list, defaultParcours()];
  }
  const fallback = candidates.reduce((latest, p) => (p.createdAt > latest.createdAt ? p : latest));
  return list.map((p) => ({ ...p, isActive: p.id === fallback.id }));
}

export function archiveParcours(id: string): void {
  setAppData((prev) => {
    const wasActive = prev.parcours.find((p) => p.id === id)?.isActive ?? false;
    const withArchived = prev.parcours.map((p) =>
      p.id === id ? { ...p, archived: true, isActive: false } : p
    );
    return { ...prev, parcours: wasActive ? activateFallback(withArchived) : withArchived };
  });
}

/** Supprime le parcours, ses chapitres lus et sa position ; en recrée un par défaut si c'était le dernier. */
export function deleteParcours(id: string): { deletedChapterCount: number } {
  const deletedChapterCount = cache.chapterReads.filter((c) => c.parcoursId === id).length;
  setAppData((prev) => {
    const wasActive = prev.parcours.find((p) => p.id === id)?.isActive ?? false;
    let parcours = prev.parcours.filter((p) => p.id !== id);
    if (parcours.length === 0) {
      parcours = [defaultParcours()];
    } else if (wasActive) {
      parcours = activateFallback(parcours);
    }
    return {
      ...prev,
      parcours,
      chapterReads: prev.chapterReads.filter((c) => c.parcoursId !== id),
      readingPositions: prev.readingPositions.filter((p) => p.parcoursId !== id)
    };
  });
  return { deletedChapterCount };
}

/** Conserve les chapitres lus qui restent dans le nouveau scope, supprime les autres. */
export function updateParcoursScope(
  id: string,
  scope: ReadingScope,
  scopeBooks: string[] = []
): { removedChapterCount: number } {
  let removedChapterCount = 0;
  setAppData((prev) => {
    const chapterReads = prev.chapterReads.filter((c) => {
      if (c.parcoursId !== id) return true;
      const keep = isChapterInScope(scope, scopeBooks, c.bookId);
      if (!keep) removedChapterCount++;
      return keep;
    });
    return {
      ...prev,
      parcours: prev.parcours.map((p) =>
        p.id === id ? { ...p, scope, scopeBooks: scope === 'custom' ? scopeBooks : [] } : p
      ),
      chapterReads
    };
  });
  return { removedChapterCount };
}

export function markChapterRead(
  parcoursId: string,
  bookId: string,
  chapter: number,
  source: ReadingSource
): { justCompleted: boolean } {
  const now = new Date().toISOString();
  let justCompleted = false;
  setAppData((prev) => {
    const parcours = prev.parcours.find((p) => p.id === parcoursId);
    if (!parcours) return prev;

    const key = chapterReadKey({ parcoursId, bookId, chapter });
    const exists = prev.chapterReads.some((c) => chapterReadKey(c) === key);
    const chapterReads = exists
      ? prev.chapterReads.map((c) => (chapterReadKey(c) === key ? { ...c, readAt: now, source } : c))
      : [...prev.chapterReads, { parcoursId, bookId, chapter, readAt: now, source }];

    let parcoursList = prev.parcours;
    if (!parcours.completedAt) {
      const { read, total } = progressForParcours(parcours, chapterReads);
      if (total > 0 && read >= total) {
        justCompleted = true;
        parcoursList = prev.parcours.map((p) => (p.id === parcoursId ? { ...p, completedAt: now } : p));
      }
    }

    return { ...prev, chapterReads, parcours: parcoursList };
  });
  return { justCompleted };
}

/** Retire la lecture ; si le parcours était marqué achevé, l'achèvement est révoqué (cohérence). */
export function unmarkChapterRead(parcoursId: string, bookId: string, chapter: number): void {
  setAppData((prev) => {
    const key = chapterReadKey({ parcoursId, bookId, chapter });
    const chapterReads = prev.chapterReads.filter((c) => chapterReadKey(c) !== key);
    const parcours = prev.parcours.map((p) =>
      p.id === parcoursId && p.completedAt ? { ...p, completedAt: null } : p
    );
    return { ...prev, chapterReads, parcours };
  });
}

/** État d'un livre dans un parcours, pris avant une action groupée pour pouvoir l'annuler. */
export interface BookReadsSnapshot {
  parcoursId: string;
  bookId: string;
  reads: ChapterRead[];
  completedAt: string | null;
}

/**
 * Marque (ou démarque) plusieurs chapitres d'un livre en une seule
 * transaction. Les chapitres déjà lus voient leur `readAt` mis à jour (même
 * horodatage pour tout le lot). Renvoie l'instantané d'avant l'action pour
 * `restoreBookReads`.
 */
export function setChaptersRead(
  parcoursId: string,
  bookId: string,
  chapters: number[],
  read: boolean,
  source: ReadingSource = 'manual'
): { snapshot: BookReadsSnapshot; justCompleted: boolean } {
  const now = new Date().toISOString();
  const before = cache.parcours.find((p) => p.id === parcoursId);
  const snapshot: BookReadsSnapshot = {
    parcoursId,
    bookId,
    reads: cache.chapterReads.filter((c) => c.parcoursId === parcoursId && c.bookId === bookId),
    completedAt: before?.completedAt ?? null
  };
  let justCompleted = false;
  setAppData((prev) => {
    const parcours = prev.parcours.find((p) => p.id === parcoursId);
    if (!parcours) return prev;
    const keys = new Set(chapters.map((chapter) => chapterReadKey({ parcoursId, bookId, chapter })));
    const others = prev.chapterReads.filter((c) => !keys.has(chapterReadKey(c)));

    if (!read) {
      return {
        ...prev,
        chapterReads: others,
        parcours: prev.parcours.map((p) => (p.id === parcoursId && p.completedAt ? { ...p, completedAt: null } : p))
      };
    }

    const chapterReads = [
      ...others,
      ...Array.from(new Set(chapters)).map((chapter) => ({ parcoursId, bookId, chapter, readAt: now, source }))
    ];
    let parcoursList = prev.parcours;
    if (!parcours.completedAt) {
      const { read: readCount, total } = progressForParcours(parcours, chapterReads);
      if (total > 0 && readCount >= total) {
        justCompleted = true;
        parcoursList = prev.parcours.map((p) => (p.id === parcoursId ? { ...p, completedAt: now } : p));
      }
    }
    return { ...prev, chapterReads, parcours: parcoursList };
  });
  return { snapshot, justCompleted };
}

/** Annule une action groupée : rétablit exactement les lectures du livre et l'achèvement du parcours. */
export function restoreBookReads(snapshot: BookReadsSnapshot): void {
  const { parcoursId, bookId, reads, completedAt } = snapshot;
  setAppData((prev) => ({
    ...prev,
    chapterReads: [
      ...prev.chapterReads.filter((c) => !(c.parcoursId === parcoursId && c.bookId === bookId)),
      ...reads
    ],
    parcours: prev.parcours.map((p) => (p.id === parcoursId ? { ...p, completedAt } : p))
  }));
}

/** Une seule position de lecture par parcours : ouvrir un autre chapitre la déplace. */
export function setReadingPosition(
  parcoursId: string,
  bookId: string,
  chapter: number,
  scrollRatio: number
): void {
  const now = new Date().toISOString();
  setAppData((prev) => ({
    ...prev,
    readingPositions: [
      ...prev.readingPositions.filter((p) => p.parcoursId !== parcoursId),
      { parcoursId, bookId, chapter, scrollRatio, updatedAt: now }
    ]
  }));
}

export function clearReadingPosition(parcoursId: string): void {
  setAppData((prev) => ({
    ...prev,
    readingPositions: prev.readingPositions.filter((p) => p.parcoursId !== parcoursId)
  }));
}

// --- Plan de lecture : sélecteurs purs ---

function planReadKey(r: { planId: string; day: number; refIndex: number }): string {
  return `${r.planId}:${r.day}:${r.refIndex}`;
}

function readKeysForPlan(planReads: PlanRead[], planId: string): Set<string> {
  return new Set(planReads.filter((r) => r.planId === planId).map(planReadKey));
}

function isDayRead(keys: Set<string>, planId: string, day: number): boolean {
  const refs = PLAN_DAYS[day - 1]?.refs ?? [];
  return refs.length > 0 && refs.every((_, refIndex) => keys.has(planReadKey({ planId, day, refIndex })));
}

/** Premier jour non entièrement lu ; le dernier jour si tout est lu. */
function computeCurrentDay(planReads: PlanRead[], planId: string): number {
  const keys = readKeysForPlan(planReads, planId);
  for (let day = 1; day <= PLAN_LENGTH; day++) {
    if (!isDayRead(keys, planId, day)) return day;
  }
  return PLAN_LENGTH;
}

function defaultPlanProgress(): PlanProgress {
  return {
    planId: PLAN_ID,
    startedAt: null,
    completedAt: null,
    currentDay: 1,
    celebrated: false,
    cardHidden: false,
    history: []
  };
}

export function getPlanProgress(data: AppData): PlanProgress {
  return data.planProgress.find((p) => p.planId === PLAN_ID) ?? defaultPlanProgress();
}

/** État de chaque jour du plan (index 0 = jour 1) : une case par référence. */
export function planDayStates(data: AppData): boolean[][] {
  const keys = readKeysForPlan(data.planReads, PLAN_ID);
  return PLAN_DAYS.map((d) => d.refs.map((_, refIndex) => keys.has(planReadKey({ planId: PLAN_ID, day: d.n, refIndex }))));
}

// --- Plan de lecture : mutateurs ---

/** Remplace les lectures du plan et recalcule jour courant et achèvement. */
function withPlanReads(prev: AppData, planReads: PlanRead[], patch: Partial<PlanProgress> = {}): AppData {
  const now = new Date().toISOString();
  const current = { ...getPlanProgress(prev), ...patch };
  const keys = readKeysForPlan(planReads, PLAN_ID);
  let allRead = true;
  for (let day = 1; day <= PLAN_LENGTH && allRead; day++) allRead = isDayRead(keys, PLAN_ID, day);
  const next: PlanProgress = {
    ...current,
    // Une lecture cochée sans avoir appuyé sur « Commencer » démarre le plan.
    startedAt: current.startedAt ?? (planReads.length > 0 ? now : null),
    completedAt: allRead ? (current.completedAt ?? now) : null,
    currentDay: computeCurrentDay(planReads, PLAN_ID)
  };
  return {
    ...prev,
    planReads,
    planProgress: [...prev.planProgress.filter((p) => p.planId !== PLAN_ID), next]
  };
}

export function startReadingPlan(): void {
  setAppData((prev) => {
    if (getPlanProgress(prev).startedAt) return prev;
    return withPlanReads(prev, prev.planReads, { startedAt: new Date().toISOString() });
  });
}

/** Coche ou décoche une référence d'un jour. */
export function setPlanRefRead(day: number, refIndex: number, read: boolean, source: PlanRead['source']): void {
  setAppData((prev) => {
    const key = planReadKey({ planId: PLAN_ID, day, refIndex });
    const others = prev.planReads.filter((r) => planReadKey(r) !== key);
    const planReads = read
      ? [...others, { planId: PLAN_ID, day, refIndex, readAt: new Date().toISOString(), source }]
      : others;
    return withPlanReads(prev, planReads);
  });
}

/** Coche ou décoche toutes les références d'un jour. */
export function setPlanDayRead(day: number, read: boolean): void {
  const refCount = PLAN_DAYS[day - 1]?.refs.length ?? 0;
  setAppData((prev) => {
    const others = prev.planReads.filter((r) => !(r.planId === PLAN_ID && r.day === day));
    if (!read) return withPlanReads(prev, others);
    const now = new Date().toISOString();
    // Les références déjà lues gardent leur date et leur source.
    const kept = prev.planReads.filter((r) => r.planId === PLAN_ID && r.day === day);
    const keptIndexes = new Set(kept.map((r) => r.refIndex));
    const added = Array.from({ length: refCount }, (_, refIndex) => refIndex)
      .filter((refIndex) => !keptIndexes.has(refIndex))
      .map((refIndex): PlanRead => ({ planId: PLAN_ID, day, refIndex, readAt: now, source: 'manual' }));
    return withPlanReads(prev, [...others, ...kept, ...added]);
  });
}

export function markPlanCelebrated(): void {
  setAppData((prev) => withPlanReads(prev, prev.planReads, { celebrated: true }));
}

/** Range l'achèvement courant dans l'historique et efface les lectures. */
function closePlanRun(prev: AppData, startedAt: string | null): AppData {
  const current = getPlanProgress(prev);
  const history =
    current.startedAt && current.completedAt
      ? [...current.history, { startedAt: current.startedAt, completedAt: current.completedAt }]
      : current.history;
  const planReads = prev.planReads.filter((r) => r.planId !== PLAN_ID);
  return withPlanReads({ ...prev, planReads }, planReads, {
    startedAt,
    completedAt: null,
    celebrated: false,
    cardHidden: false,
    history
  });
}

/** Repart du jour 1 en conservant l'historique des plans achevés. */
export function restartReadingPlan(): void {
  setAppData((prev) => closePlanRun(prev, new Date().toISOString()));
}

/** La carte de la page Bible revient à l'état « première visite ». */
export function archiveReadingPlan(): void {
  setAppData((prev) => closePlanRun(prev, null));
}

export function setPlanCardHidden(hidden: boolean): void {
  setAppData((prev) => withPlanReads(prev, prev.planReads, { cardHidden: hidden }));
}
