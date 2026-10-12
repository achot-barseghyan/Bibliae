import { useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { IonContent, IonPage } from '@ionic/react';
import WorldButton from '../../components/nav/WorldButton';
import { ChevronLeftIcon, ChevronRightIcon } from '../../components/nav/icons';
import {
  PLAN_FINALE_DAY,
  PLAN_LENGTH,
  PLAN_TITLE,
  getPlanDay,
  planReaderPath,
  planRefLabel
} from '../../data/readingPlan';
import { useReadingPlan } from '../../hooks/useReadingPlan';
import { tapHaptic } from '../../utils/haptics';
import BibleHeader from './BibleHeader';
import PlanFinale from './PlanFinale';
import './BibleChapter.css';
import './ReadingPlan.css';

/** Coche du plan (or dans le sommaire, papier dans les ronds pleins). */
export const PlanCheck: React.FC<{ size?: number; label?: string }> = ({ size = 12, label }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 12 12"
    fill="none"
    role={label ? 'img' : undefined}
    aria-label={label}
    aria-hidden={label ? undefined : true}
  >
    <path
      d="M1.2 6.4l3.2 3.2 6.4-7.2"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** Écran Lecture du jour (1…365) ; le jour 366 est l'écran Félicitations. */
const PlanDay: React.FC = () => {
  const navigate = useNavigate();
  const { day: dayParam = '' } = useParams<{ day: string }>();
  const n = Number(dayParam);
  const { progress, readsFor, setRefRead, setDayRead } = useReadingPlan();

  // Le dernier jour vient d'être lu (ici ou au retour du lecteur) : écran
  // Félicitations, une seule fois.
  const shouldCelebrate = progress.completedAt !== null && !progress.celebrated;
  useEffect(() => {
    if (shouldCelebrate && n !== PLAN_FINALE_DAY) navigate(`/bible/plan/${PLAN_FINALE_DAY}`, { replace: true });
  }, [shouldCelebrate, n, navigate]);

  if (n === PLAN_FINALE_DAY) return <PlanFinale />;

  const day = getPlanDay(n);
  if (!day) return <Navigate to="/bible/plan" replace />;

  const reads = readsFor(n);
  const readCount = reads.filter(Boolean).length;
  const allRead = readCount === reads.length;
  const kicker = n === progress.currentDay ? "Aujourd'hui" : n < progress.currentDay ? 'Jour passé' : 'À venir';
  const canGoNext = n < PLAN_LENGTH || progress.completedAt !== null;

  const goTo = (target: number) => {
    tapHaptic();
    navigate(`/bible/plan/${target}`, { replace: true });
  };

  return (
    <IonPage>
      <IonContent fullscreen className="plan-content">
        <div className="plan-day-page">
        <BibleHeader title={PLAN_TITLE} onBack={() => navigate(-1)} />

        <div className="plan-day-body">
          <div className="plan-day-hero">
            <p className="plan-kicker">{kicker}</p>
            <h1 className="plan-day-title">Jour {n}</h1>
            <p className="plan-day-sub">
              {allRead ? 'Jour lu' : `${readCount} lecture${readCount > 1 ? 's' : ''} sur ${reads.length}`}
            </p>
            <div className="plan-day-rule" aria-hidden="true" />
            <p className="plan-day-position">
              {n} / {PLAN_LENGTH}
            </p>
          </div>

          <ul className="plan-refs">
            {day.refs.map((ref, i) => {
              const isRead = reads[i] ?? false;
              const label = planRefLabel(ref);
              return (
                <li key={i} className={`plan-ref${isRead ? ' is-read' : ''}`}>
                  <button
                    type="button"
                    className="plan-ref-toggle"
                    aria-pressed={isRead}
                    aria-label={`${label} : ${isRead ? 'lu' : 'non lu'}`}
                    onClick={() => {
                      tapHaptic();
                      setRefRead(n, i, !isRead, 'manual');
                    }}
                  >
                    <span className="plan-ref-circle">
                      <PlanCheck size={11} />
                    </span>
                  </button>
                  <div className="plan-ref-main">
                    <p className="plan-ref-label">{label}</p>
                    {ref.vv && <p className="plan-ref-verses">versets {ref.vv}</p>}
                  </div>
                  <button
                    type="button"
                    className="plan-ref-read"
                    aria-label={`Lire ${label}`}
                    onClick={() => {
                      tapHaptic();
                      navigate(planReaderPath(ref, n, i));
                    }}
                  >
                    Lire
                    <ChevronRightIcon size={10} />
                  </button>
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            className={`plan-button plan-day-toggle${allRead ? ' plan-button--outline' : ''}`}
            onClick={() => {
              tapHaptic();
              setDayRead(n, !allRead);
            }}
          >
            {allRead ? 'Marquer non lu' : 'Marquer le jour lu'}
          </button>
          <p className="plan-day-note">Une lecture terminée dans le lecteur se coche d'elle-même.</p>
          <button
            type="button"
            className="plan-link plan-day-summary"
            onClick={() => {
              tapHaptic();
              navigate('/bible/plan');
            }}
          >
            Sommaire du plan
          </button>
        </div>

        {/* Même pied que le lecteur : le centre reste libre pour la rosace. */}
        <footer className="bible-chapter-pager">
          <button
            type="button"
            className="bible-chapter-pager-side bible-chapter-pager-side--prev"
            disabled={n <= 1}
            onClick={() => goTo(n - 1)}
            aria-label="Jour précédent"
          >
            <ChevronLeftIcon size={16} className="bible-chapter-pager-chevron" />
            <span className="bible-chapter-pager-side-text">
              <span className="bible-chapter-pager-side-label">Précédent</span>
              {n > 1 && <span className="bible-chapter-pager-side-value">Jour {n - 1}</span>}
            </span>
          </button>
          <span className="bible-chapter-pager-center" aria-hidden="true" />
          <button
            type="button"
            className="bible-chapter-pager-side bible-chapter-pager-side--next"
            disabled={!canGoNext}
            onClick={() => goTo(n + 1)}
            aria-label="Jour suivant"
          >
            <span className="bible-chapter-pager-side-text">
              <span className="bible-chapter-pager-side-label">Suivant</span>
              <span className="bible-chapter-pager-side-value">Jour {n + 1}</span>
            </span>
            <ChevronRightIcon size={16} className="bible-chapter-pager-chevron" />
          </button>
        </footer>
        </div>
        <WorldButton spacer={false} />
      </IonContent>
    </IonPage>
  );
};

export default PlanDay;
