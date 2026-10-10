import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IonContent, IonPage } from '@ionic/react';
import { useParishSearch } from '../../hooks/useParishSearch';
import { locationLabelFromZip } from '../../utils/frenchDepartments';
import { ChevronLeftIcon, SearchIcon, LocationIcon } from '../../components/nav/icons';
import { tapHaptic } from '../../utils/haptics';
import './Paroisses.css';
import WorldButton from '../../components/nav/WorldButton';

const Paroisses: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);
  const { results, totalItems, isLoading, error } = useParishSearch(query);

  const trimmed = query.trim();

  const locateMe = () => {
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
    <IonPage>
      <IonContent fullscreen className="paroisses-content">
        <header className="paroisses-header">
          <button
            type="button"
            className="paroisses-header-button"
            onClick={() => {
              tapHaptic();
              navigate(-1);
            }}
            aria-label="Retour"
          >
            <ChevronLeftIcon size={22} />
          </button>
        </header>

        <div className="paroisses-hero">
          <h1 className="paroisses-title">Trouver une paroisse</h1>
          <p className="paroisses-subtitle">
            Cherche par nom de paroisse, par ville ou par code postal. Chaque fiche donne les églises
            rattachées et les horaires des messes.
          </p>
        </div>

        <div className="paroisses-search">
          <div className="paroisses-search-field">
            <SearchIcon size={17} className="paroisses-search-icon" />
            <input
              type="search"
              className="paroisses-search-input"
              placeholder="Nom, ville ou code postal"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {trimmed && (
              <button
                type="button"
                className="paroisses-search-clear"
                onClick={() => {
                  setQuery('');
                  setLocateError(null);
                }}
              >
                Effacer
              </button>
            )}
          </div>
        </div>

        <button type="button" className="paroisses-locate" onClick={locateMe} disabled={isLocating}>
          <LocationIcon size={16} />
          {isLocating ? 'Localisation…' : 'Autour de moi'}
        </button>

        {locateError && <p className="paroisses-locate-error">{locateError}</p>}

        <div className="paroisses-results">
          {trimmed.length >= 2 && (
            <div className="paroisses-results-header">
              <p className="paroisses-results-count">
                {isLoading
                  ? 'Recherche…'
                  : `${totalItems} paroisse${totalItems > 1 ? 's' : ''}`}
              </p>
              <p className="paroisses-results-query">« {trimmed} »</p>
            </div>
          )}

          {trimmed.length < 2 && (
            <p className="paroisses-hint">Tape au moins deux lettres pour commencer la recherche.</p>
          )}

          {error && <p className="paroisses-error">{error}</p>}

          {!error && !isLoading && trimmed.length >= 2 && results.length === 0 && (
            <p className="paroisses-empty">Aucune paroisse trouvée pour « {trimmed} ».</p>
          )}

          {results.map((parish) => {
            const location = locationLabelFromZip(parish.zipCode);
            const hasWebsite = parish.website.includes('.');
            return (
              <article className="paroisses-card" key={parish.id}>
                <div className="paroisses-card-head">
                  <h3 className="paroisses-card-name">{parish.name}</h3>
                  {parish.zipCode && <span className="paroisses-card-zip">{parish.zipCode}</span>}
                </div>
                <div className="paroisses-card-tags">
                  <span className="paroisses-card-tag">
                    {parish.churchCount > 0
                      ? `${parish.churchCount} église${parish.churchCount > 1 ? 's' : ''}`
                      : 'Églises à préciser'}
                  </span>
                  {hasWebsite && (
                    <a
                      className="paroisses-card-tag paroisses-card-tag--link"
                      href={parish.website.startsWith('http') ? parish.website : `https://${parish.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Site
                    </a>
                  )}
                </div>
                {(location || parish.dioceseId) && (
                  <p className="paroisses-card-meta">
                    {location}
                    {location && parish.dioceseId ? ' · ' : ''}
                    {parish.dioceseId ? `Diocèse n° ${parish.dioceseId}` : ''}
                  </p>
                )}
              </article>
            );
          })}
        </div>

        <div className="paroisses-note">
          <p className="paroisses-note-kicker">Bon à savoir</p>
          <p className="paroisses-note-text">
            Une paroisse regroupe plusieurs églises. Les horaires de messe peuvent changer pendant l'été
            et les grandes fêtes : vérifie sur la fiche avant de te déplacer.
          </p>
        </div>

        <footer className="paroisses-footer">
          <p className="paroisses-footer-wordmark">Lux Scripturae, Fides Ecclesiae</p>
          <p className="paroisses-footer-links">À propos · Sources · Contact</p>
        </footer>
        <WorldButton />
      </IonContent>
    </IonPage>
  );
};

export default Paroisses;
