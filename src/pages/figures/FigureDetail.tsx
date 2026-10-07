import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { IonContent, IonPage } from '@ionic/react';
import { useFigures } from '../../hooks/useFigures';
import { useBookmarks } from '../../hooks/useBookmarks';
import { useRemoteFigureDetails } from '../../hooks/content/useRemoteFigureDetails';
import { useRemoteCouncils } from '../../hooks/content/useRemoteCouncils';
import type { ScriptureRef } from '../../data/figureDetails';
import type { Council } from '../../data/councils';
import { ChevronLeftIcon, BookmarkIcon, SearchIcon, SparkleIcon, TreeIcon, CompassIcon } from '../../components/nav/icons';
import ScriptureRefChip from './ScriptureRefChip';
import VersePreviewSheet from './VersePreviewSheet';
import CouncilPreviewSheet from './CouncilPreviewSheet';
import { tapHaptic } from '../../utils/haptics';
import './FigureDetail.css';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

const TESTAMENT_LABELS: Record<'ancien' | 'nouveau', string> = {
  ancien: 'Ancien Testament',
  nouveau: 'Nouveau Testament'
};

const FigureDetail: React.FC = () => {
  const navigate = useNavigate();
  const { figureId = '' } = useParams<{ figureId: string }>();
  const { figures } = useFigures();
  const figureDetails = useRemoteFigureDetails();
  const councils = useRemoteCouncils();
  const { isBookmarked, toggle } = useBookmarks();
  const [activeRef, setActiveRef] = useState<ScriptureRef | null>(null);
  const [activeCouncil, setActiveCouncil] = useState<Council | null>(null);

  const figure = figures.find((f) => f.id === figureId);

  if (!figure) {
    return (
      <IonPage>
        <IonContent fullscreen className="figure-detail-content">
          <header className="figure-detail-header">
            <button
              type="button"
              className="figure-detail-header-button"
              onClick={() => {
                tapHaptic();
                navigate(-1);
              }}
              aria-label="Retour"
            >
              <ChevronLeftIcon size={22} />
            </button>
          </header>
          <p className="figure-detail-not-found">Figure introuvable.</p>
        </IonContent>
      </IonPage>
    );
  }

  const detail = figureDetails[figure.id];
  const figureBookmarkKey = `figure:${figure.id}`;

  const reperes =
    detail?.reperes ??
    [
      { label: 'Époque', value: figure.epoque },
      { label: 'Testament', value: TESTAMENT_LABELS[figure.testament] },
      { label: 'Rôle', value: figure.role },
      { label: 'Date', value: figure.date },
      { label: 'Livres', value: figure.books.join(' · ') },
      { label: 'Occurrences', value: `${figure.mentions} mentions` }
    ];

  // Sections dont l'existence dépend du contenu déjà rédigé pour cette figure.
  const sections: { title: string; content: React.ReactNode }[] = [];

  sections.push({
    title: 'Biographie',
    content: detail?.biography ? (
      detail.biography.map((paragraph, i) => (
        <p className="figure-detail-paragraph" key={i}>
          {paragraph.map((segment, j) =>
            segment.type === 'text' ? (
              <span key={j}>{segment.text}</span>
            ) : (
              <ScriptureRefChip key={j} refData={segment.ref} onOpen={setActiveRef} />
            )
          )}
        </p>
      ))
    ) : (
      <p className="figure-detail-placeholder-note">Cette fiche est en cours de rédaction.</p>
    )
  });

  if (detail?.timeline) {
    sections.push({
      title: 'Chronologie',
      content: (
        <div className="figure-detail-timeline">
          {detail.timeline.map((entry, i) => (
            <div className="figure-detail-timeline-entry" key={i}>
              <SparkleIcon size={11} className="figure-detail-timeline-bullet" />
              <p className="figure-detail-timeline-date">{entry.dateLabel}</p>
              <p className="figure-detail-timeline-text">{entry.text}</p>
            </div>
          ))}
        </div>
      )
    });
  }

  sections.push({
    title: 'Généalogie et relations',
    content: (
      <div className="figure-detail-placeholder-box">
        <TreeIcon />
        <p className="figure-detail-placeholder-label">Arbre généalogique · à venir</p>
      </div>
    )
  });

  sections.push({
    title: 'Lieux de vie',
    content: (
      <>
        <div className="figure-detail-map-card">
          <span className="figure-detail-map-tick figure-detail-map-tick--tl" aria-hidden="true" />
          <span className="figure-detail-map-tick figure-detail-map-tick--tr" aria-hidden="true" />
          <span className="figure-detail-map-tick figure-detail-map-tick--bl" aria-hidden="true" />
          <span className="figure-detail-map-tick figure-detail-map-tick--br" aria-hidden="true" />
          <CompassIcon className="figure-detail-map-icon" />
          <div className="figure-detail-map-divider">
            <span className="figure-detail-map-divider-label">Carte · à venir</span>
          </div>
          <p className="figure-detail-map-message">
            Cette carte n'est pas encore disponible.
            <br />
            Nous y travaillons.
          </p>
        </div>
        {detail?.locationsSummary && (
          <p className="figure-detail-paragraph">{detail.locationsSummary}</p>
        )}
      </>
    )
  });

  if (detail?.churchTeaching) {
    sections.push({
      title: "Que dit l'Église ?",
      content: (
        <>
          <p className="figure-detail-paragraph">{detail.churchTeaching.text}</p>
          <div className="figure-detail-council-chips">
            {detail.churchTeaching.councilIds.map((id) => {
              const council = councils.find((c) => c.id === id);
              if (!council) return null;
              return (
                <button
                  type="button"
                  className="council-chip"
                  key={id}
                  onClick={() => setActiveCouncil(council)}
                >
                  {council.display}
                </button>
              );
            })}
          </div>
        </>
      )
    });
  }

  return (
    <IonPage>
      <IonContent fullscreen className="figure-detail-content">
      <header className="figure-detail-header">
        <button
          type="button"
          className="figure-detail-header-button"
          onClick={() => {
            tapHaptic();
            navigate(-1);
          }}
          aria-label="Retour"
        >
          <ChevronLeftIcon size={22} />
        </button>
        <div className="figure-detail-header-actions">
          <button
            type="button"
            className="figure-detail-header-button"
            onClick={() => toggle(figureBookmarkKey)}
            aria-pressed={isBookmarked(figureBookmarkKey)}
            aria-label="Ajouter aux favoris"
          >
            <BookmarkIcon size={19} filled={isBookmarked(figureBookmarkKey)} />
          </button>
          <button type="button" className="figure-detail-header-button" aria-label="Rechercher">
            <SearchIcon size={19} />
          </button>
        </div>
      </header>

      <div className="figure-detail-hero">
        <p className="figure-detail-kicker">
          {TESTAMENT_LABELS[figure.testament]} · {figure.epoque}
        </p>
        <h1 className="figure-detail-title">{figure.name}</h1>
        <p className="figure-detail-subtitle">{detail?.alternateNames ?? figure.originalName}</p>
      </div>

      <div className="figure-detail-portrait">
        <img src={figure.image} alt={figure.name} />
      </div>

      <div className="figure-detail-divider">
        <span className="figure-detail-divider-label">
          <SparkleIcon size={11} /> Repères
        </span>
      </div>

      <div className="figure-detail-reperes">
        {reperes.map((r) => (
          <div className="figure-detail-repere-row" key={r.label}>
            <span className="figure-detail-repere-label">{r.label}</span>
            <span className="figure-detail-repere-value">{r.value}</span>
          </div>
        ))}
      </div>

      {sections.map((section, i) => (
        <section className="figure-detail-section" key={section.title}>
          <h2 className="figure-detail-section-title">
            <span className="figure-detail-section-number">{ROMAN[i]}.</span> {section.title}
          </h2>
          {section.content}
        </section>
      ))}

      {detail?.relatedFigures && (
        <div className="figure-detail-related">
          <p className="figure-detail-related-kicker">Figures liées</p>
          <div className="figure-detail-related-grid">
            {detail.relatedFigures.map((related) => {
              const relatedFigure = figures.find((f) => f.id === related.figureId);
              if (!relatedFigure) return null;
              return (
                <button
                  type="button"
                  className="figure-detail-related-card"
                  key={related.figureId}
                  onClick={() => {
                    tapHaptic();
                    navigate(`/figures/${related.figureId}`);
                  }}
                >
                  <span className="figure-detail-related-avatar">
                    <img src={relatedFigure.image} alt="" />
                  </span>
                  <span className="figure-detail-related-name">{relatedFigure.name}</span>
                  <span className="figure-detail-related-role">{related.relation}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <footer className="figure-detail-footer">
        <p className="figure-detail-footer-wordmark">
          Lux Scripturae
          <br />
          Fides Ecclesiae
        </p>
        <p className="figure-detail-footer-quote">« Il leur expliqua les Écritures » — Lc 24, 27</p>
        <p className="figure-detail-footer-links">À propos · Sources · Contact</p>
      </footer>

      <AnimatePresence>
        {activeRef && <VersePreviewSheet refData={activeRef} onClose={() => setActiveRef(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {activeCouncil && (
          <CouncilPreviewSheet council={activeCouncil} onClose={() => setActiveCouncil(null)} />
        )}
      </AnimatePresence>
      </IonContent>
    </IonPage>
  );
};

export default FigureDetail;
