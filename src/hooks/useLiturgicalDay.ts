import { useCallback, useEffect, useState } from 'react';
import { fetchFeastForDate, todayIso, type FeastOfDay } from '../services/liturgicalCalendar';

export interface UseLiturgicalDayResult {
  feast: FeastOfDay | null;
  isLoading: boolean;
  /** `true` si la réponse vient du cache local (réseau indisponible à l'instant du chargement). */
  isStale: boolean;
  /** Date ISO de la dernière mise en cache réussie pour ce jour, `null` si aucune. */
  cachedAt: string | null;
  /** Relance la récupération (bouton « Réessayer »). */
  retry: () => void;
}

export function useLiturgicalDay(date: string = todayIso()): UseLiturgicalDayResult {
  const [state, setState] = useState<{
    feast: FeastOfDay | null;
    isLoading: boolean;
    isStale: boolean;
    cachedAt: string | null;
  }>({ feast: null, isLoading: true, isStale: false, cachedAt: null });
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, isLoading: true }));

    fetchFeastForDate(date).then((result) => {
      if (cancelled) return;
      setState({ feast: result.feast, isLoading: false, isStale: result.isStale, cachedAt: result.cachedAt });
    });

    return () => {
      cancelled = true;
    };
  }, [date, retryToken]);

  const retry = useCallback(() => setRetryToken((t) => t + 1), []);

  return { ...state, retry };
}
