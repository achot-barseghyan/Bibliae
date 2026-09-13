import { useNavigate, useParams } from 'react-router-dom';
import { IonContent, IonPage } from '@ionic/react';
import { useRemoteCouncil } from '../hooks/content/useRemoteCouncils';
import { CloseIcon } from '../components/nav/icons';
import { tapHaptic } from '../utils/haptics';
import './FullScreenWorld.css';

const CouncilText: React.FC = () => {
  const navigate = useNavigate();
  const { councilId = '' } = useParams<{ councilId: string }>();
  const council = useRemoteCouncil(councilId);

  return (
    <IonPage>
      <IonContent fullscreen className="full-screen-world">
        <header className="full-screen-world-header">
          <button
            type="button"
            className="full-screen-world-close"
            onClick={() => {
              tapHaptic();
              navigate(-1);
            }}
            aria-label="Fermer"
          >
            <CloseIcon size={20} />
          </button>
        </header>

        <div className="full-screen-world-body">
          <h1 className="full-screen-world-title">{council?.title ?? 'Texte introuvable'}</h1>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default CouncilText;
