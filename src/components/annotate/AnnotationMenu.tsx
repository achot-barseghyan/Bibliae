import { motion } from 'framer-motion';
import type { HighlightColor } from '../../services/appDataStore';
import { HIGHLIGHT_COLORS } from '../../services/annotationColors';
import { UnderlineIcon, NoteIcon, CopyIcon, TrashIcon } from '../nav/icons';
import './AnnotationMenu.css';

const EASE = [0.22, 0.8, 0.28, 1] as const;

interface AnnotationMenuProps {
  activeColor: HighlightColor | null;
  hasUnderline: boolean;
  hasNote: boolean;
  canDelete: boolean;
  reduceMotion: boolean;
  onPickColor: (color: HighlightColor) => void;
  onToggleUnderline: () => void;
  onNote: () => void;
  onCopy: () => void;
  onDelete: () => void;
}

/**
 * Barre fixe en bas d'écran plutôt qu'un popover flottant au-dessus de la
 * sélection : la sélection native (poignées comprises) reste intacte et
 * visible pendant que ce menu est ouvert, donc pas de collision avec le menu
 * contextuel natif du système (Copier/Partager), qui s'affiche lui près du
 * texte sélectionné, dans une autre zone de l'écran.
 */
const AnnotationMenu: React.FC<AnnotationMenuProps> = ({
  activeColor,
  hasUnderline,
  hasNote,
  canDelete,
  reduceMotion,
  onPickColor,
  onToggleUnderline,
  onNote,
  onCopy,
  onDelete
}) => {
  const transition = reduceMotion ? { duration: 0 } : { duration: 0.18, ease: EASE };

  return (
    <motion.div
      className="annot-menu"
      slot="fixed"
      role="menu"
      aria-label="Annoter la sélection"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={transition}
    >
      <div className="annot-menu-colors">
        {HIGHLIGHT_COLORS.map((color) => (
          <button
            key={color.key}
            type="button"
            className={`annot-menu-swatch${activeColor === color.key ? ' is-active' : ''}`}
            style={{ '--swatch-color': color.rgba } as React.CSSProperties}
            onClick={() => onPickColor(color.key)}
            aria-label={`Surligner (${color.key})`}
            aria-pressed={activeColor === color.key}
          />
        ))}
      </div>

      <span className="annot-menu-divider" aria-hidden="true" />

      <button
        type="button"
        className={`annot-menu-action${hasUnderline ? ' is-active' : ''}`}
        onClick={onToggleUnderline}
        aria-pressed={hasUnderline}
        aria-label="Souligner"
      >
        <UnderlineIcon size={17} />
      </button>
      <button
        type="button"
        className={`annot-menu-action${hasNote ? ' is-active' : ''}`}
        onClick={onNote}
        aria-pressed={hasNote}
        aria-label="Ajouter une note"
      >
        <NoteIcon size={17} />
      </button>
      <button type="button" className="annot-menu-action" onClick={onCopy} aria-label="Copier">
        <CopyIcon size={17} />
      </button>

      {canDelete && (
        <>
          <span className="annot-menu-divider" aria-hidden="true" />
          <button
            type="button"
            className="annot-menu-action annot-menu-action--danger"
            onClick={onDelete}
            aria-label="Supprimer l'annotation"
          >
            <TrashIcon size={17} />
          </button>
        </>
      )}
    </motion.div>
  );
};

export default AnnotationMenu;
