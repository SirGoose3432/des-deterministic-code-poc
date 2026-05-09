import styles from './Divider.module.css';

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerSpacing = 'sm' | 'md' | 'lg';

export interface DividerProps {
  /** Visual orientation of the dividing line. @default 'horizontal' */
  orientation?: DividerOrientation;
  /** Margin applied perpendicular to the divider. @default 'md' */
  spacing?: DividerSpacing;
  /** Optional centred label text rendered on top of the line. */
  label?: string;
}

export function Divider({
  orientation = 'horizontal',
  spacing = 'md',
  label,
}: DividerProps) {
  const classes = [
    styles.divider,
    styles[orientation],
    styles[`spacing-${spacing}`],
  ]
    .filter(Boolean)
    .join(' ');

  if (label && orientation === 'horizontal') {
    return (
      <div className={classes} role="separator" aria-label={label}>
        <span className={styles.label}>{label}</span>
      </div>
    );
  }

  return <hr className={classes} role="separator" />;
}

export default Divider;
