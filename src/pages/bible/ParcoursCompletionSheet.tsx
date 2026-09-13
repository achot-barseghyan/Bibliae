import { motion } from 'framer-motion';
import { useReadingProgress } from '../../hooks/useReadingProgress';
import { useAccessibility } from '../../hooks/useAccessibility';
import type { Parcours } from '../../hooks/useReadingProgress';
import { CloseIcon } from '../../components/nav/icons';
import { tapHaptic } from '../../utils/haptics';
import '../figures/VersePreviewSheet.css';
import './ParcoursCompletionSheet.css';

const EASE = [0.22, 0.8, 0.28, 1] as const;

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));
}

interface ParcoursCompletionSheetProps {
  parcours: Parcours;
  onClose: () => void;
  onCreateNew: () => void;
}

/** Confirmation sobre affichée une seule fois à l'achèvement d'un parcours — pas de confettis. */
const ParcoursCompletionSheet: React.FC<ParcoursCompletionSheetProps> = ({ parcours, onClose, onCreateNew }) => {
  const { settings } = useAccessibility();
  const { forParcours, archive } = useReadingProgress();
  const transition = settings.reduceMotion ? { duration: 0 } : { duration: 0.26, ease: EASE };
  const chapterCount = forParcours(parcours.id).length;

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
        className="verse-sheet parcours-completion-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={`${parcours.name} achevé`}
        onClick={(e) => e.stopPropagation()}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={transition}
      >
        <div className="verse-sheet-handle" aria-hidden="true" />

        <div className="verse-sheet-header">
          <p className="parcours-completion-kicker">Parcours achevé</p>
          <button type="button" className="verse-sheet-close" onClick={onClose} aria-label="Fermer">
            <CloseIcon size={18} />
          </button>
        </div>

        <p className="parcours-completion-name">{parcours.name}</p>

        <dl className="parcours-completion-stats">
          <div className="parcours-completion-stat">
            <dt>Commencé</dt>
            <dd>{formatDate(parcours.createdAt)}</dd>
          </div>
          <div className="parcours-completion-stat">
            <dt>Achevé</dt>
            <dd>{parcours.completedAt ? formatDate(parcours.completedAt) : '—'}</dd>
          </div>
          <div className="parcours-completion-stat">
            <dt>Chapitres lus</dt>
            <dd>{chapterCount}</dd>
          </div>
        </dl>

        <div className="parcours-completion-actions">
          <button
            type="button"
            className="parcours-completion-button"
            onClick={() => {
              tapHaptic();
              archive(parcours.id);
              onClose();
            }}
          >
            Archiver ce parcours
          </button>
          <button
            type="button"
            className="parcours-completion-button parcours-completion-button--primary"
            onClick={() => {
              tapHaptic();
              onCreateNew();
            }}
          >
            Créer un nouveau parcours
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ParcoursCompletionSheet;
