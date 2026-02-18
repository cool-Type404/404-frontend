import { useState } from 'react';
import styles from './PlaceDetailDemoPage.module.css';

import Button from '@/components/Button/Button';
import PlaceDetailModalFlow from '@/features/place-detail/flow/PlaceDetailModalFlow';

export default function PlaceDetailDemoPage() {
  const [open, setOpen] = useState(false);
  const [storeId, setStoreId] = useState<number | null>(null);

  return (
    <div className={styles.page}>
      <div className={styles.fakeMap} />

      <div className={styles.panel}>
        <Button
          variant="primary"
          type="button"
          onClick={() => {
            setStoreId(1);
            setOpen(true);
          }}
        >
          1번 가게 상세 열기
        </Button>

        <Button
          variant="secondary"
          type="button"
          onClick={() => {
            setStoreId(2);
            setOpen(true);
          }}
        >
          2번 가게 상세 열기
        </Button>

        <Button
          variant="secondary"
          type="button"
          onClick={() => {
            setStoreId(null);
            setOpen(false);
          }}
        >
          닫기
        </Button>
      </div>

      <PlaceDetailModalFlow open={open} onClose={() => setOpen(false)} storeId={storeId} />
    </div>
  );
}
