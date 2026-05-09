import { render, screen } from '@testing-library/react';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('has role="status"', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('uses the default label', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toHaveAccessibleName('Loading…');
  });

  it('uses a custom label when provided', () => {
    render(<Spinner label="Saving changes…" />);
    expect(screen.getByRole('status')).toHaveAccessibleName('Saving changes…');
  });

  it('renders with lg size without crashing', () => {
    render(<Spinner size="lg" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
