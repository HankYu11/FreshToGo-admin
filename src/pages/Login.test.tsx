import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/helpers';
import Login from './Login';

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

import { toast } from 'sonner';

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to / when authenticated', () => {
    renderWithProviders(<Login />, { auth: { isAuthenticated: true } });
    expect(screen.queryByText('Sign in')).not.toBeInTheDocument();
  });

  it('renders login form when not authenticated', () => {
    renderWithProviders(<Login />, { auth: { isAuthenticated: false } });
    expect(screen.getByText('FreshToGo Admin')).toBeInTheDocument();
    expect(screen.getByText('Sign in')).toBeInTheDocument();
  });

  it('submitting calls login(email, password)', async () => {
    const user = userEvent.setup();
    const login = vi.fn().mockResolvedValue(undefined);
    renderWithProviders(<Login />, { auth: { isAuthenticated: false, login } });

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'secret');
    await user.click(screen.getByText('Sign in'));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith('test@example.com', 'secret');
    });
  });

  it('shows "Signing in..." while loading', async () => {
    const user = userEvent.setup();
    // login that never resolves
    const login = vi.fn().mockReturnValue(new Promise(() => {}));
    renderWithProviders(<Login />, { auth: { isAuthenticated: false, login } });

    await user.type(screen.getByLabelText('Email'), 'a@b.com');
    await user.type(screen.getByLabelText('Password'), 'pass');
    await user.click(screen.getByText('Sign in'));

    await waitFor(() => {
      expect(screen.getByText('Signing in...')).toBeInTheDocument();
    });
  });

  it('shows error toast on failure', async () => {
    const user = userEvent.setup();
    const login = vi.fn().mockRejectedValue(new Error('fail'));
    renderWithProviders(<Login />, { auth: { isAuthenticated: false, login } });

    await user.type(screen.getByLabelText('Email'), 'a@b.com');
    await user.type(screen.getByLabelText('Password'), 'wrong');
    await user.click(screen.getByText('Sign in'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid email or password');
    });
  });
});
