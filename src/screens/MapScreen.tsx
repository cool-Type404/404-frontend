import { useState } from 'react';

import KakaoMap from '../components/KakaoMap';
import Button from '../components/Button/Button';
import Input from '../components/Input/Input';
import Chip from '../components/Chip/Chip';
import { CommonIcon } from '../components/CommonIcon/CommonIcon';
import { FoodCategoryIcon } from '../components/FoodCategoryIcon';
import PlaceDetailModalFlow from '@/features/place-detail/flow/PlaceDetailModalFlow';
import { useRestaurantList } from '@/features/main-map/hooks/useRestaurantList';

import styles from './MapScreen.module.css';

type FoodCategory =
  | 'korean'
  | 'japanese'
  | 'western'
  | 'chinese'
  | 'asian'
  | 'cafe'
  | 'bunsik'
  | 'etc';

// type Store = {
//   id: string;
//   name: string;
//   isOpen: boolean;
//   rating: number;
//   category: FoodCategory;
// };

// const MOCK_STORES: Store[] = [
//   { id: '1', name: '요소쿠야코우', isOpen: true, rating: 4.6, category: 'japanese' },
//   { id: '2', name: '서담헌', isOpen: true, rating: 4.8, category: 'chinese' },
//   { id: '3', name: '가츠모토', isOpen: false, rating: 4.5, category: 'japanese' },
//   { id: '4', name: '밥장인 돼지찌개', isOpen: true, rating: 4.2, category: 'korean' },
//   { id: '5', name: '구씨네부엌', isOpen: false, rating: 4.5, category: 'western' },
//   { id: '6', name: '연남토마', isOpen: true, rating: 4.6, category: 'cafe' },
// ];

export default function MapScreen() {
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const { data: stores = [], isLoading } = useRestaurantList();

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <h1 className={styles.title}>홍밥</h1>
      </header>

      <div className={styles.mapLayer}>
        <KakaoMap />
      </div>

      <div className={styles.topLeft}>
        <Button variant="primary" width={56} height={56} radius={16} aria-label="메뉴">
          <CommonIcon name="hamburger" size={28} variant="inherit" />
        </Button>
      </div>

      <div className={styles.topCenter}>
        <Button variant="third" height={44} radius={16}>
          <span className={styles.inlineIcon}>
            <CommonIcon name="filter" size={20} />
          </span>
          필터
        </Button>
      </div>

      <aside className={styles.rightPanel}>
        <div className={styles.searchWrap}>
          <Input
            variant="search"
            placeholder="지금, 먹고 싶은 음식은?"
            leftIcon={<CommonIcon name="search" size={22} />}
          />
        </div>

        <div className={styles.list}>
          {isLoading ? (
            <div>로딩 중...</div>
          ) : (
            stores.map((s, index) => (
              <div
                key={s.storeInfoPK ?? index}
                className={`${styles.card} ${selectedStoreId === s.storeInfoPK ? styles.cardSelected : ''}`}
                onClick={() => setSelectedStoreId(s.storeInfoPK)}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.cardLeft}>
                  <div className={styles.catIconBox}>
                    <FoodCategoryIcon category={toFoodCategory(s.storeCategory)} size={26} />
                  </div>
                  <div className={styles.storeInfo}>
                    <div className={styles.storeNameRow}>
                      <CommonIcon name="forkknife" size={18} />
                      <span className={styles.storeName}>{s.storeName}</span>
                    </div>
                    <div className={styles.storeMeta}>
                      <span className={styles.metaText}>
                        {categoryLabel(toFoodCategory(s.storeCategory))}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={styles.cardRight}>
                  <Chip variant={s.isOpen ? 'open' : 'closed'} size="sm">
                    {s.isOpen ? '영업중' : '영업전'}
                  </Chip>
                  <div className={styles.rating}>
                    <span className={styles.ratingLabel}>평점</span>
                    <span className={styles.star}>
                      <CommonIcon name="starfilled" size={14} />
                    </span>
                    <span className={styles.ratingValue}>
                      {s.storeRating != null ? s.storeRating.toFixed(1) : '-'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      <div className={styles.bottomLeft}>
        <Button variant="primary" height={48} radius={9999}>
          <span className={styles.inlineIcon}>
            <CommonIcon name="plus" size={16} />
          </span>
          장소 추천하기
        </Button>
      </div>

      {/* 식당 상세 모달 */}
      <PlaceDetailModalFlow
        open={selectedStoreId !== null}
        onClose={() => setSelectedStoreId(null)}
        storeId={selectedStoreId}
      />
    </div>
  );
}

function categoryLabel(category: FoodCategory) {
  switch (category) {
    case 'korean': return '한식';
    case 'japanese': return '일식';
    case 'western': return '양식';
    case 'chinese': return '중식';
    case 'asian': return '아시안';
    case 'cafe': return '카페';
    case 'bunsik': return '분식';
    case 'etc': return '기타';
    default: return '';
  }
}

function toFoodCategory(storeType: string): FoodCategory {
  const map: Record<string, FoodCategory> = {
    KOREAN: 'korean',
    JAPANESE: 'japanese',
    WESTERN: 'western',
    CHINESE: 'chinese',
    ASIAN: 'asian',
    CAFE: 'cafe',
    BUNSIK: 'bunsik',
  };
  return map[storeType] ?? 'etc';
}