import type { RefObject } from 'react';

import type { OpeningHours } from '@/features/place-detail/mock_data/placeDetail.types';
import { Divider } from '@/components/Divider';
import { formatOpeningTime, isClosedAllDay } from '@/utils/openingHours';

import styles from './HoursSection.module.css';

type Props = {
  opening_hours: OpeningHours[];
  sectionRef?: RefObject<HTMLElement | null>;
};

export default function HoursSection({ opening_hours, sectionRef }: Props) {
  return (
    <>
      <section className={styles.section} ref={sectionRef}>
        <h3 className={styles.sectionTitle}>영업시간</h3>

        <ul className={styles.hoursList}>
          {opening_hours.map((openingHour) => (
            <li key={openingHour.opening_hours_id} className={styles.hoursItem}>
              <span className={styles.day}>{openingHour.days}</span>

              {isClosedAllDay(openingHour) ? (
                <span className={styles.closed}>정기휴무</span>
              ) : (
                <span className={styles.time}>
                  {formatOpeningTime(openingHour.start_time)} ~ {formatOpeningTime(openingHour.end_time)}
                  {openingHour.break_start_time && openingHour.break_end_time ? (
                    <span className={styles.break}>
                      {' '}
                      (브레이크 {formatOpeningTime(openingHour.break_start_time)}~
                      {formatOpeningTime(openingHour.break_end_time)})
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
