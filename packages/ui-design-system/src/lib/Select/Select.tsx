import styles from './Select.module.css';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  /** Unique id wired to the <label> htmlFor — required for accessibility. */
  id: string;
  /** Visible label rendered above the select. */
  label: string;
  /** Current controlled value. */
  value: string;
  /** Called with the selected option value on change. */
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
  /** Available options. */
  options: SelectOption[];
  /** Placeholder option shown when value is empty. */
  placeholder?: string;
  /** Validation error message shown below the select. */
  error?: string;
  /** Supplemental hint shown below the select when there is no error. */
  hint?: string;
  /** Marks the field required and appends an asterisk to the label. @default false */
  required?: boolean;
  /** Disables the select. @default false */
  disabled?: boolean;
}

export function Select({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
  hint,
  required = false,
  disabled = false,
}: SelectProps) {
  const selectClass = [styles.select, error ? styles.selectError : '']
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

      <div className={styles.selectWrapper}>
        <select
          id={id}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={
            error ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
          className={selectClass}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className={styles.chevron} aria-hidden="true" />
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

export default Select;
