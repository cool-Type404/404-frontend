import { useEffect, useMemo, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { useQueries } from '@tanstack/react-query';

import KakaoMap from '../components/KakaoMap';
import Button from '../components/Button/Button';
import Input from '../components/Input/Input';
import Chip from '../components/Chip/Chip';
import Modal from '../components/Modal/Modal';
import { CommonIcon } from '../components/CommonIcon/CommonIcon';
import { useRestaurantList } from '@/features/main-map/hooks/useRestaurantList';
import { useStoreLocations } from '@/features/main-map/hooks/useStoreLocations';
import { useStoreSearch } from '@/features/main-map/hooks/useStoreSearch';
import { useFilteredStores } from '@/features/main-map/hooks/useFilteredStores';
import { getStoreDetail, getStoreReviews } from '@/features/place-detail/api/placeDetail.api';

import styles from './MapScreen.module.css';

type StoreCategory = 'KOREAN' | 'JAPANESE' | 'CHINESE' | 'WESTERN' | 'SNACK' | 'ASIAN';
type SortKey = 'recommend' | 'rating' | 'eatingLevel' | 'reviews';

type StoreSummary = {
  id: number;
  name: string;
  category: StoreCategory;
  isOpen: boolean;
  rating: number;
};

type CategoryOption = {
  label: string;
  value: StoreCategory;
};

const categoryLabelMap: Record<StoreCategory, string> = {
  KOREAN: '한식',
  JAPANESE: '일식',
  CHINESE: '중식',
  WESTERN: '양식',
  SNACK: '분식',
  ASIAN: '아시안',
};

const categoryOptions: CategoryOption[] = [
  { label: '한식', value: 'KOREAN' },
  { label: '중식', value: 'CHINESE' },
  { label: '일식', value: 'JAPANESE' },
  { label: '양식', value: 'WESTERN' },
  { label: '분식', value: 'SNACK' },
  { label: '아시안', value: 'ASIAN' },
];

const sortOptions: Array<{ key: SortKey; label: string }> = [
  { key: 'recommend', label: '추천순' },
  { key: 'rating', label: '평점 높은순' },
  { key: 'eatingLevel', label: '혼밥 레벨순' },
  { key: 'reviews', label: '리뷰 많은순' },
];

const getEatingLevelRank = (value: string | undefined) => {
  if (!value) return Number.MAX_SAFE_INTEGER;
  const rank = Number.parseInt(value, 10);
  return Number.isNaN(rank) ? Number.MAX_SAFE_INTEGER : rank;
};

const toStoreSummary = (store: {
  storeInfoPK: number;
  storeName: string;
  storeCategory: string;
  isOpen: boolean;
  storeRating: number;
}): StoreSummary => ({
  id: store.storeInfoPK,
  name: store.storeName,
  category: store.storeCategory as StoreCategory,
  isOpen: store.isOpen,
  rating: store.storeRating,
});

export default function MapScreen() {
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [appliedSort, setAppliedSort] = useState<SortKey>('recommend');
  const [draftSort, setDraftSort] = useState<SortKey>('recommend');
  const [appliedCategories, setAppliedCategories] = useState<StoreCategory[]>([]);
  const [draftCategories, setDraftCategories] = useState<StoreCategory[]>([]);
  const [debouncedQuery] = useDebounce(searchQuery, 300);

  const {
    data: stores = [],
    isLoading: isStoreListLoading,
    isError: isStoreListError,
  } = useRestaurantList();
  const {
    data: filteredStores = [],
    isLoading: isFilteredStoresLoading,
    isError: isFilteredStoresError,
  } = useFilteredStores(appliedCategories);
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

  const baseStores = useMemo(() => {
    if (debouncedQuery.trim()) {
      return searchedStores;
    }

    if (appliedCategories.length > 0) {
      return filteredStores;
    }

    return stores;
  }, [appliedCategories.length, debouncedQuery, filteredStores, searchedStores, stores]);

  const baseSummaries = useMemo(() => {
    const summaries = baseStores.map(toStoreSummary);

    if (!debouncedQuery.trim() || appliedCategories.length === 0) {
      return summaries;
    }

    return summaries.filter((store) => appliedCategories.includes(store.category));
  }, [appliedCategories, baseStores, debouncedQuery]);

  const sortMetaQueries = useQueries({
    queries: baseSummaries.map((store) => {
      if (appliedSort === 'eatingLevel') {
        return {
          queryKey: ['storeEatingLevel', store.id],
          queryFn: async () => {
            const detail = await getStoreDetail(store.id);
            return {
              storeId: store.id,
              eatingLevel: detail.eatingLevel,
            };
          },
          staleTime: 5 * 60 * 1000,
        };
      }

      if (appliedSort === 'reviews') {
        return {
          queryKey: ['storeReviewCount', store.id],
          queryFn: async () => {
            const reviews = await getStoreReviews(store.id);
            return {
              storeId: store.id,
              reviewCount: reviews.length,
            };
          },
          staleTime: 5 * 60 * 1000,
        };
      }

      return {
        queryKey: ['storeSortPlaceholder', store.id, appliedSort],
        queryFn: async () => ({ storeId: store.id }),
        enabled: false,
      };
    }),
  });

  const eatingLevelMap = useMemo(() => {
    return new Map(
      sortMetaQueries
        .map((query) => query.data)
        .filter(
          (item): item is { storeId: number; eatingLevel: string } =>
            Boolean(item && 'eatingLevel' in item && typeof item.eatingLevel === 'string'),
        )
        .map((item) => [item.storeId, item.eatingLevel]),
    );
  }, [sortMetaQueries]);

  const reviewCountMap = useMemo(() => {
    return new Map(
      sortMetaQueries
        .map((query) => query.data)
        .filter(
          (item): item is { storeId: number; reviewCount: number } =>
            Boolean(item && 'reviewCount' in item && typeof item.reviewCount === 'number'),
        )
        .map((item) => [item.storeId, item.reviewCount]),
    );
  }, [sortMetaQueries]);

  const displayedStores = useMemo(() => {
    const copied = [...baseSummaries];

    switch (appliedSort) {
      case 'rating':
        copied.sort((a, b) => b.rating - a.rating);
        break;
      case 'eatingLevel':
        copied.sort(
          (a, b) =>
            getEatingLevelRank(eatingLevelMap.get(a.id)) - getEatingLevelRank(eatingLevelMap.get(b.id)),
        );
        break;
      case 'reviews':
        copied.sort((a, b) => (reviewCountMap.get(b.id) ?? -1) - (reviewCountMap.get(a.id) ?? -1));
        break;
      case 'recommend':
      default:
        break;
    }

    return copied;
  }, [appliedSort, baseSummaries, eatingLevelMap, reviewCountMap]);

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

  const handleOpenFilter = () => {
    setDraftSort(appliedSort);
    setDraftCategories(appliedCategories);
    setIsFilterOpen(true);
  };

  const handleToggleDraftCategory = (category: StoreCategory) => {
    setDraftCategories((current) =>
      current.includes(category)
        ? current.filter((value) => value !== category)
        : [...current, category],
    );
  };

  const handleResetFilter = () => {
    setDraftSort('recommend');
    setDraftCategories([]);
  };

  const handleApplyFilter = () => {
    setAppliedSort(draftSort);
    setAppliedCategories(draftCategories);
    setIsFilterOpen(false);
  };

  const isLoading = isStoreListLoading || isLocationsLoading || (appliedCategories.length > 0 && isFilteredStoresLoading);
  const isSortMetaLoading =
    (appliedSort === 'eatingLevel' || appliedSort === 'reviews') &&
    sortMetaQueries.some((query) => query.isLoading || query.isFetching);
  const hasError = isStoreListError || isLocationsError || isSearchError || isFilteredStoresError;

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
          onClick={handleOpenFilter}
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
          {isLoading || isSearching || isSortMetaLoading ? (
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
              <span className={styles.filterBadge}>
                {sortOptions.find((option) => option.key === draftSort)?.label ?? '추천순'}
              </span>
            </div>

            <div className={styles.filterGrid}>
              {sortOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  className={`${styles.filterPill} ${draftSort === option.key ? styles.filterPillActive : ''}`}
                  onClick={() => setDraftSort(option.key)}
                >
                  <span>{option.label}</span>
                  <span className={styles.filterRadio} />
                </button>
              ))}
            </div>
          </section>

          <section className={styles.filterSection}>
            <div className={styles.filterSectionHeader}>
              <h3 className={styles.filterSectionTitle}>음식 카테고리</h3>
            </div>

            <div className={styles.categoryGrid}>
              {categoryOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`${styles.categoryPill} ${draftCategories.includes(option.value) ? styles.categoryPillActive : ''}`}
                  onClick={() => handleToggleDraftCategory(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </section>

          <div className={styles.filterActions}>
            <button type="button" className={styles.resetButton} onClick={handleResetFilter}>
              초기화
            </button>
            <button type="button" className={styles.applyButton} onClick={handleApplyFilter}>
              적용
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
