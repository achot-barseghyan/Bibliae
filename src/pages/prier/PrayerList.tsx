import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { IonContent, IonPage } from '@ionic/react';
import type { PrayerLanguage } from '../../data/prayers';
import { useRemotePrayers } from '../../hooks/content/useRemotePrayers';
import { ChevronRightIcon } from '../../components/nav/icons';
import WorldButton from '../../components/nav/WorldButton';
import { tapHaptic } from '../../utils/haptics';
import { RISE_IN, stagger, useBibleReducedMotion, useRevealOnce } from '../bible/bibleMotion';
import PrierHeroBar from './PrierHeroBar';
import { useOpenSearch } from '../accueil/searchContext';
import { PRAYER_LANGUAGE_ORDER } from './prayerLanguages';
import './PrayerList.css';

const SHORT_LABELS: Record<PrayerLanguage, string> = { fr: 'FR', en: 'EN', la: 'LA', el: 'EL', arc: 'ARC' };

/** Première lettre du titre, sans article (« L'Ange du Seigneur » → A). */
const initialOf = (title: string) => (title.replace(/^(l'|l’|le |la |les )/i, '')[0] ?? '✦').toUpperCase();

const PrayerList: React.FC = () => {
  const navigate = useNavigate();
  const openSearch = useOpenSearch();
  const prayers = useRemotePrayers();
  const reduceMotion = useBibleReducedMotion();
  const pageRef = useRef<HTMLDivElement>(null);

  useRevealOnce('intro', () => {
    if (reduceMotion || !pageRef.current) return;
    stagger(pageRef.current.querySelectorAll('[data-p2]'), RISE_IN, { duration: 850, delay: 150, step: 40, maxStagger: 900 });
  });

  return (
    <IonPage>
      <IonContent fullscreen className="prier-page">
        <div ref={pageRef}>
          <div className="prier-hero prayer-list-hero">
            <span className="prier-hero-numeral" aria-hidden="true">
              I
            </span>
            <PrierHeroBar backLabel="Prier" onBack={() => navigate(-1)} onSearch={() => openSearch('prieres')} />
            <h1 className="prier-hero-title" data-p2>
              Prières de l'Église catholique
            </h1>
            <p className="prier-hero-text" data-p2>
              Quand on ne sait pas quoi dire, on emprunte. Les prières que l'Église a gardées et transmises.
            </p>
          </div>

          <div className="prayer-list-rows">
            {prayers.map((prayer) => {
              const languages = PRAYER_LANGUAGE_ORDER.filter((lang) => prayer.texts[lang]);
              return (
                <button
                  key={prayer.id}
                  type="button"
                  className="prayer-list-row"
                  data-p2
                  onClick={() => {
                    tapHaptic();
                    navigate(`/prier/prieres/${prayer.id}`);
                  }}
                >
                  <span className="prayer-list-initial" aria-hidden="true">
                    {initialOf(prayer.title)}
                  </span>
                  <span className="prayer-list-row-body">
                    <span className="prayer-list-row-title">{prayer.title}</span>
                    <span className="prayer-list-row-meta">
                      <span className="prayer-list-row-reference">{prayer.reference}</span>
                      {languages.length > 1 && (
                        <span className="prayer-list-row-langs">
                          {languages.map((lang) => SHORT_LABELS[lang]).join(' · ')}
                        </span>
                      )}
                    </span>
                  </span>
                  <ChevronRightIcon size={13} className="prier-chevron" />
                </button>
              );
            })}
          </div>
        </div>

        <WorldButton />
      </IonContent>
    </IonPage>
  );
};

export default PrayerList;
