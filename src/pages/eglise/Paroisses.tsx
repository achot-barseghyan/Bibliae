import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IonPage } from '@ionic/react';
import { useParishSearch, type Parish } from '../../hooks/useParishSearch';
import { locationLabelFromZip } from '../../utils/frenchDepartments';
import { tapHaptic } from '../../utils/haptics';
import { churchCountLabel, departmentCode, hasWebsite } from './parishFormat';
import './Paroisses.css';
import WorldButton from '../../components/nav/WorldButton';

// Trouver une paroisse (maquette « Trouver une paroisse v2 ») : en-tête nuit
// avec radar pendant la localisation, champ de recherche collant, filtres
// appliqués aux résultats déjà chargés, cartes avec cadran « une graduation
// par église ».

const FILTERS: { label: string; test: (parish: Parish) => boolean }[] = [
  { label: 'Toutes', test: () => true },
  { label: 'Avec site', test: (parish) => hasWebsite(parish) },
  { label: '5 églises et +', test: (parish) => parish.churchCount >= 5 }
];

const ParishCard: React.FC<{ parish: Parish; index: number; onOpen: () => void }> = ({
  parish,
  index,
  onOpen
}) => {
  const location = locationLabelFromZip(parish.zipCode);
  const site = hasWebsite(parish);
  const n = parish.churchCount;
  const meta = [location, parish.dioceseId ? `Diocèse n° ${parish.dioceseId}` : null]
    .filter(Boolean)
    .join(' · ');

  return (
    <button
      type="button"
      className="tp-card"
      style={{ '--tp-i': Math.min(index, 12) } as React.CSSProperties}
      onClick={onOpen}
    >
      <span
        className="tp-dial"
        aria-hidden="true"
        style={{ '--tp-tick': `${(360 / Math.max(n, 1)).toFixed(2)}deg` } as React.CSSProperties}
      >
        <span className="tp-dial-ring" />
        <span className="tp-dial-core">{parish.zipCode ? departmentCode(parish.zipCode) : '†'}</span>
      </span>
      <span className="tp-card-main">
        <span className="tp-card-name">{parish.name}</span>
        <span className="tp-card-tags">
          <span className="tp-tag">
            {churchCountLabel(n)}
          </span>
          {site && <span className="tp-tag tp-tag--site">Site</span>}
        </span>
        {meta && <span className="tp-card-meta">{meta}</span>}
      </span>
      <span className="tp-card-side">
        {parish.zipCode && <span className="tp-card-zip">{parish.zipCode}</span>}
        <span className="tp-card-chevron" aria-hidden="true">
          ›
        </span>
      </span>
    </button>
  );
};

const Paroisses: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState(0);
  const [isLocating, setIsLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);
  const { results, isLoading, error } = useParishSearch(query);

  const trimmed = query.trim();
  const searching = trimmed.length >= 2;
  const shown = results.filter(FILTERS[filter].test);

  const locateMe = () => {
    if (isLocating) return;
    // Les navigateurs refusent la position aux pages servies en http (hors
    // localhost), sans même afficher de demande : l'erreur ressemble alors à
    // un refus de l'utilisateur alors que l'autorisation est bien donnée.
    if (!window.isSecureContext) {
      setLocateError(
        "La localisation n'est possible que sur une adresse sécurisée (https). Ouvre l'app via son lien https, ou cherche ta ville à la main."
      );
      return;
    }
    if (!navigator.geolocation) {
      setLocateError("La géolocalisation n'est pas disponible sur cet appareil.");
      return;
    }
    tapHaptic();
    setIsLocating(true);
    setLocateError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetch(
          `https://api-adresse.data.gouv.fr/reverse/?lon=${longitude}&lat=${latitude}`
        )
          .then((response) => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json();
          })
          .then((data: { features?: Array<{ properties?: { city?: string } }> }) => {
            const city = data.features?.[0]?.properties?.city;
            if (city) {
              setQuery(city);
            } else {
              setLocateError("Impossible de déterminer ta ville à partir de ta position.");
            }
          })
          .catch(() => {
            setLocateError('La localisation a échoué. Réessaie dans un instant.');
          })
          .finally(() => setIsLocating(false));
      },
      (geoError) => {
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setLocateError(
            "Accès à la position refusé. Autorise la localisation pour ce site (ou l'app) dans les réglages du navigateur et du téléphone."
          );
        } else if (geoError.code === geoError.TIMEOUT) {
          setLocateError('La position met trop de temps à arriver. Réessaie, ou cherche ta ville à la main.');
        } else {
          setLocateError("Position introuvable. Vérifie que la localisation du téléphone est activée.");
        }
        setIsLocating(false);
      },
      // La ville suffit : une position approchée (réseau) répond vite et
      // fonctionne en intérieur, là où le GPS peut ne jamais répondre.
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 10 * 60 * 1000 }
    );
  };

  return (
    <IonPage className="tp-page">
      <div className="tp-scroll">
        <header className="tp-hero">
          <span className="tp-rosace" aria-hidden="true" />
          <span className={`tp-radar${isLocating ? ' is-on' : ''}`} aria-hidden="true">
            <span className="tp-radar-ping" />
            <span className="tp-radar-ping tp-radar-ping--late" />
            <span className="tp-radar-dot" />
          </span>

          <div className="tp-hero-inner">
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
              <span className="tp-kicker">Église</span>
            </div>
            <h1 className="tp-title">
              Trouver une
              <br />
              paroisse
            </h1>
            <p className="tp-lede">
              Cherche par nom de paroisse, par ville ou par code postal. Chaque fiche donne les
              églises rattachées et les horaires des messes.
            </p>
          </div>
        </header>

        <div className="tp-search">
          <label className="tp-field">
            <span className="tp-field-shine" aria-hidden="true" />
            <svg className="tp-field-icon" width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path
                d="M8.2 14.4a6.2 6.2 0 100-12.4 6.2 6.2 0 000 12.4zM12.9 12.9l3.7 3.7"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="search"
              className="tp-input"
              placeholder="Paris, 75004, Sainte-Marie…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Nom, ville ou code postal"
              enterKeyHint="search"
            />
            {query && (
              <button
                type="button"
                className="tp-clear"
                onClick={() => {
                  setQuery('');
                  setLocateError(null);
                }}
                aria-label="Effacer la recherche"
              >
                <span className="tp-clear-dot">
                  <svg width="9" height="9" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                    <path d="M1 1l13 13M14 1L1 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </span>
              </button>
            )}
          </label>
        </div>

        <div className="tp-chips">
          <button
            type="button"
            className="tp-chip tp-chip--locate"
            onClick={locateMe}
            aria-busy={isLocating}
          >
            <span className="tp-locate-dot" aria-hidden="true" />
            {isLocating ? 'Localisation…' : 'Autour de moi'}
          </button>
          {FILTERS.map((f, i) => (
            <button
              key={f.label}
              type="button"
              className={`tp-chip${i === filter ? ' is-active' : ''}`}
              aria-pressed={i === filter}
              onClick={() => setFilter(i)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {locateError && <p className="tp-locate-error">{locateError}</p>}

        {searching && (
          <div className="tp-count" aria-live="polite">
            <span className="tp-count-main">
              <span className="tp-count-num">{isLoading ? '…' : shown.length}</span>
              <span className="tp-count-word">
                {isLoading ? 'Recherche' : shown.length > 1 ? 'paroisses' : 'paroisse'}
              </span>
            </span>
            <span className="tp-count-scope">« {trimmed} »</span>
          </div>
        )}

        <div className="tp-results">
          {!searching && (
            <div className="tp-empty">
              <p className="tp-empty-title">Où cherches-tu ?</p>
              <p className="tp-empty-text">
                Tape au moins deux lettres : une ville, un code postal ou le nom du saint patron.
              </p>
            </div>
          )}

          {searching && error && (
            <div className="tp-empty">
              <p className="tp-empty-title">Recherche indisponible</p>
              <p className="tp-empty-text">{error}</p>
            </div>
          )}

          {searching && !error && !isLoading && shown.length === 0 && (
            <div className="tp-empty">
              <p className="tp-empty-title">Aucune paroisse trouvée</p>
              <p className="tp-empty-text">
                {results.length > 0
                  ? 'Aucun résultat avec ce filtre. Essaie « Toutes ».'
                  : 'Essaie un nom de ville, un code postal, ou le nom du saint patron.'}
              </p>
            </div>
          )}

          {/* La clé change à chaque recherche/filtre : les cartes rejouent leur apparition. */}
          {!isLoading && (
            <div className="tp-list" key={`${trimmed}|${filter}`}>
              {shown.map((parish, i) => (
                <ParishCard
                  key={parish.id}
                  parish={parish}
                  index={i}
                  onOpen={() => {
                    tapHaptic();
                    navigate(`/paroisses/${parish.id}`, { state: { parish } });
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <aside className="tp-note">
          <span className="tp-note-glow" aria-hidden="true" />
          <p className="tp-note-kicker">Bon à savoir</p>
          <p className="tp-note-text">
            Une paroisse regroupe plusieurs églises. Les horaires de messe peuvent changer pendant
            l'été et les grandes fêtes : vérifie sur la fiche avant de te déplacer.
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

export default Paroisses;
