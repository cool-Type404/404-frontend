import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';

import { deleteReviewLike, postReviewLike, type Review } from '../api/placeDetail.api';

type ReviewQueriesSnapshot = Array<[QueryKey, Review[] | undefined]>;

const updateCachedReviewLike = (
  reviews: Review[] | undefined,
  reviewId: number,
  nextLiked: boolean,
): Review[] | undefined => {
  if (!reviews) return reviews;

  return reviews.map((review) => {
    if (review.reviewId !== reviewId) return review;

    const currentLikeCount = review.likeCount ?? 0;

    return {
      ...review,
      isLiked: nextLiked,
      likeCount: Math.max(0, currentLikeCount + (nextLiked ? 1 : -1)),
    };
  });
};

export const useReviewLike = () => {
  const queryClient = useQueryClient();

  const syncPlaceReviewsCache = async (reviewId: number, nextLiked: boolean) => {
    await queryClient.cancelQueries({ queryKey: ['placeReviews'] });

    const previousReviews = queryClient.getQueriesData<Review[]>({
      queryKey: ['placeReviews'],
    });

    queryClient.setQueriesData<Review[]>({ queryKey: ['placeReviews'] }, (oldReviews) =>
      updateCachedReviewLike(oldReviews, reviewId, nextLiked),
    );

    return { previousReviews };
  };

  const rollbackPlaceReviewsCache = (snapshot?: { previousReviews: ReviewQueriesSnapshot }) => {
    snapshot?.previousReviews.forEach(([queryKey, reviews]) => {
      queryClient.setQueryData(queryKey, reviews);
    });
  };

  const invalidatePlaceReviews = () => {
    queryClient.invalidateQueries({ queryKey: ['placeReviews'] });
  };

  const like = useMutation({
    mutationFn: (reviewId: number) => postReviewLike(reviewId),
    onMutate: (reviewId) => syncPlaceReviewsCache(reviewId, true),
    onError: (_error, _reviewId, context) => rollbackPlaceReviewsCache(context),
    onSettled: invalidatePlaceReviews,
  });

  const unlike = useMutation({
    mutationFn: (reviewId: number) => deleteReviewLike(reviewId),
    onMutate: (reviewId) => syncPlaceReviewsCache(reviewId, false),
    onError: (_error, _reviewId, context) => rollbackPlaceReviewsCache(context),
    onSettled: invalidatePlaceReviews,
  });

  return { like, unlike };
};
