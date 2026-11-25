import { useEffect, useRef, useState } from 'react';
import { useNavigate, useNavigationType } from 'react-router-dom';
import { IonContent, IonPage } from '@ionic/react';
import WorldButton from '../../components/nav/WorldButton';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useScrollMemory } from '../../hooks/useScrollMemory';
import { tapHaptic } from '../../utils/haptics';
import { egliseImg, rubriquePath } from '../../data/egliseRubriques';
import { JESUS_PARTS } from '../../data/ficheJesus';
import RubriqueTopBar from './RubriqueTopBar';
import { useBackToRubrique } from './rubriqueNav';
import './Rubrique.css';
import './FicheJesus.css';

const FURTHER = [
  {
    kicker: 'La foi et la raison · Chapitre 2',
    title: 'Les preuves historiques sur Jésus',
    img: 'foi-raison/christianisme',
    path: rubriquePath('raison', 'christianisme')
  },
  {
    kicker: 'Comprendre la foi · Étape I',
    title: 'Qui est Dieu ?',
    img: 'comprendre/dieu',
    path: '/parcours',
    state: { stepId: 'dieu' }
  }
];

const SUMMARY_REFS = ['CEC § 422-451', 'CEC § 638-655', 'Credo de Nicée-Constantinople'];

// Parole ouverte, pour la session : au retour, la page retrouve la même
// hauteur, donc la même position de défilement.
let openMemory: number | null = 0;

const FicheJesus: React.FC = () => {
  const navigate = useNavigate();
  const isBack = useNavigationType() === 'POP';
  const reduced = useReducedMotion();
  const back = useBackToRubrique('personnes');

  const contentRef = useRef<HTMLIonContentElement>(null);
  useScrollMemory(contentRef, 'fiche-jesus');
  const partRefs = useRef<(HTMLElement | null)[]>([]);

  const [open, setOpen] = useState<number | null>(() => (isBack ? openMemory : 0));
  useEffect(() => {
    openMemory = open;
  }, [open]);

  /** Fait défiler jusqu'à une partie, sous la barre du haut. */
  const jump = async (i: number) => {
    const content = contentRef.current;
    const target = partRefs.current[i];
    if (!content || !target) return;
    tapHaptic();
    const scroller = await content.getScrollElement();
    const top = target.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
    const bar = scroller.querySelector<HTMLElement>('.rubrique-topbar')?.offsetHeight ?? 52;
    await content.scrollToPoint(0, top - bar, reduced ? 0 : 500);
  };

  const go = (path: string, state?: unknown) => {
    tapHaptic();
    navigate(path, state ? { state } : undefined);
  };

  return (
    <IonPage>
      <IonContent ref={contentRef} fullscreen className="rubrique-content">
        <RubriqueTopBar backLabel="Les personnes" count="III · 1 / 3" onBack={back} />

        <div className="rubrique-banner">
          <span
            className="rubrique-banner-photo jesus-banner-photo"
            style={{ backgroundImage: `url('${egliseImg('personnes/jesus')}')` }}
          />
          <span className="rubrique-banner-veil" />
          <div className="rubrique-banner-text">
            <div className="rubrique-banner-kickers">
              <span className="rubrique-banner-kicker">Les personnes</span>
              <span className="rubrique-banner-rule" aria-hidden="true" />
              <span className="rubrique-banner-meta">{JESUS_PARTS.length} parties</span>
            </div>
            <h1 className="rubrique-banner-title jesus-title">Jésus-Christ</h1>
          </div>
        </div>

        <p className="rubrique-lead">
          La question la plus importante de toute la foi chrétienne. Voici une réponse simple, avant d'aller plus loin
          si tu le souhaites.
        </p>

        <blockquote className="rubrique-quote">
          <p className="rubrique-quote-text">« Qui m'a vu a vu le Père. »</p>
          <footer className="rubrique-quote-src">Jésus · Évangile selon saint Jean 14, 9</footer>
        </blockquote>

        <div className="rubrique-tip">
          <p className="rubrique-tip-label">
            <span className="rubrique-pulse" aria-hidden="true" />
            En une phrase
          </p>
          <p className="rubrique-tip-text">
            Jésus-Christ est vrai Dieu et vrai homme, venu par amour sauver l'humanité par sa mort et sa résurrection.
          </p>
          <div className="jesus-refs jesus-refs--tip">
            {SUMMARY_REFS.map((ref) => (
              <span key={ref} className="jesus-ref">
                {ref}
              </span>
            ))}
          </div>
        </div>

        <section className="rubrique-summary">
          <h2 className="rubrique-summary-title">Dans cette fiche</h2>
          <div className="rubrique-summary-list">
            {JESUS_PARTS.map((part, i) => (
              <button key={part.title} type="button" className="jesus-row" onClick={() => jump(i)}>
                <span
                  className="jesus-row-thumb"
                  style={{ backgroundImage: `url('${egliseImg(part.img)}')` }}
                  aria-hidden="true"
                />
                <span className="jesus-row-text">
                  <span className="rubrique-summary-kicker">Partie {i + 1}</span>
                  <span className="jesus-row-title">{part.title}</span>
                </span>
                <span className="rubrique-summary-arrow" aria-hidden="true">
                  ↓
                </span>
              </button>
            ))}
          </div>
        </section>

        {JESUS_PARTS.map((part, i) => (
          <section
            key={part.title}
            ref={(el) => {
              partRefs.current[i] = el;
            }}
            className="jesus-part"
          >
            <div className="jesus-part-head">
              <span className="jesus-part-arch" aria-hidden="true">
                <span style={{ backgroundImage: `url('${egliseImg(part.img)}')` }} />
              </span>
              <span className="jesus-part-titles">
                <span className="jesus-part-kicker">Partie {i + 1}</span>
                <h2 className="jesus-part-title">{part.title}</h2>
                <span className="jesus-part-desc">{part.desc}</span>
              </span>
            </div>
            <div className="jesus-part-rule" aria-hidden="true" />

            {part.paras.map((para) => (
              <p key={para} className="jesus-para">
                {para}
              </p>
            ))}

            {part.refs && (
              <div className="jesus-refs">
                {part.refs.map((ref) => (
                  <span key={ref} className="jesus-ref">
                    {ref}
                  </span>
                ))}
              </div>
            )}

            {part.args && (
              <div className="rubrique-args">
                {part.args.map((arg, k) => {
                  const on = k === open;
                  return (
                    <article key={arg.title} className={`rubrique-arg${on ? ' is-open' : ''}`}>
                      <button
                        type="button"
                        className="rubrique-arg-head"
                        aria-expanded={on}
                        onClick={() => {
                          tapHaptic();
                          setOpen(on ? null : k);
                        }}
                      >
                        <span className="rubrique-arg-titles">
                          <span className="rubrique-arg-kind">{arg.kind}</span>
                          <span className="rubrique-arg-title">{arg.title}</span>
                        </span>
                        <span className="rubrique-arg-btn" aria-hidden="true">
                          ✚︎
                        </span>
                      </button>
                      <div className="rubrique-arg-collapse">
                        <div className="rubrique-arg-inner">
                          <div className="rubrique-arg-body">
                            <blockquote className="jesus-parole">« {arg.quote} »</blockquote>
                            <p className="rubrique-arg-text jesus-parole-text">{arg.body}</p>
                            <p className="rubrique-arg-src">{arg.src}</p>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        ))}

        <section className="jesus-further">
          <h2 className="rubrique-summary-title">Pour aller plus loin</h2>
          <div className="jesus-further-list">
            {FURTHER.map((link) => (
              <button
                key={link.title}
                type="button"
                className="jesus-row jesus-row--card"
                onClick={() => go(link.path, link.state)}
              >
                <span
                  className="jesus-row-thumb"
                  style={{ backgroundImage: `url('${egliseImg(link.img)}')` }}
                  aria-hidden="true"
                />
                <span className="jesus-row-text">
                  <span className="rubrique-summary-kicker">{link.kicker}</span>
                  <span className="jesus-row-title">{link.title}</span>
                </span>
                <span className="rubrique-summary-arrow" aria-hidden="true">
                  →
                </span>
              </button>
            ))}
          </div>
        </section>

        <button type="button" className="rubrique-next jesus-next" onClick={() => go('/saints')}>
          <span>
            <span className="rubrique-next-kicker">Partie suivante · Les personnes</span>
            <span className="rubrique-next-title">Les saints</span>
          </span>
          <span className="rubrique-next-arrow" aria-hidden="true">
            →
          </span>
        </button>

        <WorldButton />
      </IonContent>
    </IonPage>
  );
};

export default FicheJesus;
