import { useSpotlightTour } from '../../hooks/useSpotlightTour';
import SpotlightTour, { type TourStep } from '../../components/nav/SpotlightTour';

const STORAGE_KEY = 'bibliae:chapter-menu-tour-seen';

const STEPS: TourStep[] = [
  {
    selector: '.bible-chapter-grid',
    title: 'Les actions d’un chapitre',
    text: 'Appui long sur un chapitre pour le marquer lu ou en cours, lui ajouter une note, le mettre en favori, le partager ou tout réinitialiser — sans l’ouvrir.',
    shape: 'pill',
    padding: 8
  }
];

/** Tour affiché une fois sur la grille des chapitres, pour faire découvrir le menu d'appui long. */
const ChapterMenuTour: React.FC = () => {
  const { isOpen, close } = useSpotlightTour(STORAGE_KEY);
  return <SpotlightTour steps={STEPS} isOpen={isOpen} onClose={close} cardBottom={24} />;
};

export default ChapterMenuTour;
