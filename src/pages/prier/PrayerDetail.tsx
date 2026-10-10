import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { IonContent, IonPage } from '@ionic/react';
import { LANGUAGE_LABELS, type PrayerLanguage } from '../../data/prayers';
import { useRemotePrayer } from '../../hooks/content/useRemotePrayers';
import { useBookmarks } from '../../hooks/useBookmarks';
import { SparkleIcon } from '../../components/nav/icons';
import PrierHeader from './PrierHeader';
import PrierSearch from './PrierSearch';
import './PrayerDetail.css';
import WorldButton from '../../components/nav/WorldButton';

const LANGUAGE_ORDER: PrayerLanguage[] = ['fr', 'en', 'la', 'el', 'arc'];

const PrayerDetail: React.FC = () => {
  const navigate = useNavigate();
  const { prayerId = '' } = useParams<{ prayerId: string }>();
  const { isBookmarked, toggle } = useBookmarks();
  const prayer = useRemotePrayer(prayerId);
  const [language, setLanguage] = useState<PrayerLanguage>('fr');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  if (!prayer) {
    return (
      <IonPage>
        <IonContent fullscreen className="prayer-detail-content">
          <PrierHeader
            label="Prier"
            roman="I"
            onBack={() => navigate(-1)}
            onSearch={() => setIsSearchOpen(true)}
          />
          <p className="prayer-detail-not-found">Prière introuvable.</p>
          <AnimatePresence>
            {isSearchOpen && <PrierSearch onClose={() => setIsSearchOpen(false)} />}
          </AnimatePresence>
          <WorldButton />
        </IonContent>
      </IonPage>
    );
  }

  const availableLanguages = LANGUAGE_ORDER.filter((lang) => prayer.texts[lang]);
  const activeLanguage = prayer.texts[language] ? language : 'fr';
  const bookmarkKey = `prayer:${prayer.id}`;

  return (
    <IonPage>
      <IonContent fullscreen className="prayer-detail-content">
        <PrierHeader
          label="Prières de l'Église catholique"
          onBack={() => navigate(-1)}
          onSearch={() => setIsSearchOpen(true)}
          isBookmarked={isBookmarked(bookmarkKey)}
          onToggleBookmark={() => toggle(bookmarkKey)}
        />

        <div className="prayer-detail-hero">
          <p className="prayer-detail-reference">{prayer.reference.toUpperCase()}</p>
          <h1 className="prayer-detail-title">{prayer.title}</h1>
        </div>

        <div className="prayer-detail-divider" aria-hidden="true" />

        {availableLanguages.length > 1 && (
          <div className="prayer-detail-tabs" role="tablist">
            {availableLanguages.map((lang) => (
              <button
                key={lang}
                type="button"
                role="tab"
                aria-selected={activeLanguage === lang}
                className={`prayer-detail-tab${activeLanguage === lang ? ' is-active' : ''}`}
                onClick={() => setLanguage(lang)}
              >
                {LANGUAGE_LABELS[lang].toUpperCase()}
              </button>
            ))}
          </div>
        )}

        <div className="prayer-detail-body">
          {(prayer.texts[activeLanguage] ?? '').split('\n\n').map((paragraph, i) => (
            <p className="prayer-detail-paragraph" key={i}>
              {paragraph}
            </p>
          ))}
        </div>

        <div className="prayer-detail-footer">
          <SparkleIcon size={14} className="prayer-detail-footer-sparkle" />
        </div>

        <AnimatePresence>
          {isSearchOpen && <PrierSearch onClose={() => setIsSearchOpen(false)} />}
        </AnimatePresence>
        <WorldButton />
      </IonContent>
    </IonPage>
  );
};

export default PrayerDetail;
