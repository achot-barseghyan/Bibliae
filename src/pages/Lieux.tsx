import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IonContent, IonPage } from '@ionic/react';
import CompassRose from '../components/CompassRose';
import { CheckIcon } from '../components/nav/icons';
import { getWantsLieuxNotice, setWantsLieuxNotice } from '../services/lieuxNotice';
import { tapHaptic } from '../utils/haptics';
import './Lieux.css';

const BellIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 9a6 6 0 1 1 12 0c0 5 2 6.5 2 6.5H4S6 14 6 9Z" />
    <path d="M10 19a2 2 0 0 0 4 0" />
  </svg>
);

const Lieux: React.FC = () => {
  const navigate = useNavigate();
  const [wantsNotice, setWantsNotice] = useState(false);

  useEffect(() => {
    // Demande enregistrée sur l'appareil : quand la section ouvrira
    // (LIEUX_AVAILABLE), une annonce s'affichera au lancement — voir
    // LieuxOpeningNotice.
    getWantsLieuxNotice().then(setWantsNotice);
  }, []);

  const toggleNotice = () => {
    tapHaptic();
    const next = !wantsNotice;
    setWantsNotice(next);
    setWantsLieuxNotice(next);
  };

  return (
    <IonPage>
      <IonContent fullscreen className="lieux-content">
        <div className="lieux-page">
          <div className="lieux-hero">
            <CompassRose className="lieux-compass" />

            <div className="lieux-divider">
              <span className="lieux-divider-label">En préparation</span>
            </div>

            <h1 className="lieux-title">Les lieux de la Bible</h1>
            <p className="lieux-message">Cette section n'est pas encore disponible. Nous y travaillons.</p>
          </div>

          <div className="lieux-actions">
            <button
              type="button"
              className={`lieux-notify${wantsNotice ? ' is-on' : ''}`}
              onClick={toggleNotice}
              aria-pressed={wantsNotice}
            >
              {wantsNotice ? <CheckIcon size={16} /> : <BellIcon />}
              {wantsNotice ? 'C’est noté, nous vous préviendrons' : 'Me prévenir à l’ouverture'}
            </button>
            <button
              type="button"
              className="lieux-back"
              onClick={() => {
                tapHaptic();
                navigate('/compendium/accueil');
              }}
            >
              Retour au Compendium
            </button>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Lieux;
