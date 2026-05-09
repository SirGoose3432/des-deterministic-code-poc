import styles from './Card.module.css';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';
export type CardElevation = 'none' | 'sm' | 'md';

export interface CardProps {
  /** Content rendered inside the card body. */
  children: React.ReactNode;
  /** Optional title displayed in the card header. */
  title?: string;
  /** Inner padding size. @default 'md' */
  padding?: CardPadding;
  /** Box shadow depth. @default 'sm' */
  elevation?: CardElevation;
  /** Stretch to fill container width. @default false */
  fullWidth?: boolean;
}

export function Card({
  children,
  title,
  padding = 'md',
  elevation = 'sm',
  fullWidth = false,
}: CardProps) {
  const classes = [
    styles.card,
    styles[`padding-${padding}`],
    styles[`elevation-${elevation}`],
    fullWidth ? styles.fullWidth : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      {title && <div className={styles.header}><h3 className={styles.title}>{title}</h3></div>}
      <div className={styles.body}>{children}</div>
    </div>
  );
}

export default Card;
