import { useState } from 'react';
import { Navigate, Route } from 'react-router-dom';
import { IonRouterOutlet, IonTabs } from '@ionic/react';
import Accueil from '../pages/Accueil';
import Figures from '../pages/Figures';
import Lieux from '../pages/Lieux';
import Frise from '../pages/Frise';
import Eglise from '../pages/Eglise';
import AppTabBar from '../components/nav/AppTabBar';
import WorldSheet from '../components/nav/WorldSheet';
import NavigationTour from '../components/nav/NavigationTour';

const CompendiumTabs: React.FC = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
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
        <AppTabBar isSheetOpen={isSheetOpen} onOpenSheet={() => setIsSheetOpen(true)} />
      </IonTabs>

      <WorldSheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)} />

      <NavigationTour />
    </>
  );
};

export default CompendiumTabs;
