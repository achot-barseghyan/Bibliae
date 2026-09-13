import {
  MYSTERY_SETS,
  PRAYERS,
  type MysterySet,
  type MysterySetKey,
  type PrayerKey
} from '../../data/rosary';
import { REMOTE_CONTENT_PATHS } from '../../config/remoteContent';
import { useRemoteContent } from '../useRemoteContent';
import { mergeRecord } from '../../utils/remoteMerge';

interface RosaryPrayer {
  name: string;
  text: string;
}

interface RemoteRosaryContent {
  mysterySets?: Partial<Record<MysterySetKey, Partial<MysterySet>>>;
  prayers?: Partial<Record<PrayerKey, Partial<RosaryPrayer>>>;
}

interface RosaryContent {
  mysterySets: Record<MysterySetKey, MysterySet>;
  prayers: Record<PrayerKey, RosaryPrayer>;
}

const LOCAL_ROSARY_CONTENT: RosaryContent = { mysterySets: MYSTERY_SETS, prayers: PRAYERS };

function mergeRosaryContent(
  local: RosaryContent,
  remote: RemoteRosaryContent | null
): RosaryContent {
  if (!remote) return local;
  return {
    mysterySets: mergeRecord(local.mysterySets, remote.mysterySets) as Record<MysterySetKey, MysterySet>,
    prayers: mergeRecord(local.prayers, remote.prayers) as Record<PrayerKey, RosaryPrayer>
  };
}

export function useRemoteRosary(): RosaryContent {
  return useRemoteContent<RosaryContent, RemoteRosaryContent>(
    REMOTE_CONTENT_PATHS.rosary,
    LOCAL_ROSARY_CONTENT,
    mergeRosaryContent
  );
}
