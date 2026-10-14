import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { IonContent, IonPage } from '@ionic/react';
import { useBookmarks } from '../../hooks/useBookmarks';
import { useRemotePrayers } from '../../hooks/content/useRemotePrayers';
import { useRemoteSaints } from '../../hooks/content/useRemoteSaints';
import WorldButton from '../../components/nav/WorldButton';
import { tapHaptic } from '../../utils/haptics';
import NightStars from '../bible/NightStars';
import { RISE_IN, stagger, useBibleReducedMotion, useRevealOnce } from '../bible/bibleMotion';
import PrierHeroBar from './PrierHeroBar';
import { useOpenSearch } from '../accueil/searchContext';
import './PrierHome.css';

const PrierHome: React.FC = () => {
  const navigate = useNavigate();
  const { isBookmarked, toggle } = useBookmarks();
  const openSearch = useOpenSearch();
  const prayers = useRemotePrayers();
  const categories = useRemoteSaints();
  const situationCount = categories.reduce((n, c) => n + c.items.length, 0);
  const reduceMotion = useBibleReducedMotion();
  const pageRef = useRef<HTMLDivElement>(null);

  useRevealOnce('intro', () => {
    if (reduceMotion || !pageRef.current) return;
    stagger(pageRef.current.querySelectorAll('[data-in]'), RISE_IN, { duration: 900, delay: 100, step: 120 });
  });

  const sections = [
    {
      roman: 'I',
      title: "Prières de l'Église catholique",
      description: "Quand on ne sait pas quoi dire, on emprunte. Les prières que l'Église a gardées et transmises.",
      count: `${prayers.length} prière${prayers.length > 1 ? 's' : ''}`,
      path: '/prier/prieres',
      variant: 'prayers'
    },
    {
      roman: 'II',
      title: "Demander l'intercession des saints",
      description:
        "Dis ce que tu traverses. À chaque situation, un saint qui l'a connue, et une prière pour la lui confier.",
      count: `${situationCount} situations · ${categories.length} domaines`,
      path: '/prier/saints',
      variant: 'saints'
    }
  ];

  return (
    <IonPage>
      <IonContent fullscreen className="prier-page">
        <div ref={pageRef}>
          <div className="prier-hero prier-home-hero">
            <NightStars count={24} seed={3} />
            <PrierHeroBar
              onSearch={() => openSearch(null)}
              isBookmarked={isBookmarked('prier:home')}
              onToggleBookmark={() => toggle('prier:home')}
            />
            <div className="prier-hero-inner prier-home-center">
              <div className="prier-candle" data-in aria-hidden="true">
                <span className="prier-candle-glow" />
                <span className="prier-candle-flame" />
                <span className="prier-candle-wick" />
                <span className="prier-candle-body" />
              </div>
              <p className="prier-hero-kicker prier-home-kicker" data-in>
                Vie de prière
              </p>
              <h1 className="prier-home-title" data-in>
                Prier
              </h1>
              <p className="prier-home-subtitle" data-in>
                Ce que l'Église a gardé et transmis, à consulter selon le besoin.
              </p>
            </div>
          </div>

          <div className="prier-home-sections">
            {sections.map((section) => (
              <button
                key={section.path}
                type="button"
                className={`prier-home-card prier-home-card--${section.variant}`}
                data-in
                onClick={() => {
                  tapHaptic();
                  navigate(section.path);
                }}
              >
                <span className="prier-home-card-numeral" aria-hidden="true">
                  {section.roman}
                </span>
                <span className="prier-home-card-shine" aria-hidden="true" />
                <span className="prier-home-card-count">{section.count}</span>
                <span className="prier-home-card-title">{section.title}</span>
                <span className="prier-home-card-text">{section.description}</span>
              </button>
            ))}
          </div>

          <footer className="prier-home-footer">
            <span className="prier-glyph" aria-hidden="true">
              {'✦︎'}
            </span>
            <p className="prier-home-quote">
              « Nous ne savons pas prier comme il faut ;
              <br />
              l'Esprit lui-même intercède pour nous. »
            </p>
            <p className="prier-home-reference">Rm 8, 26</p>
          </footer>
        </div>

        <WorldButton />
      </IonContent>
    </IonPage>
  );
};

export default PrierHome;
