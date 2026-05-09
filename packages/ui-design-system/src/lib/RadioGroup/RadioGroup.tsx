import styles from './RadioGroup.module.css';

export type RadioGroupOrientation = 'vertical' | 'horizontal';

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  /** HTML name attribute shared across all radio inputs. */
  name: string;
  /** Accessible group legend rendered above the options. */
  legend: string;
  /** Currently selected value. */
  value: string;
  /** Called with the newly selected value. */
  onChange: (value: string) => void;
  /** Available radio options. */
  options: RadioOption[];
  /** Stack direction. @default 'vertical' */
  orientation?: RadioGroupOrientation;
  /** Validation error message shown below the group. */
  error?: string;
  /** Supplemental hint shown below the group when there is no error. */
  hint?: string;
  /** Marks the group as required. @default false */
  required?: boolean;
  /** Disables all radio inputs. @default false */
  disabled?: boolean;
}

export function RadioGroup({
  name,
  legend,
  value,
  onChange,
  options,
  orientation = 'vertical',
  error,
  hint,
  required = false,
  disabled = false,
}: RadioGroupProps) {
  const listClass = [styles.list, styles[orientation]].filter(Boolean).join(' ');

  return (
    <fieldset
      className={styles.fieldset}
      aria-describedby={
        error ? `${name}-error` : hint ? `${name}-hint` : undefined
      }
      aria-required={required || undefined}
    >
      <legend className={styles.legend}>
        {legend}
        {required && (
          <span className={styles.required} aria-hidden="true">
            {' '}*
          </span>
        )}
      </legend>

      <div className={listClass}>
        {options.map((opt) => {
          const inputId = `${name}-${opt.value}`;
          const isDisabled = disabled || opt.disabled;
          return (
            <label
              key={opt.value}
              htmlFor={inputId}
              className={[styles.option, isDisabled ? styles.optionDisabled : '']
                .filter(Boolean)
                .join(' ')}
            >
              <input
                type="radio"
                id={inputId}
                name={name}
                value={opt.value}
                checked={value === opt.value}
                onChange={() => onChange(opt.value)}
                disabled={isDisabled}
                className={styles.input}
              />
              {opt.label}
            </label>
          );
        })}
      </div>

      {error && (
        <p id={`${name}-error`} className={styles.error} role="alert">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${name}-hint`} className={styles.hint}>
          {hint}
        </p>
      )}
    </fieldset>
  );
}

export default RadioGroup;
