import { useState } from 'react';
import { motion } from 'framer-motion';
import { CloseIcon } from '../nav/icons';
import '../../pages/figures/VersePreviewSheet.css';
import './NoteSheet.css';

const EASE = [0.22, 0.8, 0.28, 1] as const;
const NOTE_MAX_LENGTH = 2000;

interface NoteSheetProps {
  quote: string;
  initialText: string;
  reduceMotion: boolean;
  onSave: (text: string) => void;
  onClose: () => void;
}

const NoteSheet: React.FC<NoteSheetProps> = ({ quote, initialText, reduceMotion, onSave, onClose }) => {
  const [text, setText] = useState(initialText);
  const transition = reduceMotion ? { duration: 0 } : { duration: 0.26, ease: EASE };
  const truncatedQuote = quote.length > 90 ? `${quote.slice(0, 90)}…` : quote;

  return (
    <motion.div
      className="verse-sheet-backdrop"
      slot="fixed"
      role="presentation"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={transition}
    >
      <motion.div
        className="verse-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Ajouter une note"
        onClick={(e) => e.stopPropagation()}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={transition}
      >
        <div className="verse-sheet-handle" aria-hidden="true" />

        <div className="verse-sheet-header">
          <div>
            <p className="verse-sheet-ref">NOTE</p>
            <p className="verse-sheet-book">« {truncatedQuote} »</p>
          </div>
          <button type="button" className="verse-sheet-close" onClick={onClose} aria-label="Fermer">
            <CloseIcon size={18} />
          </button>
        </div>

        <textarea
          className="note-sheet-textarea"
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, NOTE_MAX_LENGTH))}
          maxLength={NOTE_MAX_LENGTH}
          placeholder="Écrivez votre note…"
          autoFocus
        />

        <div className="verse-sheet-actions">
          <button type="button" className="verse-sheet-read" onClick={() => onSave(text)}>
            Enregistrer
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NoteSheet;
