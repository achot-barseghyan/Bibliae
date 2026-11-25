import { useLocation, useNavigate } from 'react-router-dom';
import { tapHaptic } from '../../utils/haptics';
import { rubriquePath, type RubriqueKey } from '../../data/egliseRubriques';

/** Présent quand la page a été ouverte depuis la page parente : « Retour » revient alors dans l'historique. */
export interface NavState {
  fromParent?: boolean;
}

/** Retour d'une page de partie vers sa rubrique. */
export function useBackToRubrique(key: RubriqueKey) {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as NavState | null;

  return () => {
    tapHaptic();
    if (state?.fromParent) navigate(-1);
    // Ouverte depuis une autre page : la rubrique prend sa place, et son
    // propre « Retour » revient à la page précédente.
    else navigate(rubriquePath(key), { replace: true, state: { fromParent: true } satisfies NavState });
  };
}
