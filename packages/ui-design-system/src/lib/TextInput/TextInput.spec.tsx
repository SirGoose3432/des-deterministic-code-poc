import { render, screen, fireEvent } from '@testing-library/react';
import { TextInput } from './TextInput';

const baseProps = {
  id: 'test',
  label: 'Email',
  value: '',
  onChange: vi.fn(),
};

describe('TextInput', () => {
  it('renders the label text', () => {
    render(<TextInput {...baseProps} />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('wires the label htmlFor to the input id', () => {
    render(<TextInput {...baseProps} />);
    const label = screen.getByText('Email');
    expect(label).toHaveAttribute('for', 'test');
  });

  it('renders the current value', () => {
    render(<TextInput {...baseProps} value="hello@example.com" />);
    expect(screen.getByRole('textbox')).toHaveValue('hello@example.com');
  });

  it('calls onChange with the new string value on input', () => {
    const onChange = vi.fn();
    render(<TextInput {...baseProps} onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'typed' } });
    expect(onChange).toHaveBeenCalledWith('typed');
  });

  it('defaults to type="text"', () => {
    render(<TextInput {...baseProps} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text');
  });

  it('forwards the type prop', () => {
    render(<TextInput {...baseProps} type="email" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');
  });

  it('renders placeholder text', () => {
    render(<TextInput {...baseProps} placeholder="you@example.com" />);
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
  });

  it('renders the hint when no error is present', () => {
    render(<TextInput {...baseProps} hint="We will never share your email." />);
    expect(screen.getByText("We will never share your email.")).toBeInTheDocument();
  });

  it('renders the error message when error is set', () => {
    render(<TextInput {...baseProps} error="Invalid email." />);
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email.');
  });

  it('does not render hint when error is also present', () => {
    render(<TextInput {...baseProps} error="Bad" hint="A hint" />);
    expect(screen.queryByText('A hint')).not.toBeInTheDocument();
  });

  it('sets aria-invalid when error is present', () => {
    render(<TextInput {...baseProps} error="Bad" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not set aria-invalid without an error', () => {
    render(<TextInput {...baseProps} />);
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid');
  });

  it('appends an asterisk to the label when required', () => {
    render(<TextInput {...baseProps} required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('sets the required attribute on the input', () => {
    render(<TextInput {...baseProps} required />);
    expect(screen.getByRole('textbox')).toBeRequired();
  });

  it('disables the input when disabled', () => {
    render(<TextInput {...baseProps} disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('makes the input read-only when readOnly', () => {
    render(<TextInput {...baseProps} readOnly value="fixed" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
  });
});
