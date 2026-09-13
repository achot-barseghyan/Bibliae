import { useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { CrossIcon } from '../components/nav/icons';
import WorldSheet from '../components/nav/WorldSheet';
import { tapHaptic } from '../utils/haptics';
import BackupSection from './reglages/BackupSection';
import './Reglages.css';

const Reglages: React.FC = () => {
  const [isWorldSheetOpen, setIsWorldSheetOpen] = useState(false);

  return (
    <IonPage>
      <IonContent fullscreen className="reglages-content">
        <header className="reglages-header">
          <h1 className="reglages-title">Réglages</h1>
          <button
            type="button"
            className="reglages-world-button"
            onClick={() => {
              tapHaptic();
              setIsWorldSheetOpen(true);
            }}
            aria-label="Changer de monde"
          >
            <CrossIcon size={18} />
          </button>
        </header>

        <BackupSection />

        <WorldSheet isOpen={isWorldSheetOpen} onClose={() => setIsWorldSheetOpen(false)} />
      </IonContent>
    </IonPage>
  );
};

export default Reglages;
