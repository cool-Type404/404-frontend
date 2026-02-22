import { useQuery } from '@tanstack/react-query';
import { getStoreList } from '../api/mainMap.api';

export const useRestaurantList = () => {
  return useQuery({
    queryKey: ['restaurantList'],
    queryFn: getStoreList,
  });
};