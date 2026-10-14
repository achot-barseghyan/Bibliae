import { useCallback, useEffect, useState } from 'react';
import { API_BASE, parseParish, type Parish, type RawParish } from './useParishSearch';
import { MESSESINFO_ENABLED, fetchMasses, type Mass } from '../services/messesInfo';

const OPEN_CHURCH_ORIGIN = 'https://open-church.io';

export interface ParishChurch {
  name: string;
  latitude: number | null;
  longitude: number | null;
}

/** nokey : pas de clé messes.info ; none : la paroisse n'y est pas référencée. */
export type MassStatus = 'nokey' | 'none' | 'loading' | 'ok' | 'error';

interface ParishDetailState {
  parish: Parish | null;
  churches: ParishChurch[];
  status: 'loading' | 'ok' | 'error';
  masses: Mass[];
  massStatus: MassStatus;
  loadedAt: Date | null;
  retryMasses: () => void;
}

async function fetchParish(id: string, signal: AbortSignal): Promise<Parish> {
  const response = await fetch(`${API_BASE}/${encodeURIComponent(id)}`, {
    headers: { Accept: 'application/ld+json' },
    signal
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return parseParish((await response.json()) as RawParish);
}

/** Nom et coordonnées d'une église (pour l'itinéraire) ; une erreur n'empêche pas la fiche. */
async function fetchChurch(ref: string, signal: AbortSignal): Promise<ParishChurch | null> {
  try {
    const response = await fetch(`${OPEN_CHURCH_ORIGIN}${ref}`, {
      headers: { Accept: 'application/ld+json' },
      signal
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { name?: string; latitude?: number; longitude?: number };
    if (!data.name) return null;
    return {
      name: data.name,
      latitude: typeof data.latitude === 'number' ? data.latitude : null,
      longitude: typeof data.longitude === 'number' ? data.longitude : null
    };
  } catch {
    return null;
  }
}

export function useParishDetail(id: string | undefined): ParishDetailState {
  const [parish, setParish] = useState<Parish | null>(null);
  const [churches, setChurches] = useState<ParishChurch[]>([]);
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [masses, setMasses] = useState<Mass[]>([]);
  const [massStatus, setMassStatus] = useState<MassStatus>('loading');
  const [loadedAt, setLoadedAt] = useState<Date | null>(null);
  const [massAttempt, setMassAttempt] = useState(0);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    setStatus('loading');
    setParish(null);
    setChurches([]);
    fetchParish(id, controller.signal)
      .then(async (p) => {
        setParish(p);
        setStatus('ok');
        // Les premières églises suffisent pour la fiche et l'itinéraire.
        const list = await Promise.all(p.churchRefs.slice(0, 8).map((ref) => fetchChurch(ref, controller.signal)));
        if (!controller.signal.aborted) setChurches(list.filter((c): c is ParishChurch => c !== null));
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.error('Échec du chargement de la paroisse', err);
        setStatus('error');
      });
    return () => controller.abort();
  }, [id]);

  const messesinfoId = parish?.messesinfoId ?? null;

  useEffect(() => {
    if (!parish) return;
    if (!MESSESINFO_ENABLED) {
      setMassStatus('nokey');
      return;
    }
    if (!messesinfoId) {
      setMassStatus('none');
      return;
    }
    const controller = new AbortController();
    setMassStatus('loading');
    setMasses([]);
    fetchMasses(messesinfoId, controller.signal)
      .then((list) => {
        setMasses(list);
        setLoadedAt(new Date());
        setMassStatus('ok');
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.error('Échec du chargement des horaires messes.info', err);
        setMassStatus('error');
      });
    return () => controller.abort();
  }, [parish, messesinfoId, massAttempt]);

  const retryMasses = useCallback(() => setMassAttempt((n) => n + 1), []);

  return { parish, churches, status, masses, massStatus, loadedAt, retryMasses };
}
