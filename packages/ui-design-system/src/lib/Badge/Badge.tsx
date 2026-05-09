import styles from './Badge.module.css';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  /** Text label rendered inside the badge. */
  label: string;
  /** Colour variant conveying semantic meaning. @default 'default' */
  variant?: BadgeVariant;
  /** Size of the badge. @default 'md' */
  size?: BadgeSize;
  /** Renders a small coloured dot before the label. @default false */
  dot?: boolean;
}

export function Badge({
  label,
  variant = 'default',
  size = 'md',
  dot = false,
}: BadgeProps) {
  const classes = [styles.badge, styles[variant], styles[size]]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes}>
      {dot && <span className={styles.dot} aria-hidden="true" />}
      {label}
    </span>
  );
}

export default Badge;
