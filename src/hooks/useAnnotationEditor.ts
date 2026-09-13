import { useMemo } from 'react';
import { useAnnotations } from './useAnnotations';
import type { StabilizedSelection } from './useTextSelection';
import type { Annotation, AnnotationStyle, HighlightColor } from '../services/appDataStore';
import { HIGHLIGHT_COLORS } from '../services/annotationColors';

/**
 * Traduit une sélection stabilisée (`useTextSelection`) en actions
 * d'annotation : détecte les annotations existantes recouvertes par la
 * sélection (pour marquer la couleur active et proposer "Supprimer"),
 * applique une couleur/un soulignage/une note (mise à jour en place si la
 * sélection correspond exactement à une annotation existante, sinon
 * création — voir la règle documentée dans le plan de la fonctionnalité).
 */
export function useAnnotationEditor(selection: StabilizedSelection | null) {
  const { annotations, forBlock, findExact, add, updateStyle, updateNote, remove } = useAnnotations();

  const overlapping = useMemo<Annotation[]>(() => {
    if (!selection) return [];
    const result: Annotation[] = [];
    for (const anchor of selection.anchors) {
      const blockAnnotations = forBlock(anchor.kind, anchor.sourceId, anchor.blockIndex, anchor.lang);
      for (const a of blockAnnotations) {
        if (a.target.start < anchor.end && a.target.end > anchor.start) {
          result.push(a);
        }
      }
    }
    return result;
  }, [selection, forBlock]);

  const activeColor = useMemo<HighlightColor | null>(() => {
    if (overlapping.length === 0) return null;
    const mostRecent = overlapping.reduce((latest, a) => (a.updatedAt > latest.updatedAt ? a : latest));
    return mostRecent.style.highlight;
  }, [overlapping]);

  const hasUnderline = overlapping.some((a) => a.style.underline);

  const noteText = useMemo<string | null>(() => {
    const withNote = overlapping.filter((a) => a.note !== null);
    if (withNote.length === 0) return null;
    const mostRecent = withNote.reduce((latest, a) => (a.updatedAt > latest.updatedAt ? a : latest));
    return mostRecent.note;
  }, [overlapping]);

  // "Appliquer la dernière couleur utilisée si aucune n'est active" — la plus
  // récente couleur posée n'importe où dans l'app, sinon la première de la
  // palette par défaut.
  const lastUsedColor = useMemo<HighlightColor>(() => {
    const withHighlight = annotations.filter((a): a is Annotation & { style: { highlight: HighlightColor } } =>
      a.style.highlight !== null
    );
    if (withHighlight.length === 0) return HIGHLIGHT_COLORS[0].key;
    const mostRecent = withHighlight.reduce((latest, a) => (a.updatedAt > latest.updatedAt ? a : latest));
    return mostRecent.style.highlight;
  }, [annotations]);

  function applyToAnchors(styleFor: (existing: Annotation | undefined) => AnnotationStyle) {
    if (!selection) return;
    for (const anchor of selection.anchors) {
      const existing = findExact(
        anchor.kind,
        anchor.sourceId,
        anchor.blockIndex,
        anchor.start,
        anchor.end,
        anchor.lang
      );
      const style = styleFor(existing);
      if (existing) {
        updateStyle(existing.id, style);
      } else {
        add({
          target: {
            kind: anchor.kind,
            sourceId: anchor.sourceId,
            blockIndex: anchor.blockIndex,
            lang: anchor.lang,
            start: anchor.start,
            end: anchor.end,
            quote: anchor.quote
          },
          style,
          groupId: selection.groupId
        });
      }
    }
  }

  function applyColor(color: HighlightColor) {
    applyToAnchors((existing) => ({ highlight: color, underline: existing?.style.underline ?? false }));
  }

  function toggleUnderline() {
    const nextUnderline = !hasUnderline;
    applyToAnchors((existing) => ({ highlight: existing?.style.highlight ?? null, underline: nextUnderline }));
  }

  function removeOverlapping() {
    overlapping.forEach((a) => remove(a.id));
  }

  /**
   * Une note implique un surlignage : `fallbackColor` s'applique si aucune
   * couleur n'est déjà active. Prend `anchors`/`groupId` en paramètres
   * explicites (un instantané pris à l'ouverture de la feuille de note)
   * plutôt que de lire `selection` : le clavier virtuel déclenche des
   * événements de scroll pendant la saisie, qui effacent `selection` via
   * `useTextSelection`, donc s'appuyer sur `selection` ici perdait
   * silencieusement la note.
   */
  function saveNote(
    anchors: StabilizedSelection['anchors'],
    groupId: string | undefined,
    text: string,
    fallbackColor: HighlightColor
  ) {
    const trimmed = text.trim() === '' ? null : text;
    for (const anchor of anchors) {
      const existing = findExact(
        anchor.kind,
        anchor.sourceId,
        anchor.blockIndex,
        anchor.start,
        anchor.end,
        anchor.lang
      );
      if (existing) {
        if (!existing.style.highlight) {
          updateStyle(existing.id, { ...existing.style, highlight: fallbackColor });
        }
        updateNote(existing.id, trimmed);
      } else {
        add({
          target: {
            kind: anchor.kind,
            sourceId: anchor.sourceId,
            blockIndex: anchor.blockIndex,
            lang: anchor.lang,
            start: anchor.start,
            end: anchor.end,
            quote: anchor.quote
          },
          style: { highlight: fallbackColor, underline: false },
          note: trimmed,
          groupId
        });
      }
    }
  }

  return {
    overlapping,
    activeColor,
    hasUnderline,
    noteText,
    lastUsedColor,
    applyColor,
    toggleUnderline,
    removeOverlapping,
    saveNote
  };
}
