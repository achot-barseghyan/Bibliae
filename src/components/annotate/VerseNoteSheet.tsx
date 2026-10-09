import { useState } from 'react';
import { motion } from 'framer-motion';
import './VerseNoteSheet.css';

const EASE = [0.2, 0.8, 0.2, 1] as const;
const NOTE_MAX_LENGTH = 2000;

interface VerseNoteSheetProps {
  /** « Jn 1, 4 » */
  reference: string;
  quote: string;
  initialText: string;
  reduceMotion: boolean;
  /** Un texte vide supprime la note. */
  onSave: (text: string) => void;
  onClose: () => void;
}

/** Feuille « Note » d'un passage : citation, champ de saisie, enregistrement. */
const VerseNoteSheet: React.FC<VerseNoteSheetProps> = ({
  reference,
  quote,
  initialText,
  reduceMotion,
  onSave,
  onClose
}) => {
  const [text, setText] = useState(initialText);
  const sheetTransition = reduceMotion ? { duration: 0 } : { duration: 0.45, ease: EASE };
  const veilTransition = reduceMotion ? { duration: 0 } : { duration: 0.3 };

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
          <span className="verse-note-sheet-kicker">NOTE · {reference.toUpperCase()}</span>
          <button type="button" className="verse-note-sheet-cancel" onClick={onClose}>
            Annuler
          </button>
        </div>

        <blockquote className="verse-note-sheet-quote">« {quote} »</blockquote>

        <textarea
          className="verse-note-sheet-input"
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, NOTE_MAX_LENGTH))}
          maxLength={NOTE_MAX_LENGTH}
          rows={4}
          placeholder="Votre réflexion, une prière, un lien avec un autre passage…"
          autoFocus
        />

        <button type="button" className="verse-note-sheet-save" onClick={() => onSave(text)}>
          Enregistrer la note
        </button>
      </motion.div>
    </>
  );
};

export default VerseNoteSheet;
