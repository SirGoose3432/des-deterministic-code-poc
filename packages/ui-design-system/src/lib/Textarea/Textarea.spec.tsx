import { render, screen, fireEvent } from '@testing-library/react';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  it('renders the label', () => {
    render(<Textarea id="t" label="Notes" value="" onChange={() => {}} />);
    expect(screen.getByLabelText('Notes')).toBeInTheDocument();
  });

  it('reflects the value', () => {
    render(<Textarea id="t" label="Notes" value="hello" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toHaveValue('hello');
  });

  it('calls onChange on input', () => {
    const handler = vi.fn();
    render(<Textarea id="t" label="Notes" value="" onChange={handler} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'hi' } });
    expect(handler).toHaveBeenCalledWith('hi');
  });

  it('shows error message and sets aria-invalid', () => {
    render(
      <Textarea id="t" label="Notes" value="" onChange={() => {}} error="Required" />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Required');
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows hint when no error', () => {
    render(
      <Textarea id="t" label="Notes" value="" onChange={() => {}} hint="Max 500 chars" />,
    );
    expect(screen.getByText('Max 500 chars')).toBeInTheDocument();
  });

  it('is disabled when disabled={true}', () => {
    render(
      <Textarea id="t" label="Notes" value="" onChange={() => {}} disabled />,
    );
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('shows character counter when maxLength provided', () => {
    render(
      <Textarea id="t" label="Notes" value="hello" onChange={() => {}} maxLength={100} />,
    );
    expect(screen.getByText('5/100')).toBeInTheDocument();
  });
});
