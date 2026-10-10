import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { IonContent, IonPage } from '@ionic/react';
import { useRemoteSaints } from '../../hooks/content/useRemoteSaints';
import { ChevronRightIcon } from '../../components/nav/icons';
import PrierHeader from './PrierHeader';
import PrierSearch from './PrierSearch';
import './SaintsList.css';
import WorldButton from '../../components/nav/WorldButton';

const SaintsList: React.FC = () => {
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const intercessionCategories = useRemoteSaints();

  return (
    <IonPage>
      <IonContent fullscreen className="saints-list-content">
        <PrierHeader
          label="Prier"
          roman="II"
          onBack={() => navigate(-1)}
          onSearch={() => setIsSearchOpen(true)}
        />

        <div className="saints-list-hero">
          <h1 className="saints-list-title">Demander l'intercession des saints</h1>
          <p className="saints-list-subtitle">
            Dis ce que tu traverses. À chaque situation, un saint qui l'a connue, et une prière
            pour la lui confier.
          </p>
        </div>

        <p className="saints-list-kicker">Situations</p>

        {intercessionCategories.map((category) => (
          <div className="saints-list-category" key={category.key}>
            <p className="saints-list-category-label">{category.label.toUpperCase()}</p>
            {category.items.map((item) => (
              <button
                key={item.id}
                type="button"
                className="saints-list-row"
                onClick={() => navigate(`/prier/saints/${item.id}`)}
              >
                <span className="saints-list-row-body">
                  <span className="saints-list-row-title">{item.situation}</span>
                  <span className="saints-list-row-saint">{item.saintName.toUpperCase()}</span>
                </span>
                <ChevronRightIcon size={17} className="saints-list-row-chevron" />
              </button>
            ))}
          </div>
        ))}

        <AnimatePresence>
          {isSearchOpen && <PrierSearch onClose={() => setIsSearchOpen(false)} />}
        </AnimatePresence>
        <WorldButton />
      </IonContent>
    </IonPage>
  );
};

export default SaintsList;
