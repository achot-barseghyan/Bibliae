import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { IonContent, IonPage } from '@ionic/react';
import WorldButton from '../../components/nav/WorldButton';
import { PLAN_CHAPTER_COUNT, PLAN_FINALE_DAY, PLAN_TITLE } from '../../data/readingPlan';
import { useReadingPlan } from '../../hooks/useReadingPlan';
import { tapHaptic } from '../../utils/haptics';
import { ChevronLeftIcon } from '../../components/nav/icons';
import NightStars from './NightStars';
import { usePlanBack } from './usePlanBack';
import { RISE_IN, countUp, stagger, useBibleReducedMotion, useRevealOnce } from './bibleMotion';
import './ReadingPlan.css';

/** « 1er janvier 2026 », « 31 décembre 2026 ». */
function formatLongDate(iso: string): string {
  const date = new Date(iso);
  const formatted = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  return date.getDate() === 1 ? formatted.replace(/^1 /, '1er ') : formatted;
}

/** Écran Jour 366 : affiché quand le dernier jour du plan devient lu. Sobre, pas de confettis. */
const PlanFinale: React.FC = () => {
  const navigate = useNavigate();
  const { progress, markCelebrated, restart, archive } = useReadingPlan();
  const [isConfirmingRestart, setIsConfirmingRestart] = useState(false);
  const { startedAt, completedAt, celebrated } = progress;
  const reduceMotion = useBibleReducedMotion();
  const { navState, backLabel, goBack } = usePlanBack();
  const pageRef = useRef<HTMLDivElement>(null);
  const chaptersRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (completedAt && !celebrated) markCelebrated();
  }, [completedAt, celebrated, markCelebrated]);

  useRevealOnce(completedAt, () => {
    if (pageRef.current && !reduceMotion) {
      stagger(pageRef.current.querySelectorAll('[data-f4]'), RISE_IN, { duration: 950, delay: 200, step: 130 });
    }
    countUp(chaptersRef.current, PLAN_CHAPTER_COUNT, 800, reduceMotion, (v) => v.toLocaleString('fr-FR'));
  });

  if (!completedAt || !startedAt) return <Navigate to="/bible/plan" replace />;

  return (
    <IonPage>
      <IonContent fullscreen className="plan-finale-content">
        <div className="plan-finale" ref={pageRef}>
          <NightStars count={26} seed={11} maxTop={60} />
          <button
            type="button"
            className="night-back plan-finale-back"
            onClick={() => {
              tapHaptic();
              goBack();
            }}
          >
            <ChevronLeftIcon size={16} />
            {backLabel}
          </button>

          <div className="plan-finale-emblem" data-f4>
            <span className="plan-finale-emblem-rays" aria-hidden="true" />
            <span className="plan-finale-emblem-glow" aria-hidden="true" />
            <svg width="64" height="64" viewBox="0 0 52 52" fill="none" aria-hidden="true">
              <circle cx="26" cy="26" r="21" stroke="#F0D58E" strokeWidth="0.7" opacity="0.5" />
              <path d="M26 2.5 30.2 21.8 49.5 26 30.2 30.2 26 49.5 21.8 30.2 2.5 26 21.8 21.8Z" fill="#F0D58E" />
            </svg>
          </div>
          <p className="plan-hero-kicker plan-finale-kicker" data-f4>
            Jour {PLAN_FINALE_DAY}
          </p>
          <h1 className="plan-finale-title" data-f4>
            Félicitations
          </h1>
          <p className="plan-finale-text" data-f4>
            Vous avez achevé le plan {PLAN_TITLE}.
          </p>

          <dl className="plan-finale-facts" data-f4>
            <div className="plan-finale-fact">
              <dt>Commencé</dt>
              <dd>{formatLongDate(startedAt)}</dd>
            </div>
            <div className="plan-finale-fact">
              <dt>Achevé</dt>
              <dd>{formatLongDate(completedAt)}</dd>
            </div>
            <div className="plan-finale-fact">
              <dt>Chapitres lus</dt>
              <dd ref={chaptersRef} />
            </div>
          </dl>

          <div className="plan-finale-actions" data-f4>
            {isConfirmingRestart ? (
              <>
                <p className="plan-finale-warning">
                  Toutes les coches du plan seront effacées pour repartir du jour 1. Cet achèvement reste dans
                  l'historique.
                </p>
                <button
                  type="button"
                  className="gold-cta"
                  onClick={() => {
                    tapHaptic();
                    restart();
                    navigate('/bible/plan/1', { replace: true, state: navState });
                  }}
                >
                  <span>Recommencer au jour 1</span>
                </button>
                <button type="button" className="plan-finale-outline" onClick={() => setIsConfirmingRestart(false)}>
                  Annuler
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="gold-cta"
                  onClick={() => {
                    tapHaptic();
                    setIsConfirmingRestart(true);
                  }}
                >
                  <span>Recommencer le plan</span>
                </button>
                <button
                  type="button"
                  className="plan-finale-outline"
                  onClick={() => {
                    tapHaptic();
                    archive();
                    navigate('/bible', { replace: true });
                  }}
                >
                  Archiver
                </button>
              </>
            )}
          </div>

          <figure className="plan-finale-quote" data-f4>
            <blockquote>
              « L'herbe sèche, la fleur tombe ;
              <br />
              mais la parole de notre Dieu
              <br />
              subsiste éternellement. »
            </blockquote>
            <cite>Es 40, 8</cite>
          </figure>
        </div>
        <WorldButton />
      </IonContent>
    </IonPage>
  );
};

export default PlanFinale;
