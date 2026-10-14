import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { checkForUpdate, rememberDismiss, type UpdatePrompt } from '../services/appUpdate';
import { isReducedMotion } from '../services/reducedMotion';
import { LatinCrossIcon } from './nav/icons';
import { tapHaptic } from '../utils/haptics';
import './UpdateSheet.css';

// Feuille « Nouvelle version » (maquette « Mise à jour v2 ») : médaillon,
// nouveautés, bouton vers le store. En mode obligatoire, ni « Plus tard »
// ni fermeture par le fond ou le bouton retour.

const EASE = 'cubic-bezier(.2,.7,.2,1)';
/** Délai avant l'ouverture : laisser l'accueil s'afficher d'abord. */
const OPEN_DELAY_MS = 1200;
/** Durée de l'écran « Ouverture de Google Play… » avant de passer la main. */
const HANDOFF_MS = 900;

const STORE_LABELS = {
  android: { pre: 'Disponible sur', name: 'Google Play' },
  ios: { pre: 'Télécharger dans', name: "l'App Store" }
} as const;

const STARS = (() => {
  let s = 17;
  const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  return Array.from({ length: 22 }, () => ({
    left: `${(rnd() * 100).toFixed(1)}%`,
    top: `${(rnd() * 100).toFixed(1)}%`,
    duration: `${(2 + rnd() * 3).toFixed(2)}s`,
    delay: `${(-rnd() * 4).toFixed(2)}s`
  }));
})();

const PlayIcon = () => (
  <svg width="18" height="20" viewBox="0 0 18 20" fill="none" aria-hidden="true">
    <path d="M1.5 1.2L10.6 10 1.5 18.8c-.3-.2-.5-.6-.5-1V2.2c0-.4.2-.8.5-1z" fill="#F0D58E" />
    <path d="M13.6 7.1L10.6 10l3 2.9 3.4-1.9c.8-.5.8-1.5 0-2l-3.4-1.9z" fill="#D9B66A" />
    <path d="M1.5 1.2c.3-.2.8-.2 1.2 0l10.9 5.9-3 2.9-9.1-8.8z" fill="#F4EDDC" />
    <path d="M1.5 18.8l9.1-8.8 3 2.9-10.9 5.9c-.4.2-.9.2-1.2 0z" fill="#B5892E" />
  </svg>
);

const AppStoreIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <circle cx="9" cy="9" r="8.3" stroke="#F0D58E" strokeWidth="1.1" />
    <path d="M9.6 4.6L5.6 11.4M8.4 4.6l4 6.8M4.6 11.4h8.8" stroke="#F0D58E" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const UpdateSheet: React.FC = () => {
  const [prompt, setPrompt] = useState<UpdatePrompt | null>(null);
  const [open, setOpen] = useState(false);
  const [handoff, setHandoff] = useState(false);
  const medRef = useRef<HTMLDivElement>(null);
  const newsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let timer = 0;
    checkForUpdate()
      .then((p) => {
        if (cancelled || !p) return;
        setPrompt(p);
        timer = window.setTimeout(() => setOpen(true), OPEN_DELAY_MS);
      })
      .catch(() => {
        /* vérification best-effort */
      });
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  // Entrée : le médaillon tourne en place, les nouveautés montent une à une.
  useEffect(() => {
    if (!open || isReducedMotion()) return;
    medRef.current?.animate(
      [
        { transform: 'scale(.5) rotate(-60deg)', opacity: 0 },
        { transform: 'none', opacity: 1 }
      ],
      { duration: 1200, delay: 250, easing: EASE, fill: 'backwards' }
    );
    [...(newsRef.current?.children ?? [])].forEach((c, i) =>
      c.animate(
        [
          { opacity: 0, transform: 'translateY(14px)', filter: 'blur(4px)' },
          { opacity: 1, transform: 'none', filter: 'blur(0)' }
        ],
        { duration: 700, delay: 450 + i * 110, easing: EASE, fill: 'backwards' }
      )
    );
  }, [open]);

  const forced = prompt?.forced ?? false;

  const dismiss = useCallback(() => {
    if (!prompt || prompt.forced) return;
    rememberDismiss(prompt.version);
    setOpen(false);
  }, [prompt]);

  // Bouton retour Android : ferme (« plus tard »), ou ne fait rien si obligatoire.
  useEffect(() => {
    if (!open) return;
    const onBack = (ev: Event) => {
      (ev as CustomEvent<{ register: (priority: number, handler: () => void) => void }>).detail.register(
        200,
        dismiss
      );
    };
    document.addEventListener('ionBackButton', onBack);
    return () => document.removeEventListener('ionBackButton', onBack);
  }, [open, dismiss]);

  if (!prompt) return null;

  const store = STORE_LABELS[prompt.platform];

  const goStore = () => {
    tapHaptic();
    setHandoff(true);
    window.setTimeout(
      () => {
        window.open(prompt.storeUrl, '_blank', 'noopener');
        setHandoff(false);
        // Obligatoire : la feuille reste, l'app n'est pas utilisable sans la mise à jour.
        if (!prompt.forced) setOpen(false);
      },
      isReducedMotion() ? 0 : HANDOFF_MS
    );
  };

  return createPortal(
    <div className={`us${open ? ' is-open' : ''}`} inert={!open} aria-hidden={!open}>
      <div className="us-backdrop" onClick={dismiss} />

      <div className="us-sheet" role="dialog" aria-modal="true" aria-labelledby="us-title">
        <div className="us-hero">
          <div className="us-stars" aria-hidden="true">
            {STARS.map((s, i) => (
              <span key={i} style={{ left: s.left, top: s.top, animationDuration: s.duration, animationDelay: s.delay }} />
            ))}
          </div>
          <span className="us-beams" aria-hidden="true" />
          {!forced && <span className="us-handle" aria-hidden="true" />}

          <div ref={medRef} className="us-medal" aria-hidden="true">
            <span className="us-medal-glow" />
            <span className="us-medal-rays" />
            <span className="us-medal-ring" />
            <span className="us-medal-core">{prompt.version}</span>
          </div>
          <p className="us-kicker">{forced ? 'Mise à jour requise' : 'Nouvelle version'}</p>
          <h2 id="us-title" className="us-title">
            Bibliae {prompt.version}
          </h2>
          <p className="us-sub">
            {forced
              ? 'Cette version est nécessaire pour continuer à utiliser Bibliae.'
              : `Une nouvelle version est disponible sur ${store.name}.`}
          </p>
        </div>

        {prompt.news.length > 0 && (
          <div className="us-news-wrap">
            <div className="us-rule">
              <span>Nouveautés</span>
              <i />
            </div>
            <div ref={newsRef} className="us-news">
              {prompt.news.map((n) => (
                <div key={n.title} className="us-news-row">
                  <span className="us-news-glyph" aria-hidden="true">
                    {n.glyph || '✦'}
                  </span>
                  <div>
                    <p className="us-news-title">{n.title}</p>
                    <p className="us-news-body">{n.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="us-actions">
          <button type="button" className="us-store" onClick={goStore}>
            <span className="us-store-shine" aria-hidden="true" />
            {prompt.platform === 'android' ? <PlayIcon /> : <AppStoreIcon />}
            <span className="us-store-text">
              <span className="us-store-pre">{store.pre}</span>
              <span className="us-store-name">{store.name}</span>
            </span>
          </button>
          {forced ? (
            <p className="us-kept">Vos lectures, notes et favoris sont conservés.</p>
          ) : (
            <button type="button" className="us-later" onClick={dismiss}>
              Plus tard
            </button>
          )}
        </div>
      </div>

      <div className={`us-handoff${handoff ? ' is-on' : ''}`} aria-hidden="true">
        <div className="us-handoff-tile">
          <LatinCrossIcon size={30} />
        </div>
        <div className="us-handoff-label">
          Ouverture de {store.name}
          <span className="us-dots">
            <span />
            <span />
            <span />
          </span>
        </div>
      </div>
    </div>,
    document.querySelector('.app-shell') ?? document.body
  );
};

export default UpdateSheet;
