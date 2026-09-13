import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAccessibility } from '../../hooks/useAccessibility';
import FiguresIcon from '../../assets/icons/fluent_people-community-20-regular.svg?react';
import BibleIcon from '../../assets/icons/at-icons_book.svg?react';
import { RosaireIcon, PrierIcon, SettingsIcon, BookmarkIcon, CalendarIcon } from './icons';
import { tapHaptic } from '../../utils/haptics';
import './WorldSheet.css';

type WorldKey = 'compendium' | 'bible' | 'rosaire' | 'prier';

interface World {
  key: WorldKey;
  label: string;
  subtitle: string;
  path: string;
  Icon: React.FC<{ width?: number; height?: number; className?: string }>;
}

const worlds: World[] = [
  {
    key: 'compendium',
    label: 'Compendium',
    subtitle: 'Figures, lieux, frise, Église',
    path: '/compendium/accueil',
    Icon: FiguresIcon
  },
  {
    key: 'bible',
    label: 'La Bible',
    subtitle: '73 livres',
    path: '/bible',
    Icon: BibleIcon
  },
  {
    key: 'rosaire',
    label: 'Le Rosaire',
    subtitle: 'Prière du Rosaire',
    path: '/rosaire',
    Icon: RosaireIcon
  },
  {
    key: 'prier',
    label: 'Prier',
    subtitle: "Prières et intercession des saints",
    path: '/prier',
    Icon: PrierIcon
  }
];

function activeWorldFromPath(pathname: string): WorldKey | null {
  if (pathname.startsWith('/bible')) return 'bible';
  if (pathname.startsWith('/rosaire')) return 'rosaire';
  if (pathname.startsWith('/prier')) return 'prier';
  if (pathname.startsWith('/compendium')) return 'compendium';
  return null;
}

interface WorldSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const EASE = [0.22, 0.61, 0.36, 1] as const;

const WorldSheet: React.FC<WorldSheetProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useAccessibility();
  const activeWorld = activeWorldFromPath(location.pathname);

  const transition = settings.reduceMotion
    ? { duration: 0 }
    : { duration: 0.32, ease: EASE };

  const handleSelect = (world: World) => {
    tapHaptic();
    if (world.key !== activeWorld) {
      navigate(world.path);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="world-sheet-backdrop"
          role="presentation"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={transition}
        >
          <motion.div
            className="world-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Passer à un autre monde"
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
            <div className="world-sheet-handle" aria-hidden="true" />

            <div className="world-sheet-rows">
              {worlds.map((world) => {
                const isActive = world.key === activeWorld;
                return (
                  <button
                    key={world.key}
                    type="button"
                    className={`world-sheet-row${isActive ? ' is-active' : ''}`}
                    onClick={() => handleSelect(world)}
                  >
                    <world.Icon width={22} height={22} className="world-sheet-row-icon" />
                    <span className="world-sheet-row-text">
                      <span className="world-sheet-row-title">{world.label}</span>
                      <span className="world-sheet-row-subtitle">{world.subtitle}</span>
                    </span>
                    {isActive && <span className="world-sheet-row-badge">Ici</span>}
                  </button>
                );
              })}
            </div>

            <div className="world-sheet-divider" aria-hidden="true" />

            <div className="world-sheet-footer-row">
              <button
                type="button"
                className="world-sheet-footer-button"
                onClick={() => {
                  tapHaptic();
                  navigate('/liturgie');
                  onClose();
                }}
              >
                <CalendarIcon size={16} className="world-sheet-footer-icon world-sheet-footer-icon--jour" />
                <span className="world-sheet-footer-label">Liturgie</span>
              </button>

              <button
                type="button"
                className="world-sheet-footer-button"
                onClick={() => {
                  tapHaptic();
                  navigate('/favoris');
                  onClose();
                }}
              >
                <BookmarkIcon size={16} filled className="world-sheet-footer-icon world-sheet-footer-icon--favoris" />
                <span className="world-sheet-footer-label">Favoris</span>
              </button>

              <button
                type="button"
                className="world-sheet-footer-button"
                onClick={() => {
                  tapHaptic();
                  navigate('/reglages');
                  onClose();
                }}
              >
                <SettingsIcon size={16} className="world-sheet-footer-icon world-sheet-footer-icon--reglages" />
                <span className="world-sheet-footer-label">Réglages</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WorldSheet;
