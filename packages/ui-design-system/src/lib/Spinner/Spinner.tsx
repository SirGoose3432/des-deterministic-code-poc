import styles from './Spinner.module.css';

export type SpinnerSize = 'sm' | 'md' | 'lg';

export interface SpinnerProps {
  /** Visual size of the spinner. @default 'md' */
  size?: SpinnerSize;
  /** Accessible label read by screen readers. @default 'Loading…' */
  label?: string;
}

export function Spinner({ size = 'md', label = 'Loading…' }: SpinnerProps) {
  const classes = [styles.spinner, styles[size]].filter(Boolean).join(' ');

  return (
    <span className={styles.wrapper} role="status" aria-label={label}>
      <span className={classes} aria-hidden="true" />
    </span>
  );
}

export default Spinner;
