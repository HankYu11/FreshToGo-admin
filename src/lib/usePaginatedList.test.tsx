import { renderHook, waitFor, act } from '@testing-library/react';
import { usePaginatedList } from './usePaginatedList';
import api from './api';
import { toast } from 'sonner';

vi.mock('./api', () => ({
  default: { get: vi.fn() },
}));

vi.mock('sonner', () => ({
  toast: { error: vi.fn() },
}));

const mockGet = vi.mocked(api.get);

function makePage<T>(content: T[], totalPages = 1) {
  return { data: { content, totalElements: content.length, totalPages, number: 0, size: 20 } };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('usePaginatedList', () => {
  it('returns loading true initially', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => usePaginatedList('/api/items'));
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toEqual([]);
  });

  it('fetches data and returns it', async () => {
    mockGet.mockResolvedValue(makePage([{ id: '1' }, { id: '2' }], 3));
    const { result } = renderHook(() => usePaginatedList('/api/items'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual([{ id: '1' }, { id: '2' }]);
    expect(result.current.totalPages).toBe(3);
    expect(result.current.page).toBe(0);
  });

  it('passes params and pagination to API', async () => {
    mockGet.mockResolvedValue(makePage([]));
    renderHook(() =>
      usePaginatedList('/api/items', { search: 'foo', status: 'active' }, { size: 10 }),
    );

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith('/api/items', expect.objectContaining({
        params: { search: 'foo', status: 'active', page: 0, size: 10 },
      }));
    });
  });

  it('changes page via setPage', async () => {
    mockGet.mockResolvedValue(makePage([{ id: '1' }], 5));
    const { result } = renderHook(() => usePaginatedList('/api/items'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    mockGet.mockResolvedValue(makePage([{ id: '2' }], 5));
    act(() => result.current.setPage(2));

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith('/api/items', expect.objectContaining({
        params: expect.objectContaining({ page: 2 }),
      }));
    });
  });

  it('shows toast on error', async () => {
    const handler = () => {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).process.on('unhandledRejection', handler);

    mockGet.mockRejectedValue(new Error('Network error'));
    renderHook(() =>
      usePaginatedList('/api/items', {}, { errorMessage: 'Failed to load items' }),
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to load items');
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).process.off('unhandledRejection', handler);
  });

  it('uses default error message when none provided', async () => {
    const handler = () => {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).process.on('unhandledRejection', handler);

    mockGet.mockRejectedValue(new Error('fail'));
    renderHook(() => usePaginatedList('/api/items'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to load data');
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).process.off('unhandledRejection', handler);
  });
});
