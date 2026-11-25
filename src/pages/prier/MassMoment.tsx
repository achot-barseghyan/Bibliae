import { useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IonContent, IonPage } from '@ionic/react';
import { MASS_MOMENTS, MASS_SOURCE, POSTURE_GLYPHS, type MassRole } from '../../data/messe';
import WorldButton from '../../components/nav/WorldButton';
import { tapHaptic } from '../../utils/haptics';
import { RISE_IN, stagger, useBibleReducedMotion, useRevealOnce } from '../bible/bibleMotion';
import PrierHeroBar from './PrierHeroBar';
import { useOpenSearch } from '../accueil/searchContext';
import './Messe.css';

const ROLES: Record<MassRole, { mark: string; label: string }> = {
  P: { mark: '℣︎', label: 'Le prêtre' },
  L: { mark: '℣︎', label: 'Le lecteur' },
  D: { mark: '℣︎', label: 'Le diacre ou le prêtre' },
  M: { mark: '℣︎', label: 'Le prêtre ou le ministre' },
  A: { mark: '℟︎', label: "L'assemblée" },
  T: { mark: '✚︎', label: 'Tous ensemble' },
  R: { mark: '❧︎', label: 'À savoir' }
};

/** Un moment de la messe : qui dit quoi, l'attitude, le geste et le sens. */
const MassMoment: React.FC = () => {
  const navigate = useNavigate();
  const { momentId = '' } = useParams<{ momentId: string }>();
  const openSearch = useOpenSearch();
  const reduceMotion = useBibleReducedMotion();
  const pageRef = useRef<HTMLDivElement>(null);
  const index = MASS_MOMENTS.findIndex((m) => m.id === momentId);
  const moment = MASS_MOMENTS[index];
  const prev = MASS_MOMENTS[index - 1];
  const next = MASS_MOMENTS[index + 1];

  useRevealOnce(momentId, () => {
    if (!pageRef.current) return;
    // « Avant » / « Ensuite » réutilisent l'écran : on repart du haut.
    void pageRef.current.closest('ion-content')?.scrollToTop(0);
    if (reduceMotion) return;
    stagger(pageRef.current.querySelectorAll('[data-t7]'), RISE_IN, { duration: 850, delay: 100, step: 100 });
    stagger(pageRef.current.querySelectorAll('[data-ml]'), RISE_IN, { duration: 850, delay: 350, step: 110, maxStagger: 1800 });
  });

  const goTo = (id: string) => {
    tapHaptic();
    // Remplace l'écran : « La messe » ramène toujours à la liste.
    navigate(`/prier/messe/${id}`, { replace: true });
  };

  if (!moment) {
    return (
      <IonPage>
        <IonContent fullscreen className="prier-page">
          <div className="prier-hero messe-moment-hero">
            <PrierHeroBar backLabel="La messe" onBack={() => navigate(-1)} onSearch={() => openSearch(null)} />
          </div>
          <p className="prier-not-found">Moment introuvable.</p>
          <WorldButton />
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent fullscreen className="prier-page">
        <div ref={pageRef}>
          <div className="prier-hero messe-moment-hero">
            <span className="messe-moment-ring" aria-hidden="true" />
            <PrierHeroBar backLabel="La messe" onBack={() => navigate(-1)} onSearch={() => openSearch(null)} />
            <div className="prier-hero-inner messe-moment-center">
              <p className="messe-moment-pos">
                {index + 1} / {MASS_MOMENTS.length}
              </p>
              <p className="prier-hero-kicker messe-moment-part" data-t7>
                {moment.part}
              </p>
              <h1 className="messe-moment-title" data-t7>
                {moment.name}
              </h1>
              <p className="messe-moment-posture" data-t7>
                <span className="messe-moment-posture-glyph" aria-hidden="true">
                  {POSTURE_GLYPHS[moment.posture] ?? '✦︎'}
                </span>
                {moment.posture}
              </p>
            </div>
          </div>

          <div className="messe-lines">
            {moment.lines.map((line, i) => {
              const role = ROLES[line.role];
              const said = line.role === 'A' || line.role === 'T';
              return (
                <div
                  key={i}
                  className={`messe-line messe-line--${line.role}${said ? ' is-said' : ''}`}
                  data-ml
                >
                  <span className={`messe-mark${line.role === 'T' ? ' messe-mark--all' : ''}`} aria-hidden="true">
                    {role.mark}
                  </span>
                  <div>
                    <p className="messe-line-label">{role.label}</p>
                    <p className="messe-line-text">{line.text}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {moment.gesture && (
            <div className="messe-gesture" data-t7>
              <p className="messe-gesture-title">
                <span className="messe-gesture-dot" aria-hidden="true" />
                Le geste
              </p>
              <p className="messe-gesture-text">{moment.gesture}</p>
            </div>
          )}

          <div className="messe-why" data-t7>
            <p className="messe-why-title">Pourquoi ce moment</p>
            <p className="messe-why-text">{moment.why}</p>
          </div>

          <nav className="messe-nav" aria-label="Moments voisins">
            {prev ? (
              <button type="button" className="messe-nav-card messe-nav-card--prev" onClick={() => goTo(prev.id)}>
                <span className="messe-nav-label">← Avant</span>
                <span className="messe-nav-name">{prev.name}</span>
              </button>
            ) : (
              <span />
            )}
            {next && (
              <button type="button" className="messe-nav-card messe-nav-card--next" onClick={() => goTo(next.id)}>
                <span className="messe-nav-label">Ensuite →</span>
                <span className="messe-nav-name">{next.name}</span>
              </button>
            )}
          </nav>

          <p className="messe-source">
            <span className="prier-glyph" aria-hidden="true">
              {'✦︎'}
            </span>
            {MASS_SOURCE}
          </p>
        </div>

        <WorldButton />
      </IonContent>
    </IonPage>
  );
};

export default MassMoment;
