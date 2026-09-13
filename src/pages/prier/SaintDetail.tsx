import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { IonContent, IonPage } from '@ionic/react';
import { useRemoteIntercession } from '../../hooks/content/useRemoteSaints';
import { useBookmarks } from '../../hooks/useBookmarks';
import { SparkleIcon } from '../../components/nav/icons';
import PrierHeader from './PrierHeader';
import PrierSearch from './PrierSearch';
import './SaintDetail.css';

const SaintDetail: React.FC = () => {
  const navigate = useNavigate();
  const { situationId = '' } = useParams<{ situationId: string }>();
  const { isBookmarked, toggle } = useBookmarks();
  const { item, category } = useRemoteIntercession(situationId);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  if (!item) {
    return (
      <IonPage>
        <IonContent fullscreen className="saint-detail-content">
          <PrierHeader
            label="Prier"
            roman="II"
            onBack={() => navigate(-1)}
            onSearch={() => setIsSearchOpen(true)}
          />
          <p className="saint-detail-not-found">Situation introuvable.</p>
          <AnimatePresence>
            {isSearchOpen && <PrierSearch onClose={() => setIsSearchOpen(false)} />}
          </AnimatePresence>
        </IonContent>
      </IonPage>
    );
  }

  const bookmarkKey = `saint:${item.id}`;

  return (
    <IonPage>
      <IonContent fullscreen className="saint-detail-content">
        <PrierHeader
          label="Demander l'intercession des saints"
          onBack={() => navigate(-1)}
          onSearch={() => setIsSearchOpen(true)}
          isBookmarked={isBookmarked(bookmarkKey)}
          onToggleBookmark={() => toggle(bookmarkKey)}
        />

        <div className="saint-detail-hero">
          {category && <p className="saint-detail-category">{category.label.toUpperCase()}</p>}
          <h1 className="saint-detail-title">{item.situation}</h1>
        </div>

        <div className="saint-detail-divider" aria-hidden="true" />

        <div className="saint-detail-saint">
          <SparkleIcon size={14} className="saint-detail-saint-sparkle" />
          <p className="saint-detail-saint-name">{item.saintName}</p>
          <p className="saint-detail-saint-meta">{item.saintMeta.toUpperCase()}</p>
        </div>

        <p className="saint-detail-bio">{item.bio}</p>

        <div className="saint-detail-prayer">
          <p className="saint-detail-prayer-label">Prière</p>
          <p className="saint-detail-prayer-text">{item.prayer}</p>
        </div>

        <p className="saint-detail-closing">
          <SparkleIcon size={11} className="saint-detail-closing-sparkle" />
          Puis un Notre Père et un Je vous salue, Marie.
        </p>

        <AnimatePresence>
          {isSearchOpen && <PrierSearch onClose={() => setIsSearchOpen(false)} />}
        </AnimatePresence>
      </IonContent>
    </IonPage>
  );
};

export default SaintDetail;
