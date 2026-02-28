import { useQuery } from '@tanstack/react-query';
import { searchStores } from '../api/mainMap.api';

export const useStoreSearch = (storeName: string) => {
  return useQuery({
    queryKey: ['storeSearch', storeName],
    queryFn: () => searchStores(storeName),
    enabled: storeName.trim().length > 0,
  });
};