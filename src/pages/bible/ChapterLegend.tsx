import type { HighlightColor } from '../../services/appDataStore';
import './BibleBook.css';

interface ChapterLegendProps {
  /** Couleur du parcours actif, pour la case « Lu ». */
  readColor?: HighlightColor;
}

/** Légende des grilles de chapitres (page d'un livre, Psautier). */
const ChapterLegend: React.FC<ChapterLegendProps> = ({ readColor }) => (
  <div className="bible-book-legend">
    <span className="bible-book-legend-item">
      <span className={`bible-book-legend-swatch bible-book-legend-swatch--read${readColor ? ` is-read--${readColor}` : ''}`} />
      Lu
    </span>
    <span className="bible-book-legend-item">
      <span className="bible-book-legend-swatch bible-book-legend-swatch--progress" />
      En cours
    </span>
    <span className="bible-book-legend-item">
      <span className="bible-book-legend-swatch">
        <span className="bible-chapter-cell-other" />
      </span>
      Autre parcours
    </span>
    <span className="bible-book-legend-item">
      <span className="bible-book-legend-swatch">
        <span className="bible-chapter-cell-note" />
      </span>
      Note
    </span>
  </div>
);

export default ChapterLegend;
