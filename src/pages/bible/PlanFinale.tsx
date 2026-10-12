import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { IonContent, IonPage } from '@ionic/react';
import WorldButton from '../../components/nav/WorldButton';
import { PLAN_CHAPTER_COUNT, PLAN_FINALE_DAY, PLAN_TITLE } from '../../data/readingPlan';
import { useReadingPlan } from '../../hooks/useReadingPlan';
import { tapHaptic } from '../../utils/haptics';
import BibleHeader from './BibleHeader';
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

  useEffect(() => {
    if (completedAt && !celebrated) markCelebrated();
  }, [completedAt, celebrated, markCelebrated]);

  if (!completedAt || !startedAt) return <Navigate to="/bible/plan" replace />;

  return (
    <IonPage>
      <IonContent fullscreen className="plan-content">
        <BibleHeader title={PLAN_TITLE} onBack={() => navigate('/bible/plan', { replace: true })} />

        <div className="plan-finale">
          <svg className="plan-finale-star" width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden="true">
            <circle cx="26" cy="26" r="21" stroke="currentColor" strokeWidth="0.7" opacity="0.45" />
            <path
              d="M26 2.5 30.2 21.8 49.5 26 30.2 30.2 26 49.5 21.8 30.2 2.5 26 21.8 21.8 26 2.5Z"
              stroke="currentColor"
              strokeWidth="0.8"
              strokeLinejoin="round"
            />
            <circle cx="26" cy="26" r="2.6" fill="currentColor" opacity="0.7" />
          </svg>
          <p className="plan-kicker">Jour {PLAN_FINALE_DAY}</p>
          <h1 className="plan-finale-title">Félicitations</h1>
          <p className="plan-finale-text">Vous avez achevé le plan {PLAN_TITLE}.</p>

          <dl className="plan-finale-facts">
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
              <dd>{PLAN_CHAPTER_COUNT.toLocaleString('fr-FR')}</dd>
            </div>
          </dl>

          <div className="plan-finale-actions">
            {isConfirmingRestart ? (
              <>
                <p className="plan-finale-warning">
                  Toutes les coches du plan seront effacées pour repartir du jour 1. Cet achèvement reste dans
                  l'historique.
                </p>
                <button
                  type="button"
                  className="plan-button"
                  onClick={() => {
                    tapHaptic();
                    restart();
                    navigate('/bible/plan/1', { replace: true });
                  }}
                >
                  Recommencer au jour 1
                </button>
                <button
                  type="button"
                  className="plan-button plan-button--outline"
                  onClick={() => setIsConfirmingRestart(false)}
                >
                  Annuler
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="plan-button"
                  onClick={() => {
                    tapHaptic();
                    setIsConfirmingRestart(true);
                  }}
                >
                  Recommencer le plan
                </button>
                <button
                  type="button"
                  className="plan-button plan-button--outline"
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

          <figure className="plan-finale-quote">
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
