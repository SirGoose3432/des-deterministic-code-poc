import { render, screen, fireEvent } from '@testing-library/react';
import { RadioGroup } from './RadioGroup';

const options = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
  { value: 'c', label: 'Option C', disabled: true },
];

describe('RadioGroup', () => {
  it('renders the legend', () => {
    render(
      <RadioGroup name="g" legend="Choose one" value="" onChange={() => {}} options={options} />,
    );
    expect(screen.getByText('Choose one')).toBeInTheDocument();
  });

  it('renders all radio options', () => {
    render(
      <RadioGroup name="g" legend="Choose one" value="" onChange={() => {}} options={options} />,
    );
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });

  it('checks the option matching value', () => {
    render(
      <RadioGroup name="g" legend="Choose one" value="b" onChange={() => {}} options={options} />,
    );
    expect(screen.getByLabelText('Option B')).toBeChecked();
    expect(screen.getByLabelText('Option A')).not.toBeChecked();
  });

  it('calls onChange with the selected value', () => {
    const handler = vi.fn();
    render(
      <RadioGroup name="g" legend="Choose one" value="" onChange={handler} options={options} />,
    );
    fireEvent.click(screen.getByLabelText('Option A'));
    expect(handler).toHaveBeenCalledWith('a');
  });

  it('disables a specific option', () => {
    render(
      <RadioGroup name="g" legend="Choose one" value="" onChange={() => {}} options={options} />,
    );
    expect(screen.getByLabelText('Option C')).toBeDisabled();
  });

  it('disables all options when disabled={true}', () => {
    render(
      <RadioGroup name="g" legend="Choose one" value="" onChange={() => {}} options={options} disabled />,
    );
    screen.getAllByRole('radio').forEach((r) => expect(r).toBeDisabled());
  });

  it('shows error message', () => {
    render(
      <RadioGroup
        name="g"
        legend="Choose one"
        value=""
        onChange={() => {}}
        options={options}
        error="Required"
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Required');
  });
});
