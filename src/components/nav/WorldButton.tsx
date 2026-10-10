import { useLocation } from 'react-router-dom';
import RosaceNavBar from './RosaceNavBar';
import { COMPENDIUM_TABS, isCompendiumRoute } from './compendiumTabs';
import './WorldButton.css';

/**
 * Barre rosace des pages hors onglets du Compendium, à placer en dernier
 * enfant de l'IonContent : avec les 4 onglets dans les sous-écrans du
 * Compendium (fiche figure, Église…), avec les arcades partout ailleurs.
 *
 * Laisse sous le contenu une marge pour que la barre ne masque jamais la
 * fin de la page (désactivable via `spacer={false}` quand la page gère
 * elle-même son bas d'écran).
 */
interface WorldButtonProps {
  spacer?: boolean;
}

const WorldButton: React.FC<WorldButtonProps> = ({ spacer = true }) => {
  const { pathname } = useLocation();

  return (
    <>
      {spacer && <div className="world-button-spacer" aria-hidden="true" />}
      <RosaceNavBar tabs={isCompendiumRoute(pathname) ? COMPENDIUM_TABS : undefined} />
    </>
  );
};

export default WorldButton;
