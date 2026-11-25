import { resetAppData } from './appDataStore';
import { clearLieuxNoticeFlags } from './lieuxNotice';
import { logout as quizLogout } from './quizApi';

/**
 * Efface toutes les données personnelles stockées sur l'appareil : favoris,
 * notes, surlignages, parcours et progression, réglages, positions de lecture
 * et visites guidées déjà vues. Les caches de contenu (textes distants,
 * calendrier liturgique) sont conservés : ils ne contiennent rien de personnel.
 */
export async function eraseAllUserData(): Promise<void> {
  resetAppData();

  // localStorage ne contient que des états d'interface de l'app (positions de
  // lecture, sélection de la frise, visites guidées vues).
  try {
    localStorage.clear();
  } catch {
    // stockage indisponible : rien à effacer
  }

  await clearLieuxNoticeFlags();
  // Déconnexion du quiz du jour (le compte, lui, reste sur le serveur).
  await quizLogout();
}
