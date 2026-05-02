import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders the label text', () => {
    render(<Button label="Submit" />);
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });

  it('defaults to type="button"', () => {
    render(<Button label="X" />);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('forwards the type prop', () => {
    render(<Button label="X" type="submit" />);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('is not disabled by default', () => {
    render(<Button label="X" />);
    expect(screen.getByRole('button')).not.toBeDisabled();
  });

  it('disables the button when disabled={true}', () => {
    render(<Button label="X" disabled />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('disables the button when loading={true}', () => {
    render(<Button label="X" loading />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('sets aria-busy when loading', () => {
    render(<Button label="X" loading />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
  });

  it('does not set aria-busy when not loading', () => {
    render(<Button label="X" />);
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-busy');
  });

  it('renders a spinner element when loading', () => {
    render(<Button label="X" loading />);
    // The spinner is a <span aria-hidden="true"> inside the button.
    const spinner = screen.getByRole('button').querySelector('[aria-hidden="true"]');
    expect(spinner).toBeInTheDocument();
  });

  it('does not render a spinner when not loading', () => {
    render(<Button label="X" />);
    const spinner = screen.getByRole('button').querySelector('[aria-hidden="true"]');
    expect(spinner).not.toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handler = vi.fn();
    render(<Button label="X" onClick={handler} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const handler = vi.fn();
    render(<Button label="X" disabled onClick={handler} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handler).not.toHaveBeenCalled();
  });
});
