import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteReview } from '../api/placeDetail.api';

export const useDeleteReview = (storeId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: number) => deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['placeReviews', storeId] });
    },
  });
};