import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { IonContent, IonPage } from '@ionic/react';
import { useRemoteAccueil } from '../hooks/content/useRemoteAccueil';
import { useFigures } from '../hooks/useFigures';
import { useReadingProgress } from '../hooks/useReadingProgress';
import { useLiturgicalDay } from '../hooks/useLiturgicalDay';
import LiturgicalCard from '../components/LiturgicalCard';
import { BOOKS, getBook } from '../data/bible';
import { MYSTERY_ORDER } from '../data/rosary';
import {
  SearchIcon,
  ChevronRightIcon,
  PeopleIcon,
  BookIcon,
  RosaireIcon,
  PrierIcon
} from '../components/nav/icons';
import jesusImg from '../assets/images/men/Jesus_Christ.webp';
import './Accueil.css';

const SEARCH_CHIPS: { label: string; path: string }[] = [
  { label: 'Figures', path: '/compendium/figures' },
  { label: 'Versets', path: '/bible' },
  { label: 'Lieux', path: '/compendium/lieux' },
  { label: 'Prières', path: '/prier/prieres' },
  { label: 'Saints', path: '/prier/saints' }
];

// Numéro de semaine ISO : détermine, de façon stable et sans backend, quel
// quart des figures en vedette est mis en avant cette semaine.
function isoWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function relativeDayLabel(iso: string): string {
  const diffDays = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (diffDays <= 0) return "aujourd'hui";
  if (diffDays === 1) return 'hier';
  if (diffDays < 7) return `il y a ${diffDays} jours`;
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
}

const Accueil: React.FC = () => {
  const navigate = useNavigate();
  const { hero, featuredFigures } = useRemoteAccueil();
  const { figures } = useFigures();
  const { activeParcours, positionFor, progress } = useReadingProgress();
  const { feast } = useLiturgicalDay();

  const weeklyFigures = useMemo(() => {
    if (featuredFigures.length === 0) return [];
    const offset = isoWeek(new Date()) % featuredFigures.length;
    return [0, 1, 2, 3].map((i) => featuredFigures[(offset + i) % featuredFigures.length]);
  }, [featuredFigures]);

  const mysteryCount = MYSTERY_ORDER.length * 5;

  const readingPosition = activeParcours ? positionFor(activeParcours.id) : undefined;
  const readingBook = readingPosition ? getBook(readingPosition.bookId) : undefined;
  const readingPercent = activeParcours ? progress(activeParcours).percent : 0;

  const gospel = feast?.mass.find((m) => m.key === 'gospel');

  return (
    <IonPage>
      <IonContent fullscreen className="accueil-content">
        <header className="accueil-topbar">
          <h1 className="accueil-wordmark">
            <span className="accueil-wordmark-cross" aria-hidden="true">
              +
            </span>{' '}
            Bibliae
          </h1>
          <p className="accueil-topbar-kicker">{hero.kicker}</p>

          <button
            type="button"
            className="accueil-search"
            onClick={() => navigate('/compendium/figures')}
          >
            <SearchIcon size={17} className="accueil-search-icon" />
            <span>Une figure, un lieu, un verset…</span>
          </button>

          <div className="accueil-chips">
            {SEARCH_CHIPS.map((chip) => (
              <button
                key={chip.label}
                type="button"
                className="accueil-chip"
                onClick={() => navigate(chip.path)}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </header>

        <section className="hero">
          <img src={jesusImg} alt="Le Christ" className="hero-portrait" />
          <h2 className="hero-headline">{hero.headline}</h2>
          <div className="hero-divider" aria-hidden="true" />
        </section>

        {activeParcours && readingPosition && readingBook && (
          <button
            type="button"
            className="resume-card"
            onClick={() => navigate(`/bible/${readingBook.id}/${readingPosition.chapter}`)}
          >
            <div className="resume-card-head">
              <span className="resume-card-kicker">Reprendre</span>
              <span className="resume-card-time">{relativeDayLabel(readingPosition.updatedAt)}</span>
            </div>
            <div className="resume-card-title-row">
              <span className="resume-card-title">
                {readingBook.name} {readingPosition.chapter}
              </span>
              <ChevronRightIcon size={16} />
            </div>
            <div className="resume-card-progress-track">
              <div className="resume-card-progress-fill" style={{ width: `${readingPercent}%` }} />
            </div>
            <span className="resume-card-name">{activeParcours.name}</span>
          </button>
        )}

        <nav className="browse-grid">
          <p className="browse-grid-kicker">Parcourir</p>
          <div className="browse-grid-cards">
            <button type="button" className="browse-card" onClick={() => navigate('/compendium/figures')}>
              <PeopleIcon size={22} className="browse-card-icon" />
              <span className="browse-card-title">Compendium</span>
              <span className="browse-card-meta">{figures.length} fiches</span>
            </button>
            <button type="button" className="browse-card" onClick={() => navigate('/bible')}>
              <BookIcon size={22} className="browse-card-icon" />
              <span className="browse-card-title">La Bible</span>
              <span className="browse-card-meta">{BOOKS.length} livres</span>
            </button>
            <button type="button" className="browse-card" onClick={() => navigate('/rosaire')}>
              <RosaireIcon size={22} className="browse-card-icon" />
              <span className="browse-card-title">Le Rosaire</span>
              <span className="browse-card-meta">{mysteryCount} mystères</span>
            </button>
            <button type="button" className="browse-card" onClick={() => navigate('/prier')}>
              <PrierIcon size={22} className="browse-card-icon" />
              <span className="browse-card-title">Prier</span>
              <span className="browse-card-meta">Prières et saints</span>
            </button>
          </div>
        </nav>

        {feast && (
          <LiturgicalCard feast={feast} gospelRef={gospel?.ref ?? undefined} onOpen={() => navigate('/liturgie')} />
        )}

        <section className="figures-section">
          <div className="figures-header">
            <p className="figures-kicker">{hero.figuresKicker}</p>
            <div className="figures-title-row">
              <h2 className="figures-title">{hero.figuresTitle}</h2>
              <button
                type="button"
                className="figures-see-all"
                onClick={() => navigate('/compendium/figures')}
              >
                Tout voir
              </button>
            </div>
            <p className="figures-subtitle">{hero.figuresSubtitle}</p>
          </div>

          <div className="figures-grid">
            {weeklyFigures.map((figure) => (
              <button
                key={figure.id}
                type="button"
                className="figure-card"
                onClick={() => navigate(`/figures/${figure.id}`)}
              >
                <div className="figure-card-image-wrap">
                  <img
                    src={figure.image}
                    alt={figure.name}
                    className="figure-card-image"
                  />
                </div>
                <div className="figure-card-body">
                  <h3 className="figure-card-name">{figure.name}</h3>
                  <p className="figure-card-category">{figure.category}</p>
                  <p className="figure-card-description">{figure.description}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="bibliae">
          <p className="bibliae-kicker">Ce que fait Bibliae</p>
          <p className="bibliae-text">
            <span className="drop-cap">{hero.bibliaeText.charAt(0)}</span>
            {hero.bibliaeText.slice(1)}
          </p>
        </section>

        <footer className="accueil-footer">
          <p className="accueil-footer-wordmark">
            Lux Scripturae
            <br />
            Fides Ecclesiae
          </p>
          <p className="accueil-footer-quote">« Il leur expliqua les Écritures » — Lc 24, 27</p>
          <p className="accueil-footer-links">À propos · Sources · Contact</p>
        </footer>
      </IonContent>
    </IonPage>
  );
};

export default Accueil;
