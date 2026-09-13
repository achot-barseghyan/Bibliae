// Fusion du contenu local (par défaut, toujours présent, images incluses)
// avec les surcharges venues du contenu distant. Le distant ne fournit que
// les champs qu'il veut changer ; tout champ absent garde sa valeur locale.

export type Override<T> = Partial<T> & { id: string };

/**
 * Fusionne un tableau local (source de vérité pour l'ordre et les champs non
 * couverts, ex. les images) avec des surcharges distantes identifiées par `id`.
 * Une surcharge dont l'id n'existe pas localement est ignorée (ex. image manquante).
 */
export function mergeArrayById<T extends { id: string }>(
  local: T[],
  remote: Array<Override<T>> | null | undefined
): T[] {
  if (!remote || remote.length === 0) return local;
  const overridesById = new Map(remote.map((item) => [item.id, item]));
  return local.map((item) => {
    const override = overridesById.get(item.id);
    return override ? { ...item, ...override } : item;
  });
}

/**
 * Fusionne un objet local flat (ex. les textes de la page d'accueil) avec
 * une surcharge distante partielle.
 */
export function mergeObject<T extends object>(local: T, remote: Partial<T> | null | undefined): T {
  if (!remote) return local;
  return { ...local, ...remote };
}

/**
 * Fusionne un dictionnaire local (Record<clé, T>) avec des surcharges
 * distantes fournies pour tout ou partie des clés.
 */
export function mergeRecord<T extends object>(
  local: Record<string, T>,
  remote: Record<string, Partial<T>> | null | undefined
): Record<string, T> {
  if (!remote) return local;
  const result: Record<string, T> = { ...local };
  for (const key of Object.keys(remote)) {
    if (key in result) {
      result[key] = { ...result[key], ...remote[key] };
    }
  }
  return result;
}
