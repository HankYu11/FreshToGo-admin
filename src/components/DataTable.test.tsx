import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DataTable from './DataTable';
import type { Column } from './DataTable';

interface TestRow {
  id: string;
  name: string;
  age: number;
}

const columns: Column<TestRow>[] = [
  { key: 'name', header: 'Name' },
  { key: 'age', header: 'Age' },
];

const data: TestRow[] = [
  { id: '1', name: 'Alice', age: 30 },
  { id: '2', name: 'Bob', age: 25 },
];

const defaultProps = {
  columns,
  data,
  page: 0,
  totalPages: 3,
  onPageChange: vi.fn(),
  keyExtractor: (r: TestRow) => r.id,
};

describe('DataTable', () => {
  it('renders column headers', () => {
    render(<DataTable {...defaultProps} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
  });

  it('renders row cells using col.key as default', () => {
    render(<DataTable {...defaultProps} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
  });

  it('uses custom render function when provided', () => {
    const customColumns: Column<TestRow>[] = [
      { key: 'name', header: 'Name', render: (row) => <strong>{row.name}!</strong> },
    ];
    render(<DataTable {...defaultProps} columns={customColumns} />);
    expect(screen.getByText('Alice!')).toBeInTheDocument();
  });

  it('shows 10 skeleton rows when loading', () => {
    const { container } = render(<DataTable {...defaultProps} data={[]} loading />);
    const skeletons = container.querySelectorAll('.skeleton');
    // 10 rows × number of columns
    expect(skeletons).toHaveLength(10 * columns.length);
  });

  it('shows "No results found" when empty and not loading', () => {
    render(<DataTable {...defaultProps} data={[]} />);
    expect(screen.getByText('No results found')).toBeInTheDocument();
  });

  it('calls onRowClick with row on click', async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    render(<DataTable {...defaultProps} onRowClick={onRowClick} />);
    await user.click(screen.getByText('Alice'));
    expect(onRowClick).toHaveBeenCalledWith(data[0]);
  });

  it('hides pagination when totalPages <= 1', () => {
    render(<DataTable {...defaultProps} totalPages={1} />);
    expect(screen.queryByText('Previous')).not.toBeInTheDocument();
    expect(screen.queryByText('Next')).not.toBeInTheDocument();
  });

  it('shows "Page X of Y" text', () => {
    render(<DataTable {...defaultProps} page={1} totalPages={3} />);
    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
  });

  it('Previous disabled on page 0, Next calls onPageChange', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<DataTable {...defaultProps} page={0} onPageChange={onPageChange} />);
    expect(screen.getByText('Previous')).toBeDisabled();
    await user.click(screen.getByText('Next'));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('Next disabled on last page', () => {
    render(<DataTable {...defaultProps} page={2} totalPages={3} />);
    expect(screen.getByText('Next')).toBeDisabled();
  });
});
