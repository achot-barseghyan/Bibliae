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
 * Barre d'annotation flottante, en deux étages : la pastille de contexte
 * (référence, Copier, Partager, fermer) au-dessus de la pilule d'outils
 * (couleurs, Souligner, Note, Effacer).
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
      <div className="annot-bar-context">
        <span className="annot-bar-ref">{contextLabel}</span>
        <span className="annot-bar-context-divider" aria-hidden="true" />
        <button type="button" className="annot-bar-context-action" onClick={onCopy}>
          Copier
        </button>
        <button type="button" className="annot-bar-context-action" onClick={onShare}>
          Partager
        </button>
        <button type="button" className="annot-bar-close" onClick={onClose} aria-label="Annuler la sélection">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="annot-bar-tools">
        <div className="annot-bar-colors">
          {HIGHLIGHT_COLORS.map((color) => (
            <button
              key={color.key}
              type="button"
              className={`annot-bar-swatch${activeColor === color.key ? ' is-active' : ''}`}
              onClick={() => onPickColor(color.key)}
              aria-label={`Surligner en ${color.label}`}
              aria-pressed={activeColor === color.key}
            >
              <span className="annot-bar-swatch-dot" style={{ background: color.hex }} />
            </button>
          ))}
        </div>

        <span className="annot-bar-tools-divider" aria-hidden="true" />

        <div className="annot-bar-actions">
          <button
            type="button"
            className={`annot-bar-action${isUnderlined ? ' is-active' : ''}`}
            onClick={onToggleUnderline}
            aria-pressed={isUnderlined}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 1.5v6a4 4 0 008 0v-6" stroke="#F7F1E3" strokeWidth="1.3" strokeLinecap="round" />
              <path d="M2.5 14.5h11" stroke="#E2BE6E" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="annot-bar-action-label">Souligner</span>
          </button>

          <button type="button" className="annot-bar-action" onClick={onNote}>
            <svg width="15" height="16" viewBox="0 0 15 16" fill="none" aria-hidden="true">
              <path d="M1.5 1.5h12v9.4L10 14.5H1.5v-13z" stroke="#F7F1E3" strokeWidth="1.3" strokeLinejoin="round" />
              <path d="M4.5 5.5h6M4.5 8.5h4" stroke="#F7F1E3" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <span className="annot-bar-action-label">Note</span>
          </button>

          {canErase && (
            <button type="button" className="annot-bar-action annot-bar-action--erase" onClick={onErase}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M6 14.5h8M2.2 10.3l6.6-6.6a1.5 1.5 0 012.1 0l2.4 2.4a1.5 1.5 0 010 2.1L8 13.5H5.4l-3.2-3.2z"
                  stroke="#E8A8A2"
                  strokeWidth="1.3"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="annot-bar-action-label">Effacer</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AnnotationBar;
