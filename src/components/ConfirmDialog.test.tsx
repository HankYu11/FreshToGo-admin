import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfirmDialog from './ConfirmDialog';

const showModalMock = vi.fn();
const closeMock = vi.fn();

beforeEach(() => {
  showModalMock.mockClear();
  closeMock.mockClear();
  HTMLDialogElement.prototype.showModal = showModalMock;
  HTMLDialogElement.prototype.close = closeMock;
});

const defaultProps = {
  open: true,
  title: 'Delete item?',
  message: 'This cannot be undone.',
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
};

describe('ConfirmDialog', () => {
  it('calls showModal when open=true', () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(showModalMock).toHaveBeenCalled();
  });

  it('renders title, message, and custom confirmLabel', () => {
    render(<ConfirmDialog {...defaultProps} confirmLabel="Delete" />);
    expect(screen.getByText('Delete item?')).toBeInTheDocument();
    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('default confirm label is "Confirm"', () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByText('Confirm')).toBeInTheDocument();
  });

  it('Cancel button calls onCancel', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<ConfirmDialog {...defaultProps} onCancel={onCancel} />);
    await user.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalled();
  });

  it('Confirm button calls onConfirm', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />);
    await user.click(screen.getByText('Confirm'));
    expect(onConfirm).toHaveBeenCalled();
  });

  it('when loading: buttons disabled, shows "Processing..."', () => {
    render(<ConfirmDialog {...defaultProps} loading />);
    expect(screen.getByText('Processing...')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeDisabled();
    expect(screen.getByText('Processing...')).toBeDisabled();
  });

  it('variant="danger" applies btn-danger class', () => {
    render(<ConfirmDialog {...defaultProps} variant="danger" />);
    expect(screen.getByText('Confirm')).toHaveClass('btn-danger');
  });

  it('renders children', () => {
    render(
      <ConfirmDialog {...defaultProps}>
        <p>Extra content</p>
      </ConfirmDialog>,
    );
    expect(screen.getByText('Extra content')).toBeInTheDocument();
  });
});
