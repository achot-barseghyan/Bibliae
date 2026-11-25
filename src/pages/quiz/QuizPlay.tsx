import { useEffect, type CSSProperties } from 'react';
import type { QuizAnswerResult, QuizQuestion } from '../../services/quizApi';
import { CloseIcon } from '../../components/nav/icons';
import { ROMAN, fmt, useTicker } from './quizFormat';
import { QuizStars } from './quizShared';

export interface Verdict {
  pick: number;
  result: QuizAnswerResult;
  at: number;
}

interface Props {
  question: QuizQuestion;
  /** Instant (ms) où le chrono de la question atteint zéro. */
  deadline: number;
  /** Réponse envoyée, en attente du serveur. */
  pendingPick: number | null;
  verdict: Verdict | null;
  /** Réussite de chaque question déjà répondue. */
  results: boolean[];
  score: number;
  error: string;
  onPick: (pick: number) => void;
  onNext: () => void;
  onQuit: () => void;
}

/** Une question : vitraux de progression, médaillon-minuteur, propositions, verdict. */
const QuizPlay: React.FC<Props> = ({ question, deadline, pendingPick, verdict, results, score, error, onPick, onNext, onQuit }) => {
  const now = useTicker(100);
  const locked = verdict != null || pendingPick != null;
  const remaining = verdict
    ? Math.max(0, (deadline - verdict.at) / 1000)
    : Math.max(0, (deadline - now) / 1000);
  const limit = question.timeLimit;

  useEffect(() => {
    if (!locked && remaining <= 0) onPick(-1);
  }, [locked, remaining, onPick]);

  const r = verdict?.result;
  const isLast = question.index + 1 >= question.total;
  const showGain = r && r.gain > 0 && now - verdict.at < 1300;

  return (
    <div className="qz-screen qz-play">
      <QuizStars height={300} />
      <div className="qz-topbar">
        <button type="button" className="qz-round-btn qz-round-btn--sm" aria-label="Quitter le quiz" onClick={onQuit}>
          <CloseIcon size={12} />
        </button>
        <span className="qz-kicker">
          Question {question.index + 1} / {question.total}
        </span>
        <span className="qz-play-score qz-tabular">
          {fmt(score)}
          {showGain && <span className="qz-play-gain">+{r.gain}</span>}
        </span>
      </div>

      <div className="qz-segs" aria-hidden="true">
        {Array.from({ length: question.total }, (_, i) => {
          const done = i < results.length;
          const cls = done ? (results[i] ? 'is-ok' : 'is-ko') : i === question.index ? 'is-current' : '';
          return <span key={i} className={`qz-seg ${cls}`} />;
        })}
      </div>

      <div className="qz-timer" role="timer" aria-label={`${Math.ceil(remaining)} secondes restantes`}>
        <div
          className="qz-timer-arc"
          style={
            {
              '--qz-deg': `${Math.round((360 * remaining) / limit)}deg`,
              '--qz-arc': remaining > 6 ? '#F0D58E' : '#E0705A'
            } as CSSProperties
          }
        />
        <div className="qz-timer-glass" />
        <div className="qz-timer-core">
          <span className="qz-flame" style={{ opacity: remaining > 0 ? 1 : 0.15 }} />
          <span className="qz-timer-sec qz-tabular">{Math.ceil(remaining)}</span>
        </div>
      </div>

      <div key={`q${question.index}`} className="qz-question qz-card-in">
        <span className="qz-question-star" aria-hidden="true">
          ✦
        </span>
        <p>{question.text}</p>
      </div>

      <div className="qz-choices">
        {question.choices.map((label, i) => {
          const mine = verdict ? verdict.pick === i : pendingPick === i;
          let state = '';
          let mark = ROMAN[i];
          if (r) {
            if (i === r.good) {
              state = mine ? 'is-good is-mine' : 'is-good';
              mark = '✓';
            } else if (mine) {
              state = 'is-wrong';
              mark = '✕';
            } else state = 'is-dim';
          } else if (mine) state = 'is-pending';
          return (
            <button
              key={`${question.index}-${i}`}
              type="button"
              className={`qz-choice qz-choice-in ${state}`}
              style={{ animationDelay: `${120 + i * 70}ms` }}
              onClick={() => onPick(i)}
              disabled={locked}
            >
              <span className="qz-choice-lines" aria-hidden="true" />
              <span className="qz-choice-mark">{mark}</span>
              <span className="qz-choice-label">{label}</span>
              {r && i === r.good && <span className="qz-shine qz-shine--once" aria-hidden="true" />}
            </button>
          );
        })}
        {error && (
          <p role="alert" className="qz-error">
            {error}
          </p>
        )}
      </div>

      {r && (
        <div className={`qz-verdict ${r.correct ? 'is-ok' : 'is-ko'}`} role="status">
          <div className="qz-verdict-head">
            <span className="qz-verdict-title">
              {r.correct ? 'Juste !' : verdict.pick === -1 || r.late ? 'Temps écoulé' : 'Pas cette fois'}
            </span>
            <span className="qz-verdict-pts">{r.correct ? `+${r.gain} pts` : '0 pt'}</span>
          </div>
          <p className="qz-verdict-answer">
            {r.correct ? '' : 'La bonne réponse : '}
            {r.answer}
          </p>
          {r.ref && <p className="qz-verdict-ref">{r.ref}</p>}
          <button type="button" className="qz-btn qz-verdict-btn" onClick={onNext}>
            {isLast ? 'Voir mon résultat' : 'Question suivante →'}
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizPlay;
