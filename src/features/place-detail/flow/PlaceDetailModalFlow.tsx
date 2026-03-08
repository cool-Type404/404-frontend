import { useCallback, useEffect, useState } from 'react';

import PlaceDetailModal from '@/features/place-detail/modals/PlaceDetailModal/PlaceDetailModal';
import PlaceReviewsModal from '@/features/place-detail/modals/PlaceReviewsModal/PlaceReviewsModal';
import PlaceWriteReviewModal, {
  type CreateReviewPayload,
} from '@/features/place-detail/modals/PlaceWriteReviewModal/PlaceWriteReviewModal';

import type { PlaceDetail, Review } from '@/features/place-detail/mock_data/placeDetail.types';

import { usePlaceDetail } from '@/features/place-detail/hooks/usePlaceDetail';
import { usePlaceReviews } from '@/features/place-detail/hooks/usePlaceReviews';
import { useBookmark } from '@/features/place-detail/hooks/useBookmark';
import { useReviewLike } from '@/features/place-detail/hooks/useReviewLike';
import { useWriteReview } from '@/features/place-detail/hooks/useWriteReview';
import { useDeleteReview } from '@/features/place-detail/hooks/useDeleteReview';
import { getBookmarkList, type BookmarkStore } from '@/features/place-detail/api/placeDetail.api';

// 추후 auth context/store에서 실제 로그인 유저 ID로 교체해야함
const CURRENT_USER_ID = 1;

type View = 'detail' | 'reviews' | 'write';

type Props = {
  open: boolean;
  onClose: () => void;
  storeId: number | string | null;
};

export default function PlaceDetailModalFlow({ open, onClose, storeId }: Props) {
  const [view, setView] = useState<View>('detail');
  const [reviewsState, setReviewsState] = useState<Review[]>([]);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);

  const storeIdNum = storeId != null && !Number.isNaN(Number(storeId)) ? Number(storeId) : null;

  // API 훅
  const { data: detailData, isLoading: isDetailLoading } = usePlaceDetail(storeIdNum ?? 0);
  const { data: reviewsData } = usePlaceReviews(storeIdNum ?? 0);
  const { addBookmark, removeBookmark } = useBookmark(storeIdNum ?? 0);
  const { like, unlike } = useReviewLike(storeIdNum ?? 0);
  const writeReview = useWriteReview(storeIdNum ?? 0);
  const deleteReviewMutation = useDeleteReview(storeIdNum ?? 0);

  // 북마크 초기 상태 확인
  useEffect(() => {
    if (!open || storeIdNum == null) return;

    getBookmarkList()
      .then((bookmarks: BookmarkStore[]) => {
        const bookmarked = bookmarks.some((b: BookmarkStore) => b.storeId === storeIdNum);
        setIsBookmarked(bookmarked);
      })
      .catch(() => {
        setIsBookmarked(false);
      });
  }, [open, storeIdNum]);

  // API 데이터 → PlaceDetail 타입 변환
  const place: PlaceDetail | null =
    detailData && storeIdNum != null
      ? {
          storeInfoPK: detailData.storeInfoPK,
          store_name: detailData.storeName,
          store_type: detailData.storeCategory,
          current_open: detailData.isOpen,
          avg_rating: detailData.avgRating,
          store_number: detailData.storeNumber,
          bookmarked: isBookmarked,
          store_menus: detailData.menus.map((m) => ({
            menu_id: m.menuId,
            storeInfoPK: detailData.storeInfoPK,
            menu_name: m.menuName,
            price: Number(m.price),
            is_rec: m.isRec,
            menu_img: m.menuImg ?? null,
          })),
          store_seat:
            detailData.seats.length > 0
              ? {
                  seat_id: 0,
                  storeInfoPK: detailData.storeInfoPK,
                  single_seat: detailData.seats[0].singleSeat,
                  double_seat: detailData.seats[0].doubleSeat,
                  triple_seat: detailData.seats[0].tripleSeat,
                }
              : {
                  seat_id: 0,
                  storeInfoPK: detailData.storeInfoPK,
                  single_seat: false,
                  double_seat: false,
                  triple_seat: false,
                },
          reviews: [],
          opening_hours: detailData.openingHours.map((oh) => ({
            opening_hours_id: oh.openingHoursId,
            storeInfoPK: detailData.storeInfoPK,
            days: oh.days,
            start_time: oh.startTime,
            end_time: oh.endTime,
            break_start_time: oh.breakStartTime ?? null,
            break_end_time: oh.breakEndTime ?? null,
          })),
        }
      : null;

  // API 리뷰 → Review 타입 변환
  useEffect(() => {
    if (!open) return;
    setView('detail');

    if (reviewsData) {
      const converted: Review[] = reviewsData.map((r) => ({
        review_id: r.reviewId,
        storeInfoPK: storeIdNum ?? 0,
        user_id: r.userId,
        review_contents: r.reviewContents,
        review_rating: r.reviewRating,
        created_at: r.createdAt,
        user_nickname: r.userNickname,
        like_count: r.likeCount,
        liked_by_me: r.isLiked,
        is_mine: r.userId === CURRENT_USER_ID,
        hashtags: r.hashtags.map((h) => ({
          hashtag_id: h.hashtagId,
          review_id: r.reviewId,
          hashtag_name: h.hashtagName,
        })),
        review_images: r.reviewImages.map((img) => ({
          review_img_id: img.reviewImgId,
          review_id: r.reviewId,
          review_img_path: null,
        })),
      }));
      setReviewsState(converted);
    }
  }, [open, reviewsData, storeIdNum]);

  // 핸들러
  const handleMoreReviews = useCallback(() => setView('reviews'), []);
  const handleBack = useCallback(() => setView('detail'), []);
  const handleWriteReview = useCallback(() => setView('write'), []);

  const handleBookmarkToggle = useCallback(
    (isCurrentlyBookmarked: boolean) => {
      if (isCurrentlyBookmarked) {
        removeBookmark.mutate();
      } else {
        addBookmark.mutate();
      }
      setIsBookmarked((prev) => !prev);
    },
    [addBookmark, removeBookmark],
  );

  const handleToggleLike = useCallback(
    (review_id: string | number) => {
      const id = Number(review_id);
      const review = reviewsState.find((r) => r.review_id === review_id);
      if (!review) return;

      setReviewsState((prev) =>
        prev.map((r) => {
          if (r.review_id !== review_id) return r;
          const liked = Boolean(r.liked_by_me);
          return {
            ...r,
            liked_by_me: !liked,
            like_count: Math.max(0, (r.like_count ?? 0) + (liked ? -1 : 1)),
          };
        }),
      );

      if (review.liked_by_me) {
        unlike.mutate(id);
      } else {
        like.mutate(id);
      }
    },
    [reviewsState, like, unlike],
  );

  const handleDeleteReview = useCallback(
    (review_id: string | number) => {
      const id = Number(review_id);
      setReviewsState((prev) => prev.filter((r) => r.review_id !== review_id));
      deleteReviewMutation.mutate(id);
    },
    [deleteReviewMutation],
  );

  const handleSubmitReview = useCallback(
    (payload: CreateReviewPayload) => {
      writeReview.mutate(
        {
          reviewContents: payload.content,
          reviewRating: payload.rating,
          hashtags: payload.hashtags ?? [],
          images: payload.images,
        },
        {
          onSuccess: () => setView('detail'),
        },
      );
    },
    [writeReview],
  );

  // 얼리 리턴
  if (!open || storeIdNum == null) return null;
  if (isDetailLoading) return <div>로딩 중...</div>;
  if (!place) return null;

  // view 분기
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
        placeId={place.storeInfoPK}
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
      onBookmarkToggle={handleBookmarkToggle}
      onToggleLike={handleToggleLike}
      onDeleteReview={handleDeleteReview}
    />
  );
}
