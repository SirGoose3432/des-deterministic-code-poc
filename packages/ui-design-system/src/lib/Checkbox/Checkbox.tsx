import { useEffect, useRef } from 'react';
import styles from './Checkbox.module.css';

export interface CheckboxProps {
  /** Unique id wired to the <label> htmlFor — required for accessibility. */
  id: string;
  /** Visible label rendered beside the checkbox. */
  label: string;
  /** Controlled checked state. */
  checked: boolean;
  /** Called when the checkbox is toggled. */
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  /** Supplemental hint shown below the label. */
  hint?: string;
  /** Validation error message shown below the checkbox. */
  error?: string;
  /** Marks the field as required. @default false */
  required?: boolean;
  /** Disables the checkbox. @default false */
  disabled?: boolean;
  /** Renders the checkbox in an indeterminate state. @default false */
  indeterminate?: boolean;
}

export function Checkbox({
  id,
  label,
  checked,
  onChange,
  hint,
  error,
  required = false,
  disabled = false,
  indeterminate = false,
}: CheckboxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.row}>
        <input
          ref={inputRef}
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
          required={required}
          disabled={disabled}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={
            error ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
          className={styles.input}
        />
        <label htmlFor={id} className={styles.label}>
          {label}
          {required && (
            <span className={styles.required} aria-hidden="true">
              {' '}*
            </span>
          )}
        </label>
      </div>

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

export default Checkbox;
