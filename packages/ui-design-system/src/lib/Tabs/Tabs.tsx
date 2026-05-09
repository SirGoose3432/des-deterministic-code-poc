import styles from './Tabs.module.css';

export type TabsSize = 'sm' | 'md';

export interface TabItem {
  /** Unique identifier for this tab. */
  id: string;
  /** Visible label shown in the tab bar. */
  label: string;
  /** Disables interaction for this specific tab. @default false */
  disabled?: boolean;
}

export interface TabsProps {
  /** Tab items to render in the tab bar. */
  tabs: TabItem[];
  /** The `id` of the currently active tab. */
  activeTab: string;
  /** Called with the `id` of the tab the user clicked. */
  onChange: (tabId: string) => void;
  /** Visual size of the tab bar. @default 'md' */
  size?: TabsSize;
}

export function Tabs({ tabs, activeTab, onChange, size = 'md' }: TabsProps) {
  return (
    <div
      className={[styles.tablist, styles[size]].filter(Boolean).join(' ')}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        const classes = [
          styles.tab,
          isActive ? styles.active : '',
          tab.disabled ? styles.disabled : '',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <button
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={isActive}
            aria-disabled={tab.disabled || undefined}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && onChange(tab.id)}
            className={classes}
            type="button"
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
