import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IonPage, useIonAlert } from '@ionic/react';
import {
  QuizApiError,
  deleteAccount,
  fetchLeaderboard,
  fetchMe,
  fetchReview,
  fetchToday,
  hasQuizSession,
  login,
  logout,
  nextQuestion,
  sendAnswer,
  sendVerificationCode,
  signup,
  verifyEmail,
  type Leaderboard,
  type LeaderboardEntry,
  type LeaderboardPeriod,
  type QuizQuestion,
  type QuizReview,
  type QuizToday,
  type QuizUser
} from '../services/quizApi';
import { tapHaptic } from '../utils/haptics';
import QuizAuth, { type AuthForm } from './quiz/QuizAuth';
import QuizBoard from './quiz/QuizBoard';
import QuizHub from './quiz/QuizHub';
import QuizPlay, { type Verdict } from './quiz/QuizPlay';
import QuizResult from './quiz/QuizResult';
import QuizVerify from './quiz/QuizVerify';
import QuizWelcome from './quiz/QuizWelcome';
import { dayLabels, fmt, formatCountdown, ord, useTicker } from './quiz/quizFormat';
import './Quiz.css';

type Screen = 'loading' | 'welcome' | 'signup' | 'login' | 'verify' | 'hub' | 'play' | 'result' | 'board';

const RESEND_DELAY_MS = 60_000;

interface PlayState {
  question: QuizQuestion;
  deadline: number;
  pendingPick: number | null;
  verdict: Verdict | null;
  results: boolean[];
  score: number;
}

const messageOf = (err: unknown) =>
  err instanceof Error ? err.message : 'Une erreur est survenue. Réessaie dans un instant.';

/** Jour de Paris de l'appareil, pour l'écran d'accueil avant tout appel serveur. */
const localDay = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(new Date());

/**
 * Quiz du jour : 20 questions communes à tous, un essai par jour, classements
 * du jour, de la semaine et depuis toujours. Le serveur (dossier server/) tient
 * les comptes, sert les questions une à une et chronomètre les réponses.
 */
const Quiz: React.FC = () => {
  const navigate = useNavigate();
  const [presentAlert] = useIonAlert();
  const now = useTicker(1000);

  const [screen, setScreen] = useState<Screen>('loading');
  const [user, setUser] = useState<QuizUser | null>(null);
  const [today, setToday] = useState<QuizToday | null>(null);
  const [endsAt, setEndsAt] = useState(0);
  const [top3, setTop3] = useState<LeaderboardEntry[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [play, setPlay] = useState<PlayState | null>(null);
  const [review, setReview] = useState<QuizReview | null>(null);
  const [period, setPeriod] = useState<LeaderboardPeriod>('day');
  const [board, setBoard] = useState<Leaderboard | null>(null);
  const [boardError, setBoardError] = useState('');
  const [info, setInfo] = useState('');
  const [resendAt, setResendAt] = useState(0);
  const sending = useRef(false);

  const close = () => {
    tapHaptic();
    if (window.history.length > 1) navigate(-1);
    else navigate('/compendium/accueil', { replace: true });
  };

  /** Session expirée : accueil du quiz. Adresse non confirmée : écran du code. */
  const handleAuthLoss = useCallback((err: unknown) => {
    if (err instanceof QuizApiError && err.status === 401) {
      setUser(null);
      setScreen('welcome');
      return true;
    }
    if (err instanceof QuizApiError && err.code === 'email_unverified') {
      setUser((u) => (u ? { ...u, emailVerified: false } : u));
      setScreen('verify');
      return true;
    }
    return false;
  }, []);

  const loadHub = useCallback(async () => {
    try {
      const [t, lb] = await Promise.all([fetchToday(), fetchLeaderboard('day')]);
      setToday(t);
      setEndsAt(Date.now() + t.secondsLeft * 1000);
      setTop3(lb.top.slice(0, 3));
      setError('');
      return t;
    } catch (err) {
      if (!handleAuthLoss(err)) setError(messageOf(err));
      return null;
    }
  }, [handleAuthLoss]);

  /** Demande un code (sans insister si un code vient de partir : le serveur donne le délai). */
  const requestCode = useCallback(async (announce: boolean) => {
    try {
      const res = await sendVerificationCode();
      if (res.alreadyVerified) return;
      setResendAt(Date.now() + res.retryIn * 1000);
      if (announce) setInfo('Nouveau code envoyé.');
      setError('');
    } catch (err) {
      if (err instanceof QuizApiError && err.retryIn > 0) {
        setResendAt(Date.now() + err.retryIn * 1000);
        if (announce) setError(err.message);
      } else if (announce || !(err instanceof QuizApiError && err.status === 429)) {
        setError(messageOf(err));
      }
    }
  }, []);

  /** Compte connecté : page du joueur, ou confirmation de l'adresse d'abord. */
  const enterAccount = useCallback(
    async (u: QuizUser, codeJustSent = false) => {
      setUser(u);
      setError('');
      setInfo('');
      if (!u.emailVerified) {
        setScreen('verify');
        if (codeJustSent) setResendAt(Date.now() + RESEND_DELAY_MS);
        else await requestCode(false);
        return;
      }
      setScreen('hub');
      await loadHub();
    },
    [loadHub, requestCode]
  );

  // Session gardée sur l'appareil : on la vérifie, puis on ouvre la page du joueur.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!(await hasQuizSession())) {
        if (!cancelled) setScreen('welcome');
        return;
      }
      try {
        const me = await fetchMe();
        if (cancelled) return;
        await enterAccount(me);
      } catch (err) {
        if (cancelled) return;
        if (!handleAuthLoss(err)) {
          setError(messageOf(err));
          setScreen('welcome');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enterAccount, handleAuthLoss]);

  // Minuit passé : nouveau quiz.
  useEffect(() => {
    if (screen === 'hub' && endsAt && now >= endsAt) void loadHub();
  }, [now, endsAt, screen, loadHub]);

  // --- Comptes ---------------------------------------------------------------

  const submitAuth = async (form: AuthForm) => {
    const email = form.email.trim();
    if (screen === 'signup' && form.pseudo.trim().length < 3) return setError("Choisis un pseudo d'au moins 3 caractères.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Cette adresse e-mail n'est pas valide.");
    if (form.password.length < 8) return setError('Le mot de passe doit faire au moins 8 caractères.');
    setBusy(true);
    try {
      if (screen === 'signup') {
        const res = await signup({ pseudo: form.pseudo.trim(), email, password: form.password, avatar: form.avatar });
        await enterAccount(res.user, res.codeSent);
        if (!res.codeSent) setError("L'e-mail n'a pas pu être envoyé. Appuie sur « Renvoyer le code ».");
      } else {
        await enterAccount(await login({ email, password: form.password }));
      }
    } catch (err) {
      setError(messageOf(err));
    } finally {
      setBusy(false);
    }
  };

  const submitCode = async (code: string) => {
    setBusy(true);
    try {
      const u = await verifyEmail(code);
      tapHaptic();
      await enterAccount(u);
    } catch (err) {
      if (!handleAuthLoss(err)) setError(messageOf(err));
    } finally {
      setBusy(false);
    }
  };

  const doLogout = async () => {
    tapHaptic();
    await logout();
    setUser(null);
    setToday(null);
    setScreen('welcome');
  };

  const askDeleteAccount = () => {
    void presentAlert({
      header: 'Supprimer ton compte ?',
      message: 'Ton pseudo, tes scores et ta série seront effacés définitivement du classement.',
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: () => {
            deleteAccount()
              .then(() => {
                setUser(null);
                setToday(null);
                setScreen('welcome');
              })
              .catch((err) => setError(messageOf(err)));
          }
        }
      ]
    });
  };

  // --- Partie ----------------------------------------------------------------

  const openResult = useCallback(async () => {
    try {
      const [rv] = await Promise.all([fetchReview(), loadHub()]);
      setReview(rv);
      setScreen('result');
    } catch (err) {
      if (!handleAuthLoss(err)) setError(messageOf(err));
    }
  }, [loadHub, handleAuthLoss]);

  const serveQuestion = useCallback(async () => {
    setBusy(true);
    try {
      const q = await nextQuestion();
      sending.current = false;
      setPlay({
        question: q,
        deadline: Date.now() + q.remaining * 1000,
        pendingPick: null,
        verdict: null,
        results: q.answers,
        score: q.score
      });
      setError('');
      setScreen('play');
    } catch (err) {
      if (handleAuthLoss(err)) return;
      if (err instanceof QuizApiError && err.status === 409) {
        await openResult();
        return;
      }
      setError(messageOf(err));
    } finally {
      setBusy(false);
    }
  }, [handleAuthLoss, openResult]);

  const pick = useCallback(
    async (choice: number) => {
      if (!play || play.verdict || sending.current) return;
      sending.current = true;
      if (choice >= 0) tapHaptic();
      setPlay((p) => (p ? { ...p, pendingPick: choice } : p));
      try {
        const result = await sendAnswer(play.question.index, choice);
        setPlay((p) =>
          p
            ? {
                ...p,
                pendingPick: null,
                verdict: { pick: result.late ? -1 : choice, result, at: Date.now() },
                results: [...p.results, result.correct],
                score: result.score
              }
            : p
        );
        setError('');
      } catch (err) {
        if (handleAuthLoss(err)) return;
        // Question close côté serveur (chrono dépassé) : on se recale sur lui.
        if (err instanceof QuizApiError && err.status === 409) {
          await serveQuestion();
          return;
        }
        setError(messageOf(err));
        setPlay((p) => (p ? { ...p, pendingPick: null } : p));
        // Réessai possible seulement tant que le chrono tourne.
        if (choice >= 0) sending.current = false;
      }
    },
    [play, handleAuthLoss, serveQuestion]
  );

  const nextStep = () => {
    tapHaptic();
    if (play?.verdict?.result.finished) void openResult();
    else void serveQuestion();
  };

  const quit = () => {
    tapHaptic();
    setPlay(null);
    setScreen('hub');
    void loadHub();
  };

  // --- Classement ------------------------------------------------------------

  const loadBoard = useCallback(
    async (p: LeaderboardPeriod) => {
      setPeriod(p);
      setBoard(null);
      setBoardError('');
      try {
        setBoard(await fetchLeaderboard(p));
      } catch (err) {
        if (!handleAuthLoss(err)) setBoardError(messageOf(err));
      }
    },
    [handleAuthLoss]
  );

  const openBoard = () => {
    tapHaptic();
    setScreen('board');
    void loadBoard('day');
  };

  // --- Rendu -----------------------------------------------------------------

  const day = today?.day ?? localDay();
  const labels = dayLabels(day);
  const countdown = formatCountdown(endsAt ? (endsAt - now) / 1000 : 0);
  const welcomeCountdown = (() => {
    const [h, m, s] = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Paris',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23'
    })
      .format(now)
      .split(':')
      .map(Number);
    return formatCountdown(86400 - (h * 3600 + m * 60 + s));
  })();
  const rankLabel =
    today?.attempt.rank != null ? `${ord(today.attempt.rank)} sur ${fmt(today.players)}` : 'classement en cours';

  let content: React.ReactNode = null;
  if (screen === 'loading') {
    content = <div className="qz-screen qz-loading" aria-busy="true" />;
  } else if (screen === 'welcome') {
    content = (
      <QuizWelcome
        dateLabel={labels.short}
        countdown={welcomeCountdown}
        onSignup={() => {
          tapHaptic();
          setError('');
          setScreen('signup');
        }}
        onLogin={() => {
          tapHaptic();
          setError('');
          setScreen('login');
        }}
        onClose={close}
      />
    );
  } else if (screen === 'signup' || screen === 'login') {
    content = (
      <QuizAuth
        key={screen}
        mode={screen}
        busy={busy}
        error={error}
        onSubmit={submitAuth}
        onBack={() => {
          setError('');
          setScreen('welcome');
        }}
        onSwap={() => {
          setError('');
          setScreen(screen === 'signup' ? 'login' : 'signup');
        }}
        onClearError={() => setError('')}
      />
    );
  } else if (screen === 'verify' && user) {
    content = (
      <QuizVerify
        email={user.email}
        busy={busy}
        error={error}
        info={info}
        resendIn={Math.max(0, Math.ceil((resendAt - now) / 1000))}
        onSubmit={submitCode}
        onResend={() => {
          tapHaptic();
          setInfo('');
          void requestCode(true);
        }}
        onLogout={doLogout}
        onClearError={() => setError('')}
        onClose={close}
      />
    );
  } else if (screen === 'hub' && user) {
    content = today ? (
      <QuizHub
        user={user}
        today={today}
        dateLong={labels.long}
        countdown={countdown}
        top3={top3}
        busy={busy}
        onStart={() => {
          tapHaptic();
          void serveQuestion();
        }}
        onResult={() => {
          tapHaptic();
          void openResult();
        }}
        onBoard={openBoard}
        onLogout={doLogout}
        onDeleteAccount={askDeleteAccount}
        onClose={close}
      />
    ) : (
      <div className="qz-screen qz-loading">
        {error && (
          <div className="qz-offline">
            <p role="alert">{error}</p>
            <button type="button" className="qz-btn qz-btn--gold" onClick={() => void loadHub()}>
              Réessayer
            </button>
            <button type="button" className="qz-btn qz-btn--ghost" onClick={close}>
              Fermer
            </button>
          </div>
        )}
      </div>
    );
  } else if (screen === 'play' && play) {
    content = (
      <QuizPlay
        question={play.question}
        deadline={play.deadline}
        pendingPick={play.pendingPick}
        verdict={play.verdict}
        results={play.results}
        score={play.score}
        error={error}
        onPick={pick}
        onNext={nextStep}
        onQuit={quit}
      />
    );
  } else if (screen === 'result' && review) {
    content = (
      <QuizResult
        review={review}
        rankLabel={rankLabel}
        onBoard={openBoard}
        onHub={() => {
          tapHaptic();
          setScreen('hub');
        }}
      />
    );
  } else if (screen === 'board' && user) {
    content = (
      <QuizBoard
        user={user}
        period={period}
        board={board}
        error={boardError}
        dateLabel={labels.short}
        totalQuestions={today?.total ?? 20}
        onPeriod={(p) => {
          tapHaptic();
          void loadBoard(p);
        }}
        onBack={() => {
          tapHaptic();
          setScreen('hub');
          void loadHub();
        }}
      />
    );
  }

  return (
    <IonPage className="qz-page">
      {content}
      {screen === 'hub' && today && error && (
        <p role="alert" className="qz-toast">
          {error}
        </p>
      )}
    </IonPage>
  );
};

export default Quiz;
