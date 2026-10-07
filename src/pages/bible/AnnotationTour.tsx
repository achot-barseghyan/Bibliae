import { useSpotlightTour } from '../../hooks/useSpotlightTour';
import SpotlightTour, { type TourStep } from '../../components/nav/SpotlightTour';

const STORAGE_KEY = 'bibliae:annotation-tour-seen';

const STEPS: TourStep[] = [
  {
    selector: '.bible-chapter-verses',
    title: 'Annoter le texte',
    text: 'Sélectionnez un passage pour le surligner, le souligner ou lui ajouter une note.',
    shape: 'pill',
    padding: 8
  }
];

/** Tour affiché une fois à la lecture d'un chapitre, pour faire découvrir la sélection de texte. */
const AnnotationTour: React.FC = () => {
  const { isOpen, close } = useSpotlightTour(STORAGE_KEY);
  return <SpotlightTour steps={STEPS} isOpen={isOpen} onClose={close} cardBottom={96} />;
};

export default AnnotationTour;
