import PlaceHeaderSection from './sections/PlaceHeaderSection/PlaceHeaderSection';
import MenuSection from './sections/MenuSection/MenuSection';
import SeatSection from './sections/SeatSection/SeatSection';
import ReviewSection from './sections/ReviewSection/ReviewSection';
import HoursSection from './sections/HoursSection/HoursSection';
import StickyTabs from './components/StickyTabs/StickyTabs';

import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './PlaceDetailModal.module.css';
import Modal from '@/components/Modal/Modal';

import type { PlaceDetail } from '@/features/place-detail/mock_data/placeDetail.types';
import { Divider } from '@/components/Divider';
import { CommonIcon } from '@/components/CommonIcon/CommonIcon';
import Chip from '@/components/Chip/Chip';
import IconButton from '@/components/IconButton/IconButton';

type TabKey = 'menu' | 'seats' | 'reviews' | 'hours';

type Props = {
  open: boolean;
  onClose: () => void;
  place: PlaceDetail;
  onMoreReviews: () => void;
  onWriteReview: () => void;
  onToggleLike?: (reviewId: string | number) => void;
  onDeleteReview?: (reviewId: string | number) => void;
};

export default function PlaceDetailModal({
  open,
  onClose,
  place,
  onMoreReviews,
  onWriteReview,
  onToggleLike,
  onDeleteReview,
}: Props) {
  const [bookmarked, setBookmarked] = useState<boolean>(Boolean(place.bookmarked));
  const [activeTab, setActiveTab] = useState<TabKey>('menu');

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLElement | null>(null);
  const seatsRef = useRef<HTMLElement | null>(null);
  const reviewsRef = useRef<HTMLElement | null>(null);
  const hoursRef = useRef<HTMLElement | null>(null);

  const getScrollContainer = () => {
    return scrollRef.current?.parentElement as HTMLDivElement | null;
  };

  useEffect(() => {
    if (!open) return;

    setBookmarked(Boolean(place.bookmarked));
    setActiveTab('menu');

    requestAnimationFrame(() => {
      getScrollContainer()?.scrollTo({ top: 0 });
    });
  }, [open, place.bookmarked]);

  const ratingText =
    !place.avg_rating || place.reviews.length === 0
      ? '평점 없음'
      : `${place.avg_rating.toFixed(1)} / 5`;

  const scrollTo = useCallback((key: TabKey) => {
    const node =
      key === 'menu'
        ? menuRef.current
        : key === 'seats'
          ? seatsRef.current
          : key === 'reviews'
            ? reviewsRef.current
            : hoursRef.current;

    const container = getScrollContainer();
    if (!node || !container) return;

    const containerRect = container.getBoundingClientRect();
    const nodeRect = node.getBoundingClientRect();

    const offset = nodeRect.top - containerRect.top + container.scrollTop - 52;

    container.scrollTo({
      top: Math.max(offset, 0),
      behavior: 'smooth',
    });

    setActiveTab(key);
  }, []);

  const updateActiveTabByScroll = useCallback(() => {
    const container = getScrollContainer();
    if (!container) return;

    const containerRect = container.getBoundingClientRect();

    const sections = [
      { key: 'menu' as TabKey, ref: menuRef },
      { key: 'seats' as TabKey, ref: seatsRef },
      { key: 'reviews' as TabKey, ref: reviewsRef },
      { key: 'hours' as TabKey, ref: hoursRef },
    ];

    let current: TabKey = 'menu';

    for (const section of sections) {
      const el = section.ref.current;
      if (!el) continue;

      const rect = el.getBoundingClientRect();

      if (rect.top - containerRect.top <= 60) {
        current = section.key;
      }
    }

    setActiveTab(current);
  }, []);

  useEffect(() => {
    const container = getScrollContainer();
    if (!container) return;

    const onScroll = () => {
      requestAnimationFrame(updateActiveTabByScroll);
    };

    container.addEventListener('scroll', onScroll);
    return () => {
      container.removeEventListener('scroll', onScroll);
    };
  }, [updateActiveTabByScroll]);

  if (!open) return null;

  const HeaderLeft = (
    <div className={styles.headerLeft}>
      <IconButton
        ariaLabel={bookmarked ? '북마크 해제' : '북마크'}
        tone="green"
        size={25}
        onClick={() => setBookmarked((v) => !v)}
      >
        <CommonIcon name={bookmarked ? 'bookmarkfiiled' : 'bookmarkline'} />
      </IconButton>

      <div className={styles.headerCenterOverlay} aria-hidden="true">
        <Chip variant={place.current_open ? 'open' : 'closed'} size="sm">
          {place.current_open ? '영업중' : '영업전'}
        </Chip>
        <span className={styles.headerTitleText}>{place.store_name}</span>
      </div>
    </div>
  );

  const HeaderRight = (
    <IconButton ariaLabel="닫기" tone="green" size={25} onClick={onClose}>
      <CommonIcon name="crossclose" />
    </IconButton>
  );

    const tabItems = [
    { key: 'menu' as const, label: '전체메뉴', iconName: 'forkknife' as const },
    { key: 'seats' as const, label: '좌석수', iconName: 'chair' as const },
    { key: 'reviews' as const, label: '식당리뷰', iconName: 'review' as const },
    { key: 'hours' as const, label: '영업시간', iconName: 'openinghour' as const },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      titleAlign="left"
      headerLeft={HeaderLeft}
      headerRight={HeaderRight}
      closeOnEsc={false}
      closeOnOverlayClick={false}
      className={styles.placeModal}
    >
      <div className={styles.body} ref={scrollRef}>
        <PlaceHeaderSection place={place} ratingText={ratingText} />

        <StickyTabs<TabKey> activeTab={activeTab} onTabClick={scrollTo} items={tabItems} />

        <Divider spacing={12} color="#6fbf3a" />

        {/* Sections */}
        <MenuSection menus={place.store_menus} sectionRef={menuRef} />

        <Divider spacing={12} color="#6fbf3a" />

        <SeatSection storeSeat={place.store_seat} sectionRef={seatsRef} />

        <Divider spacing={12} color="#6fbf3a" />

        <ReviewSection
          reviews={place.reviews}
          onWriteReview={onWriteReview}
          onMoreReviews={onMoreReviews}
          onToggleLike={onToggleLike}
          onDeleteReview={onDeleteReview}
          sectionRef={reviewsRef}
        />

        <Divider spacing={12} color="#6fbf3a" />

        <HoursSection opening_hours={place.opening_hours} sectionRef={hoursRef} />

        <div className={styles.bottomSpace} />
      </div>
    </Modal>
  );
}
