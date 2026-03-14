import { useCallback, useEffect, useState } from 'react';

import Button from '@/components/Button/Button';
import Modal from '@/components/Modal/Modal';
import { getBookmarkList, type BookmarkStore } from '@/features/place-detail/api/placeDetail.api';
import { useBookmark } from '@/features/place-detail/hooks/useBookmark';
import { useDeleteReview } from '@/features/place-detail/hooks/useDeleteReview';
import { usePlaceDetail } from '@/features/place-detail/hooks/usePlaceDetail';
import { usePlaceReviews } from '@/features/place-detail/hooks/usePlaceReviews';
import { useReviewLike } from '@/features/place-detail/hooks/useReviewLike';
import { useWriteReview } from '@/features/place-detail/hooks/useWriteReview';
import type { PlaceDetail, Review } from '@/features/place-detail/mock_data/placeDetail.types';
import PlaceDetailModal from '@/features/place-detail/modals/PlaceDetailModal/PlaceDetailModal';
import styles from '@/features/place-detail/modals/PlaceDetailModal/PlaceDetailModal.module.css';
import PlaceReviewsModal from '@/features/place-detail/modals/PlaceReviewsModal/PlaceReviewsModal';
import PlaceWriteReviewModal, {
  type CreateReviewPayload,
} from '@/features/place-detail/modals/PlaceWriteReviewModal/PlaceWriteReviewModal';
import { getIsStoreOpen } from '@/utils/openingHours';

type View = 'detail' | 'reviews' | 'write';

type Props = {
  open: boolean;
  onClose: () => void;
  storeId: number | string | null;
};

export default function PlaceDetailModalFlow({ open, onClose, storeId }: Props) {
  const [view, setView] = useState<View>('detail');
  const [reviewsState, setReviewsState] = useState<Review[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isDeleteBlockedOpen, setIsDeleteBlockedOpen] = useState(false);

  const currentNickname = window.localStorage.getItem('userNickname') ?? '';
  const isAuthenticated = Boolean(window.localStorage.getItem('accessToken'));
  const storeIdNum = storeId != null && !Number.isNaN(Number(storeId)) ? Number(storeId) : null;

  const { data: detailData, isLoading: isDetailLoading } = usePlaceDetail(storeIdNum ?? 0);
  const { data: reviewsData } = usePlaceReviews(storeIdNum ?? 0);
  const { addBookmark, removeBookmark } = useBookmark(storeIdNum ?? 0);
  const { like, unlike } = useReviewLike(storeIdNum ?? 0);
  const writeReview = useWriteReview(storeIdNum ?? 0);
  const deleteReviewMutation = useDeleteReview(storeIdNum ?? 0);

  useEffect(() => {
    if (!open || storeIdNum == null) return;

    getBookmarkList()
      .then((bookmarks: BookmarkStore[]) => {
        setIsBookmarked(bookmarks.some((bookmark) => bookmark.storeId === storeIdNum));
      })
      .catch(() => {
        setIsBookmarked(false);
      });
  }, [open, storeIdNum]);

  const place: PlaceDetail | null =
    detailData && storeIdNum != null
      ? {
          storeInfoPK: detailData.storeInfoPK,
          store_name: detailData.storeName,
          store_type: detailData.storeCategory,
          current_open: getIsStoreOpen(
            detailData.openingHours.map((openingHour) => ({
              days: openingHour.days,
              start_time: openingHour.startTime,
              end_time: openingHour.endTime,
              break_start_time: openingHour.breakStartTime ?? null,
              break_end_time: openingHour.breakEndTime ?? null,
            })),
          ),
          avg_rating: detailData.avgRating,
          store_number: detailData.storeNumber,
          bookmarked: isBookmarked,
          store_menus: detailData.menus.map((menu) => ({
            menu_id: menu.menuId,
            storeInfoPK: detailData.storeInfoPK,
            menu_name: menu.menuName,
            price: Number(menu.price),
            is_rec: menu.isRec,
            menu_img: menu.menuImg ?? null,
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
          opening_hours: detailData.openingHours.map((openingHour) => ({
            opening_hours_id: openingHour.openingHoursId,
            storeInfoPK: detailData.storeInfoPK,
            days: openingHour.days,
            start_time: openingHour.startTime,
            end_time: openingHour.endTime,
            break_start_time: openingHour.breakStartTime ?? null,
            break_end_time: openingHour.breakEndTime ?? null,
          })),
        }
      : null;

  useEffect(() => {
    if (!open) return;

    setView('detail');
    setIsDeleteBlockedOpen(false);

    if (!reviewsData) return;

    const converted: Review[] = reviewsData.map((review) => ({
      review_id: review.reviewId,
      storeInfoPK: storeIdNum ?? 0,
      user_id: review.userId ?? review.reviewId,
      review_contents: review.reviewContents,
      review_rating: review.reviewRating,
      created_at: review.createdAt,
      user_nickname: review.userNickname ?? review.reviewWriter ?? '익명',
      like_count: review.likeCount ?? 0,
      liked_by_me: review.isLiked ?? false,
      is_mine:
        isAuthenticated &&
        currentNickname.length > 0 &&
        (review.userNickname ?? review.reviewWriter ?? '') === currentNickname,
      hashtags: (review.hashtags ?? []).map((hashtag, index) => ({
        hashtag_id: typeof hashtag === 'string' ? `${review.reviewId}-${index}` : hashtag.hashtagId,
        review_id: review.reviewId,
        hashtag_name: typeof hashtag === 'string' ? hashtag : hashtag.hashtagName,
      })),
      review_images: (review.reviewImages ?? []).map((image, index) => ({
        review_img_id: typeof image === 'string' ? `${review.reviewId}-img-${index}` : image.reviewImgId,
        review_id: review.reviewId,
        review_img_path: typeof image === 'string' ? image : null,
      })),
    }));

    setReviewsState(converted);
  }, [currentNickname, isAuthenticated, open, reviewsData, storeIdNum]);

  const handleMoreReviews = useCallback(() => setView('reviews'), []);
  const handleBack = useCallback(() => setView('detail'), []);

  const handleWriteReview = useCallback(() => {
    if (!isAuthenticated) {
      window.alert('로그인 후 리뷰를 작성할 수 있습니다.');
      return;
    }

    setView('write');
  }, [isAuthenticated]);

  const handleBookmarkToggle = useCallback(
    (isCurrentlyBookmarked: boolean) => {
      if (!isAuthenticated) {
        window.alert('로그인 후 북마크를 이용할 수 있습니다.');
        return false;
      }

      if (isCurrentlyBookmarked) {
        removeBookmark.mutate(undefined, {
          onSuccess: () => setIsBookmarked(false),
        });
        return true;
      }

      addBookmark.mutate(undefined, {
        onSuccess: () => setIsBookmarked(true),
      });
      return true;
    },
    [addBookmark, isAuthenticated, removeBookmark],
  );

  const handleToggleLike = useCallback(
    (reviewId: string | number) => {
      if (!isAuthenticated) {
        window.alert('로그인 후 리뷰 좋아요를 누를 수 있습니다.');
        return;
      }

      const id = Number(reviewId);
      const review = reviewsState.find((item) => item.review_id === reviewId);
      if (!review) return;

      setReviewsState((prev) =>
        prev.map((item) => {
          if (item.review_id !== reviewId) return item;
          const liked = Boolean(item.liked_by_me);
          return {
            ...item,
            liked_by_me: !liked,
            like_count: Math.max(0, (item.like_count ?? 0) + (liked ? -1 : 1)),
          };
        }),
      );

      if (review.liked_by_me) {
        unlike.mutate(id);
      } else {
        like.mutate(id);
      }
    },
    [isAuthenticated, like, reviewsState, unlike],
  );

  const handleDeleteReview = useCallback(
    (reviewId: string | number) => {
      const review = reviewsState.find((item) => item.review_id === reviewId);

      if (!isAuthenticated || !review?.is_mine) {
        setIsDeleteBlockedOpen(true);
        return;
      }

      const id = Number(reviewId);
      setReviewsState((prev) => prev.filter((item) => item.review_id !== reviewId));
      deleteReviewMutation.mutate(id);
    },
    [deleteReviewMutation, isAuthenticated, reviewsState],
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

  if (!open || storeIdNum == null) return null;
  if (isDetailLoading) return <div>로딩 중.</div>;
  if (!place) return null;

  const deleteBlockedModal = (
    <Modal
      open={isDeleteBlockedOpen}
      onClose={() => setIsDeleteBlockedOpen(false)}
      closeOnOverlayClick
      className={styles.infoModal}
    >
      <div className={styles.infoModalBody}>
        <p className={styles.infoModalMessage}>리뷰를 삭제할 수 없습니다.</p>
        <Button
          variant="primary"
          height={42}
          className={styles.infoModalButton}
          onClick={() => setIsDeleteBlockedOpen(false)}
        >
          확인
        </Button>
      </div>
    </Modal>
  );

  if (view === 'reviews') {
    return (
      <>
        <PlaceReviewsModal
          open={open}
          onClose={onClose}
          onBack={handleBack}
          placeName={place.store_name}
          reviews={reviewsState}
          onToggleLike={handleToggleLike}
          onDeleteReview={handleDeleteReview}
        />
        {deleteBlockedModal}
      </>
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
        isSubmitting={writeReview.isPending}
        submitError={writeReview.error instanceof Error ? writeReview.error.message : ''}
        onSubmitReview={handleSubmitReview}
      />
    );
  }

  const placeWithStateReviews: PlaceDetail = { ...place, reviews: reviewsState };

  return (
    <>
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
      {deleteBlockedModal}
    </>
  );
}
