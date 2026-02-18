import { useMemo, useState } from 'react';
import styles from './PlaceDetailDemoPage.module.css';

import Button from '@/components/Button/Button';
import PlaceDetailModalFlow from '@/features/place-detail/flow/PlaceDetailModalFlow';
import {
  mockPlaceDetailNoReviews,
  mockPlaceDetailWithReviews,
} from '@/features/place-detail/mock_data/placeDetail.mock';

export default function PlaceDetailDemoPage() {
  const [open, setOpen] = useState(false);
  const [withReviews, setWithReviews] = useState(true);

  const place = useMemo(() => {
    return withReviews
      ? mockPlaceDetailWithReviews
      : mockPlaceDetailNoReviews;
  }, [withReviews]);

  return (
    <div className={styles.page}>
      <div className={styles.fakeMap} />

      <div className={styles.panel}>
        <Button variant="primary" onClick={() => setOpen(true)}>
          상세 모달 열기
        </Button>

        <Button variant="secondary" onClick={() => setWithReviews((v) => !v)}>
          리뷰 {withReviews ? '없음' : '있음'}으로 변경
        </Button>
      </div>

      <PlaceDetailModalFlow
        open={open}
        onClose={() => setOpen(false)}
        place={place}
      />
    </div>
  );
}
