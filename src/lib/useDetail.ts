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

  useEffect(() => {
    const controller = new AbortController();
    api
      .get<T>(`${baseEndpoint}/${id}`, { signal: controller.signal })
      .then(({ data: result }) => setData(result))
      .catch(() => {
        if (!controller.signal.aborted) toast.error(errorMessage);
      });
    return () => controller.abort();
  }, [baseEndpoint, id, errorMessage]);

  return { data, setData, loading: data === null, id: id! };
}
