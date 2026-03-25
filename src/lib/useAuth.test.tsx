import { renderHook } from '@testing-library/react';
import { useAuth } from './useAuth';
import { AuthContext } from './authContext';
import type { AuthContextValue } from './authContext';

describe('useAuth', () => {
  it('returns context value inside AuthContext.Provider', () => {
    const value: AuthContextValue = {
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    };
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
      ),
    });
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.login).toBe(value.login);
  });

  it('throws error outside provider', () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within AuthProvider');
  });
});
