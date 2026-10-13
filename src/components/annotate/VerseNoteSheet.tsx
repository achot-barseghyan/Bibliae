import { useState } from 'react';
import { motion } from 'framer-motion';
import type { HighlightColor } from '../../services/appDataStore';
import { HIGHLIGHT_COLORS, highlightColorInfo } from '../../services/annotationColors';
import './VerseNoteSheet.css';

const EASE = [0.22, 0.8, 0.28, 1] as const;
const NOTE_MAX_LENGTH = 2000;
/** Fleuron des notes ; le sélecteur de variante texte évite tout rendu en émoji. */
const FLEURON = '❦︎';

interface VerseNoteSheetProps {
  /** « Gn 9, 27 » */
  reference: string;
  quote: string;
  initialText: string;
  /** Surlignage actuel du passage, s'il est uniforme. */
  initialColor: HighlightColor | null;
  /** Note existante : la feuille s'ouvre en relecture, datée de sa dernière modification. */
  updatedAt?: string;
  reduceMotion: boolean;
  /** `color` : surlignage à poser sur le passage (null = ne pas y toucher). */
  onSave: (text: string, color: HighlightColor | null) => void;
  onDelete?: () => void;
  onShare?: (text: string) => void;
  onShowAll?: () => void;
  onClose: () => void;
}

/** « 12 octobre 2026 » */
function formatNoteDate(iso: string): string {
  const date = new Date(iso);
  const formatted = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  return date.getDate() === 1 ? formatted.replace(/^1 /, '1er ') : formatted;
}

/**
 * Feuille « Note » d'un passage. Deux temps : la relecture d'une note
 * existante (texte, Modifier / Partager / Supprimer), et l'écriture
 * (citation teintée du surlignage choisi, papier ligné, enregistrement).
 */
const VerseNoteSheet: React.FC<VerseNoteSheetProps> = ({
  reference,
  quote,
  initialText,
  initialColor,
  updatedAt,
  reduceMotion,
  onSave,
  onDelete,
  onShare,
  onShowAll,
  onClose
}) => {
  const isExisting = initialText.trim().length > 0;
  const [mode, setMode] = useState<'read' | 'write'>(isExisting && updatedAt ? 'read' : 'write');
  const [text, setText] = useState(initialText);
  // Nouvelle note : surlignée par défaut (première couleur), comme l'annonce la feuille.
  const [color, setColor] = useState<HighlightColor | null>(initialColor ?? (isExisting ? null : HIGHLIGHT_COLORS[0].key));
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const canSave = text.trim().length > 0;

  const sheetTransition = reduceMotion ? { duration: 0 } : { duration: 0.56, ease: EASE };
  const veilTransition = reduceMotion ? { duration: 0 } : { duration: 0.42 };
  const quoteStyle = color ? { background: highlightColorInfo(color).hex } : undefined;

  return (
    <>
      <motion.div
        className="verse-note-veil"
        slot="fixed"
        role="presentation"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={veilTransition}
      />
      <motion.div
        className="verse-note-sheet"
        slot="fixed"
        role="dialog"
        aria-modal="true"
        aria-label={`Note sur ${reference}`}
        initial={{ y: '105%' }}
        animate={{ y: 0 }}
        exit={{ y: '105%' }}
        transition={sheetTransition}
      >
        <div className="verse-note-sheet-handle" aria-hidden="true" />

        <div className="verse-note-sheet-header">
          <span className="verse-note-sheet-title">
            <span className="verse-note-fleuron" aria-hidden="true">
              {FLEURON}
            </span>
            <span className="verse-note-sheet-kicker">Note · {reference}</span>
          </span>
          {mode === 'read' && updatedAt ? (
            <span className="verse-note-sheet-date">{formatNoteDate(updatedAt)}</span>
          ) : (
            <button
              type="button"
              className="verse-note-sheet-cancel"
              onClick={() => (isExisting && updatedAt ? setMode('read') : onClose())}
            >
              Annuler
            </button>
          )}
        </div>

        <blockquote className="verse-note-sheet-quote" style={quoteStyle}>
          <span className="verse-note-sheet-quote-mark" aria-hidden="true">
            «
          </span>
          {quote}
        </blockquote>

        {mode === 'read' ? (
          <>
            <p className="verse-note-sheet-lined verse-note-sheet-text">{initialText}</p>

            <div className="verse-note-sheet-actions">
              <button type="button" className="verse-note-action verse-note-action--primary" onClick={() => setMode('write')}>
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M9.5 1.8l2.7 2.7L4.8 12H2v-2.8l7.5-7.4z" stroke="#F0D58E" strokeWidth="1.3" strokeLinejoin="round" />
                </svg>
                Modifier
              </button>
              <button type="button" className="verse-note-action" onClick={() => onShare?.(initialText)}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M1.5 10.5l9-9M4 1.5h6.5V8" stroke="#B5892E" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Partager
              </button>
              <button
                type="button"
                className={`verse-note-action verse-note-action--danger${isConfirmingDelete ? ' is-confirming' : ''}`}
                onClick={() => {
                  if (isConfirmingDelete) onDelete?.();
                  else setIsConfirmingDelete(true);
                }}
              >
                {!isConfirmingDelete && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                    <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                )}
                {isConfirmingDelete ? 'Confirmer' : 'Supprimer'}
              </button>
            </div>

            {onShowAll && (
              <button type="button" className="verse-note-sheet-all" onClick={onShowAll}>
                Notes du chapitre
                <span className="verse-note-sheet-all-arrow" aria-hidden="true">
                  →
                </span>
              </button>
            )}
          </>
        ) : (
          <>
            <div className="verse-note-sheet-colors" role="radiogroup" aria-label="Surlignage du passage">
              <span className="verse-note-sheet-colors-label">Surlignage</span>
              <div className="verse-note-sheet-swatches">
                {HIGHLIGHT_COLORS.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    role="radio"
                    aria-checked={color === c.key}
                    aria-label={c.label}
                    className={`verse-note-swatch${color === c.key ? ' is-active' : ''}`}
                    // Un second appui sur la couleur choisie la retire : note sans surlignage.
                    onClick={() => setColor(color === c.key ? null : c.key)}
                  >
                    <span style={{ background: c.hex }} />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              className="verse-note-sheet-lined verse-note-sheet-input"
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, NOTE_MAX_LENGTH))}
              maxLength={NOTE_MAX_LENGTH}
              placeholder="Votre réflexion, une prière, un lien avec un autre passage…"
              autoFocus
            />

            <div className="verse-note-sheet-meta">
              <span className="verse-note-sheet-count">
                {text.length.toLocaleString('fr-FR')} / {NOTE_MAX_LENGTH.toLocaleString('fr-FR')}
              </span>
              <span className="verse-note-sheet-hint">
                {color ? 'Le passage sera surligné.' : 'Sans surlignage.'}
              </span>
            </div>

            <button
              type="button"
              className="verse-note-sheet-save"
              disabled={!canSave}
              onClick={() => onSave(text, color)}
            >
              <span className="verse-note-sheet-save-shine" aria-hidden="true" />
              <span className="verse-note-sheet-save-label">Enregistrer la note</span>
              <span className="verse-note-sheet-save-fleuron" aria-hidden="true">
                {FLEURON}
              </span>
            </button>
          </>
        )}
      </motion.div>
    </>
  );
};

export default VerseNoteSheet;
