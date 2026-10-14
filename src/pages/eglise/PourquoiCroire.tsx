import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IonPage } from '@ionic/react';
import {
  CHAPTERS,
  CONSEILS,
  CONSEILS_INTRO,
  FIDES_ET_RATIO,
  HERO_QUESTIONS,
  OBJECTIONS,
  ROMAN
} from '../../data/pourquoiCroire';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { tapHaptic } from '../../utils/haptics';
import './PourquoiCroire.css';

const EASE = 'cubic-bezier(.2,.7,.2,1)';
const SWIPE_THRESHOLD = 70;

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const pad2 = (n: number) => String(n).padStart(2, '0');

/** Ciel étoilé déterministe : mêmes étoiles à chaque ouverture. */
const STARS = (() => {
  let seed = 11;
  const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  return Array.from({ length: 34 }, () => {
    const left = rnd() * 100;
    const top = rnd() * 70;
    const size = rnd() > 0.75 ? 3 : 2;
    const duration = 2.2 + rnd() * 3;
    const delay = -rnd() * 4;
    return { left, top, size, duration, delay };
  });
})();

const WORDS = FIDES_ET_RATIO.split(' ');
const isKeyWord = (w: string) => w === 'foi' || w === 'raison';

interface DragState {
  x: number;
  dx: number;
  moved: boolean;
  el: HTMLElement;
}

const PourquoiCroire: React.FC = () => {
  const navigate = useNavigate();
  const reduced = useReducedMotion();

  const [qi, setQi] = useState(0);
  const [chap, setChap] = useState(0);
  const [open, setOpen] = useState(0);
  const [card, setCard] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const heroQRef = useRef<HTMLHeadingElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);
  const epiRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const wingRef = useRef<HTMLDivElement>(null);
  const chapTopRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLDivElement>(null);
  const argsRef = useRef<HTMLDivElement>(null);
  const deckRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const firstQ = useRef(true);
  const firstChap = useRef(true);

  /* --- Défilement : prologue (lumière, épigraphe) et citation mot à mot --- */

  const tick = useCallback(() => {
    const sc = scrollRef.current;
    const hero = heroRef.current;
    if (!sc || !hero) return;
    const st = sc.scrollTop;
    const vh = sc.clientHeight;
    const span = Math.max(1, hero.offsetHeight - vh);
    const p = clamp(st / span, 0, 1);

    const ht = heroTextRef.current;
    if (ht) {
      const k = clamp(p / 0.3, 0, 1);
      ht.style.opacity = (1 - k).toFixed(3);
      ht.style.transform = `translateY(${(-k * 40).toFixed(1)}px)`;
      ht.style.filter = `blur(${(k * 6).toFixed(1)}px)`;
    }
    if (hintRef.current) hintRef.current.style.opacity = (1 - clamp(p / 0.12, 0, 1)).toFixed(3);
    if (lightRef.current) {
      const g = clamp((p - 0.08) / 0.5, 0, 1);
      const e = g * g * (3 - 2 * g);
      lightRef.current.style.transform = `scale(${(1 + e * 70).toFixed(2)})`;
    }
    if (epiRef.current) {
      const k = clamp((p - 0.55) / 0.25, 0, 1);
      epiRef.current.style.opacity = k.toFixed(3);
      epiRef.current.style.transform = `translateY(${((1 - k) * 24).toFixed(1)}px)`;
    }
    backRef.current?.classList.toggle('is-light', st > span * 0.5);

    const W = wingRef.current;
    if (W) {
      const r = W.getBoundingClientRect();
      const s = sc.getBoundingClientRect();
      const q = clamp((s.top + s.height * 0.78 - r.top) / (r.height * 0.75), 0, 1);
      const words = W.querySelectorAll<HTMLElement>('[data-w]');
      words.forEach((w, i) => w.classList.toggle('is-on', i / words.length < q));
    }
  }, []);

  useEffect(() => {
    const sc = scrollRef.current;
    if (!sc) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        tick();
      });
    };
    const resize = new ResizeObserver(() => {
      sc.style.setProperty('--pc-vh', `${sc.clientHeight}px`);
      tick();
    });
    resize.observe(sc);
    sc.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      sc.removeEventListener('scroll', onScroll);
      resize.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [tick]);

  /* --- Apparition des blocs au défilement --- */

  useEffect(() => {
    const sc = scrollRef.current;
    if (!sc || reduced) return;
    const nodes = [...sc.querySelectorAll<HTMLElement>('[data-rv]')];
    sc.classList.add('pc-rv-ready');
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }),
      { root: sc, threshold: 0.12 }
    );
    nodes.forEach((n) => io.observe(n));
    return () => {
      io.disconnect();
      sc.classList.remove('pc-rv-ready');
    };
  }, [reduced]);

  /* --- Questions du prologue qui se succèdent --- */

  useEffect(() => {
    const id = window.setInterval(() => {
      if ((scrollRef.current?.scrollTop ?? 0) > 200) return;
      setQi((i) => (i + 1) % HERO_QUESTIONS.length);
    }, 3200);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (firstQ.current) {
      firstQ.current = false;
      return;
    }
    if (reduced) return;
    heroQRef.current?.animate(
      [
        { opacity: 0, filter: 'blur(10px)', transform: 'translateY(14px) scale(.97)', letterSpacing: '0.04em' },
        { opacity: 1, filter: 'blur(0)', transform: 'none', letterSpacing: '0' }
      ],
      { duration: 1100, easing: EASE }
    );
  }, [qi, reduced]);

  /* --- Les quatre questions --- */

  const animSteps = useCallback(
    (i: number) => {
      if (reduced) return;
      const argCard = argsRef.current?.querySelector(`[data-arg="${i}"]`);
      argCard?.querySelectorAll('[data-st]').forEach((s, k) =>
        s.animate([{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], {
          duration: 700,
          delay: 180 + k * 150,
          easing: EASE,
          fill: 'backwards'
        })
      );
    },
    [reduced]
  );

  useEffect(() => {
    if (firstChap.current) {
      firstChap.current = false;
      return;
    }
    if (reduced) return;
    panelRef.current?.animate(
      [
        { opacity: 0, transform: 'translateX(30px)', filter: 'blur(4px)' },
        { opacity: 1, transform: 'none', filter: 'blur(0)' }
      ],
      { duration: 700, easing: EASE }
    );
    numRef.current?.animate([{ opacity: 0, transform: 'scale(1.4) rotate(-6deg)' }, { opacity: 1, transform: 'none' }], {
      duration: 1100,
      easing: EASE
    });
    animSteps(0);
  }, [chap, reduced, animSteps]);

  const scrollToChapters = (offset: number) => {
    const sc = scrollRef.current;
    const top = chapTopRef.current;
    if (sc && top) sc.scrollTo({ top: top.offsetTop + offset, behavior: reduced ? 'auto' : 'smooth' });
  };

  const goChap = (i: number, scroll: boolean) => {
    if (i === chap) return;
    tapHaptic();
    setChap(i);
    setOpen(0);
    if (scroll) scrollToChapters(150);
  };

  /** Retour au fil du raisonnement, sur la question I. */
  const restart = () => {
    tapHaptic();
    if (chap !== 0) {
      setChap(0);
      setOpen(0);
    }
    scrollToChapters(0);
  };

  const toggleArg = (i: number) => {
    tapHaptic();
    const opening = i !== open;
    setOpen(opening ? i : -1);
    if (opening) animSteps(i);
  };

  /* --- Objections : cartes à retourner et à glisser --- */

  const goCard = (i: number) => {
    const n = OBJECTIONS.length;
    setCard(((i % n) + n) % n);
    setFlipped(false);
  };

  const cardRef = useRef(card);
  cardRef.current = card;

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      d.dx = e.clientX - d.x;
      if (Math.abs(d.dx) > 6) d.moved = true;
      d.el.style.setProperty('--pc-dx', `${d.dx}px`);
      d.el.style.setProperty('--pc-rot', `${(d.dx / 18).toFixed(2)}deg`);
    };
    const onUp = () => {
      const d = dragRef.current;
      if (!d) return;
      dragRef.current = null;
      d.el.classList.remove('is-dragging');
      if (!d.moved) {
        tapHaptic();
        setFlipped((f) => !f);
      } else if (d.dx < -SWIPE_THRESHOLD) {
        tapHaptic();
        goCard(cardRef.current + 1);
      } else if (d.dx > SWIPE_THRESHOLD) {
        tapHaptic();
        goCard(cardRef.current - 1);
      }
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, []);

  const dragStart = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    el.style.setProperty('--pc-dx', '0px');
    el.style.setProperty('--pc-rot', '0deg');
    el.classList.add('is-dragging');
    dragRef.current = { x: e.clientX, dx: 0, moved: false, el };
  };

  const current = CHAPTERS[chap];
  const isLast = chap === CHAPTERS.length - 1;
  const n = OBJECTIONS.length;

  return (
    <IonPage className="pc-page">
      <button
        ref={backRef}
        type="button"
        className="pc-back"
        onClick={() => {
          tapHaptic();
          navigate(-1);
        }}
      >
        <span className="pc-back-chevron" aria-hidden="true">
          ‹
        </span>
        Église
      </button>

      <div ref={scrollRef} className="pc-scroll">
        {/* --- Prologue : de la nuit vers la lumière --- */}
        <div ref={heroRef} className="pc-hero">
          <div className="pc-sticky">
            <div className="pc-sky" />
            <div className="pc-stars" aria-hidden="true">
              {STARS.map((s, i) => (
                <span
                  key={i}
                  className="pc-star"
                  style={{
                    left: `${s.left.toFixed(1)}%`,
                    top: `${s.top.toFixed(1)}%`,
                    width: s.size,
                    height: s.size,
                    animationDuration: `${s.duration.toFixed(2)}s`,
                    animationDelay: `${s.delay.toFixed(2)}s`
                  }}
                />
              ))}
            </div>

            <div ref={heroTextRef} className="pc-hero-text">
              <p className="pc-kicker pc-kicker--gold">Pourquoi croire</p>
              <div className="pc-hero-q-box" aria-live="polite">
                <h1 ref={heroQRef} className="pc-hero-q">
                  {HERO_QUESTIONS[qi]}
                </h1>
              </div>
              <p className="pc-hero-lead">
                Les raisons de croire en Dieu et en Jésus-Christ, pour les comprendre et savoir les expliquer.
              </p>
            </div>

            <div className="pc-halo" aria-hidden="true" />
            <div ref={lightRef} className="pc-light" aria-hidden="true" />

            <div ref={epiRef} className="pc-epigraph">
              <div className="pc-epigraph-mark" aria-hidden="true">
                “
              </div>
              <p className="pc-epigraph-text">
                Soyez prêts à tout moment à présenter une défense devant quiconque vous demande de rendre raison de
                l'espérance qui est en vous.
              </p>
              <div className="pc-epigraph-ref">
                <span />1 P 3, 15<span />
              </div>
            </div>

            <div ref={hintRef} className="pc-hint" aria-hidden="true">
              <span className="pc-hint-label">Faire défiler vers la lumière</span>
              <span className="pc-hint-line">
                <span />
              </span>
            </div>
          </div>
        </div>

        {/* --- Avant tout --- */}
        <section className="pc-intro">
          <p data-rv="0" className="pc-kicker">
            Avant tout
          </p>
          <h2 data-rv="1" className="pc-h2 pc-h2--lg">
            Croire n'est pas renoncer à réfléchir
          </h2>
          <p data-rv="2" className="pc-prose">
            Beaucoup de chrétiens connaissent la Bible et les prières par cœur sans savoir expliquer pourquoi ils
            croient. Face à une objection, ils restent sans réponse, et certains finissent par cesser de croire.
          </p>
          <p data-rv="3" className="pc-prose">
            L'Église enseigne pourtant que l'homme peut connaître Dieu avec certitude par la lumière naturelle de la
            raison, à partir de la création (CEC § 36). Cette page présente ces raisons, avec leurs sources.
          </p>
        </section>

        {/* --- Fides et ratio, mot à mot --- */}
        <div ref={wingRef} className="pc-wings">
          <div className="pc-rule" />
          <blockquote className="pc-wings-quote">
            {WORDS.map((w, i) => (
              <span key={i} data-w="" className={isKeyWord(w) ? 'pc-word pc-word--key' : 'pc-word'}>
                {w}
              </span>
            ))}
          </blockquote>
          <p className="pc-wings-ref">Jean-Paul II · Fides et ratio, 1998</p>
          <div className="pc-rule" />
        </div>

        {/* --- Le fil du raisonnement --- */}
        <section ref={chapTopRef} className="pc-chapters">
          <div className="pc-chapters-head">
            <p data-rv="0" className="pc-kicker">
              Le fil du raisonnement
            </p>
            <h2 data-rv="1" className="pc-h2">
              Quatre questions, dans l'ordre
            </h2>
            <p data-rv="2" className="pc-sub">
              Chacune s'appuie sur la précédente. Déroule chaque raisonnement étape par étape.
            </p>
          </div>

          <div data-rv="3" className="pc-chain">
            <div className="pc-chain-track" />
            <div className="pc-chain-fill" style={{ width: `${((chap / 3) * 75).toFixed(2)}%` }} />
            <div className="pc-chain-nodes">
              {CHAPTERS.map((c, i) => (
                <button
                  key={c.short}
                  type="button"
                  className={`pc-chain-node${i === chap ? ' is-current' : i < chap ? ' is-done' : ''}`}
                  aria-current={i === chap ? 'step' : undefined}
                  onClick={() => goChap(i, false)}
                >
                  <span className="pc-chain-dot">{ROMAN[i]}</span>
                  <span className="pc-chain-label">{c.short}</span>
                </button>
              ))}
            </div>
          </div>

          <div ref={panelRef} className="pc-panel">
            <div ref={numRef} className="pc-panel-num" aria-hidden="true">
              {ROMAN[chap]}
            </div>
            <div className="pc-panel-head">
              <p className="pc-panel-kicker">Question {ROMAN[chap]}</p>
              <h3 className="pc-panel-q">{current.question}</h3>
              <p className="pc-panel-lead">{current.lead}</p>
            </div>

            <div ref={argsRef} className="pc-args">
              {current.args.map((a, i) => {
                const on = i === open;
                return (
                  <article key={`${chap}-${i}`} data-arg={i} className={`pc-arg${on ? ' is-open' : ''}`}>
                    <button type="button" className="pc-arg-head" aria-expanded={on} onClick={() => toggleArg(i)}>
                      <span>
                        <span className="pc-arg-kind">{a.kind}</span>
                        <span className="pc-arg-title">{a.title}</span>
                      </span>
                      <span className="pc-arg-btn" aria-hidden="true">
                        ↓
                      </span>
                    </button>
                    <div className="pc-arg-collapse">
                      <div className="pc-arg-inner">
                        <div className="pc-arg-body">
                          <ol className="pc-steps">
                            {a.steps.map((st, j) => (
                              <li key={j} data-st="" className="pc-step">
                                <span className="pc-step-n">{j + 1}</span>
                                <div>
                                  {st.label && <p className="pc-step-label">{st.label}</p>}
                                  <p className="pc-step-text">{st.text}</p>
                                </div>
                              </li>
                            ))}
                          </ol>
                          <div data-st="" className="pc-concl">
                            <p className="pc-concl-kicker">
                              <span aria-hidden="true">∴</span>Donc
                            </p>
                            <p className="pc-concl-text">{a.conclusion}</p>
                          </div>
                          <div data-st="" className="pc-friend">
                            <p className="pc-friend-kicker">Pour l'expliquer à un ami</p>
                            <p className="pc-friend-text">« {a.friend} »</p>
                            <p className="pc-friend-src">{a.sources}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <button type="button" className="pc-next" onClick={() => goChap(isLast ? 0 : chap + 1, true)}>
              <span>
                <span className="pc-next-label">{isLast ? 'Revenir au début' : 'Question suivante'}</span>
                <span className="pc-next-q">{isLast ? CHAPTERS[0].question : CHAPTERS[chap + 1].question}</span>
              </span>
              <span className="pc-round pc-round--dark" aria-hidden="true">
                →
              </span>
            </button>
          </div>
        </section>

        {/* --- Objections --- */}
        <section className="pc-objections">
          <div className="pc-objections-head">
            <p data-rv="0" className="pc-kicker">
              On te dira
            </p>
            <h2 data-rv="1" className="pc-h2">
              Répondre aux objections
            </h2>
            <p data-rv="2" className="pc-sub">
              Touche une carte pour lire la réponse, glisse-la pour passer à la suivante.
            </p>
          </div>

          <div ref={deckRef} data-rv="3" className="pc-deck">
            {OBJECTIONS.map((o, i) => {
              const k = (i - card + n) % n;
              const top = k === 0;
              const label = `${pad2(i + 1)} / ${pad2(n)}`;
              return (
                <div
                  key={i}
                  className={`pc-card${top ? ' is-top' : ''}`}
                  role={top ? 'button' : undefined}
                  tabIndex={top ? 0 : -1}
                  aria-hidden={!top}
                  aria-pressed={top ? flipped : undefined}
                  aria-label={top ? `Objection ${label} : ${o.objection}` : undefined}
                  onPointerDown={top ? dragStart : undefined}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setFlipped((f) => !f);
                    } else if (e.key === 'ArrowRight') goCard(card + 1);
                    else if (e.key === 'ArrowLeft') goCard(card - 1);
                  }}
                  style={{
                    zIndex: 10 - k,
                    opacity: k > 3 ? 0 : 1,
                    transform: top ? 'none' : `translateY(${-k * 14}px) scale(${(1 - k * 0.05).toFixed(2)})`
                  }}
                >
                  <div className={`pc-card-inner${top && flipped ? ' is-flipped' : ''}`}>
                    <div className="pc-card-face pc-card-front">
                      <div className="pc-card-top">
                        <span>Objection</span>
                        <span className="pc-card-count">{label}</span>
                      </div>
                      <div className="pc-card-mark" aria-hidden="true">
                        “
                      </div>
                      <p className="pc-card-obj">{o.objection}</p>
                      <div className="pc-card-cta">
                        <span className="pc-card-cta-icon" aria-hidden="true">
                          ↻
                        </span>
                        Toucher pour la réponse
                      </div>
                    </div>
                    <div className="pc-card-face pc-card-back">
                      <div className="pc-card-top">
                        <span>Réponse</span>
                        <span className="pc-card-count">{label}</span>
                      </div>
                      <p className="pc-card-rep">{o.reponse}</p>
                      <p className="pc-card-src">{o.sources}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pc-deck-nav">
            <button type="button" className="pc-round pc-round--outline" aria-label="Objection précédente" onClick={() => goCard(card - 1)}>
              ←
            </button>
            <div className="pc-dots" aria-hidden="true">
              {OBJECTIONS.map((_, i) => (
                <span key={i} className={i === card ? 'pc-dot is-current' : 'pc-dot'} />
              ))}
            </div>
            <button type="button" className="pc-round pc-round--dark" aria-label="Objection suivante" onClick={() => goCard(card + 1)}>
              →
            </button>
          </div>
        </section>

        {/* --- Répondre plutôt que réagir --- */}
        <section className="pc-conseils">
          <div className="pc-conseils-head">
            <p data-rv="0" className="pc-kicker">
              Dans la conversation
            </p>
            <h2 data-rv="1" className="pc-h2">
              Répondre plutôt que réagir
            </h2>
            <p data-rv="2" className="pc-sub">
              {CONSEILS_INTRO}
            </p>
          </div>

          <ol className="pc-conseils-list">
            {CONSEILS.map((c, i) => (
              <li key={c.titre} data-rv="0" className={`pc-conseil pc-conseil--${c.theme}`}>
                <span className="pc-conseil-num" aria-hidden="true">
                  {i + 1}
                </span>
                <p className="pc-conseil-kicker">Conseil {i + 1}</p>
                <h3 className="pc-conseil-title">{c.titre}</h3>
                {c.texte.map((t) => (
                  <p key={t} className="pc-conseil-text">
                    {t}
                  </p>
                ))}
                {c.bulle && <p className="pc-conseil-bubble">{c.bulle}</p>}
                {c.apresBulle?.map((t) => (
                  <p key={t} className="pc-conseil-text">
                    {t}
                  </p>
                ))}
                {c.accent?.type === 'phrase' && <p className="pc-conseil-phrase">{c.accent.texte}</p>}
                {c.accent?.type === 'encadre' && (
                  <p className="pc-conseil-encadre">
                    <span aria-hidden="true">✦</span>
                    {c.accent.texte}
                  </p>
                )}
                {c.theme === 'nuit' && (
                  <button type="button" className="pc-conseil-cta" onClick={restart}>
                    Revoir les raisons de croire <span aria-hidden="true">↑</span>
                  </button>
                )}
              </li>
            ))}
          </ol>
        </section>

        {/* --- Thomas --- */}
        <section className="pc-thomas">
          <p data-rv="0" className="pc-kicker pc-kicker--gold">
            Thomas aussi a douté
          </p>
          <p data-rv="1" className="pc-thomas-doubt">
            « Si je ne vois pas dans ses mains la marque des clous, si je ne mets pas mon doigt dans la marque des
            clous, si je ne mets pas la main dans son côté, non, je ne croirai pas ! »
          </p>
          <p data-rv="1" className="pc-thomas-ref">
            Jn 20, 25
          </p>
          <p data-rv="2" className="pc-thomas-text">
            Huit jours plus tard, Jésus lui dit : « Avance ton doigt ici, et vois mes mains ; avance ta main, et mets-la
            dans mon côté : cesse d'être incrédule, sois croyant. »
          </p>
          <p data-rv="3" className="pc-thomas-cry">
            Mon Seigneur et mon Dieu !
          </p>
          <p data-rv="3" className="pc-thomas-ref pc-thomas-ref--cry">
            Jn 20, 28
          </p>
          <div data-rv="4" className="pc-thomas-rule" />
          <p data-rv="4" className="pc-thomas-newman">
            « Dix mille difficultés ne font pas un doute. »
          </p>
          <p data-rv="4" className="pc-thomas-ref">
            Saint John Henry Newman · Apologia, 1864
          </p>
          <div data-rv="5" className="pc-thomas-actions">
            <button
              type="button"
              className="pc-cta-primary"
              onClick={() => {
                tapHaptic();
                navigate('/paroisses');
              }}
            >
              En parler avec un prêtre <span aria-hidden="true">→</span>
            </button>
            <button
              type="button"
              className="pc-cta-secondary"
              onClick={restart}
            >
              Revoir le raisonnement
            </button>
          </div>
        </section>
      </div>
    </IonPage>
  );
};

export default PourquoiCroire;
