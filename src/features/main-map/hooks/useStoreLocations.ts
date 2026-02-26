import { useQuery } from '@tanstack/react-query';
import { getStoreLocations } from '../api/mainMap.api';

export function useStoreLocations() {
  return useQuery({
    queryKey: ['storeLocations'],
    queryFn: getStoreLocations,
  });
}