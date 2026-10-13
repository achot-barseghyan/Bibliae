import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { IonContent, IonPage } from '@ionic/react';
import { useRemoteIntercession } from '../../hooks/content/useRemoteSaints';
import { useBookmarks } from '../../hooks/useBookmarks';
import WorldButton from '../../components/nav/WorldButton';
import NightStars from '../bible/NightStars';
import { RISE_IN, stagger, useBibleReducedMotion, useRevealOnce } from '../bible/bibleMotion';
import PrierHeroBar from './PrierHeroBar';
import PrierSearch from './PrierSearch';
import './SaintDetail.css';

/** Initiale du saint, sans son titre (« Sainte Rita » → R, « Saint Joseph » → J). */
const initialOf = (name: string) =>
  (
    name
      .replace(/^(Saints?|Saintes?|Bienheureux|Bienheureuse|Notre-Dame de|Notre-Dame)\s+/i, '')
      .replace(/^(l'|l’|le |la )/i, '')[0] ?? '✦'
  ).toUpperCase();

const SaintDetail: React.FC = () => {
  const navigate = useNavigate();
  const { situationId = '' } = useParams<{ situationId: string }>();
  const { isBookmarked, toggle } = useBookmarks();
  const { item, category } = useRemoteIntercession(situationId);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const reduceMotion = useBibleReducedMotion();
  const pageRef = useRef<HTMLDivElement>(null);

  useRevealOnce(situationId, () => {
    if (reduceMotion || !pageRef.current) return;
    stagger(pageRef.current.querySelectorAll('[data-t5]'), RISE_IN, { duration: 850, delay: 100, step: 100 });
  });

  if (!item) {
    return (
      <IonPage>
        <IonContent fullscreen className="prier-page">
          <div className="prier-hero saint-detail-hero">
            <PrierHeroBar backLabel="Situations" onBack={() => navigate(-1)} onSearch={() => setIsSearchOpen(true)} />
          </div>
          <p className="prier-not-found">Situation introuvable.</p>
          <AnimatePresence>{isSearchOpen && <PrierSearch onClose={() => setIsSearchOpen(false)} />}</AnimatePresence>
          <WorldButton />
        </IonContent>
      </IonPage>
    );
  }

  const bookmarkKey = `saint:${item.id}`;

  return (
    <IonPage>
      <IonContent fullscreen className="prier-page">
        <div ref={pageRef}>
          <div className="prier-hero saint-detail-hero">
            <NightStars count={24} seed={3} />
            <PrierHeroBar
              backLabel="Situations"
              onBack={() => navigate(-1)}
              onSearch={() => setIsSearchOpen(true)}
              isBookmarked={isBookmarked(bookmarkKey)}
              onToggleBookmark={() => toggle(bookmarkKey)}
            />
            <div className="prier-hero-inner saint-detail-center">
              {category && (
                <p className="prier-hero-kicker saint-detail-kicker" data-t5>
                  {category.label}
                </p>
              )}
              <h1 className="saint-detail-title" data-t5>
                {item.situation}
              </h1>

              <div className="saint-detail-medallion" data-t5 aria-hidden="true">
                <span className="saint-detail-medallion-glow" />
                <span className="saint-detail-medallion-rays" />
                <span className="saint-detail-medallion-rose" />
                <span className="saint-detail-medallion-initial">{initialOf(item.saintName)}</span>
              </div>

              <p className="saint-detail-name" data-t5>
                {item.saintName}
              </p>
              <p className="saint-detail-meta" data-t5>
                {item.saintMeta}
              </p>
            </div>
          </div>

          <p className="saint-detail-bio" data-t5>
            {item.bio}
          </p>

          <div className="saint-detail-prayer-wrap">
            <div className="saint-detail-prayer" data-t5>
              <span className="saint-detail-prayer-glow" aria-hidden="true" />
              <div className="saint-detail-prayer-head">
                <span className="saint-detail-prayer-label">Prière</span>
                <span className="saint-detail-prayer-rule" />
                <span className="saint-detail-prayer-fleuron" aria-hidden="true">
                  {'❧︎'}
                </span>
              </div>
              <p className="saint-detail-prayer-text">{item.prayer}</p>
            </div>
          </div>

          <p className="saint-detail-closing">
            <span className="prier-glyph" aria-hidden="true">
              {'✦︎'}
            </span>
            Puis un Notre Père et un Je vous salue, Marie.
          </p>
        </div>

        <AnimatePresence>{isSearchOpen && <PrierSearch onClose={() => setIsSearchOpen(false)} />}</AnimatePresence>
        <WorldButton />
      </IonContent>
    </IonPage>
  );
};

export default SaintDetail;
