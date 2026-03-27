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
  return { data: { items: content, totalItems: content.length, totalPages, page: 0, size: 20 } };
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

  it('shows toast on error and stops loading', async () => {
    mockGet.mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() =>
      usePaginatedList('/api/items', {}, { errorMessage: 'Failed to load items' }),
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to load items');
    });
    expect(result.current.loading).toBe(false);
  });

  it('uses default error message when none provided', async () => {
    mockGet.mockRejectedValue(new Error('fail'));
    const { result } = renderHook(() => usePaginatedList('/api/items'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to load data');
    });
    expect(result.current.loading).toBe(false);
  });
});
