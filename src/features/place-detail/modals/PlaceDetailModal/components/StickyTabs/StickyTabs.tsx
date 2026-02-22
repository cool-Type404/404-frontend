import styles from './StickyTabs.module.css';
import { CommonIcon } from '@/components/CommonIcon/CommonIcon';

type TabItem<T extends string> = {
  key: T;
  label: string;
  iconName: Parameters<typeof CommonIcon>[0]['name'];
};

type Props<T extends string> = {
  activeTab: T;
  onTabClick: (key: T) => void;
  items: TabItem<T>[];
};

export default function StickyTabs<T extends string>({ activeTab, onTabClick, items }: Props<T>) {
  return (
    <div className={styles.stickyTabs}>
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          className={styles.tabBtn}
          data-active={activeTab === item.key}
          onClick={() => onTabClick(item.key)}
        >
          <CommonIcon name={item.iconName} />
          {item.label}
        </button>
      ))}
    </div>
  );
}
