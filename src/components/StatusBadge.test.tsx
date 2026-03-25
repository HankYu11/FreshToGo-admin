import { render, screen } from '@testing-library/react';
import StatusBadge from './StatusBadge';

describe('StatusBadge', () => {
  it('renders status label with underscores replaced by spaces', () => {
    render(<StatusBadge status="PICKED_UP" />);
    expect(screen.getByText('PICKED UP')).toBeInTheDocument();
  });

  it('applies correct color from defaultColors for known status', () => {
    render(<StatusBadge status="CONFIRMED" />);
    const badge = screen.getByText('CONFIRMED');
    expect(badge).toHaveStyle({ color: '#2563eb' });
  });

  it('falls back to gray for unknown status', () => {
    render(<StatusBadge status="UNKNOWN" />);
    const badge = screen.getByText('UNKNOWN');
    expect(badge).toHaveStyle({ color: '#6b7280' });
  });

  it('uses custom colorMap when provided', () => {
    render(<StatusBadge status="CUSTOM" colorMap={{ CUSTOM: '#ff0000' }} />);
    const badge = screen.getByText('CUSTOM');
    expect(badge).toHaveStyle({ color: '#ff0000' });
  });
});
