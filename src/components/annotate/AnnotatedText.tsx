import { Fragment } from 'react';
import type { Annotation } from '../../services/appDataStore';
import './highlightColors.css';

interface AnnotatedTextProps {
  text: string;
  annotations: Annotation[];
  /** Numéro (1, 2, 3…) affiché en exposant pour chaque annotation qui porte une note. */
  noteNumbers?: Map<string, number>;
  onNoteBadgeClick?: (annotationId: string) => void;
}

interface Run {
  start: number;
  end: number;
  highlight: string | null;
  underline: boolean;
  noteAnnotationId: string | null;
}

/**
 * Découpe `text` en runs selon les annotations qui le couvrent. Pour une
 * portion couverte par plusieurs annotations, la couleur de surlignage
 * affichée est celle de l'annotation la plus récemment modifiée ; le
 * soulignage s'applique dès qu'une des annotations couvrantes le porte
 * (les deux annotations restent en mémoire, seul l'affichage tranche). Même
 * logique pour la pastille de note : celle de l'annotation-avec-note la plus
 * récemment modifiée parmi celles qui couvrent le run.
 */
function buildRuns(text: string, annotations: Annotation[]): Run[] {
  const boundaries = new Set<number>([0, text.length]);
  annotations.forEach((a) => {
    boundaries.add(Math.max(0, Math.min(text.length, a.target.start)));
    boundaries.add(Math.max(0, Math.min(text.length, a.target.end)));
  });
  const points = Array.from(boundaries).sort((a, b) => a - b);

  const runs: Run[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i];
    const end = points[i + 1];
    if (start === end) continue;

    const covering = annotations.filter((a) => a.target.start <= start && a.target.end >= end);
    if (covering.length === 0) {
      runs.push({ start, end, highlight: null, underline: false, noteAnnotationId: null });
      continue;
    }

    const mostRecent = covering.reduce((latest, a) => (a.updatedAt > latest.updatedAt ? a : latest));
    const underline = covering.some((a) => a.style.underline);
    const withNote = covering.filter((a) => a.note !== null);
    const noteAnnotationId =
      withNote.length > 0
        ? withNote.reduce((latest, a) => (a.updatedAt > latest.updatedAt ? a : latest)).id
        : null;
    runs.push({ start, end, highlight: mostRecent.style.highlight, underline, noteAnnotationId });
  }
  return runs;
}

const AnnotatedText: React.FC<AnnotatedTextProps> = ({ text, annotations, noteNumbers, onNoteBadgeClick }) => {
  if (annotations.length === 0) {
    return <>{text}</>;
  }

  const runs = buildRuns(text, annotations);

  return (
    <>
      {runs.map((run, i) => {
        const slice = text.slice(run.start, run.end);
        if (!run.highlight && !run.underline) {
          return <Fragment key={i}>{slice}</Fragment>;
        }
        const className = [
          'annot-run',
          run.highlight ? `annot-run--${run.highlight}` : '',
          run.underline ? 'annot-run--underline' : ''
        ]
          .filter(Boolean)
          .join(' ');
        const badgeNumber = run.noteAnnotationId ? noteNumbers?.get(run.noteAnnotationId) : undefined;
        return (
          <span key={i} className={className}>
            {slice}
            {badgeNumber !== undefined && (
              <button
                type="button"
                className="annot-run-note-badge"
                onClick={(e) => {
                  e.stopPropagation();
                  onNoteBadgeClick?.(run.noteAnnotationId as string);
                }}
                aria-label={`Voir la note ${badgeNumber}`}
              >
                {badgeNumber}
              </button>
            )}
          </span>
        );
      })}
    </>
  );
};

export default AnnotatedText;
