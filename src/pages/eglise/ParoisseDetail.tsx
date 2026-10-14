import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { IonPage } from '@ionic/react';
import type { Parish } from '../../hooks/useParishSearch';
import { useParishDetail, type ParishChurch } from '../../hooks/useParishDetail';
import { useBookmarks } from '../../hooks/useBookmarks';
import { massKindLabel, messesInfoPageUrl, type Mass } from '../../services/messesInfo';
import { FRENCH_DEPARTMENTS } from '../../utils/frenchDepartments';
import { tapHaptic } from '../../utils/haptics';
import { churchCountLabel, departmentCode, hasWebsite, websiteUrl } from './parishFormat';
import WorldButton from '../../components/nav/WorldButton';
import { ExternalArrowIcon } from '../../components/nav/icons';
import './Paroisses.css';
import './ParoisseDetail.css';

// Fiche paroisse (maquette « Trouver une paroisse v2 », écran « Fiche
// paroisse ») : prochaine messe, semaine d'horaires messes.info, itinéraire,
// site, églises rattachées. Ouverte depuis la liste (la paroisse arrive par
// l'état de navigation, affichée aussitôt) ou depuis un favori (rechargée).

const WD_SHORT = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];
const WD_LONG = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const DAY_MS = 864e5;
/** Circonférence de l'anneau « prochaine messe » (r = 33). */
const RING = 207.3;

const pad = (n: number) => String(n).padStart(2, '0');
const isoOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const massTime = (m: Mass) => new Date(`${m.date}T00:00:00`).getTime() + m.minutes * 60000;

function directionsUrl(parish: Parish, church: ParishChurch | undefined): string {
  const destination =
    church && church.latitude !== null && church.longitude !== null
      ? `${church.latitude},${church.longitude}`
      : `${church?.name ?? parish.name} ${parish.zipCode}`.trim();
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}

function churchDirectionsUrl(church: ParishChurch, zip: string): string {
  const destination =
    church.latitude !== null && church.longitude !== null
      ? `${church.latitude},${church.longitude}`
      : `${church.name} ${zip}`.trim();
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}

/** « dans 12 min », « dans 3h05 », « demain », « jeudi ». */
function relativeLabel(mass: Mass, now: number): string {
  const diff = massTime(mass) - now;
  const dayDiff = Math.round(
    (new Date(`${mass.date}T00:00:00`).getTime() - new Date(`${isoOf(new Date(now))}T00:00:00`).getTime()) / DAY_MS
  );
  if (diff < 3600e3) return `dans ${Math.max(1, Math.round(diff / 60000))} min`;
  if (dayDiff === 0) return `dans ${Math.floor(diff / 3600e3)}h${pad(Math.floor(diff / 60000) % 60)}`;
  if (dayDiff === 1) return 'demain';
  return WD_LONG[new Date(`${mass.date}T00:00:00`).getDay()];
}

const ParoisseDetail: React.FC = () => {
  const { parishId } = useParams<{ parishId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const initial = (location.state as { parish?: Parish } | null)?.parish;
  const { parish: loaded, churches, status, masses, massStatus, loadedAt, retryMasses } = useParishDetail(parishId);
  const parish = loaded ?? (initial && String(initial.id) === parishId ? initial : null);
  const { bookmarks, toggle } = useBookmarks();

  // Rafraîchit « dans N min » et les messes passées.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  const [day, setDay] = useState(0);
  const days = useMemo(
    () =>
      [...Array(7)].map((_, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() + i);
        return d;
      }),
    // Recalculé une fois par jour suffit ; `now` change chaque minute.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isoOf(new Date(now))]
  );

  const ok = massStatus === 'ok';
  const next = ok ? masses.find((m) => massTime(m) > now) ?? null : null;
  const selIso = isoOf(days[day]);
  const dayMasses = ok ? masses.filter((m) => m.date === selIso) : [];
  const weekCount = ok ? masses.filter((m) => m.date >= isoOf(days[0]) && m.date <= isoOf(days[6])).length : 0;

  // L'anneau se remplit à mesure que la messe approche (plein à l'heure dite).
  const [ringShown, setRingShown] = useState(false);
  useEffect(() => {
    setRingShown(false);
    if (!next) return;
    const t = window.setTimeout(() => setRingShown(true), 60);
    return () => window.clearTimeout(t);
  }, [next]);
  const ringOffset = next && ringShown ? (RING * Math.min(massTime(next) - now, DAY_MS)) / DAY_MS : RING;

  if (!parish) {
    return (
      <IonPage className="tp-page">
        <div className="tp-scroll">
          <header className="tp-hero pf-hero">
            <span className="tp-rosace" aria-hidden="true" />
            <div className="tp-hero-inner">
              <div className="tp-hero-top">
                <button type="button" className="tp-back" onClick={() => navigate(-1)} aria-label="Retour">
                  ‹
                </button>
                <span className="tp-kicker">Paroisse</span>
              </div>
              {status === 'error' ? (
                <>
                  <h1 className="pf-title">Paroisse introuvable</h1>
                  <p className="pf-sub">La fiche n'a pas pu être chargée. Vérifie ta connexion et réessaie.</p>
                </>
              ) : (
                <div className="pf-hero-skeleton" aria-label="Chargement">
                  <span />
                  <span />
                </div>
              )}
            </div>
          </header>
        </div>
      </IonPage>
    );
  }

  const bookmarkPrefix = `paroisse:${parish.id}:`;
  const savedKey = bookmarks.find((k) => k.startsWith(bookmarkPrefix));
  const toggleFavorite = () => {
    tapHaptic();
    toggle(savedKey ?? `${bookmarkPrefix}${parish.name}`);
  };

  const dept = parish.zipCode ? departmentCode(parish.zipCode) : '';
  const place = [FRENCH_DEPARTMENTS[dept], parish.zipCode].filter(Boolean).join(' · ');
  const sub = [churchCountLabel(parish.churchCount), parish.dioceseId ? `Diocèse n° ${parish.dioceseId}` : null]
    .filter(Boolean)
    .join(' · ');
  const site = hasWebsite(parish);
  const messesUrl = parish.messesinfoId ? messesInfoPageUrl(parish.messesinfoId) : null;
  const showSchedule = massStatus === 'loading' || massStatus === 'ok';

  return (
    <IonPage className="tp-page">
      <div className="tp-scroll">
        <header className="tp-hero pf-hero">
          <span className="tp-rosace" aria-hidden="true" />
          <div className="tp-hero-inner">
            <div className="pf-hero-bar">
              <div className="tp-hero-top">
                <button
                  type="button"
                  className="tp-back"
                  onClick={() => {
                    tapHaptic();
                    navigate(-1);
                  }}
                  aria-label="Retour"
                >
                  ‹
                </button>
                <span className="tp-kicker">Paroisse</span>
              </div>
              <button
                type="button"
                className={`pf-fav${savedKey ? ' is-on' : ''}`}
                onClick={toggleFavorite}
                aria-pressed={!!savedKey}
                aria-label={savedKey ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              >
                <svg width="14" height="16" viewBox="0 0 15 17" fill="none" aria-hidden="true">
                  <path
                    d="M2 1.5h11v14l-5.5-4-5.5 4v-14z"
                    fill={savedKey ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {(dept || place) && (
              <div className="pf-place">
                {dept && <span className="pf-dept">{dept}</span>}
                <span className="pf-place-label">{place}</span>
              </div>
            )}
            <h1 className="pf-title">{parish.name}</h1>
            <p className="pf-sub">{sub}</p>
          </div>
        </header>

        {/* --- Prochaine messe --- */}
        <div className="pf-next-wrap">
          <div className="pf-next">
            <span className="tp-field-shine" aria-hidden="true" />

            {massStatus === 'loading' && (
              <div className="pf-next-grid" aria-label="Chargement des horaires">
                <span className="pf-skel pf-skel--ring" />
                <span className="pf-skel-lines">
                  <span className="pf-skel" style={{ width: '40%', height: 8 }} />
                  <span className="pf-skel" style={{ width: '70%', height: 16 }} />
                  <span className="pf-skel" style={{ width: '55%', height: 10 }} />
                </span>
              </div>
            )}

            {next && (
              <div className="pf-next-grid">
                <span className="pf-ring">
                  <svg width="76" height="76" viewBox="0 0 76 76" aria-hidden="true">
                    <circle cx="38" cy="38" r="33" className="pf-ring-track" />
                    <circle
                      cx="38"
                      cy="38"
                      r="33"
                      className="pf-ring-fill"
                      strokeDasharray={RING}
                      strokeDashoffset={ringOffset.toFixed(1)}
                    />
                  </svg>
                  <span className="pf-ring-center">
                    <span className="pf-ring-time">{next.time}</span>
                    <span className="pf-ring-day">
                      {next.date === isoOf(new Date(now))
                        ? 'Auj.'
                        : `${WD_SHORT[new Date(`${next.date}T00:00:00`).getDay()]} ${new Date(`${next.date}T00:00:00`).getDate()}`}
                    </span>
                  </span>
                </span>
                <span className="pf-next-text">
                  <span className="pf-next-kicker">
                    <span className="pf-pulse" aria-hidden="true" />
                    Prochaine · {relativeLabel(next, now)}
                  </span>
                  <span className="pf-next-church">{next.church || parish.name}</span>
                  <span className="pf-next-kind">
                    {[massKindLabel(next.kind), next.note].filter(Boolean).join(' · ')}
                  </span>
                </span>
              </div>
            )}

            {ok && !next && (
              <div className="pf-next-msg">
                <span className="pf-next-kicker">Prochaine messe</span>
                <span className="pf-next-church">Aucune messe annoncée cette semaine</span>
                <span className="pf-next-kind is-italic">
                  La paroisse n'a pas encore publié ses horaires sur messes.info.
                </span>
              </div>
            )}

            {massStatus === 'error' && (
              <div className="pf-next-msg">
                <span className="pf-next-kicker">messes.info injoignable</span>
                <span className="pf-next-church">Horaires indisponibles pour l'instant</span>
                <button type="button" className="pf-pill" onClick={retryMasses}>
                  Réessayer
                </button>
              </div>
            )}

            {(massStatus === 'nokey' || massStatus === 'none') && (
              <div className="pf-next-msg">
                <span className="pf-next-kicker">Horaires des messes</span>
                <span className="pf-next-church">
                  {messesUrl ? 'À consulter sur messes.info' : 'Horaires non référencés'}
                </span>
                <span className="pf-next-kind is-italic">
                  {messesUrl
                    ? 'La paroisse y publie ses horaires, mis à jour au fil des fêtes et des saisons.'
                    : "Cette paroisse n'est pas encore référencée sur messes.info. Son site ou l'accueil paroissial donnera les horaires."}
                </span>
                {messesUrl && (
                  <a className="pf-pill" href={messesUrl} target="_blank" rel="noopener noreferrer">
                    Voir les horaires <ExternalArrowIcon />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* --- Actions --- */}
        <div className={`pf-actions${site ? ' has-two' : ''}`}>
          <a
            className="pf-action pf-action--dark"
            href={directionsUrl(parish, churches[0])}
            target="_blank"
            rel="noopener noreferrer"
          >
            Itinéraire <span className="pf-action-arrow">→</span>
          </a>
          {site && (
            <a className="pf-action" href={websiteUrl(parish)} target="_blank" rel="noopener noreferrer">
              Site paroissial
            </a>
          )}
        </div>

        {/* --- Semaine d'horaires --- */}
        {showSchedule && (
          <section className="pf-section">
            <div className="pf-section-head">
              <h2 className="pf-section-title">Horaires des messes</h2>
              <span className="pf-section-count">
                {massStatus === 'loading' ? 'Chargement…' : `${weekCount} messe${weekCount > 1 ? 's' : ''} · 7 jours`}
              </span>
            </div>

            <div className="pf-days" role="tablist" aria-label="Jour">
              <span className="pf-days-indicator" style={{ transform: `translateX(${day * 100}%)` }} aria-hidden="true" />
              {days.map((d, i) => {
                const iso = isoOf(d);
                const has = ok && masses.some((m) => m.date === iso);
                return (
                  <button
                    key={iso}
                    type="button"
                    role="tab"
                    aria-selected={i === day}
                    className={`pf-day${i === day ? ' is-active' : ''}${d.getDay() === 0 ? ' is-sunday' : ''}`}
                    onClick={() => setDay(i)}
                  >
                    <span className="pf-day-wd">{i === 0 ? 'Auj.' : WD_SHORT[d.getDay()]}</span>
                    <span className="pf-day-n">{d.getDate()}</span>
                    <span className={`pf-day-dot${has ? ' has' : ''}`} />
                  </button>
                );
              })}
            </div>

            <div className="pf-masses" key={selIso}>
              {massStatus === 'loading' &&
                [0, 1, 2].map((k) => <span key={k} className="pf-mass-skel" aria-hidden="true" />)}

              {dayMasses.map((m, i) => {
                const past = massTime(m) < now;
                const isNext = next === m;
                const sunday = m.kind === 'SUNDAYMASS';
                return (
                  <div
                    key={`${m.minutes}-${m.church}-${i}`}
                    className={`pf-mass${isNext ? ' is-next' : ''}${past ? ' is-past' : ''}`}
                    style={{ '--pf-i': i } as React.CSSProperties}
                  >
                    <div>
                      <div className="pf-mass-time">{m.time}</div>
                      {past && <div className="pf-mass-past">Passée</div>}
                    </div>
                    <div className="pf-mass-main">
                      <div className="pf-mass-church">{m.church || parish.name}</div>
                      <div className="pf-mass-tags">
                        <span className={`pf-mass-kind${sunday ? ' is-sunday' : ''}`}>{massKindLabel(m.kind)}</span>
                        {m.note && <span className="pf-mass-note">{m.note}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}

              {ok && dayMasses.length === 0 && <div className="pf-mass-empty">Pas de messe annoncée ce jour.</div>}
            </div>

            <div className="pf-source">
              <span className="pf-source-label">
                {loadedAt
                  ? `Source messes.info · chargé à ${loadedAt.getHours()}h${pad(loadedAt.getMinutes())}`
                  : 'Source messes.info'}
              </span>
              {messesUrl && (
                <a className="pf-source-link" href={messesUrl} target="_blank" rel="noopener noreferrer">
                  messes.info <ExternalArrowIcon />
                </a>
              )}
            </div>
          </section>
        )}

        {/* --- Églises rattachées --- */}
        {churches.length > 0 && (
          <section className="pf-section">
            <div className="pf-section-head">
              <h2 className="pf-section-title">Églises</h2>
              <span className="pf-section-count">{churchCountLabel(parish.churchCount)}</span>
            </div>
            <div className="pf-churches">
              {churches.map((church) => (
                <a
                  key={church.name}
                  className="pf-church"
                  href={churchDirectionsUrl(church, parish.zipCode)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="pf-church-cross" aria-hidden="true">
                    †
                  </span>
                  <span className="pf-church-name">{church.name}</span>
                  <span className="pf-church-go">Itinéraire →</span>
                </a>
              ))}
            </div>
          </section>
        )}

        <aside className="tp-note">
          <span className="tp-note-glow" aria-hidden="true" />
          <p className="tp-note-kicker">Première visite ?</p>
          <p className="tp-note-text">
            Il n'y a rien à préparer et rien à payer. On peut arriver un peu en avance, s'asseoir au fond,
            et simplement suivre. Personne ne remarquera que c'est la première fois.
          </p>
        </aside>

        <footer className="tp-footer">
          <span className="tp-footer-cross" aria-hidden="true">
            †
          </span>
          <span className="tp-footer-motto">Lux Scripturae, fides Ecclesiae</span>
        </footer>
        <WorldButton />
      </div>
    </IonPage>
  );
};

export default ParoisseDetail;
