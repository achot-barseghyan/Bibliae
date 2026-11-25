import { useState } from 'react';
import { AVATARS } from './quizFormat';

export interface AuthForm {
  pseudo: string;
  email: string;
  password: string;
  avatar: number;
}

interface Props {
  mode: 'signup' | 'login';
  busy: boolean;
  error: string;
  onSubmit: (form: AuthForm) => void;
  onBack: () => void;
  onSwap: () => void;
  onClearError: () => void;
}

/** Inscription (pseudo, médaillon, e-mail, mot de passe) ou connexion. */
const QuizAuth: React.FC<Props> = ({ mode, busy, error, onSubmit, onBack, onSwap, onClearError }) => {
  const [form, setForm] = useState<AuthForm>({ pseudo: '', email: '', password: '', avatar: 0 });
  const signup = mode === 'signup';
  const set = (patch: Partial<AuthForm>) => {
    setForm((f) => ({ ...f, ...patch }));
    if (error) onClearError();
  };

  return (
    <div className="qz-screen qz-auth">
      <div className="qz-topbar">
        <button type="button" className="qz-round-btn" aria-label="Retour" onClick={onBack}>
          ←
        </button>
        <span className="qz-kicker">{signup ? 'Inscription' : 'Connexion'}</span>
        <span className="qz-topbar-spacer" />
      </div>
      <div className="qz-auth-head qz-in">
        <h2 className="qz-h2">{signup ? 'Rejoins le classement' : 'Bon retour parmi nous'}</h2>
        <p className="qz-auth-desc">
          {signup
            ? 'Crée ton compte pour jouer au quiz du jour et comparer ton score avec tous les joueurs.'
            : 'Connecte-toi pour retrouver ton score, ta série et ta place au classement.'}
        </p>
      </div>

      <form
        className="qz-auth-form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (!busy) onSubmit(form);
        }}
      >
        {signup && (
          <>
            <fieldset className="qz-field">
              <legend className="qz-label">Ton médaillon</legend>
              <div className="qz-avatars">
                {AVATARS.map((a, i) => (
                  <button
                    key={a.label}
                    type="button"
                    className={`qz-avatar-pick${i === form.avatar ? ' is-on' : ''}`}
                    aria-label={a.label}
                    aria-pressed={i === form.avatar}
                    onClick={() => set({ avatar: i })}
                  >
                    <img src={a.src} alt="" draggable={false} />
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="qz-field">
              <label className="qz-label" htmlFor="qz-pseudo">
                Pseudo (visible dans le classement)
              </label>
              <input
                id="qz-pseudo"
                className="qz-input"
                value={form.pseudo}
                maxLength={16}
                placeholder="Ex. Théophile"
                autoComplete="nickname"
                onChange={(e) => set({ pseudo: e.target.value })}
              />
            </div>
          </>
        )}
        <div className="qz-field">
          <label className="qz-label" htmlFor="qz-email">
            E-mail
          </label>
          <input
            id="qz-email"
            className="qz-input"
            type="email"
            inputMode="email"
            value={form.email}
            placeholder="prenom@exemple.fr"
            autoComplete="email"
            autoCapitalize="off"
            onChange={(e) => set({ email: e.target.value })}
          />
        </div>
        <div className="qz-field">
          <label className="qz-label" htmlFor="qz-pass">
            Mot de passe
          </label>
          <input
            id="qz-pass"
            className="qz-input"
            type="password"
            value={form.password}
            placeholder="8 caractères minimum"
            autoComplete={signup ? 'new-password' : 'current-password'}
            onChange={(e) => set({ password: e.target.value })}
          />
        </div>
        {error && (
          <p role="alert" className="qz-error">
            {error}
          </p>
        )}
        <button type="submit" className="qz-btn qz-btn--gold qz-auth-submit" disabled={busy}>
          {busy ? 'Un instant…' : signup ? 'Créer mon compte' : 'Me connecter'}
          <span className="qz-shine" aria-hidden="true" />
        </button>
      </form>
      <div className="qz-auth-swap">
        <button type="button" className="qz-link" onClick={onSwap}>
          {signup ? "J'ai déjà un compte" : 'Pas encore de compte ? Inscris-toi'}
        </button>
      </div>
    </div>
  );
};

export default QuizAuth;
