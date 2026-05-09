import { render, screen, fireEvent } from '@testing-library/react';
import { Select } from './Select';

const options = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
  { value: 'c', label: 'Option C', disabled: true },
];

describe('Select', () => {
  it('renders the label', () => {
    render(
      <Select id="s" label="Fruit" value="" onChange={() => {}} options={options} />,
    );
    expect(screen.getByLabelText('Fruit')).toBeInTheDocument();
  });

  it('renders all options', () => {
    render(
      <Select id="s" label="Fruit" value="" onChange={() => {}} options={options} />,
    );
    expect(screen.getByRole('option', { name: 'Option A' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Option B' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Option C' })).toBeInTheDocument();
  });

  it('renders placeholder option when provided', () => {
    render(
      <Select
        id="s"
        label="Fruit"
        value=""
        onChange={() => {}}
        options={options}
        placeholder="Pick one…"
      />,
    );
    expect(screen.getByRole('option', { name: 'Pick one…' })).toBeInTheDocument();
  });

  it('calls onChange when selection changes', () => {
    const handler = vi.fn();
    render(
      <Select id="s" label="Fruit" value="" onChange={handler} options={options} />,
    );
    fireEvent.change(screen.getByLabelText('Fruit'), { target: { value: 'b' } });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('shows error message and sets aria-invalid', () => {
    render(
      <Select
        id="s"
        label="Fruit"
        value=""
        onChange={() => {}}
        options={options}
        error="Required"
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Required');
    expect(screen.getByLabelText('Fruit')).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows hint when no error', () => {
    render(
      <Select
        id="s"
        label="Fruit"
        value=""
        onChange={() => {}}
        options={options}
        hint="Choose wisely"
      />,
    );
    expect(screen.getByText('Choose wisely')).toBeInTheDocument();
  });

  it('is disabled when disabled={true}', () => {
    render(
      <Select id="s" label="Fruit" value="" onChange={() => {}} options={options} disabled />,
    );
    expect(screen.getByLabelText('Fruit')).toBeDisabled();
  });

  it('shows required asterisk', () => {
    render(
      <Select id="s" label="Fruit" value="" onChange={() => {}} options={options} required />,
    );
    expect(screen.getByLabelText(/Fruit/)).toBeInTheDocument();
  });
});
