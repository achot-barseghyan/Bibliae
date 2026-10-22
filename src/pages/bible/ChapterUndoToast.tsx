import { motion } from 'framer-motion';
import { CloseIcon } from '../../components/nav/icons';
import './ChapterSelectionBar.css';

interface ChapterUndoToastProps {
  message: string;
  reduceMotion: boolean;
  onUndo: () => void;
  onClose: () => void;
}

/** Toast de 6 s après un marquage groupé : seule la dernière action est annulable. */
const ChapterUndoToast: React.FC<ChapterUndoToastProps> = ({ message, reduceMotion, onUndo, onClose }) => (
  <motion.div
    className="chapter-undo-toast"
    slot="fixed"
    role="status"
    aria-live="polite"
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 16 }}
    transition={reduceMotion ? { duration: 0 } : { duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
  >
    <span className="chapter-undo-toast-text">{message}</span>
    <button type="button" className="chapter-undo-toast-undo" onClick={onUndo}>
      Annuler
    </button>
    <button type="button" className="chapter-undo-toast-close" onClick={onClose} aria-label="Fermer">
      <CloseIcon size={16} />
    </button>
  </motion.div>
);

export default ChapterUndoToast;
