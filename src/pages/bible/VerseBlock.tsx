import { memo, useMemo, useState } from 'react';
import type { Annotation, HighlightColor } from '../../services/appDataStore';
import { charStyles, type VerseNote, type WordSpan } from '../../services/verseAnnotations';
import { findFigureMentions } from '../../data/figureMentions';
import { ChevronDownIcon } from '../../components/nav/icons';
import { highlightColorInfo } from '../../services/annotationColors';
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
  /** Verset du passage visé par un lien (« ?v=26-38 »), mis en valeur. */
  isFocused?: boolean;
  /** Notes en carte dépliée (extrait, date, « Lire la note ») plutôt qu'en bandeau d'une ligne. */
  notesExpanded?: boolean;
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
  onOpenNote,
  isFocused = false,
  notesExpanded = false
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
    <div className={`verse-block${isFocused ? ' is-focused' : ''}`}>
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

      {notes.map((note) => {
        // Couleur de la note : le surlignage là où finit son passage, dans ce verset.
        const last = note.ranges[note.ranges.length - 1];
        const color = last ? charStyles(annotations, verseText.length).highlight[last.start] : null;
        return (
          <InlineNote key={note.key} note={note} color={color} expanded={notesExpanded} onOpen={() => onOpenNote(note)} />
        );
      })}
    </div>
  );
};

/** Fleuron des notes ; le sélecteur de variante texte évite tout rendu en émoji. */
const FLEURON = '❦︎';
/** Au-delà, l'extrait de la carte dépliée est coupé et « Lire la note » apparaît. */
const EXCERPT_CHARS = 110;

/** « 14 oct. », avec l'année si elle n'est pas l'année en cours. */
function shortNoteDate(iso: string): string {
  const date = new Date(iso);
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', ...(sameYear ? {} : { year: 'numeric' }) });
}

interface InlineNoteProps {
  note: VerseNote;
  color: HighlightColor | null;
  expanded: boolean;
  onOpen: () => void;
}

/**
 * Note sous son verset, en trois états : bandeau d'une ligne teinté de son
 * surlignage, carte (titre, date, durée, extrait de deux lignes, « Lire la
 * note »), puis carte au texte complet. Toucher le bandeau ouvre la carte ;
 * « Déplier » / « Replier » de l'en-tête règle l'état de toutes les notes.
 * Toucher le texte ouvre la feuille de la note (relecture, modification).
 */
const InlineNote: React.FC<InlineNoteProps> = ({ note, color, expanded, onOpen }) => {
  const [view, setView] = useState<'strip' | 'card' | 'full'>(expanded ? 'card' : 'strip');
  // Le bouton de l'en-tête reprend la main sur toutes les notes.
  const [lastExpanded, setLastExpanded] = useState(expanded);
  if (lastExpanded !== expanded) {
    setLastExpanded(expanded);
    setView(expanded ? 'card' : 'strip');
  }

  const style = (color ? { '--note-tint': highlightColorInfo(color).hex } : undefined) as React.CSSProperties | undefined;

  if (view === 'strip') {
    return (
      <button
        type="button"
        className={`verse-note-strip${color ? ' is-tinted' : ''}`}
        style={style}
        onClick={() => setView('card')}
        aria-expanded={false}
      >
        <span className="verse-note-fleuron" aria-hidden="true">
          {FLEURON}
        </span>
        <span className="verse-note-strip-text">{note.text}</span>
      </button>
    );
  }

  const words = note.text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  const isLong = note.text.length > EXCERPT_CHARS;
  const isFull = view === 'full' || !isLong;

  return (
    <div className={`verse-note-card${color ? ' is-tinted' : ''}`} style={style}>
      <div className="verse-note-card-head">
        <span className="verse-note-card-kicker">
          <span className="verse-note-fleuron" aria-hidden="true">
            {FLEURON}
          </span>
          Ma note · {shortNoteDate(note.updatedAt)}
        </span>
        <span className="verse-note-card-time">{minutes} min de lecture</span>
      </div>
      <button type="button" className="verse-note-card-body" onClick={onOpen} aria-label="Ouvrir la note">
        <span className={`verse-note-card-text${isFull ? '' : ' is-clamped'}`}>{note.text}</span>
      </button>
      <button
        type="button"
        className={`verse-note-card-more${view === 'full' ? ' is-open' : ''}`}
        aria-expanded={view === 'full'}
        onClick={() => {
          if (view === 'full') setView(expanded ? 'card' : 'strip');
          else if (isLong) setView('full');
          else onOpen();
        }}
      >
        {view === 'full' ? 'Réduire' : 'Lire la note'}
        <ChevronDownIcon size={10} />
      </button>
    </div>
  );
};

export default memo(VerseBlock);
