import { useSpotlightTour } from '../../hooks/useSpotlightTour';
import SpotlightTour, { type TourStep } from '../../components/nav/SpotlightTour';

const STORAGE_KEY = 'bibliae:chapter-menu-tour-seen';

const STEPS: TourStep[] = [
  {
    // Le premier chapitre plutôt que toute la grille : celle-ci est plus
    // haute que l'écran et passait sous la carte du tour.
    selector: '.bible-book-body .bible-chapter-grid > :first-child',
    title: 'Sélectionner des chapitres',
    text: 'Appui long sur un chapitre pour le sélectionner, puis glissez sans lever le doigt pour en prendre plusieurs et les marquer lus d’un geste. Avec un seul chapitre : note, favori, partage.',
    shape: 'pill',
    padding: 6,
    scrollIntoView: true
  }
];

/** Tour affiché une fois sur la grille des chapitres, pour faire découvrir le menu d'appui long. */
const ChapterMenuTour: React.FC = () => {
  const { isOpen, close } = useSpotlightTour(STORAGE_KEY);
  return <SpotlightTour steps={STEPS} isOpen={isOpen} onClose={close} cardBottom={24} />;
};

export default ChapterMenuTour;
