import type { Leaderboard, LeaderboardPeriod, QuizUser } from '../../services/quizApi';
import { ROMAN, fmt, ord } from './quizFormat';
import { Medallion, QuizStars } from './quizShared';

const TABS: [LeaderboardPeriod, string][] = [
  ['day', "Aujourd'hui"],
  ['week', 'Semaine'],
  ['all', 'Depuis toujours']
];
const PODIUM_ORDER = [1, 0, 2];
const PODIUM_HEIGHT = [150, 110, 86];

interface Props {
  user: QuizUser;
  period: LeaderboardPeriod;
  board: Leaderboard | null;
  error: string;
  dateLabel: string;
  totalQuestions: number;
  onPeriod: (p: LeaderboardPeriod) => void;
  onBack: () => void;
}

/** Classement : onglets de période, podium en vitraux, liste et position du joueur. */
const QuizBoard: React.FC<Props> = ({ user, period, board, error, dateLabel, totalQuestions, onPeriod, onBack }) => {
  const top = board?.top ?? [];
  const sub = board
    ? `${fmt(board.total)} joueur${board.total > 1 ? 's' : ''} · ${
        period === 'day' ? `quiz du ${dateLabel}` : period === 'week' ? 'cumul des 7 derniers jours' : 'cumul de tous les quiz'
      }`
    : error || 'Chargement…';
  const detail = (correct: number, played: number) =>
    period === 'day' ? `${correct} / ${totalQuestions}` : `${played} quiz · ${correct} bonnes réponses`;
  const me = board?.me;

  return (
    <div className="qz-screen qz-board">
      <div className="qz-board-scroll">
        <div className="qz-board-band">
          <QuizStars height={300} />
          <div className="qz-topbar">
            <button type="button" className="qz-round-btn" aria-label="Retour" onClick={onBack}>
              ←
            </button>
            <span className="qz-kicker">Classement</span>
            <span className="qz-topbar-spacer" />
          </div>
          <div className="qz-tabs" role="group" aria-label="Période du classement">
            {TABS.map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={`qz-tab${period === key ? ' is-on' : ''}`}
                aria-pressed={period === key}
                onClick={() => onPeriod(key)}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="qz-board-sub">{sub}</p>
          <div className="qz-podium">
            <div className="qz-podium-rays" aria-hidden="true" />
            <div className="qz-podium-cols">
              {PODIUM_ORDER.map((k, j) => {
                const p = top[k];
                if (!p) return <div key={k} className="qz-podium-col is-empty" />;
                return (
                  <div key={`${period}-${k}`} className={`qz-podium-col is-${k}`}>
                    <span className="qz-podium-av" style={{ animationDelay: `${[800, 600, 950][j]}ms` }}>
                      <Medallion avatar={p.avatar} size={k === 0 ? 58 : 46} />
                    </span>
                    <span className="qz-podium-pseudo">{p.pseudo}</span>
                    <span className="qz-podium-score qz-tabular">{fmt(p.score)}</span>
                    <div
                      className="qz-podium-glass"
                      style={{ height: PODIUM_HEIGHT[k], animationDelay: `${[200, 0, 380][j]}ms` }}
                    >
                      <span className="qz-podium-lead" aria-hidden="true" />
                      <span className="qz-shine qz-shine--slow" aria-hidden="true" />
                      <span className="qz-podium-roman">{ROMAN[p.rank - 1] ?? p.rank}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <ol className="qz-board-rows" start={4}>
          {top.slice(3).map((p, i) => (
            <li
              key={`${period}-${p.rank}-${p.pseudo}`}
              className={`qz-board-row qz-row${p.me ? ' is-me' : ''}`}
              style={{ animationDelay: `${500 + i * 35}ms` }}
            >
              <span className="qz-board-rank qz-tabular">{p.rank}</span>
              <Medallion avatar={p.avatar} size={34} />
              <span className="qz-board-who">
                <span className="qz-board-pseudo">
                  {p.pseudo}
                  {p.me ? ' (toi)' : ''}
                </span>
                <span className="qz-board-detail">{detail(p.correct, p.played)}</span>
              </span>
              <span className="qz-board-score qz-tabular">{fmt(p.score)}</span>
            </li>
          ))}
          {board && board.total === 0 && <li className="qz-hub-empty">Aucun quiz terminé sur cette période.</li>}
        </ol>
      </div>
      <div className="qz-board-me">
        <span className="qz-board-me-rank qz-tabular">{me ? ord(me.rank) : '–'}</span>
        <Medallion avatar={user.avatar} size={34} ring />
        <span className="qz-board-who">
          <span className="qz-board-pseudo">Toi · {user.pseudo}</span>
          <span className="qz-board-detail">
            {me ? `sur ${fmt(board!.total)} joueur${board!.total > 1 ? 's' : ''}` : 'Joue le quiz du jour pour être classé'}
          </span>
        </span>
        <span className="qz-board-score qz-tabular">{me ? fmt(me.score) : '0'}</span>
      </div>
    </div>
  );
};

export default QuizBoard;
