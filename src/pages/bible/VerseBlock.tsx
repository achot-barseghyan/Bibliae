import { memo, useMemo } from 'react';
import type { Annotation, HighlightColor } from '../../services/appDataStore';
import { charStyles, type VerseNote, type WordSpan } from '../../services/verseAnnotations';
import { findFigureMentions } from '../../data/figureMentions';
import { NoteIcon } from '../../components/nav/icons';
import '../../components/annotate/highlightColors.css';
import './VerseBlock.css';

interface VerseBlockProps {
  bookId: string;
  chapter: number;
  verseNumber: number;
  verseText: string;
  words: WordSpan[];
  /** Annotations de ce verset (styles et notes). */
  annotations: Annotation[];
  /** Portion sélectionnée de ce verset, en caractères. */
  selectedRange: { start: number; end: number } | null;
  /** Notes dont le passage se termine dans ce verset (affichées dessous). */
  notes: VerseNote[];
  onOpenNote: (note: VerseNote) => void;
}

interface Segment {
  start: number;
  end: number;
  word: number;
  link: string | null;
  selected: boolean;
  highlight: HighlightColor | null;
  underline: boolean;
}

/**
 * Découpe le verset en segments de style homogène. Chaque mot porte
 * `data-v`/`data-w` (repérage par `useWordSelection`) ; les espaces entre
 * deux mots d'un même passage prennent le même fond, pour un surlignage
 * continu.
 */
function buildSegments(
  text: string,
  words: WordSpan[],
  annotations: Annotation[],
  links: Array<{ start: number; end: number; target: string }>,
  selectedRange: { start: number; end: number } | null
): Segment[] {
  const length = text.length;
  const wordAtChar: number[] = new Array(length).fill(-1);
  words.forEach((w, index) => {
    for (let i = w.start; i < w.end; i++) wordAtChar[i] = index;
  });
  const linkAtChar: Array<string | null> = new Array(length).fill(null);
  links.forEach((l) => {
    for (let i = Math.max(0, l.start); i < Math.min(length, l.end); i++) linkAtChar[i] = l.target;
  });
  const styles = charStyles(annotations, length);

  const segments: Segment[] = [];
  for (let i = 0; i < length; i++) {
    const segment: Segment = {
      start: i,
      end: i + 1,
      word: wordAtChar[i],
      link: linkAtChar[i],
      selected: !!selectedRange && i >= selectedRange.start && i < selectedRange.end,
      highlight: styles.highlight[i],
      underline: styles.underline[i]
    };
    const previous = segments[segments.length - 1];
    if (
      previous &&
      previous.word === segment.word &&
      previous.link === segment.link &&
      previous.selected === segment.selected &&
      previous.highlight === segment.highlight &&
      previous.underline === segment.underline
    ) {
      previous.end = i + 1;
    } else {
      segments.push(segment);
    }
  }
  return segments;
}

/**
 * Un verset annotable au mot près, et sous lui les notes dont le passage s'y
 * termine. Mémoïsé : sélectionner des mots ne redessine que les versets
 * dont la sélection change.
 */
const VerseBlock: React.FC<VerseBlockProps> = ({
  bookId,
  chapter,
  verseNumber,
  verseText,
  words,
  annotations,
  selectedRange,
  notes,
  onOpenNote
}) => {
  // Noms des figures bibliques, cliquables vers leur fiche.
  const links = useMemo(
    () =>
      findFigureMentions(verseText, bookId, chapter).map((m) => ({
        start: m.start,
        end: m.end,
        target: m.figureId
      })),
    [verseText, bookId, chapter]
  );

  const segments = useMemo(
    () => buildSegments(verseText, words, annotations, links, selectedRange),
    [verseText, words, annotations, links, selectedRange]
  );

  const isWholeVerseSelected =
    !!selectedRange &&
    words.length > 0 &&
    selectedRange.start <= words[0].start &&
    selectedRange.end >= words[words.length - 1].end;

  return (
    <div className="verse-block">
      <p className="bible-chapter-verse">
        <span
          className={`bible-chapter-verse-number verse-number-target${isWholeVerseSelected ? ' is-selected' : ''}`}
          data-verse-num={verseNumber}
          role="button"
          aria-label={`Sélectionner le verset ${verseNumber}`}
        >
          {verseNumber}
        </span>
        {segments.map((segment) => {
          const className = [
            segment.highlight ? `vw-hl vw-hl--${segment.highlight}` : '',
            segment.underline ? 'vw-ul' : '',
            segment.selected ? 'vw-sel' : '',
            segment.link ? 'annot-link' : ''
          ]
            .filter(Boolean)
            .join(' ');
          const content = verseText.slice(segment.start, segment.end);
          if (segment.word === -1 && !className) return content;
          return (
            <span
              key={segment.start}
              className={className || undefined}
              data-v={segment.word === -1 ? undefined : verseNumber}
              data-w={segment.word === -1 ? undefined : segment.word}
              data-link={segment.link ?? undefined}
            >
              {content}
            </span>
          );
        })}
      </p>

      {notes.map((note) => (
        <button key={note.key} type="button" className="verse-note-card" onClick={() => onOpenNote(note)}>
          <NoteIcon size={13} className="verse-note-card-icon" />
          <span className="verse-note-card-text">{note.text}</span>
        </button>
      ))}
    </div>
  );
};

export default memo(VerseBlock);
