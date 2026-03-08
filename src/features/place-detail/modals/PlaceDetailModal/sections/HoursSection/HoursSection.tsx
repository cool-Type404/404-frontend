import type { RefObject } from 'react';

import type { OpeningHours } from '@/features/place-detail/mock_data/placeDetail.types';
import { Divider } from '@/components/Divider';

import styles from './HoursSection.module.css';

type Props = {
  opening_hours: OpeningHours[];
  sectionRef?: RefObject<HTMLElement | null>;
};

function formatTime(time: string | null | undefined): string {
  if (!time) return '';
  return time.slice(0, 5);
}

export default function HoursSection({ opening_hours, sectionRef }: Props) {
  return (
    <>
      <section className={styles.section} ref={sectionRef}>
        <h3 className={styles.sectionTitle}>영업시간</h3>

        <ul className={styles.hoursList}>
          {opening_hours.map((h) => (
            <li key={h.opening_hours_id} className={styles.hoursItem}>
              <span className={styles.day}>{h.days}</span>

              {h.start_time === '정기휴무' ? (
                <span className={styles.closed}>정기휴무</span>
              ) : (
                <span className={styles.time}>
                  {formatTime(h.start_time)} ~ {formatTime(h.end_time)}
                  {h.break_start_time && h.break_end_time ? (
                    <span className={styles.break}>
                      {' '}
                      (브레이크 {formatTime(h.break_start_time)}~{formatTime(h.break_end_time)})
                    </span>
                  ) : null}
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <Divider spacing={12} color="#6fbf3a" />
    </>
  );
}