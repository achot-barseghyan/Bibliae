import { useCallback, useEffect, useState, type RefObject } from 'react';
import type { AnnotationTargetKind } from '../services/appDataStore';
import type { PrayerLanguage } from '../data/prayers';

export interface SelectionAnchor {
  kind: AnnotationTargetKind;
  sourceId: string;
  blockIndex: number;
  lang?: PrayerLanguage;
  start: number;
  end: number;
  quote: string;
}

export interface StabilizedSelection {
  anchors: SelectionAnchor[];
  groupId?: string;
}

const STABILIZE_DELAY_MS = 250;

function generateGroupId(): string {
  return `grp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function closestBlock(node: Node, container: HTMLElement): HTMLElement | null {
  let el: Element | null = node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as Element);
  while (el && el !== container) {
    if (el.hasAttribute('data-annotate-block')) return el as HTMLElement;
    el = el.parentElement;
  }
  return null;
}

interface BlockInfo {
  kind: AnnotationTargetKind;
  sourceId: string;
  blockIndex: number;
  lang?: PrayerLanguage;
  textRoot: HTMLElement;
}

function getBlockInfo(el: HTMLElement): BlockInfo | null {
  const kind = el.dataset.annotateKind as AnnotationTargetKind | undefined;
  const sourceId = el.dataset.annotateSourceId;
  const blockIndexRaw = el.dataset.annotateBlockIndex;
  const textRoot = el.querySelector('[data-annotate-text]') as HTMLElement | null;
  if (!kind || !sourceId || blockIndexRaw === undefined || !textRoot) return null;
  return {
    kind,
    sourceId,
    blockIndex: Number(blockIndexRaw),
    lang: el.dataset.annotateLang as PrayerLanguage | undefined,
    textRoot
  };
}

// Utilise l'API Range elle-même pour compter les caractères entre le début de
// `root` et le point (node, offset) : gère correctement les cas où ce point
// tombe sur une frontière d'élément plutôt que dans un nœud texte, sans
// TreeWalker manuel.
function textOffsetWithin(root: Node, node: Node, offset: number): number {
  const r = document.createRange();
  r.selectNodeContents(root);
  r.setEnd(node, offset);
  return r.toString().length;
}

function resolveSelection(container: HTMLElement, range: Range): StabilizedSelection | null {
  const startBlockEl = closestBlock(range.startContainer, container);
  const endBlockEl = closestBlock(range.endContainer, container);
  if (!startBlockEl || !endBlockEl) return null;

  const blocks = Array.from(container.querySelectorAll<HTMLElement>('[data-annotate-block]'));
  const startIdx = blocks.indexOf(startBlockEl);
  const endIdx = blocks.indexOf(endBlockEl);
  if (startIdx === -1 || endIdx === -1) return null;

  const spanned = blocks.slice(Math.min(startIdx, endIdx), Math.max(startIdx, endIdx) + 1);
  const anchors: SelectionAnchor[] = [];

  for (const blockEl of spanned) {
    const info = getBlockInfo(blockEl);
    if (!info) continue;

    const fullLength = info.textRoot.textContent?.length ?? 0;
    let start = 0;
    let end = fullLength;

    if (blockEl === startBlockEl) {
      start = info.textRoot.contains(range.startContainer)
        ? textOffsetWithin(info.textRoot, range.startContainer, range.startOffset)
        : 0;
    }
    if (blockEl === endBlockEl) {
      end = info.textRoot.contains(range.endContainer)
        ? textOffsetWithin(info.textRoot, range.endContainer, range.endOffset)
        : fullLength;
    }

    start = Math.max(0, Math.min(fullLength, start));
    end = Math.max(0, Math.min(fullLength, end));
    if (end <= start) continue;

    const quote = info.textRoot.textContent?.slice(start, end) ?? '';
    anchors.push({
      kind: info.kind,
      sourceId: info.sourceId,
      blockIndex: info.blockIndex,
      lang: info.lang,
      start,
      end,
      quote
    });
  }

  if (anchors.length === 0) return null;

  return {
    anchors,
    groupId: anchors.length > 1 ? generateGroupId() : undefined
  };
}

/**
 * Suit la sélection de texte native restreinte aux blocs annotables
 * (`[data-annotate-block]` contenant un `[data-annotate-text]`) à l'intérieur
 * du conteneur donné. La sélection n'est exposée qu'une fois stabilisée
 * (débounce de 250ms) pour ne jamais ouvrir le menu pendant le glissement
 * des poignées de sélection.
 *
 * La sélection native n'est jamais effacée par ce hook (contrairement à une
 * version précédente) : l'utilisateur garde les poignées natives pour
 * étendre sa sélection à plusieurs mots. Le menu d'annotation doit donc être
 * affiché ailleurs qu'au-dessus/en-dessous du texte sélectionné (ex. une
 * barre fixe en bas d'écran), pour ne pas entrer en collision visuelle avec
 * le menu contextuel natif du système, qui reste affiché normalement.
 */
export function useTextSelection(containerRef: RefObject<HTMLElement | null>) {
  const [selection, setSelection] = useState<StabilizedSelection | null>(null);

  useEffect(() => {
    let timer: number | undefined;

    const evaluate = () => {
      const container = containerRef.current;
      const sel = window.getSelection();
      if (!container || !sel || sel.isCollapsed || sel.rangeCount === 0) {
        setSelection(null);
        return;
      }
      const range = sel.getRangeAt(0);
      if (!container.contains(range.commonAncestorContainer)) {
        setSelection(null);
        return;
      }
      setSelection(resolveSelection(container, range));
    };

    const onSelectionChange = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(evaluate, STABILIZE_DELAY_MS);
    };

    const onScroll = () => setSelection(null);

    document.addEventListener('selectionchange', onSelectionChange);
    window.addEventListener('scroll', onScroll, { capture: true, passive: true });
    return () => {
      document.removeEventListener('selectionchange', onSelectionChange);
      window.removeEventListener('scroll', onScroll, true);
      window.clearTimeout(timer);
    };
  }, [containerRef]);

  const clearSelection = useCallback(() => {
    window.getSelection()?.removeAllRanges();
    setSelection(null);
  }, []);

  return { selection, clearSelection };
}
