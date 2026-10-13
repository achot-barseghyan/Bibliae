import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CloseIcon, PlusIcon } from '../../components/nav/icons';
import { PLAN_LENGTH, PLAN_TITLE, getPlanDay, planDayLabel, planRefLabel } from '../../data/readingPlan';
import { useReadingPlan } from '../../hooks/useReadingPlan';
import { useReadingProgress } from '../../hooks/useReadingProgress';
import { tapHaptic } from '../../utils/haptics';
import { usePlanStart } from './usePlanStart';
import { FROM_BIBLE } from './usePlanBack';
import './ReadingPlan.css';

/** Le message « Plan masqué » disparaît seul après ce délai. */
const NOTICE_DURATION_MS = 8000;

/** Carte du plan « La Bible en 1 an », en tête de la liste des livres. */
const PlanCard: React.FC = () => {
  const navigate = useNavigate();
  const { progress, isStarted, doneCount, readsFor, setCardHidden } = useReadingPlan();
  const { activeParcours } = useReadingProgress();
  const { begin, prompt } = usePlanStart();
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
      <>
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
          <span className="plan-card-glow" aria-hidden="true" />
          <p className="plan-kicker">Plan de lecture</p>
          <div className="plan-card-head">
            <div>
              <h2 className="plan-card-title">{PLAN_TITLE}</h2>
              <p className="plan-card-text">
                Trois lectures par jour pendant {PLAN_LENGTH} jours, de la Genèse à l'Apocalypse.
              </p>
            </div>
            <span className="plan-card-days" aria-hidden="true">
              <span className="plan-card-days-value">{PLAN_LENGTH}</span>
              <span className="plan-card-days-unit">jours</span>
            </span>
          </div>
          {firstDay && (
            <div className="plan-card-day">
              <p className="plan-card-day-label">Jour 1</p>
              <ul className="plan-card-chips" aria-label={planDayLabel(firstDay)}>
                {firstDay.refs.map((ref, i) => (
                  <li key={i} className="plan-card-chip">
                    {planRefLabel(ref)}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="plan-card-actions">
            <button
              type="button"
              className="plan-card-cta"
              onClick={() => {
                tapHaptic();
                begin('/bible/plan/1', FROM_BIBLE);
              }}
            >
              <span className="plan-card-cta-shine" aria-hidden="true" />
              <span className="plan-card-cta-label">Commencer le plan</span>
              <span className="plan-card-cta-arrow" aria-hidden="true">
                →
              </span>
            </button>
            <button
              type="button"
              className="plan-link plan-card-link"
              onClick={() => {
                tapHaptic();
                navigate('/bible/plan');
              }}
            >
              Sommaire
            </button>
          </div>
        </section>
        {prompt}
      </>
    );
  }

  // Plan en cours : même carte de nuit, avec les lectures du jour.
  const current = progress.currentDay;
  const day = getPlanDay(current);
  const reads = readsFor(current);
  const readCount = reads.filter(Boolean).length;
  const allRead = reads.length > 0 && readCount === reads.length;

  return (
    <section className="plan-card plan-card--intro plan-card--running" aria-label={`Plan de lecture ${PLAN_TITLE}`}>
      <span className="plan-card-glow" aria-hidden="true" />
      <p className="plan-kicker">Plan de lecture</p>
      <div className="plan-card-head">
        <div>
          <h2 className="plan-card-title">{PLAN_TITLE}</h2>
          <p className="plan-card-text">
            {allRead
              ? 'Lectures du jour terminées.'
              : `${readCount} lecture${readCount > 1 ? 's' : ''} sur ${reads.length} aujourd'hui.`}{' '}
            {doneCount} / {PLAN_LENGTH} jours lus.
          </p>
        </div>
        <span className="plan-card-days" aria-hidden="true">
          <span className="plan-card-days-value">{current}</span>
          <span className="plan-card-days-unit">sur {PLAN_LENGTH}</span>
        </span>
      </div>
      {day && (
        <div className="plan-card-day">
          <p className="plan-card-day-label">Jour {current}</p>
          <ul className="plan-card-chips" aria-label={planDayLabel(day)}>
            {day.refs.map((ref, i) => (
              <li key={i} className={`plan-card-chip${reads[i] ? ' is-read' : ''}`}>
                {reads[i] && (
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-label="lu" role="img">
                    <path
                      d="M1.2 6.4l3.2 3.2 6.4-7.2"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                {planRefLabel(ref)}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="plan-card-actions">
        <button
          type="button"
          className="plan-card-cta"
          onClick={() => {
            tapHaptic();
            navigate(`/bible/plan/${current}`, { state: FROM_BIBLE });
          }}
        >
          <span className="plan-card-cta-shine" aria-hidden="true" />
          <span className="plan-card-cta-label">Continuer · Jour {current}</span>
          <span className="plan-card-cta-arrow" aria-hidden="true">
            →
          </span>
        </button>
        <button
          type="button"
          className="plan-link plan-card-link"
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
};

export default PlanCard;
