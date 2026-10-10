import { useNavigate } from 'react-router-dom';
import { IonContent, IonPage } from '@ionic/react';
import { ChevronLeftIcon } from '../../components/nav/icons';
import { tapHaptic } from '../../utils/haptics';
import './InfoPage.css';
import WorldButton from '../../components/nav/WorldButton';

const Sources: React.FC = () => {
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
          <h1 className="info-page-header-title">Sources</h1>
        </header>

        <div className="info-page-body">
          <p className="info-page-paragraph">
            Les textes affichés dans Bibliae proviennent des sources suivantes.
          </p>

          <ul className="info-page-list">
            <li className="info-page-list-item">
              <p className="info-page-list-title">Bible Crampon (1923)</p>
              <p className="info-page-list-desc">
                Texte biblique du domaine public, adapté et modernisé pour cette application.
              </p>
            </li>
            <li className="info-page-list-item">
              <p className="info-page-list-title">AELF</p>
              <p className="info-page-list-desc">
                Association Épiscopale Liturgique pour les pays Francophones : messe et liturgie
                des heures du calendrier romain actuel (introduction, hymnes, psaumes, lectures,
                oraisons…).
              </p>
            </li>
            <li className="info-page-list-item">
              <p className="info-page-list-title">CatéGPT · Divinum Officium</p>
              <p className="info-page-list-desc">
                Calendrier liturgique, messe et office selon le calendrier traditionnel (Vetus
                Ordo, 1962).
              </p>
            </li>
            <li className="info-page-list-item">
              <p className="info-page-list-title">Prières traditionnelles de l'Église</p>
              <p className="info-page-list-desc">
                Textes publics de l'Église catholique (Notre Père, Je vous salue Marie, chapelet
                du Rosaire…).
              </p>
            </li>
          </ul>
        </div>
        <WorldButton />
      </IonContent>
    </IonPage>
  );
};

export default Sources;
