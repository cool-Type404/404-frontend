import { useEffect, useState } from 'react';

import styles from './PlaceHeaderSection.module.css';

import type { PlaceDetail } from '@/features/place-detail/mock_data/placeDetail.types';
import { Divider } from '@/components/Divider';
import { getStoreImage } from '@/features/place-detail/api/placeDetail.api';

type Props = {
  place: PlaceDetail;
  ratingText: string;
};

export default function PlaceHeaderSection({ place, ratingText }: Props) {
  const phoneDigits = place.store_number?.replaceAll('-', '') ?? '';
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    const storeId = place.storeInfoPK ?? place.storeInfoPK;
    if (!storeId) return;

    let objectUrl: string | null = null;
    let cancelled = false;

    getStoreImage(storeId)
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setImageSrc(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setImageSrc(null);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [place.storeInfoPK]);

  return (
    <div className={styles.wrap}>
      <Divider spacing={12} color="#6fbf3a" />

      <div className={styles.heroImageBox}>
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={`${place.store_name} 대표 이미지`}
            className={styles.heroImage}
            draggable={false}
          />
        ) : (
          <div className={styles.heroPlaceholder}>이미지 준비중</div>
        )}
      </div>

      <Divider spacing={12} color="#6fbf3a" />

      <div className={styles.summary}>
        <div className={styles.summaryRow}>
          <div className={styles.ratingWrap}>
            <span className={styles.label}>평점:</span>
            <span className={styles.value}>{ratingText}</span>
          </div>

          <div className={styles.phoneWrap}>
            <span className={styles.label}>연락처:</span>
            <a className={styles.link} href={`tel:${phoneDigits}`}>
              {place.store_number}
            </a>
          </div>
        </div>
      </div>

      <Divider spacing={12} color="#6fbf3a" />
    </div>
  );
}