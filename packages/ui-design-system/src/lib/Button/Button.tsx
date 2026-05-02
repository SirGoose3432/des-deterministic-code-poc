import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  /** The visible text label rendered inside the button. */
  label: string;
  /** Visual style variant controlling colour and border treatment. @default 'primary' */
  variant?: ButtonVariant;
  /** Controls padding and font-size. @default 'md' */
  size?: ButtonSize;
  /** Disables interaction and dims the button. @default false */
  disabled?: boolean;
  /** Renders a spinner and blocks interaction while an async action is in-flight. @default false */
  loading?: boolean;
  /** Stretches the button to fill its container width. @default false */
  fullWidth?: boolean;
  /** HTML button type. @default 'button' */
  type?: 'button' | 'submit' | 'reset';
  /** Click handler forwarded to the underlying <button>. */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  type = 'button',
  onClick,
}: ButtonProps) {
  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      aria-busy={loading || undefined}
    >
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      {label}
    </button>
  );
}

export default Button;
