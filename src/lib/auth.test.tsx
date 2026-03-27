import { renderHook, act } from '@testing-library/react';
import { AuthProvider } from './auth';
import { useAuth } from './useAuth';

vi.mock('./api', () => ({
  default: {
    post: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import api from './api';
import { toast } from 'sonner';

function renderAuth() {
  return renderHook(() => useAuth(), {
    wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
  });
}

describe('AuthProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('not authenticated when no token in localStorage', () => {
    const { result } = renderAuth();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('authenticated when token exists', () => {
    localStorage.setItem('access_token', 'tok123');
    const { result } = renderAuth();
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('login() posts, stores tokens, sets isAuthenticated', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { token: 'access1', refreshToken: 'refresh1' },
    });
    const { result } = renderAuth();
    await act(() => result.current.login('a@b.com', 'pass'));
    expect(api.post).toHaveBeenCalledWith('/api/admin/login', { email: 'a@b.com', password: 'pass' });
    expect(localStorage.getItem('access_token')).toBe('access1');
    expect(localStorage.getItem('refresh_token')).toBe('refresh1');
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('logout() calls server, clears tokens, sets isAuthenticated=false, shows toast', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { message: 'Logged out successfully' } });
    localStorage.setItem('access_token', 'tok');
    localStorage.setItem('refresh_token', 'ref');
    const { result } = renderAuth();
    await act(async () => result.current.logout());
    expect(api.post).toHaveBeenCalledWith('/api/admin/logout');
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(toast.success).toHaveBeenCalledWith('Logged out');
  });

  it('logout() still clears tokens if server call fails', async () => {
    vi.mocked(api.post).mockRejectedValue(new Error('network'));
    localStorage.setItem('access_token', 'tok');
    localStorage.setItem('refresh_token', 'ref');
    const { result } = renderAuth();
    await act(async () => result.current.logout());
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(toast.success).toHaveBeenCalledWith('Logged out');
  });
});
