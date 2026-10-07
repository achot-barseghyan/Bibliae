import { useNavigate } from 'react-router-dom';
import { IonContent, IonPage } from '@ionic/react';
import { ChevronLeftIcon } from '../../components/nav/icons';
import { tapHaptic } from '../../utils/haptics';
import './InfoPage.css';

const APropos: React.FC = () => {
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
          <h1 className="info-page-header-title">À propos</h1>
        </header>

        <div className="info-page-body">
          <h2 className="info-page-title">Bibliae</h2>
          <p className="info-page-tagline">Compendium de la Bible, dans la tradition catholique</p>

          <p className="info-page-paragraph">
            Bibliae relie les personnages, les généalogies, les lieux et les événements bibliques
            dans un seul espace de lecture. Chaque fiche cite les versets, les commentaires des
            Pères de l'Église et l'enseignement du Catéchisme.
          </p>

          <p className="info-page-section-title">Dans l'application</p>
          <ul className="info-page-list">
            <li className="info-page-list-item">
              <p className="info-page-list-title">Compendium</p>
              <p className="info-page-list-desc">Figures, lieux, frise et Église : l'index de la Bible.</p>
            </li>
            <li className="info-page-list-item">
              <p className="info-page-list-title">La Bible</p>
              <p className="info-page-list-desc">Les 73 livres, à lire, annoter et suivre chapitre par chapitre.</p>
            </li>
            <li className="info-page-list-item">
              <p className="info-page-list-title">Prier</p>
              <p className="info-page-list-desc">Prières traditionnelles et intercession des saints.</p>
            </li>
            <li className="info-page-list-item">
              <p className="info-page-list-title">Le Rosaire</p>
              <p className="info-page-list-desc">La prière du Rosaire, mystère par mystère.</p>
            </li>
            <li className="info-page-list-item">
              <p className="info-page-list-title">Jour liturgique</p>
              <p className="info-page-list-desc">La messe et la liturgie des heures du jour.</p>
            </li>
          </ul>

          <p className="info-page-footer-note">Développé par Adrien Barseghyan.</p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default APropos;
