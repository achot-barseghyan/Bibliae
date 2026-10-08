import { Fragment } from 'react';
import type { Annotation } from '../../services/appDataStore';
import './highlightColors.css';

/** Portion du texte cliquable (ex. nom d'une figure), par décalages de caractères. */
export interface TextLink {
  start: number;
  end: number;
  target: string;
}

interface AnnotatedTextProps {
  text: string;
  annotations: Annotation[];
  /** Numéro (1, 2, 3…) affiché en exposant pour chaque annotation qui porte une note. */
  noteNumbers?: Map<string, number>;
  onNoteBadgeClick?: (annotationId: string) => void;
  /** Liens posés par-dessus le texte, sans en changer le contenu : les
   * décalages des annotations (calculés sur le texte brut) restent valides. */
  links?: TextLink[];
  onLinkClick?: (target: string) => void;
}

interface Run {
  start: number;
  end: number;
  highlight: string | null;
  underline: boolean;
  noteAnnotationId: string | null;
  link: string | null;
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
function buildRuns(text: string, annotations: Annotation[], links: TextLink[]): Run[] {
  const boundaries = new Set<number>([0, text.length]);
  const addRange = (start: number, end: number) => {
    boundaries.add(Math.max(0, Math.min(text.length, start)));
    boundaries.add(Math.max(0, Math.min(text.length, end)));
  };
  annotations.forEach((a) => addRange(a.target.start, a.target.end));
  links.forEach((l) => addRange(l.start, l.end));
  const points = Array.from(boundaries).sort((a, b) => a - b);

  const runs: Run[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i];
    const end = points[i + 1];
    if (start === end) continue;

    const link = links.find((l) => l.start <= start && l.end >= end)?.target ?? null;
    const covering = annotations.filter((a) => a.target.start <= start && a.target.end >= end);
    if (covering.length === 0) {
      runs.push({ start, end, highlight: null, underline: false, noteAnnotationId: null, link });
      continue;
    }

    const mostRecent = covering.reduce((latest, a) => (a.updatedAt > latest.updatedAt ? a : latest));
    const underline = covering.some((a) => a.style.underline);
    const withNote = covering.filter((a) => a.note !== null);
    const noteAnnotationId =
      withNote.length > 0
        ? withNote.reduce((latest, a) => (a.updatedAt > latest.updatedAt ? a : latest)).id
        : null;
    runs.push({ start, end, highlight: mostRecent.style.highlight, underline, noteAnnotationId, link });
  }
  return runs;
}

const AnnotatedText: React.FC<AnnotatedTextProps> = ({
  text,
  annotations,
  noteNumbers,
  onNoteBadgeClick,
  links = [],
  onLinkClick
}) => {
  if (annotations.length === 0 && links.length === 0) {
    return <>{text}</>;
  }

  const runs = buildRuns(text, annotations, links);

  return (
    <>
      {runs.map((run, i) => {
        const raw = text.slice(run.start, run.end);
        const slice = run.link ? (
          <span
            className="annot-link"
            role="link"
            tabIndex={0}
            onClick={(e) => {
              // Un appui long sert à sélectionner du texte pour l'annoter :
              // on ne suit pas le lien si une sélection est en cours.
              if (window.getSelection()?.isCollapsed === false) return;
              e.stopPropagation();
              onLinkClick?.(run.link as string);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onLinkClick?.(run.link as string);
            }}
          >
            {raw}
          </span>
        ) : (
          raw
        );
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
