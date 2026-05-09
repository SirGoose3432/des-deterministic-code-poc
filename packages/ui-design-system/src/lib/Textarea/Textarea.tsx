import styles from './Textarea.module.css';

export type TextareaResize = 'none' | 'vertical' | 'both';

export interface TextareaProps {
  /** Unique id wired to the <label> htmlFor — required for accessibility. */
  id: string;
  /** Visible label rendered above the textarea. */
  label: string;
  /** Current controlled value. */
  value: string;
  /** Called with the raw string on every keystroke. */
  onChange: (value: string) => void;
  /** Placeholder text shown when the field is empty. */
  placeholder?: string;
  /** Number of visible text rows. @default 4 */
  rows?: number;
  /** Validation error message shown below the textarea. */
  error?: string;
  /** Supplemental hint shown below the textarea when there is no error. */
  hint?: string;
  /** Marks the field required and appends an asterisk to the label. @default false */
  required?: boolean;
  /** Disables the textarea. @default false */
  disabled?: boolean;
  /** Makes the textarea read-only. @default false */
  readOnly?: boolean;
  /** Maximum character count. */
  maxLength?: number;
  /** CSS resize behaviour. @default 'vertical' */
  resize?: TextareaResize;
}

export function Textarea({
  id,
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  error,
  hint,
  required = false,
  disabled = false,
  readOnly = false,
  maxLength,
  resize = 'vertical',
}: TextareaProps) {
  const textareaClass = [
    styles.textarea,
    styles[`resize-${resize}`],
    error ? styles.textareaError : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.wrapper}>
      <div className={styles.labelRow}>
        <label htmlFor={id} className={styles.label}>
          {label}
          {required && (
            <span className={styles.required} aria-hidden="true">
              {' '}*
            </span>
          )}
        </label>
        {maxLength != null && (
          <span className={styles.counter} aria-live="polite">
            {value.length}/{maxLength}
          </span>
        )}
      </div>

      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={
          error ? `${id}-error` : hint ? `${id}-hint` : undefined
        }
        className={textareaClass}
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

export default Textarea;
