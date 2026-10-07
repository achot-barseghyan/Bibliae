import { useSpotlightTour } from './useSpotlightTour';

const STORAGE_KEY = 'bibliae:navigation-tour-seen';

export function useNavigationTour() {
  return useSpotlightTour(STORAGE_KEY);
}
