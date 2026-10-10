import { Navigate, Route } from 'react-router-dom';
import { IonRouterOutlet, IonTabs } from '@ionic/react';
import Accueil from '../pages/Accueil';
import Figures from '../pages/Figures';
import Lieux from '../pages/Lieux';
import Frise from '../pages/Frise';
import Eglise from '../pages/Eglise';
import AppTabBar from '../components/nav/AppTabBar';
import NavigationTour from '../components/nav/NavigationTour';

const CompendiumTabs: React.FC = () => (
  <>
    <IonTabs>
      <IonRouterOutlet>
        <Route path="accueil" element={<Accueil />} />
        <Route path="figures" element={<Figures />} />
        <Route path="lieux" element={<Lieux />} />
        <Route path="frise" element={<Frise />} />
        <Route path="eglise" element={<Eglise />} />
        <Route path="*" element={<Navigate to="accueil" replace />} />
      </IonRouterOutlet>
      <AppTabBar />
    </IonTabs>

    <NavigationTour />
  </>
);

export default CompendiumTabs;
