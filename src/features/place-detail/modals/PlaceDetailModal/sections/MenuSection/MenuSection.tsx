import Chip from '@/components/Chip/Chip';
import { CommonIcon } from '@/components/CommonIcon/CommonIcon';
import { Divider } from '@/components/Divider';

import type { StoreMenu } from '@/features/place-detail/mock_data/placeDetail.types';

import styles from './MenuSection.module.css';

type Props = {
  menus: StoreMenu[];
  sectionRef?: React.RefObject<HTMLElement | null>;
};

export default function MenuSection({ menus, sectionRef }: Props) {
  return (
    <section className={styles.section} ref={sectionRef}>
      <h3 className={styles.sectionTitle}>전체 메뉴</h3>

      <ul className={styles.menuList}>
        {menus.map((m, index) => (
          <li key={m.menu_id} className={styles.menuItemWrapper}>
            <div className={styles.menuItem}>
              <div className={styles.menuImageBox}>
                {m.menu_img ? (
                  <img
                    src={`${import.meta.env.VITE_API_BASE_URL}${m.menu_img}`}
                    alt={m.menu_name}
                    className={styles.menuImage}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.removeAttribute('hidden');
                    }}
                  />
                ) : null}
                <div
                  className={styles.menuImagePlaceholder}
                  hidden={!!m.menu_img}
                >
                  이미지 준비중
                </div>
              </div>

              <div className={styles.menuContent}>
                <div className={styles.menuNameRow}>
                  <span className={styles.menuName}>{m.menu_name}</span>
                  {m.is_rec && (
                    <Chip variant="recommend" size="sm">
                      <CommonIcon
                        name="thumbsupfilled"
                        size={12}
                        style={{ marginRight: 4, color: '#fbbf24' }}
                      />
                      추천
                    </Chip>
                  )}
                </div>
                <div className={styles.menuPrice}>{m.price.toLocaleString()}원</div>
              </div>
            </div>

            {index !== menus.length - 1 && <Divider color="#e5e7eb" />}
          </li>
        ))}
      </ul>
    </section>
  );
}