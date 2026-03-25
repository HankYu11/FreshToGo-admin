import { render, screen } from '@testing-library/react';
import DetailCard from './DetailCard';

describe('DetailCard', () => {
  it('renders fields with labels and values', () => {
    render(
      <DetailCard>
        <DetailCard.Field label="Email">test@example.com</DetailCard.Field>
        <DetailCard.Field label="Phone">123-456</DetailCard.Field>
      </DetailCard>,
    );
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Phone')).toBeInTheDocument();
    expect(screen.getByText('123-456')).toBeInTheDocument();
  });

  it('renders labels as dt elements', () => {
    render(
      <DetailCard>
        <DetailCard.Field label="Name">John</DetailCard.Field>
      </DetailCard>,
    );
    const dt = screen.getByText('Name');
    expect(dt.tagName).toBe('DT');
  });

  it('renders values as dd elements', () => {
    render(
      <DetailCard>
        <DetailCard.Field label="Name">John</DetailCard.Field>
      </DetailCard>,
    );
    const dd = screen.getByText('John');
    expect(dd.tagName).toBe('DD');
  });

  it('accepts custom className', () => {
    const { container } = render(
      <DetailCard className="custom">
        <DetailCard.Field label="A">B</DetailCard.Field>
      </DetailCard>,
    );
    expect(container.firstElementChild).toHaveClass('custom');
  });

  it('applies inline style', () => {
    const { container } = render(
      <DetailCard style={{ marginBottom: '2rem' }}>
        <DetailCard.Field label="A">B</DetailCard.Field>
      </DetailCard>,
    );
    expect(container.firstElementChild).toHaveStyle({ marginBottom: '2rem' });
  });
});
