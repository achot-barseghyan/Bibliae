import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IonContent, IonPage } from '@ionic/react';
import { tapHaptic } from '../utils/haptics';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { CHAPTERS, OBJECTIONS } from '../data/pourquoiCroire';
import './Eglise.css';

const EASE = 'cubic-bezier(.2,.7,.2,1)';

interface StarterStep {
  id: string;
  numeral: string;
  title: string;
  description: string;
}

const STARTER_STEPS: StarterStep[] = [
  {
    id: 'dieu',
    numeral: 'I',
    title: 'Qui est Dieu ?',
    description: 'Un seul Dieu en trois personnes, le Père, le Fils et le Saint-Esprit. La base de tout le reste.'
  },
  {
    id: 'jesus',
    numeral: 'II',
    title: 'Qui est Jésus-Christ ?',
    description: 'Vrai Dieu et vrai homme, né de la Vierge Marie, mort et ressuscité pour le salut de tous.'
  },
  {
    id: 'eglise',
    numeral: 'III',
    title: "Qu'est-ce que l'Église ?",
    description: 'La communauté fondée par le Christ, guidée par les apôtres et leurs successeurs.'
  },
  {
    id: 'vivre-sa-foi',
    numeral: 'IV',
    title: 'Comment vivre sa foi ?',
    description: "La prière, les sacrements et la vie quotidienne d'un catholique, sans jargon."
  }
];

interface QaItem {
  question: string;
  answer: string;
  /** Paragraphes du Catéchisme, pour les questions de base. */
  ref?: string;
}

const FAQ_ITEMS: QaItem[] = [
  {
    question: "C'est quoi la Trinité ?",
    answer:
      'Un seul Dieu qui existe en trois personnes distinctes, le Père, le Fils et le Saint-Esprit, unis dans une seule nature divine.',
    ref: '232-267'
  },
  {
    question: 'Pourquoi Jésus est mort sur la croix ?',
    answer: "Pour racheter les péchés de l'humanité et ouvrir le chemin vers la vie éternelle, par amour.",
    ref: '599-618'
  },
  {
    question: "C'est quoi un sacrement ?",
    answer: 'Un signe concret institué par le Christ, comme le baptême ou l’Eucharistie, qui donne réellement la grâce de Dieu.',
    ref: '1131'
  },
  {
    question: "Faut-il être baptisé pour croire ?",
    answer: "On peut croire avant d'être baptisé. Le baptême est le sacrement qui fait officiellement entrer dans l'Église.",
    ref: '1213-1216'
  },
  {
    question: 'Comment prier quand on débute ?',
    answer: 'En parlant à Dieu simplement, avec ses propres mots, ou en s’appuyant sur des prières comme le Notre Père.',
    ref: '2559-2565'
  },
  {
    question: 'Que se passe-t-il après la mort ?',
    answer: "L'Église enseigne la résurrection des corps et la vie éternelle, promise à ceux qui vivent dans l'amour de Dieu.",
    ref: '988-1016'
  }
];

const PRACTICAL_QA: QaItem[] = [
  {
    question: 'Je ne suis pas baptisé, puis-je quand même aller à la messe ?',
    answer: 'Oui, tout le monde est le bienvenu à la messe. Seule la communion est réservée aux catholiques baptisés.'
  },
  {
    question: 'Comment se déroule une messe, concrètement ?',
    answer:
      'Elle suit toujours la même structure : accueil, lectures bibliques, homélie, prière eucharistique, communion, envoi. Une fois repérée, elle devient facile à suivre.'
  },
  {
    question: "Je n'ai jamais lu la Bible, par où commencer ?",
    answer:
      "L'Évangile selon saint Marc est souvent conseillé en premier, car il est court et direct. Les fiches de ce site permettent de suivre chaque personnage au fil de la lecture."
  },
  {
    question: 'Dois-je tout comprendre avant de croire ?',
    answer: 'Non. La foi grandit avec le temps et les questions. Beaucoup de croyants continuent d’apprendre toute leur vie.'
  }
];

type QaTab = 'bases' | 'pratiques';

const QA_TABS: { key: QaTab; label: string; kicker: string; title: string; items: QaItem[] }[] = [
  { key: 'bases', label: 'Les bases', kicker: 'Les bases', title: 'Les questions les plus fréquentes', items: FAQ_ITEMS },
  {
    key: 'pratiques',
    label: 'Questions pratiques',
    kicker: 'Questions pratiques',
    title: 'Ce que les nouveaux croyants demandent souvent',
    items: PRACTICAL_QA
  }
];

interface RciaStage {
  label: string;
  title: string;
  description: string;
  /** Position sur l'arc, en degrés (0 = gauche, 180 = droite). */
  deg: number;
}

const RCIA_STAGES: RciaStage[] = [
  { label: 'Étape 1', title: 'Entrée en Église', description: "Premier accueil dans la communauté, souvent à l'automne.", deg: 18 },
  {
    label: 'Étape 2',
    title: 'Temps de formation',
    description: "Rencontres régulières pour découvrir la foi, la Bible et la vie de l'Église.",
    deg: 66
  },
  {
    label: 'Étape 3',
    title: 'Appel décisif',
    description: "Au début du Carême, l'évêque appelle officiellement les catéchumènes au baptême.",
    deg: 114
  },
  {
    label: 'Étape 4',
    title: 'Baptême à Pâques',
    description: 'Le baptême est célébré lors de la veillée pascale, avec la première communion et la confirmation.',
    deg: 162
  }
];

const ROMAN = ['I', 'II', 'III', 'IV'];
const ARC_LENGTH = 408.4;
const ARC_RADIUS = 130;

interface Tile {
  label: string;
  glyph: string;
  path: string;
  /** État passé à la page, ex. l'étape du parcours à ouvrir. */
  state?: { stepId: string };
  variant: 'jesus' | 'saints' | 'paroisse';
}

const TILES: Tile[] = [
  { label: 'Jésus', glyph: '✚', path: '/parcours', state: { stepId: 'jesus' }, variant: 'jesus' },
  { label: 'Les saints', glyph: '✦', path: '/saints', variant: 'saints' },
  { label: 'Une paroisse', glyph: '⌂', path: '/paroisses', variant: 'paroisse' }
];

/** Ciel étoilé déterministe du haut de page. */
const STARS = (() => {
  let seed = 7;
  const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  return Array.from({ length: 26 }, () => {
    const left = rnd() * 100;
    const top = rnd() * 100;
    const size = rnd() > 0.7 ? 3 : 2;
    const duration = 2.2 + rnd() * 3;
    const delay = -rnd() * 4;
    return { left, top, size, duration, delay };
  });
})();

const Eglise: React.FC = () => {
  const navigate = useNavigate();
  const reduced = usePrefersReducedMotion();

  const [tab, setTab] = useState<QaTab>('bases');
  const [open, setOpen] = useState(0);
  const [stage, setStage] = useState(0);

  const contentRef = useRef<HTMLIonContentElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const rosaceRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const autoRef = useRef(0);
  const firstStage = useRef(true);
  const firstTab = useRef(true);

  const go = (path: string, state?: unknown) => {
    tapHaptic();
    navigate(path, state ? { state } : undefined);
  };

  /* --- Défilement : rosace en parallaxe, fil des étapes --- */

  const tick = useCallback(
    (scrollTop: number) => {
      // Seule la rosace s'efface : le texte et ses boutons restent lisibles,
      // car sur petit écran il faut défiler pour les atteindre.
      const r = rosaceRef.current;
      if (r && !reduced) {
        r.style.transform = `translateY(${(scrollTop * 0.3).toFixed(1)}px) scale(${(1 + scrollTop * 0.0006).toFixed(3)})`;
        r.style.opacity = Math.max(0, 1 - scrollTop / 280).toFixed(3);
      }

      const wrap = timelineRef.current;
      const line = lineRef.current;
      const content = contentRef.current;
      if (wrap && line && content) {
        const scr = content.getBoundingClientRect();
        const box = wrap.getBoundingClientRect();
        const mark = scr.top + scr.height * 0.6;
        const h = Math.max(0, Math.min(box.height - 60, mark - box.top - 20));
        line.style.height = `${h}px`;
        wrap.querySelectorAll<HTMLElement>('[data-node]').forEach((n) => {
          n.classList.toggle('is-on', n.getBoundingClientRect().top + 20 < mark);
        });
      }
    },
    [reduced]
  );

  useEffect(() => {
    let raf = 0;
    const content = contentRef.current;
    if (!content) return;
    let scrollEl: HTMLElement | null = null;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        tick(scrollEl?.scrollTop ?? 0);
      });
    };
    let cancelled = false;
    content.getScrollElement().then((el) => {
      if (cancelled) return;
      scrollEl = el;
      el.addEventListener('scroll', onScroll, { passive: true });
      tick(el.scrollTop);
    });
    return () => {
      cancelled = true;
      scrollEl?.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [tick]);

  /* --- Rosace ajustée pour que les boutons du haut tiennent dans l'écran --- */

  useEffect(() => {
    const content = contentRef.current;
    const root = rootRef.current;
    const text = heroTextRef.current;
    if (!content || !root || !text) return;
    const fit = () => {
      const avail = content.clientHeight;
      if (!avail) return;
      const stage = parseFloat(getComputedStyle(root).getPropertyValue('--eg-stage')) || 330;
      // Ce qui précède le texte en plus de la scène (encoche du téléphone).
      const inset = text.offsetTop - stage;
      // 56 : le fronton de la barre du bas déborde de 48px au centre, là où
      // sont les boutons.
      const next = Math.round(Math.max(190, Math.min(330, avail - text.offsetHeight - inset - 56)));
      if (next === stage) return;
      root.style.setProperty('--eg-stage', `${next}px`);
      root.style.setProperty('--eg-rs', `${Math.round((next * 240) / 330)}px`);
      root.style.setProperty('--eg-rtop', `${Math.round((next * 50) / 330)}px`);
    };
    const ro = new ResizeObserver(fit);
    ro.observe(content);
    ro.observe(text);
    return () => ro.disconnect();
  }, []);

  /* --- Entrées : haut de page au chargement, sections au défilement --- */

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;
    root.querySelectorAll('[data-in]').forEach((n, i) =>
      n.animate(
        [
          { opacity: 0, transform: 'translateY(18px)', filter: 'blur(4px)' },
          { opacity: 1, transform: 'none', filter: 'blur(0)' }
        ],
        { duration: 1100, delay: 150 + i * 140, easing: EASE, fill: 'backwards' }
      )
    );
    root.querySelectorAll('[data-tile]').forEach((n, i) =>
      n.animate([{ opacity: 0, transform: 'translateY(50px) scale(.9)' }, { opacity: 1, transform: 'none' }], {
        duration: 1200,
        delay: 750 + i * 130,
        easing: EASE,
        fill: 'backwards'
      })
    );

    root.classList.add('eglise-rv-ready');
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }),
      { threshold: 0.15 }
    );
    root.querySelectorAll('[data-rv]').forEach((n) => io.observe(n));
    return () => {
      io.disconnect();
      root.classList.remove('eglise-rv-ready');
    };
  }, [reduced]);

  /* --- Chemin vers le baptême : avance seul, reprend après un toucher --- */

  const startAuto = useCallback(() => {
    window.clearInterval(autoRef.current);
    if (reduced) return;
    autoRef.current = window.setInterval(() => setStage((s) => (s + 1) % RCIA_STAGES.length), 4200);
  }, [reduced]);

  useEffect(() => {
    startAuto();
    return () => window.clearInterval(autoRef.current);
  }, [startAuto]);

  useEffect(() => {
    if (firstStage.current) {
      firstStage.current = false;
      return;
    }
    if (reduced) return;
    stageRef.current?.animate(
      [
        { opacity: 0, transform: 'translateY(12px)', filter: 'blur(3px)' },
        { opacity: 1, transform: 'none', filter: 'blur(0)' }
      ],
      { duration: 650, easing: EASE }
    );
  }, [stage, reduced]);

  const pickStage = (i: number) => {
    tapHaptic();
    setStage(i);
    startAuto();
  };

  /* --- Questions --- */

  useEffect(() => {
    if (firstTab.current) {
      firstTab.current = false;
      return;
    }
    if (reduced) return;
    const list = listRef.current;
    if (!list) return;
    [...list.children].forEach((c, i) =>
      c.animate([{ opacity: 0, transform: 'translateX(24px)' }, { opacity: 1, transform: 'none' }], {
        duration: 600,
        delay: i * 60,
        easing: EASE,
        fill: 'backwards'
      })
    );
  }, [tab, reduced]);

  const pickTab = (key: QaTab) => {
    if (key === tab) return;
    tapHaptic();
    setTab(key);
    setOpen(0);
  };

  const scrollTo = (ref: React.RefObject<HTMLElement | null>) => {
    const target = ref.current;
    const content = contentRef.current;
    if (!target || !content) return;
    content.scrollToPoint(0, target.offsetTop - 10, reduced ? 0 : 600);
  };

  const qa = QA_TABS.find((t) => t.key === tab) ?? QA_TABS[0];
  const current = RCIA_STAGES[stage];
  const pilgrimDeg = current.deg;

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

            <div ref={rosaceRef} className="eglise-rosace-stage" aria-hidden="true">
              <div className="eglise-rays" />
              <div className="eglise-rosace-glow" />
              <div data-in="" className="eglise-rosace">
                <div className="eglise-rosace-outer" />
                <div className="eglise-rosace-inner" />
                <div className="eglise-rosace-spokes" />
                <div className="eglise-rosace-ring" />
                <div className="eglise-rosace-ring eglise-rosace-ring--far" />
                <div className="eglise-rosace-ring eglise-rosace-ring--mid" />
                <div className="eglise-rosace-heart">✚</div>
              </div>
            </div>

            <div ref={heroTextRef} className="eglise-hero-text">
              <p data-in="" className="eglise-kicker eglise-kicker--gold">
                Pour commencer
              </p>
              <h1 data-in="" className="eglise-hero-title">
                La foi catholique, <em>expliquée simplement</em>
              </h1>
              <p data-in="" className="eglise-hero-lead">
                Ces pages ne demandent aucune connaissance préalable. Elles répondent aux questions que se pose un
                nouveau croyant, avec les mêmes sources que le reste du site : la Bible et le Catéchisme de l'Église
                catholique.
              </p>
              <div data-in="" className="eglise-hero-actions">
                <button type="button" className="eglise-btn-gold" onClick={() => scrollTo(stepsRef)}>
                  <span className="eglise-btn-shine" aria-hidden="true" />
                  <span className="eglise-btn-label">Par où commencer</span>
                  <span className="eglise-btn-arrow" aria-hidden="true">
                    ↓
                  </span>
                </button>
                <button type="button" className="eglise-link-light" onClick={() => scrollTo(faqRef)}>
                  J'ai une question précise
                </button>
              </div>
            </div>
          </header>

          {/* --- Accès directs --- */}
          <nav className="eglise-tiles" aria-label="Accès directs">
            {TILES.map((t) => (
              <button
                key={t.path}
                type="button"
                data-tile=""
                className={`eglise-tile eglise-tile--${t.variant}`}
                onClick={() => go(t.path, t.state)}
              >
                <span className="eglise-tile-frame" aria-hidden="true" />
                <span className="eglise-tile-glow" aria-hidden="true" />
                <span className="eglise-tile-glyph" aria-hidden="true">
                  {t.glyph}
                </span>
                <span className="eglise-tile-label">{t.label}</span>
              </button>
            ))}
          </nav>

          <button type="button" data-tile="" className="eglise-pourquoi" onClick={() => go('/pourquoi-croire')}>
            <span className="eglise-pourquoi-mark" aria-hidden="true">
              ?
            </span>
            <span className="eglise-pourquoi-kicker">Essentiel</span>
            <span className="eglise-pourquoi-title">Pourquoi croire ?</span>
            <span className="eglise-pourquoi-text">
              Dieu existe-t-il ? Jésus est-il vraiment ressuscité ? Les raisons de croire, pour les comprendre et
              savoir les expliquer.
            </span>
            <span className="eglise-pourquoi-footer">
              <span className="eglise-pourquoi-meta">
                {CHAPTERS.length} questions · {OBJECTIONS.length} objections
              </span>
              <span className="eglise-pourquoi-arrow" aria-hidden="true">
                →
              </span>
            </span>
          </button>

          {/* --- Étape par étape --- */}
          <section className="eglise-steps" ref={stepsRef}>
            <p data-rv="0" className="eglise-kicker">
              Étape par étape
            </p>
            <h2 data-rv="1" className="eglise-section-title">
              Par où commencer
            </h2>
            <p data-rv="2" className="eglise-section-subtitle">
              Quatre questions dans l'ordre où elles se posent naturellement, chacune reliée à une fiche plus complète.
            </p>

            <div ref={timelineRef} className="eglise-timeline">
              <div className="eglise-timeline-track" />
              <div ref={lineRef} className="eglise-timeline-fill" />
              <div className="eglise-timeline-list">
                {STARTER_STEPS.map((step) => (
                  <button
                    type="button"
                    key={step.id}
                    data-rv="0"
                    className="eglise-step"
                    onClick={() => go('/parcours', { stepId: step.id })}
                  >
                    <span data-node="" className="eglise-step-node">
                      {step.numeral}
                    </span>
                    <span className="eglise-step-body">
                      <span className="eglise-step-title">{step.title}</span>
                      <span className="eglise-step-description">{step.description}</span>
                      <span className="eglise-step-link">
                        Lire <span aria-hidden="true" />
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* --- Questions --- */}
          <section className="eglise-qa" ref={faqRef}>
            <p data-rv="0" className="eglise-kicker">
              {qa.kicker}
            </p>
            <h2 data-rv="1" className="eglise-section-title eglise-section-title--qa">
              {qa.title}
            </h2>

            <div data-rv="2" className="eglise-seg" role="tablist">
              <div className={`eglise-seg-thumb${tab === 'pratiques' ? ' is-right' : ''}`} aria-hidden="true" />
              {QA_TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={t.key === tab}
                  className={`eglise-seg-btn${t.key === tab ? ' is-active' : ''}`}
                  onClick={() => pickTab(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div ref={listRef} className="eglise-qa-list" role="tabpanel">
              {qa.items.map((item, i) => {
                const on = i === open;
                return (
                  <div key={`${tab}-${i}`} className={`eglise-qa-item${on ? ' is-open' : ''}`}>
                    <button
                      type="button"
                      className="eglise-qa-head"
                      aria-expanded={on}
                      onClick={() => {
                        tapHaptic();
                        setOpen(on ? -1 : i);
                      }}
                    >
                      <span className="eglise-qa-n">{String(i + 1).padStart(2, '0')}</span>
                      <span className="eglise-qa-q">{item.question}</span>
                      <span className="eglise-qa-btn" aria-hidden="true">
                        ✚
                      </span>
                    </button>
                    <div className="eglise-qa-collapse">
                      <div className="eglise-qa-inner">
                        <div className="eglise-qa-body">
                          <p className="eglise-qa-a">{item.answer}</p>
                          {item.ref && (
                            <button
                              type="button"
                              className="eglise-qa-ref"
                              onClick={() => go(`/catechisme/${item.ref}`)}
                            >
                              Catéchisme, § {item.ref}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* --- Chemin vers le baptême --- */}
          <section className="eglise-rcia">
            <p data-rv="0" className="eglise-kicker">
              Aller plus loin
            </p>
            <h2 data-rv="1" className="eglise-section-title">
              Le chemin vers le baptême
            </h2>
            <p data-rv="2" className="eglise-section-subtitle">
              Pour qui souhaite être baptisé, l'Église catholique propose un parcours appelé catéchuménat, réparti sur
              plusieurs mois.
            </p>

            <div data-rv="3" className="eglise-arc">
              <svg width="300" height="176" viewBox="0 0 300 176" className="eglise-arc-svg" aria-hidden="true">
                <path
                  d="M 20 150 A 130 130 0 0 1 280 150"
                  fill="none"
                  stroke="rgba(35,32,26,0.22)"
                  strokeWidth="0.8"
                  strokeDasharray="2 5"
                />
                <path
                  d="M 20 150 A 130 130 0 0 1 280 150"
                  fill="none"
                  stroke="#B5892E"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={ARC_LENGTH}
                  strokeDashoffset={(ARC_LENGTH * (1 - pilgrimDeg / 180)).toFixed(1)}
                  className="eglise-arc-progress"
                />
              </svg>
              {RCIA_STAGES.map((s, i) => {
                const rad = (s.deg * Math.PI) / 180;
                return (
                  <button
                    key={s.label}
                    type="button"
                    className={`eglise-arc-stop${i <= stage ? ' is-reached' : ''}`}
                    style={{ left: 150 - ARC_RADIUS * Math.cos(rad), top: 150 - ARC_RADIUS * Math.sin(rad) }}
                    aria-label={`${s.label} : ${s.title}`}
                    aria-current={i === stage ? 'step' : undefined}
                    onClick={() => pickStage(i)}
                  >
                    <span />
                  </button>
                );
              })}
              <div className="eglise-pilgrim" style={{ transform: `rotate(${pilgrimDeg}deg)` }} aria-hidden="true">
                <span />
              </div>
              <div className="eglise-arc-center" aria-hidden="true">
                <span className="eglise-arc-roman">{ROMAN[stage]}</span>
                <span className="eglise-arc-step">{current.label}</span>
              </div>
            </div>

            <div ref={stageRef} className="eglise-stage" aria-live="polite">
              <h3 className="eglise-stage-title">{current.title}</h3>
              <p className="eglise-stage-text">{current.description}</p>
            </div>
            <div className="eglise-stage-bars">
              {RCIA_STAGES.map((s, i) => (
                <button
                  key={s.label}
                  type="button"
                  className={`eglise-stage-bar${i === stage ? ' is-current' : ''}`}
                  aria-label={s.label}
                  onClick={() => pickStage(i)}
                >
                  <span />
                </button>
              ))}
            </div>
          </section>

          {/* --- Prochaine étape --- */}
          <section className="eglise-cta">
            <div data-rv="0" className="eglise-candle" aria-hidden="true">
              <span className="eglise-candle-halo" />
              <span className="eglise-candle-flame" />
              <span className="eglise-candle-core" />
              <span className="eglise-candle-wick" />
              <span className="eglise-candle-body" />
            </div>
            <p data-rv="1" className="eglise-kicker eglise-kicker--gold eglise-cta-kicker">
              Prochaine étape
            </p>
            <h2 data-rv="2" className="eglise-cta-title">
              Envie d'aller plus loin qu'un site internet ?
            </h2>
            <p data-rv="3" className="eglise-cta-text">
              Une paroisse proche de chez toi peut répondre à tes questions et t'accompagner, que tu envisages le
              baptême ou simplement que tu veuilles en discuter.
            </p>
            <div data-rv="4" className="eglise-cta-actions">
              <button type="button" className="eglise-cta-primary" onClick={() => go('/paroisses')}>
                Trouver une paroisse <span aria-hidden="true">→</span>
              </button>
              <button type="button" className="eglise-cta-secondary" onClick={() => go('/contact')}>
                Poser une question
              </button>
            </div>
            <p className="eglise-cta-wordmark">Lux Scripturae, fides Ecclesiae</p>
          </section>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Eglise;
