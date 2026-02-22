import { useQuery } from '@tanstack/react-query';
import { getStoreDetail } from '../api/placeDetail.api';

export const usePlaceDetail = (storeId: number) => {
  return useQuery({
    queryKey: ['placeDetail', storeId],
    queryFn: () => getStoreDetail(storeId),
    enabled: !!storeId,
  });
};