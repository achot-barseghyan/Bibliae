import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IonContent, IonPage } from '@ionic/react';
import { useFigures } from '../hooks/useFigures';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { FRISE, FRISE_EVENTS } from '../data/frise';
import { tapHaptic } from '../utils/haptics';
import './Frise.css';

// Frise de l'histoire sainte (maquette « Frise v2 ») : en-tête nuit avec
// barre de progression des époques, ruban horizontal des 235 événements
// (au-dessus / au-dessous de la bande de chaque époque), fiche de
// l'événement choisi en bas avec « Avant / Après ».

const EASE = 'cubic-bezier(.2,.7,.2,1)';
/** Écart entre deux événements d'une même époque. */
const SLOT = 78;
/** Marge avant le premier événement d'une époque. */
const PADL = 16;
/** Largeur d'une étiquette (centre utilisé pour recentrer le ruban). */
const LABEL_W = 136;

/** Fond et poids (barre du haut) de chaque époque, dans l'ordre I → VIII. */
const ERA_STYLE = [
  { bg: 'linear-gradient(160deg,#4A3A26,#1E1A14)', w: 1 },
  { bg: 'linear-gradient(160deg,#6A552E,#23201A)', w: 1.4 },
  { bg: 'linear-gradient(160deg,#8A2A2F,#3A1014)', w: 1.4 },
  { bg: 'linear-gradient(160deg,#7A2228,#2A0E10)', w: 2.2 },
  { bg: 'linear-gradient(160deg,#4A3A5A,#1E1828)', w: 0.8 },
  { bg: 'linear-gradient(160deg,#3E3A6A,#171830)', w: 1.6 },
  { bg: 'linear-gradient(160deg,#24406B,#141C30)', w: 1.4 },
  { bg: 'linear-gradient(160deg,#2E5585,#141C30)', w: 1 }
];

/** Tournants de l'histoire du salut : point doré, trait plus long. */
const MAJOR = new Set([
  'creation',
  'deluge',
  'appel-abram',
  'mer-rouge',
  'sinai',
  'jerusalem',
  'temple',
  'prise-jerusalem',
  'edit-cyrus',
  'nativite',
  'crucifixion',
  'resurrection',
  'pentecote',
  'conversion-paul'
]);

/** Index de la période du Christ : avant elle, les années sont av. J.-C. */
const CHRIST_PERIOD = FRISE.findIndex((p) => p.id === 'jesus');

const eraWidth = (count: number) => Math.max(240, PADL + count * SLOT + 130);

/** Position de chaque événement : période et rang dans la période. */
const POSITIONS = FRISE_EVENTS.map((e) => ({
  p: FRISE.indexOf(e.period),
  j: e.period.events.findIndex((x) => x.id === e.id)
}));

/** Rang global (0 → 234) d'un événement d'après son id. */
const INDEX_BY_ID = new Map(FRISE_EVENTS.map((e) => [e.id, e.index]));

/** Événement sélectionné, mémorisé pour retrouver sa place en revenant d'un
 * chapitre ou d'une fiche figure (la page est démontée entre-temps). */
const SELECTED_KEY = 'frise-selected';

function loadSelected(): number {
  try {
    const index = parseInt(localStorage.getItem(SELECTED_KEY) ?? '', 10);
    return index >= 0 && index < FRISE_EVENTS.length ? index : 0;
  } catch {
    return 0;
  }
}

function saveSelected(index: number) {
  try {
    localStorage.setItem(SELECTED_KEY, String(index));
  } catch {
    // Stockage indisponible : la frise repartira simplement du début.
  }
}

const STARS = (() => {
  let s = 11;
  const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  return Array.from({ length: 28 }, () => ({
    left: `${(rnd() * 100).toFixed(1)}%`,
    top: `${(rnd() * 100).toFixed(1)}%`,
    duration: `${(2 + rnd() * 3).toFixed(2)}s`,
    delay: `${(-rnd() * 4).toFixed(2)}s`
  }));
})();

const Frise: React.FC = () => {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const { figures } = useFigures();
  const [selected, setSelected] = useState(loadSelected);
  const [cur, setCur] = useState(() => POSITIONS[loadSelected()].p);

  const ribbonRef = useRef<HTMLDivElement>(null);
  const eraRefs = useRef<(HTMLDivElement | null)[]>([]);
  const headRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const figuresById = useMemo(() => new Map(figures.map((f) => [f.id, f])), [figures]);
  const event = FRISE_EVENTS[selected];
  const pos = POSITIONS[selected];

  /* --- Défilement du ruban --- */

  const eventCenter = (index: number) => {
    const { p, j } = POSITIONS[index];
    const era = eraRefs.current[p];
    return era ? era.offsetLeft + PADL + j * SLOT + LABEL_W / 2 - 8 : 0;
  };

  const centerOn = useCallback((index: number, behavior: ScrollBehavior) => {
    const ribbon = ribbonRef.current;
    if (!ribbon) return;
    ribbon.scrollTo({ left: Math.max(0, eventCenter(index) - ribbon.clientWidth / 2), behavior });
  }, []);

  useEffect(() => {
    centerOn(selected, reduced ? 'auto' : 'smooth');
  }, [selected, reduced, centerOn]);

  // Ionic masque la page en la quittant (défilement remis à zéro) et le ruban
  // n'a pas sa largeur au montage : on se replace d'un coup quand il en change.
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  useEffect(() => {
    const ribbon = ribbonRef.current;
    if (!ribbon || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => {
      if (ribbon.clientWidth > 0) centerOn(selectedRef.current, 'auto');
    });
    observer.observe(ribbon);
    return () => observer.disconnect();
  }, [centerOn]);

  // Époque au centre du ruban → barre de progression du haut.
  const rafRef = useRef(0);
  const onRibbonScroll = () => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      const ribbon = ribbonRef.current;
      if (!ribbon) return;
      const c = ribbon.scrollLeft + ribbon.clientWidth / 2;
      let n = 0;
      eraRefs.current.forEach((el, i) => {
        if (el && el.offsetLeft <= c) n = i;
      });
      setCur(n);
    });
  };
  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const jumpToEra = (p: number) => {
    tapHaptic();
    const el = eraRefs.current[p];
    ribbonRef.current?.scrollTo({ left: Math.max(0, (el?.offsetLeft ?? 0) - 22), behavior: reduced ? 'auto' : 'smooth' });
  };

  const select = (index: number) => {
    if (index < 0 || index >= FRISE_EVENTS.length) return;
    tapHaptic();
    setSelected(index);
    saveSelected(index);
  };

  /* --- Animations d'entrée et de la fiche --- */

  useEffect(() => {
    if (reduced) return;
    headRef.current?.querySelectorAll('[data-hd]').forEach((n, i) =>
      n.animate(
        [
          { opacity: 0, transform: 'translateY(12px)', filter: 'blur(5px)' },
          { opacity: 1, transform: 'none', filter: 'blur(0)' }
        ],
        { duration: 850, delay: 100 + i * 110, easing: EASE, fill: 'backwards' }
      )
    );
    ribbonRef.current?.animate([{ opacity: 0, transform: 'translateX(60px)' }, { opacity: 1, transform: 'none' }], {
      duration: 1200,
      delay: 350,
      easing: EASE,
      fill: 'backwards'
    });
    // Une seule fois, à l'ouverture de la page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const firstCard = useRef(true);
  useEffect(() => {
    const base = firstCard.current ? 500 : 0;
    firstCard.current = false;
    if (reduced) return;
    cardRef.current?.querySelectorAll('[data-dt]').forEach((n, i) =>
      n.animate(
        [
          { opacity: 0, transform: 'translateY(10px)', filter: 'blur(4px)' },
          { opacity: 1, transform: 'none', filter: 'blur(0)' }
        ],
        { duration: 700, delay: base + i * 60, easing: EASE, fill: 'backwards' }
      )
    );
    cardRef.current?.querySelector('.fr-card-body')?.scrollTo({ top: 0 });
  }, [selected, reduced]);

  const eraBg = ERA_STYLE[pos.p]?.bg;
  const meta = [
    event.date ? `${event.date}${pos.p < CHRIST_PERIOD ? ' av. J.-C.' : ''}` : null,
    event.ref?.display
  ]
    .filter(Boolean)
    .join(' · ');
  const linked = (event.figureIds ?? []).map((id) => figuresById.get(id)).filter((f) => !!f);

  return (
    <IonPage>
      <IonContent fullscreen scrollY={false} className="fr-content">
        <div className="fr">
          {/* --- En-tête nuit et ruban --- */}
          <header ref={headRef} className="fr-head">
            <div className="fr-stars" aria-hidden="true">
              {STARS.map((s, i) => (
                <span key={i} style={{ left: s.left, top: s.top, animationDuration: s.duration, animationDelay: s.delay }} />
              ))}
            </div>
            <span className="fr-rosace" aria-hidden="true" />

            <div className="fr-top">
              <button type="button" className="fr-back" onClick={() => navigate('/compendium/accueil')}>
                <svg width="9" height="16" viewBox="0 0 9 16" fill="none" aria-hidden="true">
                  <path d="M7.5 1L1.5 8l6 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Accueil
              </button>
            </div>
            <h1 className="fr-title" data-hd>
              Frise de l'histoire sainte
            </h1>
            <div className="fr-sub" data-hd>
              <span className="fr-kicker">Glissez dans le temps</span>
              <span className="fr-direction">av. J.-C. → apr. J.-C.</span>
            </div>

            <div className="fr-eras" data-hd role="tablist" aria-label="Époques">
              {FRISE.map((period, i) => (
                <button
                  key={period.id}
                  type="button"
                  role="tab"
                  aria-selected={i === cur}
                  aria-label={`${period.numeral} · ${period.name}`}
                  className={`fr-era${i === cur ? ' is-current' : i < cur ? ' is-past' : ''}`}
                  style={{ flexGrow: ERA_STYLE[i]?.w ?? 1 }}
                  onClick={() => jumpToEra(i)}
                >
                  <span className="fr-era-roman">{period.numeral}</span>
                  <span className="fr-era-bar" />
                </button>
              ))}
            </div>

            <div ref={ribbonRef} className="fr-ribbon" onScroll={onRibbonScroll}>
              <div className="fr-track">
                {FRISE.map((period, i) => (
                  <div
                    key={period.id}
                    ref={(el) => {
                      eraRefs.current[i] = el;
                    }}
                    className={`fr-period${i === 0 ? ' is-first' : ''}${i === FRISE.length - 1 ? ' is-last' : ''}`}
                    style={{ width: eraWidth(period.events.length) }}
                  >
                    <div className="fr-band" style={{ background: ERA_STYLE[i]?.bg }}>
                      <span className="fr-band-roman">{period.numeral}</span>
                      <span className="fr-band-name">{period.name}</span>
                    </div>
                    {period.events.map((e, j) => {
                      const index = INDEX_BY_ID.get(e.id) ?? 0;
                      const on = index === selected;
                      const up = j % 2 === 0;
                      const major = MAJOR.has(e.id);
                      return (
                        <button
                          key={e.id}
                          type="button"
                          className={`fr-ev ${up ? 'is-up' : 'is-down'}${major ? ' is-major' : ''}${on ? ' is-on' : ''}`}
                          style={{ left: PADL + j * SLOT }}
                          onClick={() => select(index)}
                          aria-pressed={on}
                        >
                          <span className="fr-ev-stem">
                            <span className="fr-ev-dot" />
                            {on && <span className="fr-ev-halo" />}
                          </span>
                          <span className="fr-ev-label">
                            <span className="fr-ev-date">{e.date ?? '—'}</span>
                            <span className="fr-ev-title">{e.title}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </header>

          {/* --- Fiche de l'événement --- */}
          <div className="fr-card-wrap">
            <article ref={cardRef} className="fr-card" aria-live="polite">
              <span className="fr-card-ghost" aria-hidden="true">
                {event.period.numeral}
              </span>
              <div className="fr-card-body">
                <div className="fr-card-era" data-dt>
                  <span className="fr-card-era-dot" style={{ background: eraBg }} />
                  <span className="fr-card-era-name">
                    {event.period.numeral} · {event.period.name}
                  </span>
                </div>
                <h2 className="fr-card-title" data-dt>
                  {event.title}
                </h2>
                {meta && (
                  <p className="fr-card-meta" data-dt>
                    {meta}
                  </p>
                )}
                <p className="fr-card-text" data-dt>
                  {event.text}
                </p>
                {(event.ref || linked.length > 0) && (
                  <div className="fr-card-actions" data-dt>
                    {event.ref && (
                      <button
                        type="button"
                        className="fr-read"
                        onClick={() => {
                          tapHaptic();
                          navigate(`/bible/${event.ref!.bookId}/${event.ref!.chapter}`);
                        }}
                      >
                        <svg width="13" height="11" viewBox="0 0 18 16" fill="none" aria-hidden="true">
                          <path
                            d="M1 1.6h5.6A2.4 2.4 0 019 4v10.4a1.8 1.8 0 00-1.7-1.2H1V1.6zM17 1.6h-5.6A2.4 2.4 0 009 4v10.4a1.8 1.8 0 011.7-1.2H17V1.6z"
                            stroke="currentColor"
                            strokeWidth="1.3"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Lire {event.ref.display}
                      </button>
                    )}
                    {linked.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        className="fr-figure"
                        onClick={() => {
                          tapHaptic();
                          navigate(`/figures/${f.id}`);
                        }}
                      >
                        <span className="fr-figure-avatar" style={{ background: eraBg }}>
                          {f.image ? <img src={f.image} alt="" /> : f.name.charAt(0)}
                        </span>
                        {f.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="fr-card-nav">
                <button
                  type="button"
                  className="fr-step"
                  onClick={() => select(selected - 1)}
                  disabled={selected === 0}
                  aria-label="Événement précédent"
                >
                  <svg width="8" height="14" viewBox="0 0 9 16" fill="none" aria-hidden="true">
                    <path d="M7.5 1L1.5 8l6 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Avant
                </button>
                <span className="fr-count">
                  {selected + 1} / {FRISE_EVENTS.length}
                </span>
                <button
                  type="button"
                  className="fr-step"
                  onClick={() => select(selected + 1)}
                  disabled={selected === FRISE_EVENTS.length - 1}
                  aria-label="Événement suivant"
                >
                  Après
                  <svg width="8" height="14" viewBox="0 0 9 16" fill="none" aria-hidden="true">
                    <path d="M1.5 1l6 7-6 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </article>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Frise;
