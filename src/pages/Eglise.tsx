import { useEffect, useRef } from 'react';
import { useNavigate, useNavigationType } from 'react-router-dom';
import { IonContent, IonPage } from '@ionic/react';
import { tapHaptic } from '../utils/haptics';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useScrollMemory } from '../hooks/useScrollMemory';
import { FOI_RAISON } from '../data/egliseTextes';
import {
  FOI_RAISON_ARGS,
  RUBRIQUES,
  rubriquePath,
  type Rubrique,
  type RubriquePart
} from '../data/egliseRubriques';
import './Eglise.css';

const EASE = 'cubic-bezier(.2,.7,.2,1)';

/** Ciel étoilé déterministe du haut de page. */
const STARS = (() => {
  let seed = 7;
  const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  return Array.from({ length: 22 }, () => ({
    left: rnd() * 100,
    top: rnd() * 100,
    size: rnd() > 0.7 ? 3 : 2,
    duration: 2.2 + rnd() * 3,
    delay: -rnd() * 4
  }));
})();

// Position de chaque carrousel, pour la session : au retour d'une page, il
// reprend là où on l'avait laissé.
const carouselMemory = new Map<string, number>();

/** Inclinaison des cartes selon leur position dans le carrousel. */
const tiltCards = (car: HTMLElement) => {
  const mid = car.scrollLeft + car.clientWidth / 2;
  car.querySelectorAll<HTMLElement>('[data-card]').forEach((card) => {
    const d = (card.offsetLeft + card.offsetWidth / 2 - mid) / (card.offsetWidth + 12);
    const a = Math.min(Math.abs(d), 1.5);
    card.style.transform = `rotateY(${(-d * 9).toFixed(2)}deg) scale(${(1 - a * 0.04).toFixed(3)})`;
    const glass = card.querySelector<HTMLElement>('[data-glass]');
    if (glass) glass.style.transform = `translateX(${(-d * 10).toFixed(1)}px)`;
  });
};

const Eglise: React.FC = () => {
  const navigate = useNavigate();
  const isBack = useNavigationType() === 'POP';
  const reduced = useReducedMotion();

  const contentRef = useRef<HTMLIonContentElement>(null);
  useScrollMemory(contentRef, 'eglise');
  const rootRef = useRef<HTMLDivElement>(null);

  /** Une partie mène à sa page, ou à la page de l'app qu'elle présente. */
  const openPart = (rubrique: Rubrique, part: RubriquePart) => {
    tapHaptic();
    if (part.link) navigate(part.link.path, part.link.state ? { state: part.link.state } : undefined);
    else navigate(rubriquePath(rubrique.key, part.id));
  };

  const openRubrique = (rubrique: Rubrique) => {
    tapHaptic();
    navigate(rubriquePath(rubrique.key), { state: { fromParent: true } });
  };

  /* --- Haut de page : entrée en cascade --- */

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduced || isBack) return;
    root.querySelectorAll('[data-in]').forEach((n, i) =>
      n.animate(
        [
          { opacity: 0, transform: 'translateY(16px)', filter: 'blur(4px)' },
          { opacity: 1, transform: 'none', filter: 'blur(0)' }
        ],
        { duration: 1000, delay: 120 + i * 120, easing: EASE, fill: 'backwards' }
      )
    );
    // Une seule fois, à l'arrivée sur la page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  /* --- Carrousels : inclinaison et position gardée --- */

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const cleanups = [...root.querySelectorAll<HTMLElement>('[data-car]')].map((car) => {
      const key = car.dataset.car ?? '';
      car.scrollLeft = carouselMemory.get(key) ?? 0;
      let raf = 0;
      const onScroll = () => {
        carouselMemory.set(key, car.scrollLeft);
        if (reduced || raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          tiltCards(car);
        });
      };
      if (!reduced) tiltCards(car);
      car.addEventListener('scroll', onScroll, { passive: true });
      return () => {
        car.removeEventListener('scroll', onScroll);
        cancelAnimationFrame(raf);
      };
    });
    return () => cleanups.forEach((fn) => fn());
  }, [reduced]);

  /* --- Sections : apparition, puis animations seulement à l'écran --- */

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const sections = root.querySelectorAll<HTMLElement>('[data-sec]');
    const animateIn = !reduced && !isBack;
    const reveal = (sec: HTMLElement) => {
      sec.classList.add('is-in');
      sec.querySelector('[data-roman]')?.animate(
        [
          { opacity: 0, translate: '0 18px', scale: '0.7', filter: 'blur(6px)' },
          { opacity: 1, translate: '0 0', scale: '1', filter: 'blur(0)' }
        ],
        { duration: 900, easing: EASE }
      );
      sec.querySelectorAll<HTMLElement>('[data-card]').forEach((card, i) => {
        card.style.opacity = '';
        card.animate(
          [
            { opacity: 0, translate: '0 54px', rotate: '-5deg' },
            { opacity: 1, translate: '0 0', rotate: '0deg' }
          ],
          { duration: 950, delay: 120 + i * 120, easing: EASE, fill: 'backwards' }
        );
      });
    };

    sections.forEach((sec) => {
      if (animateIn) sec.querySelectorAll<HTMLElement>('[data-card]').forEach((c) => (c.style.opacity = '0'));
      else sec.classList.add('is-in');
    });

    const seen = new WeakSet<Element>();
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          e.target.classList.toggle('is-live', e.isIntersecting);
          if (!e.isIntersecting || seen.has(e.target)) return;
          seen.add(e.target);
          if (animateIn) reveal(e.target as HTMLElement);
        }),
      { threshold: 0.05 }
    );
    sections.forEach((sec) => io.observe(sec));
    return () => io.disconnect();
    // Une seule fois, à l'arrivée sur la page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  const raison = RUBRIQUES[0];

  return (
    <IonPage>
      <IonContent ref={contentRef} fullscreen className="eglise-content">
        <div ref={rootRef}>
          {/* --- Haut de page : rosace dans la nuit --- */}
          <header className="eglise-hero">
            <div className="eglise-stars" aria-hidden="true">
              {STARS.map((s, i) => (
                <span
                  key={i}
                  className="eglise-star"
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

            <div className="eglise-rosace-stage" aria-hidden="true">
              <div className="eglise-rosace-glow" />
              <div className="eglise-rosace">
                <div className="eglise-rosace-outer" />
                <div className="eglise-rosace-inner" />
                <div className="eglise-rosace-ring" />
                <div className="eglise-rosace-heart">✚︎</div>
              </div>
            </div>

            <div className="eglise-hero-text">
              <p data-in="" className="eglise-kicker">
                L'Église
              </p>
              <h1 data-in="" className="eglise-hero-title">
                La foi catholique, <em>expliquée simplement</em>
              </h1>
              <p data-in="" className="eglise-hero-lead">
                Choisis une rubrique. Aucune connaissance préalable n'est demandée.
              </p>
              <button type="button" data-in="" className="eglise-hero-link" onClick={() => openRubrique(raison)}>
                Commence ici : {raison.title} <span aria-hidden="true">→</span>
              </button>
            </div>
          </header>

          {/* --- Les six rubriques --- */}
          <div className="eglise-rubriques">
            {RUBRIQUES.map((rubrique) => {
              const featured = rubrique.key === 'raison';
              return (
                <section
                  key={rubrique.key}
                  data-sec=""
                  className={`eglise-sec eglise-sec--${rubrique.key}${featured ? ' eglise-sec--featured' : ''}`}
                  aria-label={rubrique.title}
                >
                  {featured && (
                    <>
                      <span className="eglise-featured-border" aria-hidden="true" />
                      <span className="eglise-featured-fill" aria-hidden="true" />
                      <span className="eglise-featured-banner" aria-hidden="true">
                        <span
                          className="eglise-zoom"
                          style={{ backgroundImage: `url('${rubrique.banner}')` }}
                        />
                        <span className="eglise-featured-veil" />
                      </span>
                      <span className="eglise-featured-glow" aria-hidden="true" />
                      <div className="eglise-featured-intro">
                        <span className="eglise-priority">
                          <span className="eglise-pulse" aria-hidden="true" />
                          <span className="eglise-priority-label">À étudier en priorité</span>
                          <span className="eglise-priority-shine" aria-hidden="true" />
                        </span>
                        <p className="eglise-featured-text">
                          Le socle de ta foi. Comprendre pourquoi tu crois, pour savoir l'expliquer à ceux qui te le
                          demandent.
                        </p>
                      </div>
                    </>
                  )}

                  <div className="eglise-sec-head">
                    <span data-roman="" className="eglise-roman" aria-hidden="true">
                      {rubrique.roman}
                    </span>
                    <span className="eglise-sec-titles">
                      <span className="eglise-sec-title">{rubrique.title}</span>
                      <span className="eglise-sec-desc">{rubrique.desc}</span>
                    </span>
                    <button
                      type="button"
                      className="eglise-see-all"
                      aria-label={`Tout voir : ${rubrique.title}`}
                      onClick={() => openRubrique(rubrique)}
                    >
                      Tout voir <span aria-hidden="true">→</span>
                    </button>
                  </div>
                  <div className="eglise-sec-line" aria-hidden="true" />

                  <div data-car={rubrique.key} className="eglise-carousel">
                    {rubrique.parts.map((part, i) => (
                      <button
                        key={part.id}
                        type="button"
                        data-card=""
                        className="eglise-card"
                        style={{ '--eg-delay': `${(-(RUBRIQUES.indexOf(rubrique) * 1.3 + i * 0.9)).toFixed(1)}s` } as React.CSSProperties}
                        onClick={() => openPart(rubrique, part)}
                      >
                        <span className="eglise-card-arch" aria-hidden="true">
                          <span className="eglise-card-glass" />
                          <span className="eglise-card-light" />
                          <span data-glass="" className="eglise-card-glyph">
                            <span>{part.glyph}</span>
                          </span>
                          <span className="eglise-card-photo" style={{ backgroundImage: `url('${part.img}')` }} />
                          <span className="eglise-card-shine" />
                        </span>
                        <span className="eglise-card-text">
                          <span className="eglise-card-title">{part.title}</span>
                          <span className="eglise-card-desc">{part.desc}</span>
                        </span>
                        <span className="eglise-card-arrow" aria-hidden="true">
                          {part.link || part.content === 'jesus' ? '→' : '↓'}
                        </span>
                      </button>
                    ))}
                    <span className="eglise-carousel-end" aria-hidden="true" />
                  </div>

                  {featured && (
                    <div className="eglise-start-wrap">
                      <button
                        type="button"
                        className="eglise-start"
                        onClick={() => openPart(rubrique, rubrique.parts[0])}
                      >
                        <span className="eglise-start-shine" aria-hidden="true" />
                        <span className="eglise-start-text">
                          <span className="eglise-start-title">Commencer le chapitre 1</span>
                          <span className="eglise-start-meta">
                            {FOI_RAISON.length} chapitres · {FOI_RAISON_ARGS} arguments · dans l'ordre
                          </span>
                        </span>
                        <span className="eglise-start-arrow" aria-hidden="true">
                          →
                        </span>
                      </button>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Eglise;
