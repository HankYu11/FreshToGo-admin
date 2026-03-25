import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import api from './api';

export function useDetail<T>(
  baseEndpoint: string,
  options: { errorMessage?: string } = {},
) {
  const { id } = useParams<{ id: string }>();
  const errorMessage = options.errorMessage ?? 'Failed to load data';
  const [data, setData] = useState<T | null>(null);
  const [fetchState, setFetchState] = useState<{ settled: boolean; key: string }>({
    settled: false,
    key: '',
  });

  const fetchKey = `${baseEndpoint}:${id}`;

  useEffect(() => {
    const controller = new AbortController();
    api
      .get<T>(`${baseEndpoint}/${id}`, { signal: controller.signal })
      .then(({ data: result }) => {
        setData(result);
        setFetchState({ settled: true, key: fetchKey });
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          toast.error(errorMessage);
          setFetchState({ settled: true, key: fetchKey });
        }
      });
    return () => controller.abort();
  }, [baseEndpoint, id, errorMessage, fetchKey]);

  const loading = !fetchState.settled || fetchState.key !== fetchKey;

  return { data, setData, loading, id: id! };
}
