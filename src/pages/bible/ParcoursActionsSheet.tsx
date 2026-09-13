import { useState } from 'react';
import { motion } from 'framer-motion';
import { useReadingProgress } from '../../hooks/useReadingProgress';
import { useAccessibility } from '../../hooks/useAccessibility';
import type { Parcours } from '../../hooks/useReadingProgress';
import type { HighlightColor } from '../../services/appDataStore';
import { CloseIcon } from '../../components/nav/icons';
import { tapHaptic } from '../../utils/haptics';
import '../figures/VersePreviewSheet.css';
import './ParcoursActionsSheet.css';

const EASE = [0.22, 0.8, 0.28, 1] as const;
const COLOR_OPTIONS: HighlightColor[] = ['or', 'bleu-encre', 'olive', 'sanguine', 'oxblood'];

type View = 'menu' | 'rename' | 'color' | 'confirm-reset' | 'confirm-delete';

interface ParcoursActionsSheetProps {
  parcours: Parcours;
  onClose: () => void;
}

const ParcoursActionsSheet: React.FC<ParcoursActionsSheetProps> = ({ parcours, onClose }) => {
  const { settings } = useAccessibility();
  const { parcours: allParcours, forParcours, rename, recolor, resetProgress, archive, remove } =
    useReadingProgress();
  const transition = settings.reduceMotion ? { duration: 0 } : { duration: 0.26, ease: EASE };

  const [view, setView] = useState<View>('menu');
  const [name, setName] = useState(parcours.name);
  const usedColors = new Set(allParcours.filter((p) => !p.archived && p.id !== parcours.id).map((p) => p.color));
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
        className="verse-sheet parcours-actions-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={`Actions sur ${parcours.name}`}
        onClick={(e) => e.stopPropagation()}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={transition}
      >
        <div className="verse-sheet-handle" aria-hidden="true" />

        <div className="verse-sheet-header">
          <p className="parcours-actions-title">{parcours.name}</p>
          <button type="button" className="verse-sheet-close" onClick={onClose} aria-label="Fermer">
            <CloseIcon size={18} />
          </button>
        </div>

        {view === 'menu' && (
          <div className="parcours-actions-list">
            <button type="button" className="parcours-actions-item" onClick={() => setView('rename')}>
              Renommer
            </button>
            <button type="button" className="parcours-actions-item" onClick={() => setView('color')}>
              Changer la couleur
            </button>
            <button type="button" className="parcours-actions-item" onClick={() => setView('confirm-reset')}>
              Réinitialiser la progression
            </button>
            <button
              type="button"
              className="parcours-actions-item"
              onClick={() => {
                tapHaptic();
                archive(parcours.id);
                onClose();
              }}
            >
              Archiver
            </button>
            <button
              type="button"
              className="parcours-actions-item parcours-actions-item--danger"
              onClick={() => setView('confirm-delete')}
            >
              Supprimer
            </button>
          </div>
        )}

        {view === 'rename' && (
          <div className="parcours-actions-panel">
            <input
              type="text"
              className="parcours-actions-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              autoFocus
            />
            <button
              type="button"
              className="parcours-actions-confirm"
              disabled={name.trim() === ''}
              onClick={() => {
                tapHaptic();
                rename(parcours.id, name.trim());
                onClose();
              }}
            >
              Enregistrer
            </button>
          </div>
        )}

        {view === 'color' && (
          <div className="parcours-actions-panel">
            <div className="parcours-actions-colors">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`parcours-actions-color parcours-actions-color--${c}${parcours.color === c ? ' is-selected' : ''}`}
                  disabled={usedColors.has(c) && c !== parcours.color}
                  onClick={() => {
                    tapHaptic();
                    recolor(parcours.id, c);
                    onClose();
                  }}
                  aria-label={`Couleur ${c}`}
                />
              ))}
            </div>
          </div>
        )}

        {view === 'confirm-reset' && (
          <div className="parcours-actions-panel">
            <p className="parcours-actions-warning">
              Réinitialiser « {parcours.name} » supprimera les {chapterCount} chapitre
              {chapterCount > 1 ? 's' : ''} marqués lus. Le parcours et sa couleur sont conservés.
            </p>
            <button
              type="button"
              className="parcours-actions-confirm parcours-actions-confirm--danger"
              onClick={() => {
                tapHaptic();
                resetProgress(parcours.id);
                onClose();
              }}
            >
              Réinitialiser la progression
            </button>
          </div>
        )}

        {view === 'confirm-delete' && (
          <div className="parcours-actions-panel">
            <p className="parcours-actions-warning">
              Supprimer « {parcours.name} » effacera définitivement les {chapterCount} chapitre
              {chapterCount > 1 ? 's' : ''} marqués lus dans ce parcours.
            </p>
            <button
              type="button"
              className="parcours-actions-confirm parcours-actions-confirm--danger"
              onClick={() => {
                tapHaptic();
                remove(parcours.id);
                onClose();
              }}
            >
              Supprimer le parcours
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ParcoursActionsSheet;
