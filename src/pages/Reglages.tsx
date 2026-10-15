import { IonContent, IonPage } from '@ionic/react';
import WorldButton from '../components/nav/WorldButton';
import AccessibilityPanel from '../components/AccessibilityPanel';
import ReadingPrefsSection from '../components/ReadingPrefsSection';
import ReadingPreview from '../components/ReadingPreview';
import BackupSection from './reglages/BackupSection';
import InfoLinksSection from './reglages/InfoLinksSection';
import './Reglages.css';

const Reglages: React.FC = () => {
  return (
    <IonPage>
      <IonContent fullscreen className="reglages-content">
        <header className="reglages-header">
          <h1 className="reglages-title">Réglages</h1>
        </header>

        <ReadingPreview className="reglages-preview" />
        <AccessibilityPanel />
        <ReadingPrefsSection />
        <BackupSection />
        <InfoLinksSection />
        <WorldButton />
      </IonContent>
    </IonPage>
  );
};

export default Reglages;
