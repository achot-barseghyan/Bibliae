import { figureDetails, type FigureDetail } from '../../data/figureDetails';
import { REMOTE_CONTENT_PATHS } from '../../config/remoteContent';
import { useRemoteContent } from '../useRemoteContent';
import { mergeRecord } from '../../utils/remoteMerge';

export function useRemoteFigureDetails(): Record<string, FigureDetail> {
  return useRemoteContent<Record<string, FigureDetail>, Record<string, Partial<FigureDetail>>>(
    REMOTE_CONTENT_PATHS.figureDetails,
    figureDetails,
    mergeRecord
  );
}
