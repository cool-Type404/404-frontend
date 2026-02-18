import { useCallback, useEffect, useState } from 'react';

import PlaceDetailModal from '@/features/place-detail/modals/PlaceDetailModal/PlaceDetailModal';
import PlaceReviewsModal from '@/features/place-detail/modals/PlaceReviewsModal/PlaceReviewsModal';
import PlaceWriteReviewModal from '@/features/place-detail/modals/PlaceWriteReviewModal/PlaceWriteReviewModal';

import type { PlaceDetail, Review } from '@/features/place-detail/mock_data/placeDetail.types';

type View = 'detail' | 'reviews' | 'write';

type Props = {
  open: boolean;
  onClose: () => void;
  place: PlaceDetail;
};

export default function PlaceDetailModalFlow({ open, onClose, place }: Props) {
  const [view, setView] = useState<View>('detail');
  const [reviewsState, setReviewsState] = useState<Review[]>(place.reviews ?? []);

  useEffect(() => {
    if (!open) return;
    setView('detail');
    setReviewsState(place.reviews ?? []);
  }, [open, place]);

  const handleMoreReviews = useCallback(() => setView('reviews'), []);
  const handleBack = useCallback(() => setView('detail'), []);
  const handleWriteReview = useCallback(() => setView('write'), []);

  const handleToggleLike = useCallback((review_id: number) => {
    setReviewsState((prev) =>
      prev.map((r) => {
        if (r.review_id !== review_id) return r;

        const liked = Boolean(r.liked_by_me);
        const current = r.like_count ?? 0;

        return {
          ...r,
          liked_by_me: !liked,
          like_count: Math.max(0, current + (liked ? -1 : 1)),
        };
      }),
    );
  }, []);

  const handleDeleteReview = useCallback((review_id: number) => {
    setReviewsState((prev) => prev.filter((r) => r.review_id !== review_id));
  }, []);

  if (!open) return null;

  if (view === 'reviews') {
    return (
      <PlaceReviewsModal
        open={open}
        onClose={onClose}
        onBack={handleBack}
        placeName={place.store_name}
        reviews={reviewsState}
        onToggleLike={handleToggleLike}
        onDeleteReview={handleDeleteReview}
      />
    );
  }

  if (view === 'write') {
    return (
      <PlaceWriteReviewModal
        open={open}
        onClose={onClose}
        onBack={handleBack}
        placeId={place.store_info_id}
        placeName={place.store_name}
      />
    );
  }

  const placeWithStateReviews: PlaceDetail = { ...place, reviews: reviewsState };

  return (
    <PlaceDetailModal
      open={open}
      onClose={onClose}
      place={placeWithStateReviews}
      onMoreReviews={handleMoreReviews}
      onWriteReview={handleWriteReview}
      onToggleLike={handleToggleLike}
      onDeleteReview={handleDeleteReview}
    />
  );
}
