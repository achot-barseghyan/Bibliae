import { Navigate, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import CompendiumTabs from './navigation/CompendiumTabs';
import Bible from './pages/Bible';
import Rosaire from './pages/Rosaire';
import Prier from './pages/Prier';
import FigureDetail from './pages/figures/FigureDetail';
import CouncilText from './pages/CouncilText';
import Reglages from './pages/Reglages';
import Favoris from './pages/Favoris';
import JourLiturgique from './pages/JourLiturgique';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* Bibliae uses a single fixed manuscript palette — no dark variant */
/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
/* import '@ionic/react/css/palettes/dark.system.css'; */

/* Theme variables */
import './theme/variables.css';
import './theme/desktopFrame.css';

setupIonicReact();

const App: React.FC = () => (
  <div className="app-shell">
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route path="/compendium/*" element={<CompendiumTabs />} />
          <Route path="/bible/*" element={<Bible />} />
          <Route path="/rosaire" element={<Rosaire />} />
          <Route path="/prier/*" element={<Prier />} />
          <Route path="/figures/:figureId" element={<FigureDetail />} />
          <Route path="/credo/:councilId" element={<CouncilText />} />
          <Route path="/reglages" element={<Reglages />} />
          <Route path="/favoris" element={<Favoris />} />
          <Route path="/liturgie" element={<JourLiturgique />} />
          <Route path="/liturgie/:date" element={<JourLiturgique />} />
          <Route path="/" element={<Navigate to="/compendium/accueil" replace />} />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  </div>
);

export default App;
