import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from './api';
import type { PaginatedResponse } from '../types/api';

export function usePaginatedList<T>(
  endpoint: string,
  params: Record<string, string | number | undefined> = {},
  options: { size?: number; errorMessage?: string } = {},
) {
  const size = options.size ?? 20;
  const errorMessage = options.errorMessage ?? 'Failed to load data';

  const [page, setPage] = useState(0);
  const [fetchState, setFetchState] = useState<{
    data: T[];
    totalPages: number;
    key: string;
  } | null>(null);

  const paramsKey = JSON.stringify(params);
  const fetchKey = `${page}:${paramsKey}`;

  useEffect(() => {
    const controller = new AbortController();
    api
      .get<PaginatedResponse<T>>(endpoint, {
        params: { ...params, page, size },
        signal: controller.signal,
      })
      .then(({ data: res }) => {
        setFetchState({ data: res.content, totalPages: res.totalPages, key: fetchKey });
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          toast.error(errorMessage);
          setFetchState((prev) => prev ? { ...prev, key: fetchKey } : { data: [], totalPages: 0, key: fetchKey });
        }
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, page, size, paramsKey, errorMessage]);

  const loading = fetchState === null || fetchState.key !== fetchKey;

  return {
    data: fetchState?.data ?? [],
    loading,
    page,
    totalPages: fetchState?.totalPages ?? 0,
    setPage,
  };
}
