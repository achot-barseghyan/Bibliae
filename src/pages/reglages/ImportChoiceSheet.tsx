import { motion } from 'framer-motion';
import { useAccessibility } from '../../hooks/useAccessibility';
import { CloseIcon } from '../../components/nav/icons';
import '../figures/VersePreviewSheet.css';

const EASE = [0.22, 0.61, 0.36, 1] as const;

interface ImportChoiceSheetProps {
  bookmarksCount: number;
  onChoice: (choice: 'merge' | 'replace' | 'cancel') => void;
}

const ImportChoiceSheet: React.FC<ImportChoiceSheetProps> = ({ bookmarksCount, onChoice }) => {
  const { settings } = useAccessibility();
  const transition = settings.reduceMotion ? { duration: 0 } : { duration: 0.32, ease: EASE };

  return (
    <motion.div
      className="verse-sheet-backdrop"
      role="presentation"
      onClick={() => onChoice('cancel')}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={transition}
    >
      <motion.div
        className="verse-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Importer les données"
        onClick={(e) => e.stopPropagation()}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={transition}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={(_event, info) => {
          if (info.offset.y > 80 || info.velocity.y > 600) {
            onChoice('cancel');
          }
        }}
      >
        <div className="verse-sheet-handle" aria-hidden="true" />

        <div className="verse-sheet-header">
          <div>
            <p className="verse-sheet-ref">FICHIER VALIDE</p>
            <p className="verse-sheet-book">
              {bookmarksCount} favori{bookmarksCount > 1 ? 's' : ''} trouvé{bookmarksCount > 1 ? 's' : ''}
            </p>
          </div>
          <button
            type="button"
            className="verse-sheet-close"
            onClick={() => onChoice('cancel')}
            aria-label="Annuler l'import"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        <p className="verse-sheet-quote">
          Fusionner ajoute ces favoris aux vôtres et conserve vos réglages actuels. Remplacer
          efface vos données actuelles et les remplace par celles du fichier.
        </p>

        <div className="verse-sheet-actions">
          <button type="button" className="verse-sheet-read" onClick={() => onChoice('merge')}>
            Fusionner
          </button>
          <button type="button" className="verse-sheet-read" onClick={() => onChoice('replace')}>
            Remplacer
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ImportChoiceSheet;
