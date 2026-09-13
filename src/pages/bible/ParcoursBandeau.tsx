import { useReadingProgress } from '../../hooks/useReadingProgress';
import { ChevronDownIcon } from '../../components/nav/icons';
import { tapHaptic } from '../../utils/haptics';
import './ParcoursBandeau.css';

interface ParcoursBandeauProps {
  onOpenSelector: () => void;
}

/** Bandeau du parcours actif, présent sur la grille des chapitres et la liste des livres — seul point d'entrée vers le suivi de lecture. */
const ParcoursBandeau: React.FC<ParcoursBandeauProps> = ({ onOpenSelector }) => {
  const { activeParcours } = useReadingProgress();
  if (!activeParcours) return null;

  return (
    <button
      type="button"
      className="parcours-bandeau"
      onClick={() => {
        tapHaptic();
        onOpenSelector();
      }}
      aria-haspopup="dialog"
    >
      <span className={`parcours-bandeau-dot parcours-bandeau-dot--${activeParcours.color}`} aria-hidden="true" />
      <span className="parcours-bandeau-text">
        <span className="parcours-bandeau-label">Parcours actif</span>
        <span className="parcours-bandeau-name">{activeParcours.name}</span>
      </span>
      <ChevronDownIcon size={12} className="parcours-bandeau-chevron" />
    </button>
  );
};

export default ParcoursBandeau;
