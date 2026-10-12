import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IonContent, IonPage } from '@ionic/react';
import WorldButton from '../../components/nav/WorldButton';
import { ChevronDownIcon } from '../../components/nav/icons';
import {
  PLAN_FINALE_DAY,
  PLAN_GROUPS,
  PLAN_LENGTH,
  PLAN_TITLE,
  planDayLabel
} from '../../data/readingPlan';
import { useReadingPlan } from '../../hooks/useReadingPlan';
import { tapHaptic } from '../../utils/haptics';
import BibleHeader from './BibleHeader';
import { PlanCheck } from './PlanDay';
import './ReadingPlan.css';

/** Écran Introduction et sommaire du plan. */
const PlanSommaire: React.FC = () => {
  const navigate = useNavigate();
  const { progress, isStarted, doneCount, readCount, readsFor, start, archive } = useReadingPlan();
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);
  const current = progress.currentDay;
  // Un seul groupe ouvert par défaut : celui du jour courant. `null` = aucun.
  const [openBook, setOpenBook] = useState<string | null | undefined>(undefined);
  const defaultBook = PLAN_GROUPS.find((g) => current >= g.first && current <= g.last)?.book ?? null;
  const expanded = openBook === undefined ? defaultBook : openBook;

  const openDay = (n: number) => {
    tapHaptic();
    navigate(`/bible/plan/${n}`);
  };

  return (
    <IonPage>
      <IonContent fullscreen className="plan-content">
        <BibleHeader title="Plan de lecture" onBack={() => navigate(-1)} />

        <div className="plan-body">
          <section className="plan-intro">
            <p className="plan-kicker">Introduction du plan</p>
            <h1 className="plan-intro-title">{PLAN_TITLE}</h1>
            <p className="plan-intro-text">
              Chaque jour, trois lectures prises dans trois parties de la Bible : de la Genèse aux Chroniques,
              d'Esdras à Malachie, et le Nouveau Testament avec les Psaumes.
            </p>
            <div className="plan-intro-progress">
              <span className="plan-track" aria-hidden="true">
                <span className="plan-track-fill" style={{ width: `${(doneCount / PLAN_LENGTH) * 100}%` }} />
              </span>
              <span className="plan-count">
                {doneCount} / {PLAN_LENGTH} jours
              </span>
            </div>
            <button
              type="button"
              className="plan-button plan-button--outline"
              onClick={() => {
                if (!isStarted) start();
                openDay(isStarted ? current : 1);
              }}
            >
              {isStarted ? `Reprendre · Jour ${current}` : 'Commencer'}
            </button>
          </section>

          <h2 className="plan-section-title">
            <span className="plan-kicker">Sommaire</span>
          </h2>

          {PLAN_GROUPS.map((group) => {
            const isOpen = expanded === group.book;
            const done = group.days.filter((d) => readsFor(d.n).every(Boolean)).length;
            return (
              <div key={group.first}>
                <button
                  type="button"
                  className="plan-group-header"
                  aria-expanded={isOpen}
                  onClick={() => {
                    tapHaptic();
                    setOpenBook(isOpen ? null : group.book);
                  }}
                >
                  <span className="plan-group-book">{group.book}</span>
                  <span className="plan-group-range">
                    jours {group.first} – {group.last}
                  </span>
                  <span className={`plan-group-count${done === group.days.length ? ' is-complete' : ''}`}>
                    {done} / {group.days.length}
                  </span>
                  <ChevronDownIcon size={10} className="plan-group-chevron" />
                </button>

                {isOpen &&
                  group.days.map((day) => {
                    const reads = readsFor(day.n);
                    const isDone = reads.every(Boolean);
                    const isPartial = !isDone && reads.some(Boolean);
                    const classes = [
                      'plan-day-row',
                      isDone ? 'is-done' : '',
                      day.n === current ? 'is-current is-selected' : ''
                    ]
                      .filter(Boolean)
                      .join(' ');
                    return (
                      <button
                        key={day.n}
                        type="button"
                        className={classes}
                        aria-current={day.n === current ? 'step' : undefined}
                        onClick={() => openDay(day.n)}
                      >
                        <span className="plan-day-num">{day.n}</span>
                        <span className="plan-day-refs">{planDayLabel(day)}</span>
                        <span className="plan-day-state">
                          {isDone && <PlanCheck size={12} label="Lu" />}
                          {isPartial && <span className="plan-day-partial" aria-label="Commencé" role="img" />}
                        </span>
                      </button>
                    );
                  })}
              </div>
            );
          })}

          <button
            type="button"
            className="plan-finale-row"
            disabled={!progress.completedAt}
            onClick={() => openDay(PLAN_FINALE_DAY)}
          >
            <span className="plan-finale-num">{PLAN_FINALE_DAY}</span>
            <span className="plan-finale-label">Félicitations</span>
          </button>

          {isStarted && (
            <section className="plan-reset">
              {isConfirmingReset ? (
                <>
                  <p className="plan-reset-warning">
                    {readCount > 0
                      ? `Les ${readCount} lecture${readCount > 1 ? 's' : ''} cochée${readCount > 1 ? 's' : ''} seront effacées et le plan reviendra à son état de départ.`
                      : 'Le plan reviendra à son état de départ.'}
                  </p>
                  <button
                    type="button"
                    className="plan-button"
                    onClick={() => {
                      tapHaptic();
                      // Même effet que l'archivage : coches effacées, plan « jamais commencé »,
                      // historique des plans achevés conservé.
                      archive();
                      setIsConfirmingReset(false);
                      setOpenBook(undefined);
                    }}
                  >
                    Réinitialiser le plan
                  </button>
                  <button
                    type="button"
                    className="plan-button plan-button--outline"
                    onClick={() => setIsConfirmingReset(false)}
                  >
                    Annuler
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="plan-link"
                  onClick={() => {
                    tapHaptic();
                    setIsConfirmingReset(true);
                  }}
                >
                  Réinitialiser le plan
                </button>
              )}
            </section>
          )}
        </div>
        <WorldButton />
      </IonContent>
    </IonPage>
  );
};

export default PlanSommaire;
