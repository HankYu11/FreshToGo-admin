import { render, screen } from '@testing-library/react';
import StatCard from './StatCard';

describe('StatCard', () => {
  it('renders title and string value', () => {
    render(<StatCard title="Revenue" value="$1,000" />);
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('$1,000')).toBeInTheDocument();
  });

  it('renders title and numeric value', () => {
    render(<StatCard title="Users" value={42} />);
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('shows skeleton when loading=true and hides value', () => {
    const { container } = render(<StatCard title="Users" value={42} loading />);
    expect(container.querySelector('.skeleton')).toBeInTheDocument();
    expect(screen.queryByText('42')).not.toBeInTheDocument();
  });

  it('does not show skeleton when loading=false', () => {
    const { container } = render(<StatCard title="Users" value={42} loading={false} />);
    expect(container.querySelector('.skeleton')).not.toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });
});
