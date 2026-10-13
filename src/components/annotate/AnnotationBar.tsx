import { motion } from 'framer-motion';
import type { HighlightColor } from '../../services/appDataStore';
import { HIGHLIGHT_COLORS } from '../../services/annotationColors';
import './AnnotationBar.css';

const EASE = [0.2, 0.8, 0.2, 1] as const;

interface AnnotationBarProps {
  /** « Jn 1, 4 · 9 mots » */
  contextLabel: string;
  /** Couleur portée par toute la sélection, s'il y en a une seule. */
  activeColor: HighlightColor | null;
  isUnderlined: boolean;
  canErase: boolean;
  reduceMotion: boolean;
  onPickColor: (color: HighlightColor) => void;
  onToggleUnderline: () => void;
  onNote: () => void;
  onErase: () => void;
  onCopy: () => void;
  onShare: () => void;
  onClose: () => void;
}

/**
 * Panneau d'annotation sombre posé en bas du lecteur : référence et
 * fermeture, puis les pastilles (couleurs, souligner, gommer), puis les
 * actions Note / Partager / Copier.
 */
const AnnotationBar: React.FC<AnnotationBarProps> = ({
  contextLabel,
  activeColor,
  isUnderlined,
  canErase,
  reduceMotion,
  onPickColor,
  onToggleUnderline,
  onNote,
  onErase,
  onCopy,
  onShare,
  onClose
}) => {
  const transition = reduceMotion
    ? { duration: 0 }
    : { y: { duration: 0.45, ease: EASE }, opacity: { duration: 0.3 } };

  return (
    <motion.div
      className="annot-bar"
      slot="fixed"
      role="toolbar"
      aria-label="Annoter la sélection"
      initial={{ y: '140%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '140%', opacity: 0 }}
      transition={transition}
    >
      <div className="annot-bar-head">
        <span className="annot-bar-ref">{contextLabel}</span>
        <button type="button" className="annot-bar-close" onClick={onClose} aria-label="Annuler la sélection">
          <svg width="11" height="11" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="annot-bar-swatches">
        {HIGHLIGHT_COLORS.map((color) => (
          <button
            key={color.key}
            type="button"
            className={`annot-bar-swatch${activeColor === color.key ? ' is-active' : ''}`}
            style={{ background: color.hex }}
            onClick={() => onPickColor(color.key)}
            aria-label={`Surligner en ${color.label}`}
            aria-pressed={activeColor === color.key}
          />
        ))}
        <button
          type="button"
          className={`annot-bar-round${isUnderlined ? ' is-active' : ''}`}
          onClick={onToggleUnderline}
          aria-label="Souligner"
          aria-pressed={isUnderlined}
        >
          <svg width="13" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M4 1.5v6a4 4 0 008 0v-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M2.5 14.5h11" stroke="#F0D58E" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
        <button
          type="button"
          className="annot-bar-round"
          onClick={onErase}
          disabled={!canErase}
          aria-label="Effacer le surlignage et le soulignement"
        >
          <svg width="12" height="12" viewBox="0 0 15 15" fill="none" aria-hidden="true">
            <path d="M1 14L14 1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="annot-bar-actions">
        <button type="button" className="annot-bar-action" onClick={onNote}>
          <svg width="11" height="15" viewBox="0 0 11 15" fill="none" aria-hidden="true">
            <path d="M6.5 1H4.6a3.3 3.3 0 000 6.6h1.9" fill="#F0D58E" />
            <path d="M6.5 1v13M9.5 1v13M4.6 1h5.9" stroke="#F0D58E" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Note
        </button>
        <button type="button" className="annot-bar-action" onClick={onShare}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M1.5 10.5l9-9M4 1.5h6.5V8" stroke="#F0D58E" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Partager
        </button>
        <button type="button" className="annot-bar-action" onClick={onCopy}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <rect x="1" y="1" width="8" height="8" rx="1" stroke="#F0D58E" strokeWidth="1.3" />
            <rect x="5" y="5" width="8" height="8" rx="1" stroke="#F0D58E" strokeWidth="1.3" />
          </svg>
          Copier
        </button>
      </div>
    </motion.div>
  );
};

export default AnnotationBar;
