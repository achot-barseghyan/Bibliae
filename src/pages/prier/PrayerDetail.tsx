import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { IonContent, IonPage } from '@ionic/react';
import { LANGUAGE_LABELS, type PrayerLanguage } from '../../data/prayers';
import { useRemotePrayer } from '../../hooks/content/useRemotePrayers';
import { useBookmarks } from '../../hooks/useBookmarks';
import WorldButton from '../../components/nav/WorldButton';
import { tapHaptic } from '../../utils/haptics';
import { RISE_IN, stagger, useBibleReducedMotion, useRevealOnce } from '../bible/bibleMotion';
import PrierHeroBar from './PrierHeroBar';
import PrierSearch from './PrierSearch';
import { PRAYER_LANGUAGE_ORDER } from './prayerLanguages';
import './PrayerDetail.css';

/** Dernière ligne « Amen » (latin, grec, araméen translittéré), mise en valeur. */
const AMEN = /^(Amen|Ameyn|Ἀμήν)\.?$/i;

const PrayerDetail: React.FC = () => {
  const navigate = useNavigate();
  const { prayerId = '' } = useParams<{ prayerId: string }>();
  const { isBookmarked, toggle } = useBookmarks();
  const prayer = useRemotePrayer(prayerId);
  const [language, setLanguage] = useState<PrayerLanguage>('fr');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const reduceMotion = useBibleReducedMotion();
  const heroRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const hasIntroRef = useRef(false);

  const activeLanguage: PrayerLanguage = prayer?.texts[language] ? language : 'fr';

  // Titre à l'ouverture, puis les lignes à chaque changement de langue.
  useRevealOnce(`${prayerId}:${activeLanguage}`, () => {
    if (reduceMotion) return;
    const isIntro = !hasIntroRef.current;
    hasIntroRef.current = true;
    if (isIntro && heroRef.current) {
      stagger(heroRef.current.querySelectorAll('[data-t3]'), RISE_IN, { duration: 850, delay: 100, step: 110 });
    }
    if (bodyRef.current) {
      stagger(
        bodyRef.current.querySelectorAll('[data-ln]'),
        [
          { opacity: 0, transform: 'translateY(10px)', filter: 'blur(6px)' },
          { opacity: 1, transform: 'none', filter: 'blur(0)' }
        ],
        { duration: 900, delay: isIntro ? 450 : 0, step: 90, maxStagger: 1800 }
      );
    }
  });

  if (!prayer) {
    return (
      <IonPage>
        <IonContent fullscreen className="prier-page">
          <div className="prier-hero prayer-detail-hero">
            <PrierHeroBar backLabel="Prières" onBack={() => navigate(-1)} onSearch={() => setIsSearchOpen(true)} />
          </div>
          <p className="prier-not-found">Prière introuvable.</p>
          <AnimatePresence>{isSearchOpen && <PrierSearch onClose={() => setIsSearchOpen(false)} />}</AnimatePresence>
          <WorldButton />
        </IonContent>
      </IonPage>
    );
  }

  const availableLanguages = PRAYER_LANGUAGE_ORDER.filter((lang) => prayer.texts[lang]);
  const languageIndex = availableLanguages.indexOf(activeLanguage);
  const bookmarkKey = `prayer:${prayer.id}`;
  const stanzas = (prayer.texts[activeLanguage] ?? '').split('\n\n').map((stanza) => stanza.split('\n'));
  // Grec et araméen : l'EB Garamond porte mieux leurs diacritiques que le Cormorant.
  const isOriental = activeLanguage === 'el' || activeLanguage === 'arc';

  return (
    <IonPage>
      <IonContent fullscreen className="prier-page">
        <div className="prier-hero prayer-detail-hero" ref={heroRef}>
          <span className="prayer-detail-rays" aria-hidden="true" />
          <PrierHeroBar
            backLabel="Prières"
            onBack={() => navigate(-1)}
            onSearch={() => setIsSearchOpen(true)}
            isBookmarked={isBookmarked(bookmarkKey)}
            onToggleBookmark={() => toggle(bookmarkKey)}
          />
          <div className="prier-hero-inner prayer-detail-center">
            <p className="prier-hero-kicker prayer-detail-kicker" data-t3>
              {prayer.reference}
            </p>
            <h1 className="prayer-detail-title" data-t3>
              {prayer.title}
            </h1>

            {availableLanguages.length > 1 && (
              <div
                className="prayer-detail-langs"
                role="tablist"
                data-t3
                style={{ '--lang-count': availableLanguages.length } as React.CSSProperties}
              >
                <span
                  className="prayer-detail-langs-thumb"
                  style={{ transform: `translateX(${languageIndex * 100}%)` }}
                  aria-hidden="true"
                />
                {availableLanguages.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    role="tab"
                    aria-selected={activeLanguage === lang}
                    className={`prayer-detail-lang${activeLanguage === lang ? ' is-active' : ''}`}
                    onClick={() => {
                      tapHaptic();
                      setLanguage(lang);
                    }}
                  >
                    {LANGUAGE_LABELS[lang]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div
          className={`prayer-detail-body${isOriental ? ' is-oriental' : ''}`}
          ref={bodyRef}
          lang={activeLanguage === 'arc' ? 'arc' : activeLanguage}
        >
          {stanzas.map((lines, i) => (
            <div className="prayer-detail-stanza" key={`${activeLanguage}-${i}`}>
              {lines.map((line, j) => (
                <p key={j} className={`prayer-detail-line${AMEN.test(line.trim()) ? ' is-amen' : ''}`} data-ln>
                  {line}
                </p>
              ))}
            </div>
          ))}
        </div>

        <div className="prayer-detail-end" aria-hidden="true">
          <span className="prayer-detail-end-rule" />
          <span className="prier-glyph">{'✦︎'}</span>
        </div>

        <AnimatePresence>{isSearchOpen && <PrierSearch onClose={() => setIsSearchOpen(false)} />}</AnimatePresence>
        <WorldButton />
      </IonContent>
    </IonPage>
  );
};

export default PrayerDetail;
