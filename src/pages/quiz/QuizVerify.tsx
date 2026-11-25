import { useState } from 'react';
import { CloseIcon } from '../../components/nav/icons';

interface Props {
  email: string;
  busy: boolean;
  error: string;
  info: string;
  /** Secondes avant de pouvoir redemander un code (0 : possible tout de suite). */
  resendIn: number;
  onSubmit: (code: string) => void;
  onResend: () => void;
  onLogout: () => void;
  onClearError: () => void;
  onClose: () => void;
}

/** Confirmation de l'adresse e-mail : code à 6 chiffres reçu par e-mail. */
const QuizVerify: React.FC<Props> = ({ email, busy, error, info, resendIn, onSubmit, onResend, onLogout, onClearError, onClose }) => {
  const [code, setCode] = useState('');

  const change = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 6);
    setCode(digits);
    if (error) onClearError();
    // Code complet (saisi ou collé) : envoi direct.
    if (digits.length === 6 && !busy) onSubmit(digits);
  };

  return (
    <div className="qz-screen qz-auth qz-verify">
      <div className="qz-topbar">
        <button type="button" className="qz-round-btn qz-round-btn--sm" onClick={onClose} aria-label="Fermer le quiz">
          <CloseIcon size={12} />
        </button>
        <span className="qz-kicker">Vérification</span>
        <span className="qz-topbar-spacer" />
      </div>
      <div className="qz-auth-head qz-in">
        <div className="qz-verify-seal" aria-hidden="true">
          ✉
        </div>
        <h2 className="qz-h2">Confirme ton adresse</h2>
        <p className="qz-auth-desc">
          Nous avons envoyé un code à 6 chiffres à <strong className="qz-verify-email">{email}</strong>. Il est valable
          15 minutes.
        </p>
      </div>

      <form
        className="qz-auth-form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (!busy && code.length === 6) onSubmit(code);
        }}
      >
        <div className="qz-field">
          <label className="qz-label" htmlFor="qz-code">
            Code reçu par e-mail
          </label>
          <input
            id="qz-code"
            className="qz-input qz-code-input"
            value={code.length > 3 ? `${code.slice(0, 3)} ${code.slice(3)}` : code}
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000 000"
            maxLength={7}
            onChange={(e) => change(e.target.value)}
          />
        </div>
        {error && (
          <p role="alert" className="qz-error">
            {error}
          </p>
        )}
        {info && !error && (
          <p role="status" className="qz-info">
            {info}
          </p>
        )}
        <button type="submit" className="qz-btn qz-btn--gold qz-auth-submit" disabled={busy || code.length !== 6}>
          {busy ? 'Un instant…' : 'Confirmer'}
          <span className="qz-shine" aria-hidden="true" />
        </button>
      </form>

      <div className="qz-verify-actions">
        <button type="button" className="qz-link" onClick={onResend} disabled={resendIn > 0 || busy}>
          {resendIn > 0 ? `Renvoyer le code dans ${resendIn} s` : 'Renvoyer le code'}
        </button>
        <p className="qz-note">Pense à regarder dans les courriers indésirables.</p>
        <button type="button" className="qz-link qz-link--quiet" onClick={onLogout}>
          Utiliser un autre compte
        </button>
      </div>
    </div>
  );
};

export default QuizVerify;
