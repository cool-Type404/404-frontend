import styles from './PlaceHeaderSection.module.css';

import type { PlaceDetail } from '@/features/place-detail/mock_data/placeDetail.types';
import { Divider } from '@/components/Divider';

import { toApiAssetUrl } from '@/utils/assetUrl';

type Props = {
  place: PlaceDetail;
  ratingText: string;
};

export default function PlaceHeaderSection({ place, ratingText }: Props) {
  const phoneDigits = place.store_number?.replaceAll('-', '') ?? '';
  const storeImgSrc = toApiAssetUrl(place.store_img);

  return (
    <div className={styles.wrap}>
      <Divider spacing={12} color="#6fbf3a" />

      {place.store_img ? (
        <div className={styles.heroImageBox}>
          <img
            src={storeImgSrc}
            alt={`${place.store_name} 대표 이미지`}
            className={styles.heroImage}
            draggable={false}
          />
        </div>
      ) : (
        <div className={styles.heroImageBox}>
          <div className={styles.heroPlaceholder}>이미지 준비중</div>
        </div>
      )}

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
