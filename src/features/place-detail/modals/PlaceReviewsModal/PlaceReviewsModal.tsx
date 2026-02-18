import Modal from '@/components/Modal/Modal';
import IconButton from '@/components/IconButton/IconButton';
import { CommonIcon } from '@/components/CommonIcon/CommonIcon';

import ReviewCard from '@/features/place-detail/components/ReviewCard/ReviewCard';
import type { Review } from '@/features/place-detail/mock_data/placeDetail.types';

import styles from './PlaceReviewsModal.module.css';

type Props = {
  open: boolean;
  onClose: () => void;
  onBack: () => void;
  placeName: string;
  reviews: Review[];
  onToggleLike?: (reviewId: number) => void;
  onDeleteReview?: (reviewId: number) => void;
};

export default function PlaceReviewsModal({
  open,
  onClose,
  onBack,
  placeName,
  reviews,
  onToggleLike,
  onDeleteReview,
}: Props) {
  const HeaderLeft = (
    <IconButton ariaLabel="뒤로가기" tone="green" size={25} onClick={onBack}>
      <CommonIcon name="leftdir" />
    </IconButton>
  );

  const HeaderRight = (
    <IconButton ariaLabel="닫기" tone="green" size={25} onClick={onClose}>
      <CommonIcon name="crossclose" />
    </IconButton>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="식당 리뷰"
      titleAlign="center"
      headerLeft={HeaderLeft}
      headerRight={HeaderRight}
      closeOnEsc={false}
      closeOnOverlayClick={false}
      className={styles.reviewsModal}
    >
      <div className={styles.subTitle} aria-hidden="true">
        {placeName}
      </div>

      <div className={styles.list}>
        {reviews.map((r) => {
          const tags =
            r.hashtags?.map((h) =>
              h.hashtag_name.startsWith('#') ? h.hashtag_name : `#${h.hashtag_name}`,
            ) ?? undefined;

          const firstImage = r.review_images?.[0]?.review_img_path;

          const reviewIdNumber = Number(r.review_id);

          return (
            <ReviewCard
              key={r.review_id}
              id={r.review_id}
              author={r.user_nickname ?? '익명'}
              date={r.created_at}
              rating={r.review_rating}
              content={r.review_contents}
              tags={tags}
              imageUrl={firstImage}
              likesCount={r.like_count ?? 0}
              likedByMe={Boolean(r.liked_by_me)}
              isMine={Boolean(r.is_mine)}
              onToggleLike={() => onToggleLike?.(reviewIdNumber)}
              onDelete={() => onDeleteReview?.(reviewIdNumber)}
            />
          );
        })}
      </div>
    </Modal>
  );
}