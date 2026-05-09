import styles from './Breadcrumb.module.css';

export interface BreadcrumbItem {
  /** Visible label for this crumb. */
  label: string;
  /** Navigation href. When omitted the crumb renders as plain text (current page). */
  href?: string;
  /** Click handler; use instead of href for SPA navigation. */
  onClick?: React.MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
}

export interface BreadcrumbProps {
  /** Ordered list of breadcrumb items from root to current page. */
  items: BreadcrumbItem[];
  /** Character used between crumbs. @default '/' */
  separator?: string;
}

export function Breadcrumb({ items, separator = '/' }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={styles.nav}>
      <ol className={styles.list}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className={styles.item}>
              {isLast ? (
                <span className={styles.current} aria-current="page">
                  {item.label}
                </span>
              ) : item.href ? (
                <a
                  href={item.href}
                  onClick={item.onClick as React.MouseEventHandler<HTMLAnchorElement>}
                  className={styles.link}
                >
                  {item.label}
                </a>
              ) : (
                <button
                  type="button"
                  onClick={item.onClick as React.MouseEventHandler<HTMLButtonElement>}
                  className={styles.linkButton}
                >
                  {item.label}
                </button>
              )}
              {!isLast && (
                <span className={styles.separator} aria-hidden="true">
                  {separator}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
