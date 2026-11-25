import { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate, useNavigationType, useParams } from 'react-router-dom';
import { IonContent, IonPage } from '@ionic/react';
import WorldButton from '../../components/nav/WorldButton';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useScrollMemory } from '../../hooks/useScrollMemory';
import { tapHaptic } from '../../utils/haptics';
import { STARTER_STEPS_RAW, type RubriqueArgument } from '../../data/egliseTextes';
import type { DocumentChapters } from '../../data/egliseDocuments';
import {
  CHEMIN_BAPTEME,
  LAST_ROMAN,
  RUBRIQUES,
  STARTER_STEPS,
  findRubrique,
  rubriquePath,
  type Rubrique as RubriqueData,
  type RubriquePart
} from '../../data/egliseRubriques';
import FicheJesus from './FicheJesus';
import RubriqueTopBar from './RubriqueTopBar';
import { useBackToRubrique, type NavState } from './rubriqueNav';
import './Rubrique.css';

const EASE = 'cubic-bezier(.2,.7,.2,1)';
const CHURCH_HOME = '/compendium/eglise';
const ROMAN = ['I', 'II', 'III', 'IV'];
const ARC_LENGTH = 408.4;
const ARC_RADIUS = 130;

// Argument ouvert de chaque partie, pour la session : au retour du Catéchisme,
// la page retrouve la même hauteur, donc la même position de défilement.
const openArgMemory = new Map<string, number | null>();

/* --- Arguments en accordéon --- */

const ArgumentList: React.FC<{ partKey: string; args: RubriqueArgument[]; isBack: boolean }> = ({
  partKey,
  args,
  isBack
}) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState<number | null>(() =>
    isBack && openArgMemory.has(partKey) ? (openArgMemory.get(partKey) ?? null) : 0
  );
  useEffect(() => {
    openArgMemory.set(partKey, open);
  }, [partKey, open]);

  return (
    <div className="rubrique-args">
      {args.map((arg, i) => {
        const on = i === open;
        // « Catéchisme, § 232-267 » renvoie au paragraphe dans l'app.
        const cec = arg.src?.match(/^Catéchisme, § (.+)$/)?.[1];
        return (
          <article key={arg.title} className={`rubrique-arg${on ? ' is-open' : ''}`}>
            <button
              type="button"
              className="rubrique-arg-head"
              aria-expanded={on}
              onClick={() => {
                tapHaptic();
                setOpen(on ? null : i);
              }}
            >
              <span className="rubrique-arg-titles">
                {arg.kind && <span className="rubrique-arg-kind">{arg.kind}</span>}
                <span className="rubrique-arg-title">{arg.title}</span>
              </span>
              <span className="rubrique-arg-btn" aria-hidden="true">
                ✚︎
              </span>
            </button>
            <div className="rubrique-arg-collapse">
              <div className="rubrique-arg-inner">
                <div className="rubrique-arg-body">
                  {arg.steps && (
                    <div className="rubrique-arg-steps">
                      {arg.steps.map(([label, text], k) => (
                        <div key={k} className="rubrique-arg-step">
                          <span className="rubrique-arg-step-n">{k + 1}</span>
                          <span>
                            {label && <span className="rubrique-arg-step-label">{label}</span>}
                            <span className="rubrique-arg-step-text">{text}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {arg.body && <p className="rubrique-arg-text">{arg.body}</p>}
                  {arg.quote && (
                    <blockquote className="rubrique-arg-quote">
                      <span className="rubrique-arg-quote-mark" aria-hidden="true">
                        «
                      </span>
                      <p className="rubrique-arg-quote-text">{arg.quote}</p>
                      <footer className="rubrique-arg-quote-ref">
                        <span aria-hidden="true" />
                        {arg.quoteRef}
                      </footer>
                    </blockquote>
                  )}
                  {arg.concl && (
                    <div className="rubrique-arg-concl">
                      <p className="rubrique-arg-concl-label">Donc</p>
                      <p className="rubrique-arg-concl-text">{arg.concl}</p>
                    </div>
                  )}
                  {arg.friend && (
                    <div className="rubrique-arg-friend">
                      <p className="rubrique-arg-friend-label">Pour l'expliquer à un ami</p>
                      <p className="rubrique-arg-friend-text">{arg.friend}</p>
                    </div>
                  )}
                  {arg.src &&
                    (cec ? (
                      <button
                        type="button"
                        className="rubrique-arg-src rubrique-arg-src--link"
                        onClick={() => {
                          tapHaptic();
                          navigate(`/catechisme/${cec}`);
                        }}
                      >
                        {arg.src}
                      </button>
                    ) : (
                      <p className="rubrique-arg-src">{arg.src}</p>
                    ))}
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};

/* --- Par où commencer --- */

const StarterSteps: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="rubrique-steps">
      <div className="rubrique-steps-thread" aria-hidden="true" />
      {STARTER_STEPS_RAW.map(([num, title, body], i) => (
        <button
          key={num}
          type="button"
          className="rubrique-step"
          style={{ '--rb-delay': `${(-i * 0.7).toFixed(1)}s` } as React.CSSProperties}
          onClick={() => {
            tapHaptic();
            const { path, state } = STARTER_STEPS[i].link;
            navigate(path, state ? { state } : undefined);
          }}
        >
          <span className="rubrique-step-medal" aria-hidden="true">
            <span className="rubrique-step-halo" />
            <span className="rubrique-step-pulse" />
            <span className="rubrique-step-photo">
              <span style={{ backgroundImage: `url('${STARTER_STEPS[i].img}')` }} />
            </span>
            <span className="rubrique-step-num">{num}</span>
          </span>
          <span className="rubrique-step-body">
            <span className="rubrique-step-title">{title}</span>
            <span className="rubrique-step-text">{body}</span>
          </span>
        </button>
      ))}
    </div>
  );
};

/* --- Chemin vers le baptême : avance seul, reprend après un toucher --- */

const CheminBapteme: React.FC = () => {
  const reduced = useReducedMotion();
  const [stage, setStage] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const autoRef = useRef(0);
  const firstStage = useRef(true);

  const startAuto = useCallback(() => {
    window.clearInterval(autoRef.current);
    if (reduced) return;
    autoRef.current = window.setInterval(() => setStage((s) => (s + 1) % CHEMIN_BAPTEME.length), 4200);
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
        { opacity: 0, transform: 'translateY(12px)' },
        { opacity: 1, transform: 'none' }
      ],
      { duration: 600, easing: EASE }
    );
  }, [stage, reduced]);

  const pick = (i: number) => {
    tapHaptic();
    setStage(i);
    startAuto();
  };

  const [label, title, text, deg] = CHEMIN_BAPTEME[stage];

  return (
    <div className="rubrique-chemin">
      <div className="rubrique-arc">
        <svg width="300" height="176" viewBox="0 0 300 176" aria-hidden="true">
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
            strokeDashoffset={(ARC_LENGTH * (1 - deg / 180)).toFixed(1)}
            className="rubrique-arc-progress"
          />
        </svg>
        {CHEMIN_BAPTEME.map(([stopLabel, stopTitle, , stopDeg], i) => {
          const rad = (stopDeg * Math.PI) / 180;
          return (
            <button
              key={stopLabel}
              type="button"
              className={`rubrique-arc-stop${i <= stage ? ' is-reached' : ''}`}
              style={{ left: 150 - ARC_RADIUS * Math.cos(rad), top: 150 - ARC_RADIUS * Math.sin(rad) }}
              aria-label={`${stopLabel} : ${stopTitle}`}
              aria-current={i === stage ? 'step' : undefined}
              onClick={() => pick(i)}
            >
              <span />
            </button>
          );
        })}
        <div className="rubrique-pilgrim" style={{ transform: `rotate(${deg}deg)` }} aria-hidden="true">
          <span />
        </div>
        <div className="rubrique-arc-center" aria-hidden="true">
          <span className="rubrique-arc-roman">{ROMAN[stage]}</span>
          <span className="rubrique-arc-label">{label}</span>
        </div>
      </div>
      <div ref={stageRef} className="rubrique-stage" aria-live="polite">
        <h3 className="rubrique-stage-title">{title}</h3>
        <p className="rubrique-stage-text">{text}</p>
      </div>
      <div className="rubrique-stage-bars">
        {CHEMIN_BAPTEME.map(([barLabel], i) => (
          <button
            key={barLabel}
            type="button"
            className={`rubrique-stage-bar${i === stage ? ' is-current' : ''}`}
            aria-label={barLabel}
            onClick={() => pick(i)}
          >
            <span />
          </button>
        ))}
      </div>
    </div>
  );
};

/* --- Parler à une paroisse --- */

const ContactCard: React.FC = () => {
  const navigate = useNavigate();
  const go = (path: string) => {
    tapHaptic();
    navigate(path);
  };
  return (
    <div className="rubrique-contact">
      <div className="rubrique-candle" aria-hidden="true">
        <span className="rubrique-candle-halo" />
        <span className="rubrique-candle-flame" />
        <span className="rubrique-candle-wick" />
        <span className="rubrique-candle-body" />
      </div>
      <p className="rubrique-contact-kicker">Prochaine étape</p>
      <p className="rubrique-contact-title">Une rencontre, sans engagement</p>
      <div className="rubrique-contact-actions">
        <button type="button" className="rubrique-contact-primary" onClick={() => go('/paroisses')}>
          Trouver une paroisse <span aria-hidden="true">→</span>
        </button>
        <button type="button" className="rubrique-contact-secondary" onClick={() => go('/contact')}>
          Poser une question
        </button>
      </div>
    </div>
  );
};

/* --- Page d'un document de l'Église --- */

// Résumés chapitre par chapitre : chargés à la première page de document, puis
// gardés pour la session, pour que le retour sur la page les trouve aussitôt.
let docsTexte: DocumentChapters[] | null = null;
const loadDocsTexte = () =>
  import('../../data/egliseDocumentsTexte').then((m) => {
    docsTexte = m.default;
    return docsTexte;
  });

// Chapitre ouvert de chaque document, pour la session.
const openChapterMemory = new Map<string, number | null>();

const DocumentContent: React.FC<{ partKey: string; part: RubriquePart; isBack: boolean }> = ({
  partKey,
  part,
  isBack
}) => {
  const doc = part.doc!;
  const [texte, setTexte] = useState(docsTexte);
  const [openCh, setOpenCh] = useState<number | null>(() =>
    isBack ? (openChapterMemory.get(partKey) ?? null) : null
  );
  useEffect(() => {
    openChapterMemory.set(partKey, openCh);
  }, [partKey, openCh]);
  useEffect(() => {
    if (texte) return;
    let alive = true;
    loadDocsTexte()
      .then((t) => alive && setTexte(t))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [texte]);

  const chapters = part.docIndex != null ? texte?.[part.docIndex]?.chapters : undefined;
  const facts: [string, string, boolean?][] = [
    ['Type', doc.type],
    ['Date', doc.date],
    ['Auteur', doc.author],
    ['Titre', doc.latin, true]
  ];

  return (
    <>
      <dl className="rubrique-doc-facts">
        {facts.map(([label, value, italic]) => (
          <div key={label} className="rubrique-doc-fact">
            <dt>{label}</dt>
            <dd className={italic ? 'is-italic' : undefined}>{value}</dd>
          </div>
        ))}
      </dl>

      <h2 className="rubrique-doc-label">Les idées clés</h2>
      <ArgumentList partKey={partKey} args={doc.args} isBack={isBack} />

      <a className="rubrique-doc-full" href={doc.url} target="_blank" rel="noopener noreferrer" onClick={() => tapHaptic()}>
        <span>
          <span className="rubrique-doc-full-title">Lire le texte intégral</span>
          <span className="rubrique-doc-full-meta">Site du Vatican · en français</span>
        </span>
        <span className="rubrique-doc-full-arrow" aria-hidden="true">
          ↗
        </span>
      </a>

      {chapters && (
        <section className="rubrique-doc-chapters" aria-label="Le document en entier">
          <p className="rubrique-doc-label">Le document en entier</p>
          <h2 className="rubrique-doc-chapters-title">Chapitre par chapitre, en mots simples</h2>
          <p className="rubrique-doc-chapters-intro">
            Les {chapters.length} parties du document, dans l'ordre, réécrites simplement. Rien n'est sauté : chaque
            chapitre est résumé fidèlement. Pour les mots exacts, lis le texte intégral.
          </p>
          <div className="rubrique-doc-chapter-list">
            {chapters.map((ch, k) => {
              const on = openCh === k;
              return (
                <article key={k} className={`rubrique-arg rubrique-doc-chapter${on ? ' is-open' : ''}`}>
                  <button
                    type="button"
                    className="rubrique-doc-chapter-head"
                    aria-expanded={on}
                    onClick={() => {
                      tapHaptic();
                      setOpenCh(on ? null : k);
                    }}
                  >
                    <span className="rubrique-doc-chapter-n" aria-hidden="true">
                      {k + 1}
                    </span>
                    <span className="rubrique-arg-titles">
                      <span className="rubrique-arg-kind">{ch.ref}</span>
                      <span className="rubrique-doc-chapter-title">{ch.title}</span>
                    </span>
                    <span className="rubrique-arg-btn" aria-hidden="true">
                      ✚︎
                    </span>
                  </button>
                  <div className="rubrique-arg-collapse">
                    <div className="rubrique-arg-inner">
                      <div className="rubrique-doc-chapter-body">
                        {ch.paras.map((para, j) =>
                          para.startsWith('# ') ? (
                            <h3 key={j} className="rubrique-doc-subhead">
                              <span aria-hidden="true" />
                              {para.slice(2)}
                            </h3>
                          ) : (
                            <p key={j} className="rubrique-doc-para">
                              {para}
                            </p>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
};

/* --- Présentation d'une rubrique --- */

const Overview: React.FC<{ rubrique: RubriqueData }> = ({ rubrique }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const contentRef = useRef<HTMLIonContentElement>(null);
  useScrollMemory(contentRef, `rubrique-${rubrique.key}`);

  const index = RUBRIQUES.indexOf(rubrique);
  const next = RUBRIQUES[(index + 1) % RUBRIQUES.length];
  const state = location.state as NavState | null;

  const back = () => {
    tapHaptic();
    if (state?.fromParent) navigate(-1);
    else navigate(CHURCH_HOME, { replace: true });
  };

  const openPart = (part: RubriquePart) => {
    tapHaptic();
    if (part.link) navigate(part.link.path, part.link.state ? { state: part.link.state } : undefined);
    else navigate(rubriquePath(rubrique.key, part.id), { state: { fromParent: true } satisfies NavState });
  };

  return (
    <IonPage>
      <IonContent ref={contentRef} fullscreen className="rubrique-content">
        <RubriqueTopBar backLabel="Église" count={`${rubrique.roman} / ${LAST_ROMAN}`} onBack={back} />

        <div className="rubrique-banner">
          <span className="rubrique-banner-photo" style={{ backgroundImage: `url('${rubrique.banner}')` }} />
          <span className="rubrique-banner-veil" />
          <div className="rubrique-banner-text">
            <div className="rubrique-banner-kickers">
              <span className="rubrique-banner-kicker">Rubrique {rubrique.roman}</span>
              <span className="rubrique-banner-rule" aria-hidden="true" />
              <span className="rubrique-banner-meta">{rubrique.count}</span>
            </div>
            <h1 className="rubrique-banner-title">{rubrique.title}</h1>
          </div>
        </div>

        <p className="rubrique-lead">{rubrique.intro}</p>

        <blockquote className="rubrique-quote">
          <p className="rubrique-quote-text">« {rubrique.quote} »</p>
          <footer className="rubrique-quote-src">{rubrique.quoteSrc}</footer>
        </blockquote>

        <div className="rubrique-tip">
          <p className="rubrique-tip-label">
            <span className="rubrique-pulse" aria-hidden="true" />
            {rubrique.tipLabel}
          </p>
          <p className="rubrique-tip-text">{rubrique.tip}</p>
        </div>

        <section className="rubrique-summary">
          <h2 className="rubrique-summary-title">Les pages de cette rubrique</h2>
          <div className="rubrique-summary-list">
            {rubrique.parts.map((part, i) => (
              <button key={part.id} type="button" className="rubrique-summary-row" onClick={() => openPart(part)}>
                <span className="rubrique-thumb" aria-hidden="true">
                  <span className="rubrique-thumb-glyph">{part.glyph}</span>
                  <span className="rubrique-thumb-photo" style={{ backgroundImage: `url('${part.img}')` }} />
                </span>
                <span className="rubrique-summary-text">
                  <span className="rubrique-summary-kicker">
                    {rubrique.key === 'raison' ? 'Chapitre' : 'Partie'} {i + 1}
                  </span>
                  <span className="rubrique-summary-name">{part.title}</span>
                  <span className="rubrique-summary-desc">{part.desc}</span>
                </span>
                <span className="rubrique-summary-arrow" aria-hidden="true">
                  →
                </span>
              </button>
            ))}
          </div>
          {rubrique.outro && (
            <p className="rubrique-summary-outro">
              <span aria-hidden="true">❦︎</span>
              {rubrique.outro}
            </p>
          )}
        </section>

        <button
          type="button"
          className="rubrique-next"
          onClick={() => {
            tapHaptic();
            navigate(rubriquePath(next.key), { replace: true, state: location.state });
          }}
        >
          <span>
            <span className="rubrique-next-kicker">Rubrique suivante · {next.roman}</span>
            <span className="rubrique-next-title">{next.title}</span>
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

/* --- Page d'une partie --- */

const PartPage: React.FC<{ rubrique: RubriqueData; part: RubriquePart }> = ({ rubrique, part }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isBack = useNavigationType() === 'POP';
  const contentRef = useRef<HTMLIonContentElement>(null);
  const partKey = `${rubrique.key}/${part.id}`;
  useScrollMemory(contentRef, `rubrique-${partKey}`);

  const pages = rubrique.parts;
  const index = pages.indexOf(part);
  const prev = pages[index - 1];
  const next = pages[index + 1];
  const toRubrique = useBackToRubrique(rubrique.key);

  // Les pages voisines remplacent celle-ci : « Retour » mène toujours à la rubrique.
  const goSibling = (target: RubriquePart) => {
    tapHaptic();
    navigate(rubriquePath(rubrique.key, target.id), { replace: true, state: location.state });
  };

  return (
    <IonPage>
      <IonContent ref={contentRef} fullscreen className="rubrique-content">
        <RubriqueTopBar backLabel={rubrique.title} count={`${index + 1} / ${pages.length}`} onBack={toRubrique} />

        <div className="rubrique-banner rubrique-banner--part">
          <span className="rubrique-banner-photo" style={{ backgroundImage: `url('${part.img}')` }} />
          <span className="rubrique-banner-veil" />
          <div className="rubrique-banner-text">
            <div className="rubrique-banner-kickers">
              <span className="rubrique-banner-kicker">{rubrique.title}</span>
              <span className="rubrique-banner-rule" aria-hidden="true" />
              <span className="rubrique-banner-meta">
                {rubrique.key === 'raison' ? 'Chapitre' : 'Partie'} {index + 1}
              </span>
            </div>
            <h1 className="rubrique-banner-title">{part.title}</h1>
            <p className="rubrique-banner-desc">{part.desc}</p>
          </div>
        </div>

        <p className="rubrique-lead">{part.lead}</p>

        <div className="rubrique-part">
          {part.content === 'args' && part.args && <ArgumentList partKey={partKey} args={part.args} isBack={isBack} />}
          {part.content === 'document' && part.doc && <DocumentContent partKey={partKey} part={part} isBack={isBack} />}
          {part.content === 'steps' && <StarterSteps />}
          {part.content === 'chemin' && <CheminBapteme />}
          {part.content === 'contact' && <ContactCard />}

          <nav className="rubrique-pager" aria-label="Pages de la rubrique">
            {prev ? (
              <button type="button" className="rubrique-pager-prev" onClick={() => goSibling(prev)}>
                <span className="rubrique-pager-label">← Précédent</span>
                <span className="rubrique-pager-title">{prev.title}</span>
              </button>
            ) : (
              <span />
            )}
            {next && (
              <button type="button" className="rubrique-pager-next" onClick={() => goSibling(next)}>
                <span className="rubrique-pager-label">Suivant →</span>
                <span className="rubrique-pager-title">{next.title}</span>
              </button>
            )}
          </nav>
          <button type="button" className="rubrique-all" onClick={toRubrique}>
            Toutes les pages de « {rubrique.title} »
          </button>
        </div>

        <WorldButton />
      </IonContent>
    </IonPage>
  );
};

/* --- Routes /eglise/:rubrique et /eglise/:rubrique/:partie --- */

const Rubrique: React.FC = () => {
  const { rubrique: rubriqueKey, partie } = useParams();
  const rubrique = findRubrique(rubriqueKey);
  if (!rubrique) return <Navigate to={CHURCH_HOME} replace />;
  if (!partie) return <Overview key={rubrique.key} rubrique={rubrique} />;

  const part = rubrique.parts.find((p) => p.id === partie);
  // Une partie qui renvoie vers une autre page de l'app n'a pas de page propre.
  if (!part || part.link) return <Navigate to={rubriquePath(rubrique.key)} replace />;
  if (part.content === 'jesus') return <FicheJesus />;
  return <PartPage key={`${rubrique.key}/${part.id}`} rubrique={rubrique} part={part} />;
};

export default Rubrique;
