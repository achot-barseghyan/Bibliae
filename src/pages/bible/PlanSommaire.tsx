import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IonContent, IonPage } from '@ionic/react';
import WorldButton from '../../components/nav/WorldButton';
import { ChevronDownIcon, ChevronLeftIcon } from '../../components/nav/icons';
import { PLAN_FINALE_DAY, PLAN_GROUPS, PLAN_LENGTH, PLAN_TITLE, planDayLabel } from '../../data/readingPlan';
import { useReadingPlan } from '../../hooks/useReadingPlan';
import { tapHaptic } from '../../utils/haptics';
import NightStars from './NightStars';
import { FROM_SOMMAIRE } from './usePlanBack';
import { usePlanStart } from './usePlanStart';
import { PlanCheck } from './PlanDay';
import { RISE_IN, countUp, stagger, useBibleReducedMotion, useRevealOnce } from './bibleMotion';
import './ReadingPlan.css';

/** Remplit le cadran (graduations dorées + repère) jusqu'à `degrees`. */
function setDial(dial: HTMLElement | null, mark: HTMLElement | null, degrees: number) {
  const mask = `conic-gradient(#000 0deg ${degrees.toFixed(2)}deg, transparent ${degrees.toFixed(2)}deg)`;
  if (dial) {
    dial.style.webkitMaskImage = mask;
    dial.style.maskImage = mask;
  }
  if (mark) mark.style.transform = `rotate(${degrees.toFixed(2)}deg)`;
}

/** Écran Introduction et sommaire du plan. */
const PlanSommaire: React.FC = () => {
  const navigate = useNavigate();
  const reduceMotion = useBibleReducedMotion();
  const { progress, isStarted, doneCount, readCount, readsFor, archive } = useReadingPlan();
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);
  const { begin, prompt } = usePlanStart();
  const current = progress.currentDay;
  // Un seul groupe ouvert par défaut : celui du jour courant. `null` = aucun.
  const [openBook, setOpenBook] = useState<string | null | undefined>(undefined);
  const defaultBook = PLAN_GROUPS.find((g) => current >= g.first && current <= g.last)?.book ?? null;
  const expanded = openBook === undefined ? defaultBook : openBook;

  const heroRef = useRef<HTMLDivElement>(null);
  const groupsRef = useRef<HTMLDivElement>(null);
  const dialRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const dayNumRef = useRef<HTMLSpanElement>(null);
  const hasPlayedIntroRef = useRef(false);

  // Entrée de la page, une fois.
  useRevealOnce('intro', () => {
    if (reduceMotion) return;
    if (heroRef.current) stagger(heroRef.current.querySelectorAll('[data-in]'), RISE_IN, { duration: 950, delay: 100, step: 110 });
    if (groupsRef.current) {
      stagger(groupsRef.current.querySelectorAll('[data-group]'), RISE_IN, { duration: 950, delay: 700, step: 50, maxStagger: 600 });
    }
  });

  // Cadran des 365 jours : tourne jusqu'aux jours lus à l'ouverture, se cale ensuite.
  const shownDay = isStarted ? current : 1;
  useEffect(() => {
    const target = (doneCount / PLAN_LENGTH) * 360;
    const animate = !reduceMotion && !hasPlayedIntroRef.current;
    hasPlayedIntroRef.current = true;
    // Pas d'annulation au nettoyage : StrictMode rejoue l'effet aussitôt, et
    // couper le compteur le figerait sur sa valeur finale sans l'animer.
    countUp(dayNumRef.current, shownDay, 400, !animate);
    if (!animate) {
      setDial(dialRef.current, markRef.current, target);
      return;
    }
    const start = performance.now() + 500;
    const tick = (now: number) => {
      const p = Math.max(0, Math.min(1, (now - start) / 2200));
      setDial(dialRef.current, markRef.current, target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doneCount, shownDay]);

  // Jours d'un groupe qui s'ouvre : glissent en place.
  useEffect(() => {
    if (reduceMotion || openBook === undefined || !groupsRef.current) return;
    stagger(
      groupsRef.current.querySelectorAll('[data-day-row]'),
      [{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }],
      { duration: 500, step: 22, maxStagger: 500 }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openBook]);

  const openDay = (n: number) => {
    tapHaptic();
    navigate(`/bible/plan/${n}`, { state: FROM_SOMMAIRE });
  };

  return (
    <IonPage>
      <IonContent fullscreen className="plan-content">
        <div className="plan-hero plan-hero--sommaire" ref={heroRef}>
          <NightStars count={26} seed={11} maxTop={60} />
          <div className="plan-hero-inner">
            <div className="plan-hero-top" data-in>
              <button
                type="button"
                className="night-back"
                onClick={() => {
                  tapHaptic();
                  navigate(-1);
                }}
              >
                <ChevronLeftIcon size={16} />
                La Bible
              </button>
              <span className="plan-hero-tag">Plan de lecture</span>
            </div>
            <p className="plan-hero-kicker" data-in>
              Introduction du plan
            </p>
            <h1 className="plan-hero-title" data-in>
              {PLAN_TITLE}
            </h1>
            <p className="plan-hero-text" data-in>
              Chaque jour, trois lectures prises dans trois parties de la Bible : de la Genèse aux Chroniques,
              d'Esdras à Malachie, et le Nouveau Testament avec les Psaumes.
            </p>

            <div className="plan-dial" data-in>
              <span className="plan-dial-glow" aria-hidden="true" />
              <span className="plan-dial-ticks" aria-hidden="true" />
              <div className="plan-dial-fill" ref={dialRef} aria-hidden="true">
                <span className="plan-dial-ticks plan-dial-ticks--gold" />
              </div>
              <div className="plan-dial-mark" ref={markRef} aria-hidden="true">
                <span />
              </div>
              <span className="plan-dial-inner" aria-hidden="true" />
              <div className="plan-dial-center">
                <span className="plan-dial-label">Jour</span>
                <span className="plan-dial-day" ref={dayNumRef} />
                <span className="plan-dial-count">
                  {doneCount} / {PLAN_LENGTH} jours lus
                </span>
              </div>
            </div>

            <div className="plan-hero-cta" data-in>
              <button
                type="button"
                className="gold-cta"
                onClick={() => {
                  if (isStarted) {
                    openDay(current);
                  } else {
                    tapHaptic();
                    begin('/bible/plan/1', FROM_SOMMAIRE);
                  }
                }}
              >
                <span>{isStarted ? `Reprendre · Jour ${current}` : 'Commencer le plan'}</span>
                <span className="gold-cta-arrow" aria-hidden="true">
                  →
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="plan-sommaire" ref={groupsRef}>
          <div className="plan-rule-heading">
            <h2 className="plan-rule-title">Sommaire</h2>
            <span className="plan-rule-line" />
            <span className="plan-rule-aside">{PLAN_LENGTH} jours</span>
          </div>

          <div className="plan-groups">
            {PLAN_GROUPS.map((group) => {
              const isOpen = expanded === group.book;
              const states = group.days.map((d) => {
                const reads = readsFor(d.n);
                const done = reads.every(Boolean);
                return { done, partial: !done && reads.some(Boolean) };
              });
              const done = states.filter((st) => st.done).length;
              return (
                <div key={group.first} className={`plan-group${isOpen ? ' is-open' : ''}`} data-group>
                  <button
                    type="button"
                    className="plan-group-header"
                    aria-expanded={isOpen}
                    onClick={() => {
                      tapHaptic();
                      setOpenBook(isOpen ? null : group.book);
                    }}
                  >
                    <span className="plan-group-line">
                      <span className="plan-group-title">
                        <span className="plan-group-book">{group.book}</span>
                        <span className="plan-group-range">
                          jours {group.first} – {group.last}
                        </span>
                      </span>
                      <span className={`plan-group-count${done === group.days.length ? ' is-complete' : ''}`}>
                        {done} / {group.days.length}
                      </span>
                      <ChevronDownIcon size={10} className="plan-group-chevron" />
                    </span>
                    <span className="plan-group-ticks" aria-hidden="true">
                      {group.days.map((d, i) => {
                        const state =
                          isStarted && d.n === current
                            ? ' is-current'
                            : states[i].done
                              ? ' is-done'
                              : states[i].partial
                                ? ' is-partial'
                                : '';
                        return <span key={d.n} className={`plan-group-tick${state}`} />;
                      })}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="plan-group-days">
                      {group.days.map((day, i) => {
                        const { done: isDone, partial: isPartial } = states[i];
                        const isCurrent = isStarted && day.n === current;
                        const classes = ['plan-day-row', isDone ? 'is-done' : '', isCurrent ? 'is-current' : '']
                          .filter(Boolean)
                          .join(' ');
                        return (
                          <button
                            key={day.n}
                            type="button"
                            data-day-row
                            className={classes}
                            aria-current={isCurrent ? 'step' : undefined}
                            onClick={() => openDay(day.n)}
                          >
                            <span className="plan-day-num">{day.n}</span>
                            <span className="plan-day-refs">{planDayLabel(day)}</span>
                            <span className="plan-day-state">
                              {isDone && <PlanCheck size={13} label="Lu" />}
                              {isPartial && <span className="plan-day-partial" aria-label="Commencé" role="img" />}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
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
          </div>

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
                    className="plan-pill plan-pill--accent"
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
                  <button type="button" className="plan-pill" onClick={() => setIsConfirmingReset(false)}>
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
        {prompt}
        <WorldButton />
      </IonContent>
    </IonPage>
  );
};

export default PlanSommaire;
