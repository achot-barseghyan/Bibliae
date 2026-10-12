import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CloseIcon, PlusIcon } from '../../components/nav/icons';
import { PLAN_LENGTH, PLAN_TITLE, getPlanDay, planDayLabel, planRefLabel } from '../../data/readingPlan';
import { useReadingPlan } from '../../hooks/useReadingPlan';
import { useReadingProgress } from '../../hooks/useReadingProgress';
import { tapHaptic } from '../../utils/haptics';
import './ReadingPlan.css';

/** Le message « Plan masqué » disparaît seul après ce délai. */
const NOTICE_DURATION_MS = 8000;

/** Carte du plan « La Bible en 1 an », en tête de la liste des livres. */
const PlanCard: React.FC = () => {
  const navigate = useNavigate();
  const { progress, isStarted, doneCount, readsFor, start, setCardHidden } = useReadingPlan();
  const { activeParcours } = useReadingProgress();
  // Message affiché à la place de la carte juste après l'avoir masquée.
  const [isNoticeVisible, setIsNoticeVisible] = useState(false);

  useEffect(() => {
    if (!isNoticeVisible) return;
    const timer = window.setTimeout(() => setIsNoticeVisible(false), NOTICE_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [isNoticeVisible]);

  if (progress.cardHidden) {
    if (!isNoticeVisible) return null;
    return (
      <div className="plan-notice" role="status">
        <div className="plan-notice-body">
          <PlusIcon size={16} className="plan-notice-icon" />
          <p className="plan-notice-text">
            Plan masqué. Vous pouvez y accéder à tout moment depuis le bandeau{' '}
            <em>{activeParcours?.name ?? 'du parcours actif'}</em>, rubrique Plans de lecture.
          </p>
        </div>
        <div className="plan-notice-actions">
          <button
            type="button"
            className="plan-link"
            onClick={() => {
              tapHaptic();
              setCardHidden(false);
              setIsNoticeVisible(false);
            }}
          >
            Annuler
          </button>
          <button type="button" className="plan-link plan-link--muted" onClick={() => setIsNoticeVisible(false)}>
            Compris
          </button>
        </div>
      </div>
    );
  }

  if (!isStarted) {
    const firstDay = getPlanDay(1);
    return (
      <section className="plan-card plan-card--intro" aria-label={`Plan de lecture ${PLAN_TITLE}`}>
        <button
          type="button"
          className="plan-card-close"
          aria-label="Masquer le plan"
          onClick={() => {
            tapHaptic();
            setCardHidden(true);
            setIsNoticeVisible(true);
          }}
        >
          <CloseIcon size={16} />
        </button>
        <p className="plan-kicker">Plan de lecture</p>
        <h2 className="plan-card-title">{PLAN_TITLE}</h2>
        <p className="plan-card-text">
          Trois lectures par jour pendant 365 jours, de la Genèse à l'Apocalypse.
        </p>
        {firstDay && (
          <div className="plan-card-day">
            <p className="plan-card-day-label">Jour 1</p>
            <p className="plan-card-day-refs">{planDayLabel(firstDay)}</p>
          </div>
        )}
        <div className="plan-card-actions">
          <button
            type="button"
            className="plan-button"
            onClick={() => {
              tapHaptic();
              start();
              navigate('/bible/plan/1');
            }}
          >
            Commencer le plan
          </button>
          <button
            type="button"
            className="plan-link"
            onClick={() => {
              tapHaptic();
              navigate('/bible/plan');
            }}
          >
            Sommaire
          </button>
        </div>
      </section>
    );
  }

  const day = getPlanDay(progress.currentDay);
  const reads = readsFor(progress.currentDay);
  const readCount = reads.filter(Boolean).length;

  return (
    <button
      type="button"
      className="plan-card plan-card--active"
      onClick={() => {
        tapHaptic();
        navigate(`/bible/plan/${progress.currentDay}`);
      }}
    >
      <span className="plan-card-top">
        <span className="plan-card-plan">
          <span className="plan-card-dot" aria-hidden="true" />
          <span className="plan-kicker">Plan · {PLAN_TITLE}</span>
        </span>
        <span className="plan-card-status">
          {readCount} / {reads.length} lu
        </span>
      </span>
      <span className="plan-card-title">
        Jour {progress.currentDay}
      </span>
      <span className="plan-card-refs">
        {day?.refs.map((ref, i) => (
          <span key={i} className={`plan-card-ref${reads[i] ? ' is-read' : ''}`}>
            <span className="plan-card-ref-dot" aria-hidden="true" />
            <span>
              {planRefLabel(ref)}
            </span>
          </span>
        ))}
      </span>
      <span className="plan-card-progress">
        <span className="plan-track" aria-hidden="true">
          <span className="plan-track-fill" style={{ width: `${(doneCount / PLAN_LENGTH) * 100}%` }} />
        </span>
        <span className="plan-count">
          {doneCount} / {PLAN_LENGTH}
        </span>
      </span>
    </button>
  );
};

export default PlanCard;
