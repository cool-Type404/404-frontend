import { useEffect, useMemo, useState } from 'react';
import { useDebounce } from 'use-debounce';

import KakaoMap from '../components/KakaoMap';
import Button from '../components/Button/Button';
import Input from '../components/Input/Input';
import Chip from '../components/Chip/Chip';
import Modal from '../components/Modal/Modal';
import { CommonIcon } from '../components/CommonIcon/CommonIcon';
import { useRestaurantList } from '@/features/main-map/hooks/useRestaurantList';
import { useStoreLocations } from '@/features/main-map/hooks/useStoreLocations';
import { useStoreSearch } from '@/features/main-map/hooks/useStoreSearch';

import styles from './MapScreen.module.css';

type StoreCategory = 'KOREAN' | 'JAPANESE' | 'CHINESE' | 'WESTERN' | 'SNACK' | 'ASIAN';

type StoreSummary = {
  id: number;
  name: string;
  category: StoreCategory;
  isOpen: boolean;
  rating: number;
};

const categoryLabelMap: Record<StoreCategory, string> = {
  KOREAN: '한식',
  JAPANESE: '일식',
  CHINESE: '중식',
  WESTERN: '양식',
  SNACK: '분식',
  ASIAN: '아시안',
};

export default function MapScreen() {
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [debouncedQuery] = useDebounce(searchQuery, 300);

  const {
    data: stores = [],
    isLoading: isStoreListLoading,
    isError: isStoreListError,
  } = useRestaurantList();
  const {
    data: locationsData,
    isLoading: isLocationsLoading,
    isError: isLocationsError,
  } = useStoreLocations();
  const {
    data: searchedStores = [],
    isFetching: isSearching,
    isError: isSearchError,
  } = useStoreSearch(debouncedQuery);

  const displayedStores = useMemo<StoreSummary[]>(() => {
    const source = debouncedQuery.trim() ? searchedStores : stores;

    return source.map((store) => ({
      id: store.storeInfoPK,
      name: store.storeName,
      category: store.storeCategory as StoreCategory,
      isOpen: store.isOpen,
      rating: store.storeRating,
    }));
  }, [debouncedQuery, searchedStores, stores]);

  const locationMap = useMemo(() => {
    return new Map(
      (locationsData?.stores ?? []).map((store) => [
        store.store_id,
        { lat: store.latitude, lng: store.longitude },
      ]),
    );
  }, [locationsData]);

  const mapMarkers = useMemo(() => {
    return displayedStores
      .map((store) => {
        const location = locationMap.get(store.id);

        if (!location) {
          return null;
        }

        return {
          id: store.id,
          lat: location.lat,
          lng: location.lng,
          name: store.name,
        };
      })
      .filter((marker): marker is NonNullable<typeof marker> => marker !== null);
  }, [displayedStores, locationMap]);

  useEffect(() => {
    if (displayedStores.length === 0) {
      setSelectedStoreId(null);
      return;
    }

    const selectedStillVisible = displayedStores.some((store) => store.id === selectedStoreId);

    if (!selectedStillVisible) {
      setSelectedStoreId(displayedStores[0].id);
    }
  }, [displayedStores, selectedStoreId]);

  const isLoading = isStoreListLoading || isLocationsLoading;
  const hasError = isStoreListError || isLocationsError || isSearchError;

  return (
    <div className={styles.root}>
      <div className={styles.mapLayer}>
        <KakaoMap markers={mapMarkers} onMarkerClick={setSelectedStoreId} />
        <div className={styles.mapDimmer} />
      </div>

      <div className={styles.topLeft}>
        <Button
          variant="primary"
          width={74}
          height={74}
          radius={24}
          aria-label="메뉴 열기"
          className={styles.menuButton}
        >
          <CommonIcon name="hamburger" size={40} variant="inherit" />
        </Button>
      </div>

      <div className={styles.topCenter}>
        <button
          type="button"
          className={styles.filterButton}
          aria-label="필터"
          onClick={() => setIsFilterOpen(true)}
        >
          <CommonIcon name="filter" size={24} className={styles.filterIcon} />
          <span>필터</span>
        </button>
      </div>

      <aside className={styles.rightPanel}>
        <div className={styles.searchWrap}>
          <Input
            variant="search"
            placeholder="지금, 먹고 싶은 음식은?"
            leftIcon={<CommonIcon name="search" size={26} />}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            containerClassName={styles.searchInput}
          />
        </div>

        {hasError ? <div className={styles.feedbackCard}>식당 정보를 불러오지 못했습니다.</div> : null}

        <div className={styles.list}>
          {isLoading || isSearching ? (
            <div className={styles.feedbackCard}>식당 정보를 불러오는 중입니다.</div>
          ) : displayedStores.length === 0 ? (
            <div className={styles.feedbackCard}>조건에 맞는 식당이 없습니다.</div>
          ) : (
            displayedStores.map((store) => {
              const isSelected = selectedStoreId === store.id;

              return (
                <button
                  key={store.id}
                  type="button"
                  className={`${styles.card} ${isSelected ? styles.cardSelected : ''}`}
                  onClick={() => setSelectedStoreId(store.id)}
                >
                  <div className={styles.cardTop}>
                    <Chip variant={store.isOpen ? 'open' : 'closed'} size="sm" className={styles.categoryChip}>
                      {categoryLabelMap[store.category] ?? store.category}
                    </Chip>
                    <Chip variant={store.isOpen ? 'open' : 'closed'} size="sm" className={styles.statusChip}>
                      {store.isOpen ? '영업중' : '영업전'}
                    </Chip>
                  </div>

                  <div className={styles.cardBottom}>
                    <div className={styles.storeNameRow}>
                      <CommonIcon name="forkknife" size={30} className={styles.forkIcon} />
                      <span className={styles.storeName}>{store.name}</span>
                    </div>

                    <div className={styles.rating}>
                      <span className={styles.ratingLabel}>평점</span>
                      <CommonIcon name="starline" size={18} className={styles.starIcon} />
                      <span className={styles.ratingValue}>{store.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      <div className={styles.bottomLeft}>
        <Button variant="primary" height={64} radius={18} className={styles.recommendButton}>
          <span className={styles.inlineIcon}>
            <CommonIcon name="plus" size={18} />
          </span>
          장소 추천하기
        </Button>
      </div>

      <Modal
        open={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="필터"
        closeOnOverlayClick
        className={styles.filterModal}
        headerLeft={
          <button
            type="button"
            className={styles.filterBackButton}
            aria-label="필터 닫기"
            onClick={() => setIsFilterOpen(false)}
          >
            <CommonIcon name="leftdir" size={28} />
          </button>
        }
      >
        <div className={styles.filterModalBody}>
          <section className={styles.filterSection}>
            <div className={styles.filterSectionHeader}>
              <h3 className={styles.filterSectionTitle}>정렬</h3>
              <span className={styles.filterBadge}>추천순</span>
            </div>

            <div className={styles.filterGrid}>
              <button type="button" className={`${styles.filterPill} ${styles.filterPillActive}`}>
                <span>추천순</span>
                <span className={styles.filterRadio} />
              </button>
              <button type="button" className={styles.filterPill}>
                <span>평점 높은순</span>
                <span className={styles.filterRadio} />
              </button>
              <button type="button" className={styles.filterPill}>
                <span>혼밥 레벨순</span>
                <span className={styles.filterRadio} />
              </button>
              <button type="button" className={styles.filterPill}>
                <span>리뷰 많은순</span>
                <span className={styles.filterRadio} />
              </button>
            </div>
          </section>

          <section className={styles.filterSection}>
            <div className={styles.filterSectionHeader}>
              <h3 className={styles.filterSectionTitle}>음식 카테고리</h3>
            </div>

            <div className={styles.categoryGrid}>
              <button type="button" className={`${styles.categoryPill} ${styles.categoryPillActive}`}>
                한식
              </button>
              <button type="button" className={styles.categoryPill}>중식</button>
              <button type="button" className={styles.categoryPill}>일식</button>
              <button type="button" className={styles.categoryPill}>양식</button>
              <button type="button" className={styles.categoryPill}>분식</button>
              <button type="button" className={styles.categoryPill}>카페</button>
              <button type="button" className={styles.categoryPill}>아시안</button>
              <button type="button" className={styles.categoryPill}>기타</button>
            </div>
          </section>

          <div className={styles.filterActions}>
            <button type="button" className={styles.resetButton}>초기화</button>
            <button type="button" className={styles.applyButton}>적용</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
