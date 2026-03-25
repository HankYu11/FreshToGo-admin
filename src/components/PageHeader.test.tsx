import { render, screen } from '@testing-library/react';
import PageHeader from './PageHeader';

describe('PageHeader', () => {
  it('renders the title', () => {
    render(<PageHeader title="Users" />);
    expect(screen.getByText('Users')).toBeInTheDocument();
  });

  it('renders children as action buttons', () => {
    render(
      <PageHeader title="Merchants">
        <button>Create</button>
        <button>Export</button>
      </PageHeader>,
    );
    expect(screen.getByText('Create')).toBeInTheDocument();
    expect(screen.getByText('Export')).toBeInTheDocument();
  });

  it('does not render actions container when no children', () => {
    const { container } = render(<PageHeader title="Dashboard" />);
    const header = container.firstElementChild!;
    expect(header.children).toHaveLength(1);
  });
});
