import { render, screen, fireEvent, act } from '@testing-library/react';
import Filters from './Filters';
import type { FilterDropdown } from './Filters';

describe('Filters', () => {
  it('renders search input with placeholder', () => {
    render(<Filters searchPlaceholder="Find users..." onSearchChange={vi.fn()} />);
    expect(screen.getByPlaceholderText('Find users...')).toBeInTheDocument();
  });

  it('debounces search: calls onSearchChange after 300ms', () => {
    vi.useFakeTimers();
    const onSearchChange = vi.fn();
    render(<Filters onSearchChange={onSearchChange} />);
    fireEvent.change(screen.getByPlaceholderText('Search...'), { target: { value: 'hello' } });
    expect(onSearchChange).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(300); });
    expect(onSearchChange).toHaveBeenCalledWith('hello');
    vi.useRealTimers();
  });

  it('does not fire before debounce period', () => {
    vi.useFakeTimers();
    const onSearchChange = vi.fn();
    render(<Filters onSearchChange={onSearchChange} />);
    fireEvent.change(screen.getByPlaceholderText('Search...'), { target: { value: 'hi' } });
    act(() => { vi.advanceTimersByTime(200); });
    expect(onSearchChange).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('renders dropdown filters with options', () => {
    const filters: FilterDropdown[] = [
      { key: 'status', label: 'Status', options: [{ value: 'active', label: 'Active' }], value: '' },
    ];
    render(<Filters filters={filters} onFilterChange={vi.fn()} />);
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('changing dropdown calls onFilterChange(key, value)', () => {
    const onFilterChange = vi.fn();
    const filters: FilterDropdown[] = [
      { key: 'status', label: 'Status', options: [{ value: 'active', label: 'Active' }], value: '' },
    ];
    render(<Filters filters={filters} onFilterChange={onFilterChange} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'active' } });
    expect(onFilterChange).toHaveBeenCalledWith('status', 'active');
  });

  it('showDateRange=true renders date inputs', () => {
    const { container } = render(<Filters showDateRange onDateRangeChange={vi.fn()} />);
    const dateInputs = container.querySelectorAll('input[type="date"]');
    expect(dateInputs).toHaveLength(2);
  });

  it('changing date calls onDateRangeChange', () => {
    const onDateRangeChange = vi.fn();
    const { container } = render(
      <Filters showDateRange dateFrom="2024-01-01" dateTo="2024-01-31" onDateRangeChange={onDateRangeChange} />,
    );
    const dateInputs = container.querySelectorAll<HTMLInputElement>('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2024-02-01' } });
    expect(onDateRangeChange).toHaveBeenCalledWith('2024-02-01', '2024-01-31');
  });

  it('no search input when onSearchChange not provided', () => {
    render(<Filters />);
    expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument();
  });
});
