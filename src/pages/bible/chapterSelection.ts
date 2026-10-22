// Logique pure de la sélection multiple de chapitres (écran Livre).

/** `[1,2,3,5,7,8,9]` → `"1–3, 5, 7–9"` : tri, fusion des numéros consécutifs. */
export function formatRanges(chapters: Iterable<number>): string {
  const sorted = Array.from(new Set(chapters)).sort((a, b) => a - b);
  const parts: string[] = [];
  let i = 0;
  while (i < sorted.length) {
    let j = i;
    while (j + 1 < sorted.length && sorted[j + 1] === sorted[j] + 1) j++;
    parts.push(j > i ? `${sorted[i]}–${sorted[j]}` : String(sorted[i]));
    i = j + 1;
  }
  return parts.join(', ');
}

/**
 * Sélection pendant un glissement : on repart toujours de `base` (la
 * sélection d'avant le geste) et on ajoute ou retire la plage A…B dans
 * l'ordre des chapitres. Revenir en arrière réduit donc la plage.
 */
export function paintRange(base: ReadonlySet<number>, anchor: number, current: number, add: boolean): Set<number> {
  const next = new Set(base);
  const from = Math.min(anchor, current);
  const to = Math.max(anchor, current);
  for (let n = from; n <= to; n++) {
    if (add) next.add(n);
    else next.delete(n);
  }
  return next;
}

/** Chapitres 1 → `to` inclus. */
export function chapterRange(to: number): Set<number> {
  return new Set(Array.from({ length: Math.max(0, to) }, (_, i) => i + 1));
}
