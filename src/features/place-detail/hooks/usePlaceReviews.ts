import { useQuery } from '@tanstack/react-query';
import { getStoreReviews } from '../api/placeDetail.api';

export const usePlaceReviews = (storeId: number) => {
  return useQuery({
    queryKey: ['placeReviews', storeId],
    queryFn: () => getStoreReviews(storeId),
    enabled: !!storeId,
    staleTime: 1000 * 60 * 5,
  });
};