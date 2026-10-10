import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { IonContent, IonPage } from '@ionic/react';
import { useRemotePrayers } from '../../hooks/content/useRemotePrayers';
import { ChevronRightIcon } from '../../components/nav/icons';
import PrierHeader from './PrierHeader';
import PrierSearch from './PrierSearch';
import './PrayerList.css';
import WorldButton from '../../components/nav/WorldButton';

const PrayerList: React.FC = () => {
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const prayers = useRemotePrayers();

  return (
    <IonPage>
      <IonContent fullscreen className="prayer-list-content">
        <PrierHeader
          label="Prier"
          roman="I"
          onBack={() => navigate(-1)}
          onSearch={() => setIsSearchOpen(true)}
        />

        <div className="prayer-list-hero">
          <h1 className="prayer-list-title">Prières de l'Église catholique</h1>
          <p className="prayer-list-subtitle">
            Quand on ne sait pas quoi dire, on emprunte. Les prières que l'Église a gardées et
            transmises.
          </p>
        </div>

        <p className="prayer-list-kicker">Prières</p>

        <div className="prayer-list-rows">
          {prayers.map((prayer) => (
            <button
              key={prayer.id}
              type="button"
              className="prayer-list-row"
              onClick={() => navigate(`/prier/prieres/${prayer.id}`)}
            >
              <span className="prayer-list-row-body">
                <span className="prayer-list-row-title">{prayer.title}</span>
                <span className="prayer-list-row-reference">{prayer.reference.toUpperCase()}</span>
              </span>
              <ChevronRightIcon size={17} className="prayer-list-row-chevron" />
            </button>
          ))}
        </div>

        <AnimatePresence>
          {isSearchOpen && <PrierSearch onClose={() => setIsSearchOpen(false)} />}
        </AnimatePresence>
        <WorldButton />
      </IonContent>
    </IonPage>
  );
};

export default PrayerList;
