import { render, screen, fireEvent } from '@testing-library/react';
import { Alert } from './Alert';

describe('Alert', () => {
  it('renders children', () => {
    render(<Alert variant="info">Information message</Alert>);
    expect(screen.getByText('Information message')).toBeInTheDocument();
  });

  it('renders the title when provided', () => {
    render(<Alert variant="success" title="Done">Body</Alert>);
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('has role="alert"', () => {
    render(<Alert variant="error">Error!</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders dismiss button when dismissible={true}', () => {
    render(
      <Alert variant="info" dismissible>
        Message
      </Alert>,
    );
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
  });

  it('does not render dismiss button by default', () => {
    render(<Alert variant="info">Message</Alert>);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    const handler = vi.fn();
    render(
      <Alert variant="info" dismissible onDismiss={handler}>
        Message
      </Alert>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
