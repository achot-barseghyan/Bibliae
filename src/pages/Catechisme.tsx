import { useNavigate, useParams } from 'react-router-dom';
import { IonContent, IonPage } from '@ionic/react';
import { useRemoteCatechismRange } from '../hooks/content/useRemoteCatechisme';
import { ChevronLeftIcon } from '../components/nav/icons';
import { tapHaptic } from '../utils/haptics';
import './Catechisme.css';
import WorldButton from '../components/nav/WorldButton';

const Catechisme: React.FC = () => {
  const navigate = useNavigate();
  const { ref = '' } = useParams<{ ref: string }>();
  const paragraphs = useRemoteCatechismRange(ref);

  return (
    <IonPage>
      <IonContent fullscreen className="catechisme-content">
        <header className="catechisme-header">
          <button
            type="button"
            className="catechisme-back"
            onClick={() => {
              tapHaptic();
              navigate(-1);
            }}
            aria-label="Retour"
          >
            <ChevronLeftIcon size={22} />
          </button>
          <h1 className="catechisme-header-title">Catéchisme</h1>
        </header>

        <div className="catechisme-body">
          <p className="catechisme-kicker">Catéchisme de l'Église catholique</p>
          <h2 className="catechisme-title">§ {ref}</h2>
          {paragraphs.length > 0 && (
            <p className="catechisme-subtitle">
              {paragraphs.length} paragraphe{paragraphs.length > 1 ? 's' : ''}
            </p>
          )}
          <div className="catechisme-rule" />

          {paragraphs.length > 0 ? (
            <div className="catechisme-paragraphs">
              {paragraphs.map((p) => (
                <p className="catechisme-paragraph" key={p.id}>
                  <span className="catechisme-paragraph-number">{p.number}</span>
                  {p.text}
                </p>
              ))}
            </div>
          ) : (
            <div className="catechisme-placeholder">
              <p className="catechisme-placeholder-text">
                Ce passage du Catéchisme n'est pas encore disponible dans l'application.
              </p>
            </div>
          )}
        </div>
        <WorldButton />
      </IonContent>
    </IonPage>
  );
};

export default Catechisme;
