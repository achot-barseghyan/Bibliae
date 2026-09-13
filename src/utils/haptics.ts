import { Haptics, ImpactStyle } from '@capacitor/haptics';

// Léger retour haptique sur les gestes de navigation (changer d'onglet,
// changer de monde, revenir en arrière). Échoue silencieusement là où
// l'API Vibration n'existe pas (desktop, iOS Safari en navigateur).
export function tapHaptic(): void {
  Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
}
