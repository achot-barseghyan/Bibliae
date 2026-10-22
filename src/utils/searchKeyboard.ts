// Clavier des champs de recherche (`input type="search"`), pour toute l'app.
// Les recherches partent pendant la frappe : une fois la saisie faite, le
// clavier ne sert plus et masque la moitié des résultats sur mobile. On le
// ferme donc :
// - à la touche loupe / Entrée du clavier ;
// - dès qu'on touche ailleurs que le champ (résultats, filtres, défilement).
// La croix d'effacement, dans le même champ, laisse le clavier ouvert pour
// retaper aussitôt.

function focusedSearchInput(): HTMLInputElement | null {
  const el = document.activeElement;
  return el instanceof HTMLInputElement && el.type === 'search' ? el : null;
}

export function installSearchKeyboardDismiss(): void {
  // Phase de bouillonnement : les gestionnaires React du champ (mémoriser la
  // recherche, Échap...) passent avant.
  document.addEventListener('keydown', (e) => {
    const input = focusedSearchInput();
    if (input && e.target === input && e.key === 'Enter' && !e.isComposing) input.blur();
  });

  const dismissOutside = (e: Event) => {
    const input = focusedSearchInput();
    if (!input) return;
    const field = input.closest('label') ?? input.parentElement ?? input;
    if (e.target instanceof Node && field.contains(e.target)) return;
    input.blur();
  };
  document.addEventListener('touchstart', dismissOutside, { passive: true, capture: true });
  document.addEventListener('mousedown', dismissOutside, { capture: true });
}
