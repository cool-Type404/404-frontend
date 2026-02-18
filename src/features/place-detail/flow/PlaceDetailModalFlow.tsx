import { useCallback, useEffect, useMemo, useState } from 'react';

import PlaceDetailModal from '@/features/place-detail/modals/PlaceDetailModal/PlaceDetailModal';
import PlaceReviewsModal from '@/features/place-detail/modals/PlaceReviewsModal/PlaceReviewsModal';
import PlaceWriteReviewModal, {
  type CreateReviewPayload,
} from '@/features/place-detail/modals/PlaceWriteReviewModal/PlaceWriteReviewModal';

import type {
  PlaceDetail,
  Review,
  HashTag,
} from '@/features/place-detail/mock_data/placeDetail.types';
import {
  mockPlaceDetailNoReviews,
  mockPlaceDetailWithReviews,
} from '@/features/place-detail/mock_data/placeDetail.mock';

type View = 'detail' | 'reviews' | 'write';

type Props = {
  open: boolean;
  onClose: () => void;
  storeId: number | string | null;
};

export default function PlaceDetailModalFlow({ open, onClose, storeId }: Props) {
  const [view, setView] = useState<View>('detail');
  const [reviewsState, setReviewsState] = useState<Review[]>([]);

  const place: PlaceDetail | null = useMemo(() => {
    if (storeId == null) return null;

    const idNum = Number(storeId);
    if (Number.isNaN(idNum)) return null;

    if (idNum % 2 === 0) return { ...mockPlaceDetailNoReviews, store_info_id: idNum };
    return { ...mockPlaceDetailWithReviews, store_info_id: idNum };
  }, [storeId]);

  useEffect(() => {
    if (!open) return;
    setView('detail');
    setReviewsState(place?.reviews ?? []);
  }, [open, place]);

  const handleMoreReviews = useCallback(() => setView('reviews'), []);
  const handleBack = useCallback(() => setView('detail'), []);
  const handleWriteReview = useCallback(() => setView('write'), []);

  const handleToggleLike = useCallback((review_id: string | number) => {
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

  const handleDeleteReview = useCallback((review_id: string | number) => {
    setReviewsState((prev) => prev.filter((r) => r.review_id !== review_id));
  }, []);

  const handleSubmitReview = useCallback((payload: CreateReviewPayload) => {
    const reviewId = `temp-${Date.now()}`;
    const now = new Date().toISOString();

    const hashtags: HashTag[] = (payload.hashtags ?? []).map((name, idx) => ({
      hashtag_id: `temp-hashtag-${reviewId}-${idx}`,
      review_id: reviewId,
      hashtag_name: name,
    }));

    const newReview: Review = {
      review_id: reviewId,
      store_info_id: payload.placeId,
      user_id: 'me',

      review_contents: payload.content,
      review_rating: payload.rating,
      created_at: now,

      user_nickname: '나',
      like_count: 0,
      liked_by_me: false,
      is_mine: true,

      hashtags,
      review_images: [],
    };

    setReviewsState((prev) => [newReview, ...prev]);
    setView('detail');
  }, []);

  if (!open) return null;
  if (storeId == null) return null;
  if (!place) return null;

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
        onSubmitReview={handleSubmitReview}
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
