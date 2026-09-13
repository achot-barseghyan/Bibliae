import { ACCUEIL_HERO, FEATURED_FIGURES, type AccueilHero, type FeaturedFigure } from '../../data/accueil';
import { REMOTE_CONTENT_PATHS } from '../../config/remoteContent';
import { useRemoteContent } from '../useRemoteContent';
import { mergeArrayById, mergeObject, type Override } from '../../utils/remoteMerge';

interface RemoteAccueilContent {
  hero?: Partial<AccueilHero>;
  featuredFigures?: Array<Override<FeaturedFigure>>;
}

interface AccueilContent {
  hero: AccueilHero;
  featuredFigures: FeaturedFigure[];
}

const LOCAL_ACCUEIL_CONTENT: AccueilContent = { hero: ACCUEIL_HERO, featuredFigures: FEATURED_FIGURES };

function mergeAccueilContent(local: AccueilContent, remote: RemoteAccueilContent | null): AccueilContent {
  if (!remote) return local;
  return {
    hero: mergeObject(local.hero, remote.hero),
    featuredFigures: mergeArrayById(local.featuredFigures, remote.featuredFigures)
  };
}

export function useRemoteAccueil(): AccueilContent {
  return useRemoteContent<AccueilContent, RemoteAccueilContent>(
    REMOTE_CONTENT_PATHS.accueil,
    LOCAL_ACCUEIL_CONTENT,
    mergeAccueilContent
  );
}
