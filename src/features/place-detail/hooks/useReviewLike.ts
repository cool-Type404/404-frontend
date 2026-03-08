import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postReviewLike, deleteReviewLike } from '../api/placeDetail.api';

export const useReviewLike = (storeId: number) => {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['placeReviews', storeId] });
  };

  const like = useMutation({
    mutationFn: (reviewId: number) => postReviewLike(reviewId),
    onSuccess: invalidate,
  });

  const unlike = useMutation({
    mutationFn: (reviewId: number) => deleteReviewLike(reviewId),
    onSuccess: invalidate,
  });

  return { like, unlike };
};