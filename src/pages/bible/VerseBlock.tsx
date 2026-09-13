import { useState } from 'react';
import { useAnnotations, type Annotation } from '../../hooks/useAnnotations';
import AnnotatedText from '../../components/annotate/AnnotatedText';
import { ChevronDownIcon } from '../../components/nav/icons';
import { tapHaptic } from '../../utils/haptics';
import './VerseBlock.css';

interface VerseBlockProps {
  sourceId: string;
  verseNumber: number;
  verseText: string;
  onOpenExistingNote: (annotation: Annotation) => void;
}

/**
 * Un verset et, s'il porte des notes, le panneau "Mes notes" juste en dessous.
 * Composant à part (plutôt qu'inline dans BibleChapter) pour pouvoir garder
 * un état local par verset — visibilité du panneau, note dépliée — sans
 * violer les règles des hooks dans un `.map()`.
 */
const VerseBlock: React.FC<VerseBlockProps> = ({ sourceId, verseNumber, verseText, onOpenExistingNote }) => {
  const { forBlock } = useAnnotations();
  const blockAnnotations = forBlock('verse', sourceId, verseNumber);
  const noteAnnotations = blockAnnotations
    .filter((a) => a.note !== null)
    .sort((a, b) => a.target.start - b.target.start);

  const [panelVisible, setPanelVisible] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(() => noteAnnotations[0]?.id ?? null);

  const noteNumbers = new Map(noteAnnotations.map((a, i) => [a.id, i + 1]));

  return (
    <>
      <p
        className="bible-chapter-verse"
        data-annotate-block
        data-annotate-kind="verse"
        data-annotate-source-id={sourceId}
        data-annotate-block-index={verseNumber}
      >
        <span className="bible-chapter-verse-number">{verseNumber}</span>
        <span data-annotate-text>
          <AnnotatedText
            text={verseText}
            annotations={blockAnnotations}
            noteNumbers={noteNumbers}
            onNoteBadgeClick={(id) => {
              tapHaptic();
              setPanelVisible(true);
              setExpandedId(id);
            }}
          />
        </span>
      </p>

      {noteAnnotations.length > 0 && (
        <div className="verse-notes">
          <button
            type="button"
            className="verse-notes-toggle"
            onClick={() => {
              tapHaptic();
              setPanelVisible((value) => !value);
            }}
            aria-expanded={panelVisible}
          >
            <span className="verse-notes-toggle-label">MES NOTES · {noteAnnotations.length}</span>
            <span className="verse-notes-toggle-rule" aria-hidden="true" />
            <span className="verse-notes-toggle-action">{panelVisible ? 'MASQUER' : 'AFFICHER'}</span>
          </button>

          {panelVisible && (
            <div className="verse-notes-list">
              {noteAnnotations.map((annotation, i) => {
                const isExpanded = expandedId === annotation.id;
                const highlight = annotation.style.highlight ?? 'oxblood';
                return (
                  <div
                    key={annotation.id}
                    className={`verse-notes-item verse-notes-item--${highlight}${isExpanded ? ' is-expanded' : ''}`}
                  >
                    <button
                      type="button"
                      className="verse-notes-item-header"
                      onClick={() => {
                        tapHaptic();
                        setExpandedId(isExpanded ? null : annotation.id);
                      }}
                      aria-expanded={isExpanded}
                    >
                      <span className="verse-notes-badge">{i + 1}</span>
                      <span className="verse-notes-label">{annotation.target.quote}</span>
                      {!isExpanded && <span className="verse-notes-preview">{annotation.note}</span>}
                      <ChevronDownIcon size={13} className="verse-notes-chevron" />
                    </button>
                    {isExpanded && (
                      <div className="verse-notes-body">
                        <p className="verse-notes-text">{annotation.note}</p>
                        <button
                          type="button"
                          className="verse-notes-edit"
                          onClick={() => {
                            tapHaptic();
                            onOpenExistingNote(annotation);
                          }}
                        >
                          Modifier
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default VerseBlock;
