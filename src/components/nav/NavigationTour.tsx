import { useNavigationTour } from '../../hooks/useNavigationTour';
import SpotlightTour, { type TourStep } from './SpotlightTour';

const STEPS: TourStep[] = [
  {
    selector: '.app-tab-bar',
    title: 'Le Compendium',
    text: "Figures, Lieux, Frise et Église sont les quatre sections du Compendium, l'index de la Bible.",
    shape: 'pill',
    padding: 0
  },
  {
    selector: '.app-tab-bar-cross',
    title: 'Changer de monde',
    text: 'Ce bouton ouvre La Bible et le Rosaire, les deux autres grands espaces de l’application.',
    shape: 'circle',
    padding: 6
  }
];

const NavigationTour: React.FC = () => {
  const { isOpen, close } = useNavigationTour();
  return <SpotlightTour steps={STEPS} isOpen={isOpen} onClose={close} />;
};

export default NavigationTour;
