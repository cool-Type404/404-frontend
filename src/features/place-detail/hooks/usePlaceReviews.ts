import { useQuery } from '@tanstack/react-query';
import { getStoreReviews } from '../api/placeDetail.api';

export const usePlaceReviews = (storeId: number, viewerKey: string) => {
  return useQuery({
    queryKey: ['placeReviews', storeId, viewerKey],
    queryFn: () => getStoreReviews(storeId),
    enabled: !!storeId,
    staleTime: 1000 * 60 * 5,
  });
};
