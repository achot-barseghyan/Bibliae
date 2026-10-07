import { useNavigate } from 'react-router-dom';
import { IonContent, IonPage } from '@ionic/react';
import { ChevronLeftIcon } from '../../components/nav/icons';
import { tapHaptic } from '../../utils/haptics';
import './InfoPage.css';

const CONTACT_EMAIL = 'contact@bibliae.app';

const Contact: React.FC = () => {
  const navigate = useNavigate();

  return (
    <IonPage>
      <IonContent fullscreen className="info-page-content">
        <header className="info-page-header">
          <button
            type="button"
            className="info-page-back"
            onClick={() => {
              tapHaptic();
              navigate(-1);
            }}
            aria-label="Retour"
          >
            <ChevronLeftIcon size={20} />
          </button>
          <h1 className="info-page-header-title">Contact</h1>
        </header>

        <div className="info-page-body">
          <p className="info-page-paragraph">
            Une question, une erreur à signaler, une suggestion ? Écrivez-nous.
          </p>

          <a className="info-page-contact-button" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Contact;
