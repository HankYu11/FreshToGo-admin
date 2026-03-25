import { renderHook, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useDetail } from './useDetail';
import api from './api';
import { toast } from 'sonner';

vi.mock('./api', () => ({
  default: { get: vi.fn() },
}));

vi.mock('sonner', () => ({
  toast: { error: vi.fn() },
}));

const mockGet = vi.mocked(api.get);

function wrapper({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter initialEntries={['/items/42']}>
      <Routes>
        <Route path="/items/:id" element={children} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useDetail', () => {
  it('returns loading true initially', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useDetail('/api/items'), { wrapper });
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
  });

  it('fetches data by id from params', async () => {
    mockGet.mockResolvedValue({ data: { id: '42', name: 'Test' } });
    const { result } = renderHook(() => useDetail('/api/items'), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual({ id: '42', name: 'Test' });
    expect(result.current.id).toBe('42');
    expect(mockGet).toHaveBeenCalledWith('/api/items/42', expect.objectContaining({
      signal: expect.any(AbortSignal),
    }));
  });

  it('exposes setData to update entity', async () => {
    mockGet.mockResolvedValue({ data: { id: '42', name: 'Old' } });
    const { result } = renderHook(() => useDetail<{ id: string; name: string }>('/api/items'), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setData({ id: '42', name: 'Updated' }));
    expect(result.current.data).toEqual({ id: '42', name: 'Updated' });
  });

  it('shows toast on error', async () => {
    const handler = () => {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).process.on('unhandledRejection', handler);

    mockGet.mockRejectedValue(new Error('Not found'));
    renderHook(() => useDetail('/api/items', { errorMessage: 'Failed to load item' }), { wrapper });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to load item');
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).process.off('unhandledRejection', handler);
  });

  it('uses default error message', async () => {
    const handler = () => {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).process.on('unhandledRejection', handler);

    mockGet.mockRejectedValue(new Error('fail'));
    renderHook(() => useDetail('/api/items'), { wrapper });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to load data');
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).process.off('unhandledRejection', handler);
  });
});
