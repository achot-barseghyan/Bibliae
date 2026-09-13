import { motion } from 'framer-motion';
import { MYSTERY_ORDER, type MysterySetKey } from '../../data/rosary';
import { useRemoteRosary } from '../../hooks/content/useRemoteRosary';
import { useAccessibility } from '../../hooks/useAccessibility';
import './MysteryPickerSheet.css';

const EASE = [0.22, 0.61, 0.36, 1] as const;

interface MysteryPickerSheetProps {
  active: MysterySetKey;
  onSelect: (key: MysterySetKey) => void;
  onClose: () => void;
}

const MysteryPickerSheet: React.FC<MysteryPickerSheetProps> = ({ active, onSelect, onClose }) => {
  const { settings } = useAccessibility();
  const { mysterySets } = useRemoteRosary();
  const transition = settings.reduceMotion ? { duration: 0 } : { duration: 0.32, ease: EASE };

  return (
    <motion.div
      className="mystery-sheet-backdrop"
      role="presentation"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={transition}
    >
      <motion.div
        className="mystery-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Choisir la série de mystères"
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
            onClose();
          }
        }}
      >
        <div className="mystery-sheet-handle" aria-hidden="true" />

        <div className="mystery-sheet-rows">
          {MYSTERY_ORDER.map((key) => {
            const set = mysterySets[key];
            const isActive = key === active;
            return (
              <button
                key={key}
                type="button"
                className={`mystery-sheet-row${isActive ? ' is-active' : ''}`}
                onClick={() => {
                  onSelect(key);
                  onClose();
                }}
              >
                <span className="mystery-sheet-row-text">
                  <span className="mystery-sheet-row-title">{set.label}</span>
                  <span className="mystery-sheet-row-subtitle">{set.days}</span>
                </span>
                {isActive && <span className="mystery-sheet-row-badge">Ici</span>}
              </button>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MysteryPickerSheet;
