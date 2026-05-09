import styles from './Alert.module.css';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  /** Semantic intent controlling colour and icon. */
  variant: AlertVariant;
  /** Content rendered in the alert body. */
  children: React.ReactNode;
  /** Optional bold title rendered above the body. */
  title?: string;
  /** Shows a dismiss button when true. @default false */
  dismissible?: boolean;
  /** Called when the dismiss button is clicked. */
  onDismiss?: React.MouseEventHandler<HTMLButtonElement>;
}

const ICONS: Record<AlertVariant, string> = {
  info:    'ℹ',
  success: '✓',
  warning: '⚠',
  error:   '✕',
};

export function Alert({
  variant,
  children,
  title,
  dismissible = false,
  onDismiss,
}: AlertProps) {
  const classes = [styles.alert, styles[variant]].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      role="alert"
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
    >
      <span className={styles.icon} aria-hidden="true">
        {ICONS[variant]}
      </span>

      <div className={styles.content}>
        {title && <p className={styles.title}>{title}</p>}
        <div className={styles.body}>{children}</div>
      </div>

      {dismissible && (
        <button
          type="button"
          className={styles.dismiss}
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          ✕
        </button>
      )}
    </div>
  );
}

export default Alert;
