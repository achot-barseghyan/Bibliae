import { useLocation, useNavigate } from 'react-router-dom';

/** État de navigation posé par la page qui ouvre un jour du plan. */
export interface PlanNavState {
  /** Libellé du bouton retour : la page d'où l'on vient (« Sommaire », « La Bible »...). */
  backLabel?: string;
}

export const FROM_SOMMAIRE: PlanNavState = { backLabel: 'Sommaire' };
export const FROM_BIBLE: PlanNavState = { backLabel: 'La Bible' };

/**
 * Retour depuis un jour du plan (ou le Jour 366) vers la page d'où l'on
 * vient : un vrai retour arrière, jamais une nouvelle entrée d'historique
 * (qui créait une boucle avec le bouton retour du sommaire). Les passages
 * d'un jour à l'autre se font en `replace` en gardant cet état, donc le
 * retour ramène toujours à la page d'origine. Ouvert sans historique (lien
 * direct, app relancée sur ce jour), on se rabat sur le sommaire.
 */
export function usePlanBack() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as PlanNavState | null) ?? undefined;
  // react-router donne la clé « default » à la toute première entrée.
  const hasHistory = location.key !== 'default';

  return {
    /** À transmettre aux navigations entre jours (replace), pour garder l'origine. */
    navState: state,
    backLabel: hasHistory ? (state?.backLabel ?? 'Retour') : 'Sommaire',
    goBack: () => {
      if (hasHistory) navigate(-1);
      else navigate('/bible/plan', { replace: true });
    }
  };
}
