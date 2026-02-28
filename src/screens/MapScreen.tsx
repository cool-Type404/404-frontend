import { useState, useCallback } from 'react';
import { useDebounce } from 'use-debounce';

import KakaoMap from '../components/KakaoMap';
import Button from '../components/Button/Button';
import Input from '../components/Input/Input';
import Chip from '../components/Chip/Chip';
import { CommonIcon } from '../components/CommonIcon/CommonIcon';
import { FoodCategoryIcon } from '../components/FoodCategoryIcon';
import PlaceDetailModalFlow from '@/features/place-detail/flow/PlaceDetailModalFlow';
import { useRestaurantList } from '@/features/main-map/hooks/useRestaurantList';
import { useStoreLocations } from '@/features/main-map/hooks/useStoreLocations';
import { useStoreSearch } from '@/features/main-map/hooks/useStoreSearch';

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

export default function MapScreen() {
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebounce(searchQuery, 400);

  const { data: stores = [], isLoading } = useRestaurantList();
  const { data: searchResults, isFetching: isSearching } = useStoreSearch(debouncedQuery);
  const { data: locationsData } = useStoreLocations();

  // 검색어가 있으면 검색 결과, 없으면 전체 목록
  const displayedStores = debouncedQuery.trim() ? (searchResults ?? []) : stores;

  const handleMarkerClick = useCallback((storeId: number) => {
    setSelectedStoreId(storeId);
  }, []);

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <h1 className={styles.title}>홍밥</h1>
      </header>

      <div className={styles.mapLayer}>
        <KakaoMap
          markers={
            locationsData?.stores.map((s) => ({
              id: s.store_id,
              lat: s.latitude,
              lng: s.longitude,
              name: '',
            })) ?? []
          }
          onMarkerClick={handleMarkerClick}
        />
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.list}>
          {isLoading || isSearching ? (
            <div>로딩 중...</div>
          ) : displayedStores.length === 0 ? (
            <div className={styles.emptyState}>검색 결과가 없습니다.</div>
          ) : (
            displayedStores.map((s, index) => (
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