import { CommonIcon } from '@/components/CommonIcon/CommonIcon';
import Chip from '@/components/Chip/Chip';

import type { StoreSeat } from '@/features/place-detail/mock_data/placeDetail.types';

import styles from './SeatSection.module.css';

type Props = {
  storeSeat?: StoreSeat;
  sectionRef?: React.RefObject<HTMLElement | null>;
};

export default function SeatSection({ storeSeat, sectionRef }: Props) {
  const seatsUi = [
    { type: 1 as const, exists: Boolean(storeSeat?.single_seat) },
    { type: 2 as const, exists: Boolean(storeSeat?.double_seat) },
    { type: 4 as const, exists: Boolean(storeSeat?.triple_seat) },
  ];

  return (
    <section className={styles.section} ref={sectionRef}>
      <h3 className={styles.sectionTitle}>좌석수</h3>

      <div className={styles.seatWrap}>
        {seatsUi.map((s) => {
          const iconName = s.type === 1 ? 'person' : s.type === 2 ? 'twopeople' : 'peoplegroup';

          return (
            <div key={s.type} className={styles.seatCard}>
              <div className={styles.seatTop}>
                <CommonIcon name={iconName} size={36} />
                <div className={styles.seatType}>{s.type}인석</div>
              </div>

              <Chip variant={s.exists ? 'seatAvailable' : 'seatUnavailable'} size="sm">
                {s.exists ? '있음' : '없음'}
              </Chip>
            </div>
          );
        })}
      </div>
    </section>
  );
}
