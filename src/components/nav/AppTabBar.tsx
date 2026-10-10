import RosaceNavBar from './RosaceNavBar';
import { COMPENDIUM_TABS } from './compendiumTabs';
import './AppTabBar.css';

/**
 * Barre d'onglets du Compendium : la barre rosace avec ses 4 onglets.
 * La barre elle-même est fixée en bas de l'écran ; ce conteneur, placé dans
 * le slot du bas d'IonTabs, réserve sa hauteur sous les pages.
 */
const AppTabBar: React.FC = () => (
  <div className="app-tab-bar" slot="bottom">
    <RosaceNavBar tabs={COMPENDIUM_TABS} />
  </div>
);

export default AppTabBar;
