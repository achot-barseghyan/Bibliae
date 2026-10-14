import { figureDetails, type FigureDetail } from '../../data/figureDetails';
import { REMOTE_CONTENT_PATHS } from '../../config/remoteContent';
import { useRemoteContent } from '../useRemoteContent';
import { mergeRecordWithAdditions } from '../../utils/remoteMerge';

/**
 * Fiches détaillées : celles embarquées, corrigées par figure-details.json,
 * plus celles que ce fichier **ajoute** (figures sans fiche dans l'app),
 * pour publier une biographie sans nouvelle version.
 */
export function useRemoteFigureDetails(): Record<string, FigureDetail> {
  return useRemoteContent<Record<string, FigureDetail>, Record<string, Partial<FigureDetail>>>(
    REMOTE_CONTENT_PATHS.figureDetails,
    figureDetails,
    mergeRecordWithAdditions
  );
}
