import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { IonContent, IonPage } from '@ionic/react';
import { useBookmarks } from '../../hooks/useBookmarks';
import { ChevronRightIcon } from '../../components/nav/icons';
import WorldButton from '../../components/nav/WorldButton';
import PrierHeader from './PrierHeader';
import PrierSearch from './PrierSearch';
import './PrierHome.css';

const SECTIONS = [
  {
    roman: 'I',
    title: "Prières de l'Église catholique",
    description:
      "Quand on ne sait pas quoi dire, on emprunte. Les prières que l'Église a gardées et transmises.",
    path: '/prier/prieres'
  },
  {
    roman: 'II',
    title: 'Demander l\'intercession des saints',
    description:
      "Dis ce que tu traverses. À chaque situation, un saint qui l'a connue, et une prière pour la lui confier.",
    path: '/prier/saints'
  }
];

const PrierHome: React.FC = () => {
  const navigate = useNavigate();
  const { isBookmarked, toggle } = useBookmarks();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <IonPage>
      <IonContent fullscreen className="prier-home-content">
        <PrierHeader
          label="Prier"
          onSearch={() => setIsSearchOpen(true)}
          isBookmarked={isBookmarked('prier:home')}
          onToggleBookmark={() => toggle('prier:home')}
        />

        <div className="prier-home-hero">
          <p className="prier-home-kicker">Vie de prière</p>
          <h1 className="prier-home-title">Prier</h1>
          <p className="prier-home-subtitle">
            Ce que l'Église a gardé et transmis, à consulter selon le besoin.
          </p>
        </div>

        <div className="prier-home-divider" aria-hidden="true" />

        <div className="prier-home-sections">
          {SECTIONS.map((section) => (
            <button
              key={section.path}
              type="button"
              className="prier-home-row"
              onClick={() => navigate(section.path)}
            >
              <span className="prier-home-row-roman">{section.roman}</span>
              <span className="prier-home-row-body">
                <span className="prier-home-row-title">{section.title}</span>
                <span className="prier-home-row-description">{section.description}</span>
              </span>
              <ChevronRightIcon size={18} className="prier-home-row-chevron" />
            </button>
          ))}
        </div>

        <footer className="prier-home-footer">
          <p className="prier-home-quote">
            « Nous ne savons pas prier comme il faut ; l'Esprit lui-même intercède pour nous. »
          </p>
          <p className="prier-home-reference">Rm 8, 26</p>
        </footer>

        <AnimatePresence>
          {isSearchOpen && <PrierSearch onClose={() => setIsSearchOpen(false)} />}
        </AnimatePresence>
        <WorldButton />
      </IonContent>
    </IonPage>
  );
};

export default PrierHome;
