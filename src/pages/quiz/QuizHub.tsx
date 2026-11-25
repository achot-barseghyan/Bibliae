import type { LeaderboardEntry, QuizToday, QuizUser } from '../../services/quizApi';
import { CloseIcon } from '../../components/nav/icons';
import { ROMAN, fmt, ord } from './quizFormat';
import { Medallion, QuizStars } from './quizShared';

const MEDAL_INK = ['#B5892E', '#6F7686', '#A2643A'];

interface Props {
  user: QuizUser;
  today: QuizToday;
  dateLong: string;
  countdown: string;
  top3: LeaderboardEntry[];
  busy: boolean;
  onStart: () => void;
  onResult: () => void;
  onBoard: () => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
  onClose: () => void;
}

/** Page du joueur connecté : quiz du jour à lancer ou déjà joué, podium du jour. */
const QuizHub: React.FC<Props> = ({
  user,
  today,
  dateLong,
  countdown,
  top3,
  busy,
  onStart,
  onResult,
  onBoard,
  onLogout,
  onDeleteAccount,
  onClose
}) => {
  const { attempt, streak } = today;
  const played = attempt.status === 'finished';
  const inProgress = attempt.status === 'in_progress';
  const streakLabel =
    streak > 1 ? `Série de ${streak} jours` : streak === 1 ? '1 jour de série' : "Commence ta série aujourd'hui";
  const players = today.players;

  return (
    <div className="qz-screen qz-hub">
      <div className="qz-hub-band">
        <QuizStars height={260} />
        <div className="qz-topbar">
          <div className="qz-hub-me">
            <button type="button" className="qz-round-btn qz-round-btn--sm" onClick={onClose} aria-label="Fermer le quiz">
              <CloseIcon size={12} />
            </button>
            <Medallion avatar={user.avatar} size={36} ring />
            <span>
              <span className="qz-hub-pseudo">{user.pseudo}</span>
              <span className="qz-hub-streak">{streakLabel}</span>
            </span>
          </div>
          <button type="button" className="qz-pill" onClick={onLogout}>
            Déconnexion
          </button>
        </div>
        <div className="qz-hub-head">
          <span className="qz-live">
            <span className="qz-live-dot" aria-hidden="true" />
            {players === 0
              ? 'Sois le premier aujourd’hui'
              : `${fmt(players)} joueur${players > 1 ? 's' : ''} aujourd’hui`}
          </span>
          <h1 className="qz-title qz-title--hub qz-in">
            Le quiz <em>du jour</em>
          </h1>
          <p className="qz-hub-date">{dateLong}</p>
        </div>
      </div>

      <div className="qz-hub-card qz-in" style={{ animationDelay: '100ms' }}>
        <div className="qz-vitrail-band" aria-hidden="true" />
        {!played ? (
          <div className="qz-hub-card-body">
            <div className="qz-facts">
              {[
                [String(today.total), 'questions'],
                [`${today.timeLimit} s`, 'par question'],
                ['1', 'seul essai']
              ].map(([big, small]) => (
                <div key={small} className="qz-fact">
                  <div className="qz-fact-big">{big}</div>
                  <div className="qz-fact-small">{small}</div>
                </div>
              ))}
            </div>
            <p className="qz-hub-rule">
              Une bonne réponse rapporte 100 points, plus un bonus de vitesse jusqu'à 50 points. Trois bonnes réponses
              d'affilée ajoutent 20 points.
            </p>
            {inProgress && (
              <p className="qz-hub-resume">
                Partie en cours : question {attempt.index + 1} / {today.total} · {fmt(attempt.score)} points. Le chrono
                de la question ouverte continue de tourner.
              </p>
            )}
            <button type="button" className="qz-btn qz-btn--oxblood" onClick={onStart} disabled={busy}>
              {busy ? 'Chargement…' : inProgress ? 'Reprendre le quiz' : 'Commencer le quiz'}
              <span className="qz-shine qz-shine--soft" aria-hidden="true" />
            </button>
            <p className="qz-hub-ends">
              Fin du quiz dans <span className="qz-tabular">{countdown}</span>
            </p>
          </div>
        ) : (
          <div className="qz-hub-card-body is-done">
            <p className="qz-kicker qz-kicker--or">Quiz terminé</p>
            <p className="qz-hub-score qz-tabular">{fmt(attempt.score)}</p>
            <p className="qz-hub-score-sub">
              points · {attempt.correct} / {today.total}
              {attempt.rank ? ` · ${ord(attempt.rank)} sur ${fmt(players)}` : ''}
            </p>
            <div className="qz-hub-next">
              <p>Prochain quiz dans</p>
              <p className="qz-hub-next-time qz-tabular">{countdown}</p>
            </div>
            <button type="button" className="qz-btn qz-btn--outline" onClick={onResult}>
              Mes réponses
            </button>
          </div>
        )}
      </div>

      <div className="qz-hub-podium-head">
        <div>
          <p className="qz-kicker qz-kicker--or">Classement du jour</p>
          <h2 className="qz-h3">Le podium</h2>
        </div>
        <button type="button" className="qz-pill qz-pill--light" onClick={onBoard}>
          Tout voir →
        </button>
      </div>
      <div className="qz-hub-podium">
        {top3.length === 0 ? (
          <p className="qz-hub-empty">Personne n'a encore terminé le quiz du jour.</p>
        ) : (
          top3.map((p, i) => (
            <div key={`${p.rank}-${p.pseudo}`} className="qz-top-row qz-row" style={{ animationDelay: `${300 + i * 90}ms` }}>
              <span className="qz-top-rank" style={{ color: MEDAL_INK[p.rank - 1] ?? MEDAL_INK[2] }}>
                {ROMAN[p.rank - 1] ?? p.rank}
              </span>
              <Medallion avatar={p.avatar} size={34} />
              <span className="qz-top-pseudo">
                {p.pseudo}
                {p.me ? ' (toi)' : ''}
              </span>
              <span className="qz-top-score qz-tabular">{fmt(p.score)}</span>
            </div>
          ))
        )}
      </div>
      <div className="qz-hub-foot">
        <button type="button" className="qz-link qz-link--muted" onClick={onDeleteAccount}>
          Supprimer mon compte
        </button>
      </div>
    </div>
  );
};

export default QuizHub;
