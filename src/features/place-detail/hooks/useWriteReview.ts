import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postReview } from '../api/placeDetail.api';
import type { WriteReviewRequest } from '../api/placeDetail.api';

export const useWriteReview = (storeId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: WriteReviewRequest) => postReview(storeId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['placeReviews', storeId] });
    },
  });
};