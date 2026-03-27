import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../test/helpers';
import Dashboard from './Dashboard';
import type { DashboardStats } from '../types/api';

vi.mock('recharts', () => ({
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('../lib/api', () => {
  const getMock = vi.fn();
  return {
    default: { get: getMock },
  };
});

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

import api from '../lib/api';
import { toast } from 'sonner';

const statsData: DashboardStats = {
  totalUsers: 100,
  totalMerchants: 20,
  activeMerchants: 15,
  todayReservations: 50,
  todayRevenue: 5000,
  noShowRate: 0.08,
};

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows skeleton while loading', () => {
    vi.mocked(api.get).mockReturnValue(new Promise(() => {}));
    const { container } = renderWithProviders(<Dashboard />);
    expect(container.querySelectorAll('.skeleton').length).toBeGreaterThan(0);
  });

  it('renders stat cards with values after API resolves', async () => {
    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url === '/api/admin/dashboard') {
        return Promise.resolve({ data: statsData });
      }
      return Promise.resolve({ data: [] });
    });

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument();
    });
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('renders two chart sections', async () => {
    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url === '/api/admin/dashboard') {
        return Promise.resolve({ data: statsData });
      }
      return Promise.resolve({ data: [{ date: '2024-01-01', value: 10 }] });
    });

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Reservations')).toBeInTheDocument();
    });
    expect(screen.getByText('Revenue')).toBeInTheDocument();
  });

  it('shows error toast on API failure', async () => {
    // Dashboard re-throws from .catch() creating unhandled rejections.
    // Suppress at process level so Vitest doesn't report them.
    const handler = () => { /* swallow */ };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).process.on('unhandledRejection', handler);

    vi.mocked(api.get).mockRejectedValue(new Error('network'));

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });

    // Allow microtasks to flush so rejections are caught before removing handler
    await new Promise((r) => setTimeout(r, 50));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).process.off('unhandledRejection', handler);
  });
});
