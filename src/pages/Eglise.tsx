import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { IonContent, IonPage } from '@ionic/react';
import { tapHaptic } from '../utils/haptics';
import './Eglise.css';

interface StarterStep {
  id: string;
  numeral: string;
  title: string;
  description: string;
}

const STARTER_STEPS: StarterStep[] = [
  {
    id: 'dieu',
    numeral: 'I.',
    title: 'Qui est Dieu ?',
    description: 'Un seul Dieu en trois personnes, le Père, le Fils et le Saint-Esprit. La base de tout le reste.'
  },
  {
    id: 'jesus',
    numeral: 'II.',
    title: 'Qui est Jésus-Christ ?',
    description: 'Vrai Dieu et vrai homme, né de la Vierge Marie, mort et ressuscité pour le salut de tous.'
  },
  {
    id: 'eglise',
    numeral: 'III.',
    title: "Qu'est-ce que l'Église ?",
    description: 'La communauté fondée par le Christ, guidée par les apôtres et leurs successeurs.'
  },
  {
    id: 'vivre-sa-foi',
    numeral: 'IV.',
    title: 'Comment vivre sa foi ?',
    description: "La prière, les sacrements et la vie quotidienne d'un catholique, sans jargon."
  }
];

interface FaqItem {
  question: string;
  answer: string;
  ref: string;
}

const FAQ_ITEMS: FaqItem[] = [
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

interface RciaStage {
  label: string;
  title: string;
  description: string;
}

const RCIA_STAGES: RciaStage[] = [
  {
    label: 'Étape 1',
    title: 'Entrée en Église',
    description: "Premier accueil dans la communauté, souvent à l'automne."
  },
  {
    label: 'Étape 2',
    title: 'Temps de formation',
    description: "Rencontres régulières pour découvrir la foi, la Bible et la vie de l'Église."
  },
  {
    label: 'Étape 3',
    title: 'Appel décisif',
    description: "Au début du Carême, l'évêque appelle officiellement les catéchumènes au baptême."
  },
  {
    label: 'Étape 4',
    title: 'Baptême à Pâques',
    description: 'Le baptême est célébré lors de la veillée pascale, avec la première communion et la confirmation.'
  }
];

interface PracticalQa {
  question: string;
  answer: string;
}

const PRACTICAL_QA: PracticalQa[] = [
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

const Eglise: React.FC = () => {
  const navigate = useNavigate();
  const stepsRef = useRef<HTMLElement>(null);
  const faqRef = useRef<HTMLElement>(null);

  const scrollTo = (ref: React.RefObject<HTMLElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <IonPage>
      <IonContent fullscreen className="eglise-content">
        <header className="eglise-hero">
          <p className="eglise-kicker">Pour commencer</p>
          <h1 className="eglise-hero-title">La foi catholique, expliquée simplement</h1>
          <p className="eglise-hero-text">
            Ces pages ne demandent aucune connaissance préalable. Elles répondent aux questions que se pose un
            nouveau croyant, avec les mêmes sources que le reste du site : la Bible et le Catéchisme de l'Église
            catholique.
          </p>
          <button type="button" className="eglise-btn-primary" onClick={() => scrollTo(stepsRef)}>
            Par où commencer
          </button>
          <button type="button" className="eglise-link-secondary" onClick={() => scrollTo(faqRef)}>
            J'ai une question précise
          </button>
        </header>

        <section className="eglise-steps" ref={stepsRef}>
          <p className="eglise-kicker">Étape par étape</p>
          <h2 className="eglise-section-title">Par où commencer</h2>
          <p className="eglise-section-subtitle">
            Quatre questions dans l'ordre où elles se posent naturellement, chacune reliée à une fiche plus
            complète.
          </p>

          <div className="eglise-steps-list">
            {STARTER_STEPS.map((step) => (
              <button
                type="button"
                key={step.id}
                className="eglise-step-card"
                onClick={() => {
                  tapHaptic();
                  navigate('/parcours', { state: { stepId: step.id } });
                }}
              >
                <span className="eglise-step-numeral">{step.numeral}</span>
                <h3 className="eglise-step-title">{step.title}</h3>
                <p className="eglise-step-description">{step.description}</p>
                <span className="eglise-step-link">Lire →</span>
              </button>
            ))}
          </div>
        </section>

        <section className="eglise-faq" ref={faqRef}>
          <p className="eglise-kicker">Les bases</p>
          <h2 className="eglise-section-title">Les questions les plus fréquentes</h2>
          <p className="eglise-section-subtitle">
            Chaque fiche répond à une question en langage courant, avec la référence du Catéchisme pour aller plus
            loin.
          </p>

          <div className="eglise-faq-list">
            {FAQ_ITEMS.map((item) => (
              <button
                type="button"
                key={item.question}
                className="eglise-faq-item"
                onClick={() => {
                  tapHaptic();
                  navigate(`/catechisme/${item.ref}`);
                }}
              >
                <h3 className="eglise-faq-question">{item.question}</h3>
                <p className="eglise-faq-answer">{item.answer}</p>
                <div className="eglise-faq-meta">
                  <span className="eglise-faq-ref">Catéchisme, § {item.ref}</span>
                  <span className="eglise-faq-link">Lire →</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <div className="eglise-band">
          <section className="eglise-rcia">
            <p className="eglise-kicker">Aller plus loin</p>
            <h2 className="eglise-section-title">Le chemin vers le baptême</h2>
            <p className="eglise-section-subtitle">
              Pour qui souhaite être baptisé, l'Église catholique propose un parcours appelé catéchuménat, réparti
              sur plusieurs mois.
            </p>

            <ol className="eglise-rcia-list">
              {RCIA_STAGES.map((stage) => (
                <li key={stage.label} className="eglise-rcia-item">
                  <span className="eglise-rcia-label">{stage.label}</span>
                  <span className="eglise-rcia-dot" aria-hidden="true" />
                  <span className="eglise-rcia-title">{stage.title}</span>
                  <p className="eglise-rcia-description">{stage.description}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="eglise-practical">
            <p className="eglise-kicker">Questions pratiques</p>
            <h2 className="eglise-section-title">Ce que les nouveaux croyants demandent souvent</h2>

            <div className="eglise-practical-list">
              {PRACTICAL_QA.map((qa) => (
                <div key={qa.question} className="eglise-practical-item">
                  <h3 className="eglise-practical-question">{qa.question}</h3>
                  <p className="eglise-practical-answer">{qa.answer}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="eglise-cta">
          <p className="eglise-cta-kicker">Prochaine étape</p>
          <h2 className="eglise-cta-title">Envie d'aller plus loin qu'un site internet ?</h2>
          <p className="eglise-cta-text">
            Une paroisse proche de chez toi peut répondre à tes questions et t'accompagner, que tu envisages le
            baptême ou simplement que tu veuilles en discuter.
          </p>
          <button
            type="button"
            className="eglise-cta-primary"
            onClick={() => {
              tapHaptic();
              navigate('/paroisses');
            }}
          >
            Trouver une paroisse
          </button>
          <button type="button" className="eglise-cta-secondary">
            Poser une question
          </button>
        </section>

        <footer className="eglise-footer">
          <p className="eglise-footer-wordmark">Lux Scripturae, Fides Ecclesiae</p>
          <p className="eglise-footer-links">À propos · Sources · Contact</p>
        </footer>
      </IonContent>
    </IonPage>
  );
};

export default Eglise;
