import type { CSSProperties } from 'react';
import { CloseIcon } from '../../components/nav/icons';
import { QuizStars } from './quizShared';

const RULES = [
  ['I', '20 questions par jour', 'Tirées au hasard dans plus de 1 200 questions'],
  ['II', 'Les mêmes pour tous', 'Un nouveau tirage chaque jour à minuit'],
  ['III', 'Un classement commun', 'Du jour, de la semaine et depuis toujours']
];

interface Props {
  dateLabel: string;
  countdown: string;
  onSignup: () => void;
  onLogin: () => void;
  onClose: () => void;
}

/** Accueil du quiz pour un visiteur sans compte. */
const QuizWelcome: React.FC<Props> = ({ dateLabel, countdown, onSignup, onLogin, onClose }) => (
  <div className="qz-screen qz-welcome">
    <QuizStars height={420} />
    <button type="button" className="qz-round-btn qz-welcome-close" onClick={onClose} aria-label="Fermer le quiz">
      <CloseIcon size={14} />
    </button>
    <div className="qz-welcome-art" aria-hidden="true">
      <div className="qz-welcome-glow" />
      <div className="qz-rosace">
        <div className="qz-rosace-outer" />
        <div className="qz-rosace-inner" />
        <div className="qz-rosace-rim" />
        <div className="qz-rosace-heart">?</div>
      </div>
    </div>
    <div className="qz-welcome-text">
      <p className="qz-kicker qz-in">Bibliae · Quiz</p>
      <h1 className="qz-title qz-in" style={{ animationDelay: '80ms' }}>
        Le quiz <em>du jour</em>
      </h1>
      <p className="qz-lede qz-in" style={{ animationDelay: '160ms' }}>
        Chaque jour, 20 questions sur la Bible. Les mêmes pour tout le monde. Un seul essai.
      </p>
    </div>
    <ul className="qz-rules">
      {RULES.map(([roman, title, desc], i) => (
        <li key={roman} className="qz-rule qz-row" style={{ animationDelay: `${260 + i * 90}ms` } as CSSProperties}>
          <span className="qz-rule-roman qz-gold-text">{roman}</span>
          <span className="qz-rule-body">
            <span className="qz-rule-title">{title}</span>
            <span className="qz-rule-desc">{desc}</span>
          </span>
        </li>
      ))}
    </ul>
    <p className="qz-welcome-when">
      Quiz du {dateLabel} · fin dans <span className="qz-tabular qz-gold">{countdown}</span>
    </p>
    <div className="qz-welcome-actions">
      <button type="button" className="qz-btn qz-btn--gold" onClick={onSignup}>
        Créer mon compte
        <span className="qz-shine" aria-hidden="true" />
      </button>
      <button type="button" className="qz-btn qz-btn--ghost" onClick={onLogin}>
        J'ai déjà un compte
      </button>
      <p className="qz-note">Un compte est nécessaire pour apparaître dans le classement.</p>
    </div>
  </div>
);

export default QuizWelcome;
