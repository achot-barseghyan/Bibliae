import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IonContent, IonPage } from '@ionic/react';
import { Preferences } from '@capacitor/preferences';
import { CheckIcon } from '../components/nav/icons';
import { tapHaptic } from '../utils/haptics';
import './Lieux.css';

/** Intérêt pour l'ouverture de la section, enregistré sur l'appareil : une
 * prochaine version pourra s'en servir pour prévenir l'utilisateur. */
const NOTIFY_KEY = 'bibliae:lieux:notify-on-open';

const BellIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 9a6 6 0 1 1 12 0c0 5 2 6.5 2 6.5H4S6 14 6 9Z" />
    <path d="M10 19a2 2 0 0 0 4 0" />
  </svg>
);

/** Rose des vents : quatre grandes pointes cardinales bicolores, quatre
 * petites pointes intercardinales, deux cercles et le nord marqué. */
const CompassRose: React.FC = () => {
  const cardinal = [0, 90, 180, 270];
  const intercardinal = [45, 135, 225, 315];
  const ticks = Array.from({ length: 16 }, (_, i) => i * 22.5);
  return (
    <svg className="lieux-compass" viewBox="-120 -130 240 250" aria-hidden="true">
      <circle r="112" className="lieux-compass-ring" />
      <circle r="74" className="lieux-compass-ring lieux-compass-ring--inner" />
      {ticks.map((angle) => (
        <line
          key={angle}
          y1={-112}
          y2={angle % 90 === 0 ? -100 : -106}
          transform={`rotate(${angle})`}
          className="lieux-compass-tick"
        />
      ))}
      <text y="-117" className="lieux-compass-north">
        N
      </text>
      <g className="lieux-compass-star">
        {intercardinal.map((angle) => (
          <g key={angle} transform={`rotate(${angle})`}>
            <path d="M0 0 L-9 -9 L0 -62 Z" className="lieux-compass-point--light" />
            <path d="M0 0 L9 -9 L0 -62 Z" className="lieux-compass-point--outline" />
          </g>
        ))}
        {cardinal.map((angle) => (
          <g key={angle} transform={`rotate(${angle})`}>
            <path d="M0 0 L-11 -11 L0 -92 Z" className="lieux-compass-point--dark" />
            <path d="M0 0 L11 -11 L0 -92 Z" className="lieux-compass-point--mid" />
          </g>
        ))}
        <circle r="5" className="lieux-compass-center" />
      </g>
    </svg>
  );
};

const Lieux: React.FC = () => {
  const navigate = useNavigate();
  const [wantsNotice, setWantsNotice] = useState(false);

  useEffect(() => {
    Preferences.get({ key: NOTIFY_KEY })
      .then(({ value }) => setWantsNotice(value === 'true'))
      .catch(() => {});
  }, []);

  const toggleNotice = () => {
    tapHaptic();
    const next = !wantsNotice;
    setWantsNotice(next);
    Preferences.set({ key: NOTIFY_KEY, value: String(next) }).catch(() => {});
  };

  return (
    <IonPage>
      <IonContent fullscreen className="lieux-content">
        <div className="lieux-page">
          <div className="lieux-hero">
            <CompassRose />

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
