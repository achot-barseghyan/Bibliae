import { useEffect, useState } from 'react';
import type { QuizReview } from '../../services/quizApi';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { fmt } from './quizFormat';
import { QuizStars } from './quizShared';

interface Props {
  review: QuizReview;
  rankLabel: string;
  onBoard: () => void;
  onHub: () => void;
}

function verdictFor(correct: number): string {
  if (correct >= 18) return "Digne d'un docteur de l'Église";
  if (correct >= 14) return 'Très beau parcours';
  if (correct >= 10) return 'Bien joué';
  if (correct >= 6) return 'Un bon début';
  return 'Chaque jour, on apprend';
}

/** Rosace de résultat (un pétale par question), score et correction. */
const QuizResult: React.FC<Props> = ({ review, rankLabel, onBoard, onHub }) => {
  const reduced = usePrefersReducedMotion();
  const [shown, setShown] = useState(reduced ? review.score : 0);

  useEffect(() => {
    if (reduced) {
      setShown(review.score);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / 1600);
      setShown(Math.round(review.score * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [review.score, reduced]);

  const n = review.items.length;

  return (
    <div className="qz-screen qz-result">
      <div className="qz-result-art">
        <QuizStars height={330} />
        <div className="qz-result-glow" aria-hidden="true" />
        <div className="qz-petals" aria-hidden="true">
          {review.items.map((it, i) => {
            const cls = it.pick === it.good ? 'is-ok' : it.pick === -1 ? 'is-late' : 'is-ko';
            return (
              <span
                key={i}
                className={`qz-petal ${cls}`}
                style={{ transform: `rotate(${(360 / n) * i}deg)`, animationDelay: `${200 + i * 60}ms` }}
              />
            );
          })}
        </div>
        <div className="qz-result-core">
          <span className="qz-result-points qz-tabular">{fmt(shown)}</span>
          <span className="qz-result-unit">points</span>
        </div>
      </div>
      <div className="qz-result-text qz-in" style={{ animationDelay: '900ms' }}>
        <h2 className="qz-h2">{verdictFor(review.correct)}</h2>
        <p>
          {review.correct} bonne{review.correct > 1 ? 's' : ''} réponse{review.correct > 1 ? 's' : ''} sur {n} · {rankLabel}
        </p>
      </div>
      <div className="qz-result-actions qz-in" style={{ animationDelay: '1100ms' }}>
        <button type="button" className="qz-btn qz-btn--gold" onClick={onBoard}>
          Classement
          <span className="qz-shine" aria-hidden="true" />
        </button>
        <button type="button" className="qz-btn qz-btn--ghost" onClick={onHub}>
          Accueil
        </button>
      </div>
      <p className="qz-kicker qz-result-kicker">Tes réponses</p>
      <ol className="qz-review">
        {review.items.map((it, i) => {
          const ok = it.pick === it.good;
          const line = ok
            ? `✓ ${it.choices[it.good]}`
            : `${it.pick === -1 ? 'Temps écoulé' : `Ta réponse : ${it.choices[it.pick]}`} · Bonne réponse : ${it.choices[it.good]}`;
          return (
            <li key={i} className={`qz-review-item qz-row ${ok ? 'is-ok' : 'is-ko'}`} style={{ animationDelay: `${i * 40}ms` }}>
              <div className="qz-review-q">
                <span className="qz-review-n qz-tabular">{String(i + 1).padStart(2, '0')}</span>
                <span>{it.q}</span>
              </div>
              <div className="qz-review-line">
                {line}
                {it.ref ? ` (${it.ref})` : ''}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default QuizResult;
