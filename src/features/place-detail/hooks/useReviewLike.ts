import { useMutation } from '@tanstack/react-query';
import { postReviewLike, deleteReviewLike } from '../api/placeDetail.api';

export const useReviewLike = () => {
  const like = useMutation({
    mutationFn: (reviewId: number) => postReviewLike(reviewId),
  });

  const unlike = useMutation({
    mutationFn: (reviewId: number) => deleteReviewLike(reviewId),
  });

  return { like, unlike };
};