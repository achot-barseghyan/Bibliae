import { useEffect, useRef } from 'react';
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
import NightStars from './NightStars';
import PlanFinale from './PlanFinale';
import { usePlanBack } from './usePlanBack';
import { RISE_IN, stagger, useBibleReducedMotion, useRevealOnce } from './bibleMotion';
import './BibleChapter.css';
import './ReadingPlan.css';

/** Les trois parties de la Bible d'où viennent les lectures de chaque jour, dans l'ordre. */
const PLAN_PARTS = ['De la Genèse aux Chroniques', "D'Esdras à Malachie", 'Nouveau Testament et Psaumes'];

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

const ARC_R = 80;
const ARC_C = 2 * Math.PI * ARC_R;
const ARC_GAP = 10;

/** Anneau du jour : un arc par lecture, doré une fois lue. */
const DayArcs: React.FC<{ reads: boolean[] }> = ({ reads }) => {
  const step = ARC_C / reads.length;
  const segment = step - ARC_GAP;
  return (
    <svg className="plan-day-arcs" width="176" height="176" viewBox="0 0 176 176" aria-hidden="true">
      {reads.map((isRead, i) => (
        <circle
          key={i}
          cx="88"
          cy="88"
          r={ARC_R}
          className={`plan-day-arc${isRead ? ' is-read' : ''}`}
          strokeDasharray={`${segment.toFixed(1)} ${(ARC_C - segment).toFixed(1)}`}
          strokeDashoffset={(-step * i - ARC_GAP / 2).toFixed(1)}
        />
      ))}
    </svg>
  );
};

/** Écran Lecture du jour (1…365) ; le jour 366 est l'écran Félicitations. */
const PlanDay: React.FC = () => {
  const navigate = useNavigate();
  const { day: dayParam = '' } = useParams<{ day: string }>();
  const n = Number(dayParam);
  const { progress, readsFor, setRefRead, setDayRead } = useReadingPlan();
  const reduceMotion = useBibleReducedMotion();
  const { navState, backLabel, goBack } = usePlanBack();
  const pageRef = useRef<HTMLDivElement>(null);

  // Le dernier jour vient d'être lu (ici ou au retour du lecteur) : écran
  // Félicitations, une seule fois.
  const shouldCelebrate = progress.completedAt !== null && !progress.celebrated;
  useEffect(() => {
    if (shouldCelebrate && n !== PLAN_FINALE_DAY) navigate(`/bible/plan/${PLAN_FINALE_DAY}`, { replace: true, state: navState });
  }, [shouldCelebrate, n, navigate, navState]);

  // Entrée du jour, rejouée à chaque changement de jour.
  useRevealOnce(n, () => {
    if (reduceMotion || !pageRef.current) return;
    stagger(pageRef.current.querySelectorAll('[data-d2]'), RISE_IN, { duration: 850, delay: 150, step: 90 });
  });

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
    navigate(`/bible/plan/${target}`, { replace: true, state: navState });
  };

  return (
    <IonPage>
      <IonContent fullscreen className="plan-content">
        <div className="plan-day-page" ref={pageRef}>
          <div className="plan-hero plan-hero--day">
            <NightStars count={26} seed={11} maxTop={60} />
            <div className="plan-hero-inner">
              <div className="plan-day-top">
                <button
                  type="button"
                  className="night-back"
                  onClick={() => {
                    tapHaptic();
                    goBack();
                  }}
                >
                  <ChevronLeftIcon size={16} />
                  {backLabel}
                </button>
                <span className="plan-day-top-title">{PLAN_TITLE}</span>
                <span aria-hidden="true" />
              </div>

              <div className="plan-day-hero">
                <p className="plan-hero-kicker" data-d2>
                  {kicker}
                </p>
                <div className="plan-day-ring" data-d2>
                  <span className="plan-day-ring-glow" aria-hidden="true" />
                  <span className="plan-day-ring-rays" aria-hidden="true" />
                  <DayArcs reads={reads} />
                  <h1 className="plan-day-ring-center">
                    <span className="plan-dial-label">Jour</span>
                    <span className="plan-day-ring-num">{n}</span>
                  </h1>
                </div>
                <p className="plan-day-line" data-d2>
                  {allRead ? 'Jour lu' : `${readCount} lecture${readCount > 1 ? 's' : ''} sur ${reads.length}`}
                </p>
              </div>
            </div>
          </div>

          <div className="plan-day-body">
            <ul className="plan-refs">
              {day.refs.map((ref, i) => {
                const isRead = reads[i] ?? false;
                const label = planRefLabel(ref);
                return (
                  <li key={i} className={`plan-ref${isRead ? ' is-read' : ''}`} data-d2>
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
                        <PlanCheck size={12} />
                      </span>
                    </button>
                    <div className="plan-ref-main">
                      <p className="plan-ref-part">{PLAN_PARTS[Math.min(i, PLAN_PARTS.length - 1)]}</p>
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
                      <ChevronRightIcon size={11} />
                    </button>
                  </li>
                );
              })}
            </ul>

            <button
              type="button"
              className={`plan-pill plan-day-toggle${allRead ? '' : ' plan-pill--accent'}`}
              onClick={() => {
                tapHaptic();
                setDayRead(n, !allRead);
              }}
            >
              {allRead ? 'Marquer non lu' : 'Marquer le jour lu'}
            </button>
            <p className="plan-day-note">Une lecture terminée dans le lecteur se coche d'elle-même.</p>
            {backLabel !== 'Sommaire' && (
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
            )}
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
