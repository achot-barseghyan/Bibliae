import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { IonContent, IonPage } from '@ionic/react';
import AccessibilityQuickSheet from '../components/AccessibilityQuickSheet';
import { AccessibilityIcon } from '../components/nav/icons';
import { useAccessibility } from '../hooks/useAccessibility';
import { useFigures } from '../hooks/useFigures';
import { FRISE, FRISE_EVENTS } from '../data/frise';
import { tapHaptic } from '../utils/haptics';
import './Frise.css';

/** Écart horizontal entre deux événements sur la frise. */
const SPACING = 96;
/** Marge avant le premier et après le dernier événement. */
const EDGE = 24;
/** Quatre couloirs d'étiquettes (au-dessus/au-dessous, près/loin de la
 * bande), parcourus en boucle pour que les noms ne se chevauchent pas. */
const LANES = ['up-far', 'down-near', 'up-near', 'down-far'] as const;

/** Demi-largeur typique d'une étiquette d'événement. */
const LABEL_HALF_WIDTH = 48;

const eventX = (index: number) => EDGE + index * SPACING + SPACING / 2;

/** Bande de chaque période : de son premier à son dernier événement. */
const PERIOD_BANDS = FRISE.map((period, p) => {
  const firstIndex = FRISE_EVENTS.findIndex((e) => e.period.id === period.id);
  return {
    period,
    firstIndex,
    tone: p % 2 === 0 ? 'encre' : 'oxblood',
    left: EDGE + firstIndex * SPACING,
    width: period.events.length * SPACING
  };
});

const Frise: React.FC = () => {
  const navigate = useNavigate();
  const { figures } = useFigures();
  const { settings } = useAccessibility();
  const [isA11yOpen, setIsA11yOpen] = useState(false);
  const [selected, setSelected] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const periodsRef = useRef<HTMLDivElement>(null);

  const figuresById = useMemo(() => new Map(figures.map((f) => [f.id, f])), [figures]);
  const event = FRISE_EVENTS[selected];
  const totalWidth = EDGE * 2 + FRISE_EVENTS.length * SPACING;

  // Garde l'événement choisi au centre de la frise, et sa période visible
  // dans la rangée de raccourcis.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (scroller) {
      scroller.scrollTo({
        // On centre l'étiquette (qui part du trait vers la droite), pas le trait.
        left: eventX(selected) + LABEL_HALF_WIDTH - scroller.clientWidth / 2,
        behavior: settings.reduceMotion ? 'auto' : 'smooth'
      });
    }
    // Sans animation : un second défilement doux simultané interromprait
    // celui de la frise dans Chrome/WebView.
    const periods = periodsRef.current;
    const chip = periods?.querySelector<HTMLElement>('.frise-period-chip.is-active');
    if (periods && chip) {
      periods.scrollLeft = chip.offsetLeft + chip.offsetWidth / 2 - periods.clientWidth / 2;
    }
  }, [selected, settings.reduceMotion]);

  const select = (index: number) => {
    if (index < 0 || index >= FRISE_EVENTS.length) return;
    tapHaptic();
    setSelected(index);
  };

  return (
    <IonPage>
      <IonContent fullscreen className="frise-content">
        <header className="frise-topbar">
          <span className="frise-topbar-wordmark">
            Bibli<span className="frise-topbar-wordmark-accent">ae</span>
          </span>
          <button
            type="button"
            className={`frise-a11y-button${isA11yOpen ? ' is-active' : ''}`}
            onClick={() => setIsA11yOpen(true)}
            aria-label="Accessibilité"
            aria-haspopup="dialog"
            aria-expanded={isA11yOpen}
          >
            <AccessibilityIcon />
          </button>
        </header>

        <AnimatePresence>
          {isA11yOpen && <AccessibilityQuickSheet onClose={() => setIsA11yOpen(false)} />}
        </AnimatePresence>

        <div className="frise-intro">
          <h1 className="frise-page-title">Frise</h1>
          <p className="frise-page-subtitle">
            L'histoire du salut de la Création à l'Apocalypse : {FRISE.length} périodes,{' '}
            {FRISE_EVENTS.length} événements.
          </p>
        </div>

        <div className="frise-periods" ref={periodsRef}>
          {PERIOD_BANDS.map(({ period, firstIndex }) => (
            <button
              key={period.id}
              type="button"
              className={`frise-period-chip${event.period.id === period.id ? ' is-active' : ''}`}
              onClick={() => select(firstIndex)}
            >
              <span className="frise-period-chip-numeral">{period.numeral}</span>
              {period.name}
            </button>
          ))}
        </div>

        <section className="frise-panel">
          <div className="frise-panel-head">
            <span className="frise-panel-kicker">Glissez dans le temps</span>
            <span className="frise-panel-direction">av. J.-C. → apr.</span>
          </div>

          <div className="frise-scroller" ref={scrollerRef}>
            <div className="frise-track" style={{ width: totalWidth }}>
              {PERIOD_BANDS.map(({ period, tone, left, width }) => (
                <div key={period.id} className={`frise-band frise-band--${tone}`} style={{ left, width }}>
                  <span className="frise-band-label">
                    <span className="frise-band-numeral">{period.numeral}</span>
                    {period.name}
                  </span>
                </div>
              ))}

              {FRISE_EVENTS.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  className={`frise-event frise-event--${LANES[e.index % LANES.length]}${
                    e.index === selected ? ' is-selected' : ''
                  }`}
                  style={{ left: eventX(e.index) }}
                  onClick={() => select(e.index)}
                  aria-pressed={e.index === selected}
                >
                  <span className="frise-event-tick" aria-hidden="true" />
                  <span className="frise-event-label">
                    <span className="frise-event-date">{e.date ?? '—'}</span>
                    <span className="frise-event-title">{e.title}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <article className="frise-card" key={event.id}>
            <p className="frise-card-kicker">
              {event.period.numeral} · {event.period.name}
              <span className="frise-card-count">
                {selected + 1} / {FRISE_EVENTS.length}
              </span>
            </p>
            <h2 className="frise-card-title">{event.title}</h2>
            <p className="frise-card-meta">
              {event.date ?? '—'}
              {event.ref && ` · ${event.ref.display}`}
            </p>
            <p className="frise-card-text">{event.text}</p>

            {event.figureIds && event.figureIds.length > 0 && (
              <div className="frise-card-figures">
                {event.figureIds.map((id) => {
                  const figure = figuresById.get(id);
                  if (!figure) return null;
                  return (
                    <button
                      key={id}
                      type="button"
                      className="frise-card-figure"
                      onClick={() => {
                        tapHaptic();
                        navigate(`/figures/${id}`);
                      }}
                    >
                      <span className="frise-card-figure-avatar">
                        <img src={figure.image} alt="" />
                      </span>
                      <span className="frise-card-figure-name">{figure.name}</span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="frise-card-actions">
              <button
                type="button"
                className="frise-card-prev"
                onClick={() => select(selected - 1)}
                disabled={selected === 0}
                aria-label="Événement précédent"
              >
                ←
              </button>
              {event.ref && (
                <button
                  type="button"
                  className="frise-card-read"
                  onClick={() => {
                    tapHaptic();
                    navigate(`/bible/${event.ref!.bookId}/${event.ref!.chapter}`);
                  }}
                >
                  Lire {event.ref.display}
                </button>
              )}
              <button
                type="button"
                className="frise-card-next"
                onClick={() => select(selected + 1)}
                disabled={selected === FRISE_EVENTS.length - 1}
              >
                Suivant →
              </button>
            </div>
          </article>
        </section>

        <p className="frise-footnote">
          Le temps se lit de gauche à droite, comme une frise d'école. La fiche du bas montre
          l'événement choisi. Les dates sont des repères traditionnels, souvent discutés : « v. »
          signifie « vers ».
        </p>
      </IonContent>
    </IonPage>
  );
};

export default Frise;
