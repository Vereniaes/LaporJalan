/* Load public reports; keep the last successful response during a failed refresh.
Todo:
-> cancel requests on unmount and expose retry state
*/
import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchPublicReports, PublicReportsSnapshot } from './data';

export function usePublicReports() {
  const [snapshot, setSnapshot] = useState<PublicReportsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const current = useRef<AbortController>();
  const refresh = useCallback(async () => {
    current.current?.abort();
    const controller = new AbortController();
    current.current = controller;
    setLoading(true);
    setError(false);
    const timeout = window.setTimeout(() => controller.abort(), 15_000);
    try {
      const result = await fetchPublicReports(controller.signal);
      if (current.current === controller) setSnapshot(result);
    } catch {
      if (current.current === controller) setError(true);
    } finally {
      window.clearTimeout(timeout);
      if (current.current === controller) setLoading(false);
    }
  }, []);
  useEffect(() => {
    void refresh();
    return () => {
      current.current?.abort();
      current.current = undefined;
    };
  }, [refresh]);
  return { snapshot, loading, error, refresh };
}
