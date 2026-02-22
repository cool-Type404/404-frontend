import type { Review } from '@/features/place-detail/mock_data/placeDetail.types';

import EmptyState from '@/components/EmptyState/EmptyState';
import ReviewCard from '@/features/place-detail/components/ReviewCard/ReviewCard';
import { Button } from '@/components/Button';

import { formatDateYMD } from '@/lib/date/formatDate';

import styles from './ReviewSection.module.css';

type Props = {
  reviews: Review[];
  onWriteReview: () => void;
  onMoreReviews: () => void;
  onToggleLike?: (reviewId: string | number) => void;
  onDeleteReview?: (reviewId: string | number) => void;

  sectionRef?: React.RefObject<HTMLElement | null>;
};

export default function ReviewSection({
  reviews,
  onWriteReview,
  onMoreReviews,
  onToggleLike,
  onDeleteReview,
  sectionRef,
}: Props) {
  const previewReviews = reviews.slice(0, 3);

  return (
    <section className={styles.section} ref={sectionRef}>
      <div className={styles.sectionHeaderRow}>
        <h3 className={styles.sectionTitle}>식당 리뷰</h3>
        <button type="button" className={styles.linkBtn} onClick={onWriteReview}>
          리뷰 작성하기 &gt;
        </button>
      </div>

      {reviews.length === 0 ? (
        <div className={styles.emptyStateWrap}>
          <EmptyState
            title="아직 리뷰가 없어요!"
            description="첫 리뷰를 남겨주세요!"
            className={styles.emptyStateFull}
          />
        </div>
      ) : (
        <div className={styles.reviewList}>
          {previewReviews.map((r) => {
            const firstImagePath =
              r.review_images && r.review_images.length > 0
                ? r.review_images[0].review_img_path
                : undefined;

            const tags =
              r.hashtags?.map((t) =>
                t.hashtag_name.startsWith('#') ? t.hashtag_name : `#${t.hashtag_name}`,
              ) ?? undefined;

            return (
              <ReviewCard
                key={String(r.review_id)}
                id={r.review_id}
                author={r.user_nickname ?? '익명'}
                date={formatDateYMD(r.created_at)}
                rating={r.review_rating}
                content={r.review_contents}
                tags={tags}
                imageUrl={firstImagePath ?? undefined}
                likesCount={r.like_count ?? 0}
                likedByMe={Boolean(r.liked_by_me)}
                isMine={Boolean(r.is_mine)}
                onToggleLike={onToggleLike}
                onDelete={onDeleteReview}
              />
            );
          })}

          {reviews.length > 3 ? (
            <Button variant="secondary" type="button" onClick={onMoreReviews}>
              더보기
            </Button>
          ) : null}
        </div>
      )}
    </section>
  );
}