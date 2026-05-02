import styles from './TextInput.module.css';

export type TextInputType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'search';

export interface TextInputProps {
  /** Unique id wired to the <label> htmlFor — required for accessibility. */
  id: string;
  /** Visible label rendered above the input. */
  label: string;
  /** Current controlled value. */
  value: string;
  /** Called with the raw string on every keystroke. */
  onChange: (value: string) => void;
  /** HTML input type. @default 'text' */
  type?: TextInputType;
  /** Placeholder text shown when the field is empty. */
  placeholder?: string;
  /** Validation error message; turns the border red and renders below the input. */
  error?: string;
  /** Supplemental hint shown below the input when there is no error. */
  hint?: string;
  /** Marks the field required and appends an asterisk to the label. @default false */
  required?: boolean;
  /** Disables the input. @default false */
  disabled?: boolean;
  /** Makes the input read-only. @default false */
  readOnly?: boolean;
}

export function TextInput({
  id,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  error,
  hint,
  required = false,
  disabled = false,
  readOnly = false,
}: TextInputProps) {
  const inputClass = [styles.input, error ? styles.inputError : '']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.wrapper}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {required && (
          <span className={styles.required} aria-hidden="true">
            {' '}*
          </span>
        )}
      </label>

      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={
          error ? `${id}-error` : hint ? `${id}-hint` : undefined
        }
        className={inputClass}
      />

      {error && (
        <p id={`${id}-error`} className={styles.error} role="alert">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${id}-hint`} className={styles.hint}>
          {hint}
        </p>
      )}
    </div>
  );
}

export default TextInput;
