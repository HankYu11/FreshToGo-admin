import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactElement } from 'react';
import { AuthContext } from '../lib/authContext';
import type { AuthContextValue } from '../lib/authContext';

const defaultAuth: AuthContextValue = {
  isAuthenticated: true,
  login: vi.fn(),
  logout: vi.fn(),
};

interface Options extends Omit<RenderOptions, 'wrapper'> {
  auth?: Partial<AuthContextValue>;
  initialEntries?: string[];
}

export function renderWithProviders(
  ui: ReactElement,
  { auth, initialEntries = ['/'], ...rest }: Options = {},
) {
  const authValue = { ...defaultAuth, ...auth };
  return render(ui, {
    wrapper: ({ children }) => (
      <MemoryRouter initialEntries={initialEntries}>
        <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
      </MemoryRouter>
    ),
    ...rest,
  });
}
