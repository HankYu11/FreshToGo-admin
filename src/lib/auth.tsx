import { useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import api from './api';
import type { LoginData } from '../types/api';
import { AuthContext } from './authContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem('access_token'),
  );

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<LoginData>('/api/admin/login', {
      email,
      password,
    });
    localStorage.setItem('access_token', data.token);
    localStorage.setItem('refresh_token', data.refreshToken);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(async () => {
    await api.post('/api/admin/logout').catch(() => {});
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsAuthenticated(false);
    toast.success('Logged out');
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
