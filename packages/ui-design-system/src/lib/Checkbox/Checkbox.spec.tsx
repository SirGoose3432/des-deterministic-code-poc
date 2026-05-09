import { render, screen, fireEvent } from '@testing-library/react';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('renders the label', () => {
    render(
      <Checkbox id="cb" label="Accept terms" checked={false} onChange={() => {}} />,
    );
    expect(screen.getByLabelText('Accept terms')).toBeInTheDocument();
  });

  it('reflects checked state', () => {
    render(
      <Checkbox id="cb" label="Accept terms" checked={true} onChange={() => {}} />,
    );
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('calls onChange when toggled', () => {
    const handler = vi.fn();
    render(
      <Checkbox id="cb" label="Accept terms" checked={false} onChange={handler} />,
    );
    fireEvent.click(screen.getByRole('checkbox'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('shows error message and sets aria-invalid', () => {
    render(
      <Checkbox
        id="cb"
        label="Accept terms"
        checked={false}
        onChange={() => {}}
        error="Required"
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Required');
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows hint when no error', () => {
    render(
      <Checkbox
        id="cb"
        label="Subscribe"
        checked={false}
        onChange={() => {}}
        hint="Weekly emails only"
      />,
    );
    expect(screen.getByText('Weekly emails only')).toBeInTheDocument();
  });

  it('is disabled when disabled={true}', () => {
    render(
      <Checkbox id="cb" label="Opt in" checked={false} onChange={() => {}} disabled />,
    );
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });
});
