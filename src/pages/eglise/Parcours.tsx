import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { IonContent, IonPage } from '@ionic/react';
import { parcoursSteps, PARCOURS_ORDER, type ScriptureRef } from '../../data/parcours';
import { ChevronLeftIcon } from '../../components/nav/icons';
import ScriptureRefChip from '../figures/ScriptureRefChip';
import VersePreviewSheet from '../figures/VersePreviewSheet';
import { tapHaptic } from '../../utils/haptics';
import './Parcours.css';
import WorldButton from '../../components/nav/WorldButton';

interface ParcoursLocationState {
  stepId?: string;
}

const Parcours: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const ionContentRef = useRef<HTMLIonContentElement>(null);
  const [activeRef, setActiveRef] = useState<ScriptureRef | null>(null);

  const requestedStepId = (location.state as ParcoursLocationState | null)?.stepId;
  const requestedIndex = requestedStepId ? PARCOURS_ORDER.indexOf(requestedStepId) : -1;
  const [stepIndex, setStepIndex] = useState(requestedIndex >= 0 ? requestedIndex : 0);

  const step = parcoursSteps[PARCOURS_ORDER[stepIndex]];
  const prevStep = stepIndex > 0 ? parcoursSteps[PARCOURS_ORDER[stepIndex - 1]] : undefined;
  const nextStep = stepIndex < PARCOURS_ORDER.length - 1 ? parcoursSteps[PARCOURS_ORDER[stepIndex + 1]] : undefined;

  useEffect(() => {
    ionContentRef.current?.scrollToTop(300);
  }, [stepIndex]);

  const goToStep = (id: string) => {
    const index = PARCOURS_ORDER.indexOf(id);
    if (index >= 0) {
      tapHaptic();
      setStepIndex(index);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="parcours-content" ref={ionContentRef}>
        <header className="parcours-header">
          <button
            type="button"
            className="parcours-header-button"
            onClick={() => {
              tapHaptic();
              navigate(-1);
            }}
            aria-label="Retour"
          >
            <ChevronLeftIcon size={22} />
          </button>
        </header>

        <div className="parcours-progress">
          <p className="parcours-progress-kicker">
            Parcours pour nouveaux croyants · Étape {step.numeral}
          </p>
          <div className="parcours-progress-track">
            {PARCOURS_ORDER.map((id, i) => (
              <button
                key={id}
                type="button"
                className={`parcours-progress-segment${i <= stepIndex ? ' is-filled' : ''}`}
                onClick={() => goToStep(id)}
                aria-label={parcoursSteps[id].title}
                aria-current={i === stepIndex ? 'step' : undefined}
              />
            ))}
          </div>
        </div>

        <div className="parcours-hero">
          <h1 className="parcours-title">{step.title}</h1>
          <p className="parcours-intro">{step.intro}</p>
        </div>

        {step.sections.map((section, i) => (
          <div key={section.title}>
            <section className="parcours-section">
              <h2 className="parcours-section-title">{section.title}</h2>
              {section.paragraphs.map((paragraph, j) => (
                <p className="parcours-paragraph" key={j}>
                  {paragraph.map((segment, k) =>
                    segment.type === 'text' ? (
                      <span key={k}>{segment.text}</span>
                    ) : (
                      <ScriptureRefChip key={k} refData={segment.ref} onOpen={setActiveRef} />
                    )
                  )}
                </p>
              ))}
            </section>

            {i === step.pullQuoteAfterSection && (
              <div className="parcours-pull-quote">
                <p className="parcours-pull-quote-text">« {step.pullQuote.quote} »</p>
                <p className="parcours-pull-quote-ref">{step.pullQuote.reference.toUpperCase()}</p>
              </div>
            )}
          </div>
        ))}

        <div className="parcours-teaching">
          <p className="parcours-teaching-kicker">Ce qu’enseigne l’Église, en une phrase</p>
          <p className="parcours-teaching-text">{step.teaching.text}</p>
          <div className="parcours-teaching-tags">
            {step.teaching.tags.map((tag) => (
              <span className="parcours-teaching-tag" key={tag}>
                {tag.toUpperCase()}
              </span>
            ))}
          </div>
        </div>

        {step.furtherLinks.length > 0 && (
          <div className="parcours-further">
            <p className="parcours-further-kicker">Pour aller plus loin</p>
            <div className="parcours-further-list">
              {step.furtherLinks.map((link) => (
                <button
                  type="button"
                  className="parcours-further-card"
                  key={link.stepId ?? link.to}
                  onClick={() => {
                    if (link.stepId) {
                      goToStep(link.stepId);
                    } else if (link.to) {
                      tapHaptic();
                      navigate(link.to);
                    }
                  }}
                >
                  <span className="parcours-further-card-kicker">{link.kicker.toUpperCase()}</span>
                  <span className="parcours-further-card-title">{link.title}</span>
                  <span className="parcours-further-card-description">{link.description}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="parcours-nav">
          {prevStep ? (
            <button
              type="button"
              className="parcours-nav-link parcours-nav-prev"
              onClick={() => goToStep(prevStep.id)}
            >
              <span className="parcours-nav-label">← Précédent</span>
              <span className="parcours-nav-title">{prevStep.title}</span>
            </button>
          ) : (
            <span />
          )}

          {nextStep ? (
            <button
              type="button"
              className="parcours-nav-link parcours-nav-next"
              onClick={() => goToStep(nextStep.id)}
            >
              <span className="parcours-nav-label">Suivant →</span>
              <span className="parcours-nav-title">{nextStep.title}</span>
            </button>
          ) : (
            <button
              type="button"
              className="parcours-nav-link parcours-nav-next"
              onClick={() => {
                tapHaptic();
                navigate('/compendium/eglise');
              }}
            >
              <span className="parcours-nav-label">Retour →</span>
              <span className="parcours-nav-title">Église</span>
            </button>
          )}
        </div>

        <footer className="parcours-footer">
          <p className="parcours-footer-wordmark">Lux Scripturae, Fides Ecclesiae</p>
          <p className="parcours-footer-links">À propos · Sources · Contact</p>
        </footer>

        <AnimatePresence>
          {activeRef && <VersePreviewSheet refData={activeRef} onClose={() => setActiveRef(null)} />}
        </AnimatePresence>
        <WorldButton />
      </IonContent>
    </IonPage>
  );
};

export default Parcours;
