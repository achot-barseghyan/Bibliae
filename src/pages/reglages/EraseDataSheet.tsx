import { motion } from 'framer-motion';
import { useAccessibility } from '../../hooks/useAccessibility';
import { CloseIcon } from '../../components/nav/icons';
import '../figures/VersePreviewSheet.css';

const EASE = [0.22, 0.61, 0.36, 1] as const;

interface EraseDataSheetProps {
  onChoice: (choice: 'erase' | 'cancel') => void;
}

const EraseDataSheet: React.FC<EraseDataSheetProps> = ({ onChoice }) => {
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
        role="alertdialog"
        aria-modal="true"
        aria-label="Effacer toutes mes données"
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
            <p className="verse-sheet-ref">ACTION IRRÉVERSIBLE</p>
            <p className="verse-sheet-book">Effacer toutes mes données ?</p>
          </div>
          <button
            type="button"
            className="verse-sheet-close"
            onClick={() => onChoice('cancel')}
            aria-label="Annuler"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        <p className="verse-sheet-quote">
          Vos favoris, notes, surlignages, parcours de lecture et réglages seront définitivement
          supprimés de cet appareil. Exportez-les d'abord si vous souhaitez les conserver.
        </p>

        <div className="verse-sheet-actions">
          <button type="button" className="verse-sheet-read" onClick={() => onChoice('cancel')}>
            Annuler
          </button>
          <button type="button" className="verse-sheet-read" onClick={() => onChoice('erase')}>
            Tout effacer
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EraseDataSheet;
