import { useQuery } from '@tanstack/react-query';
import { filterStores } from '../api/mainMap.api';

export const useFilteredStores = (storeTypes: string[]) => {
  const normalizedStoreTypes = [...storeTypes].sort();

  return useQuery({
    queryKey: ['filteredStores', normalizedStoreTypes],
    queryFn: () => filterStores({ storeType: normalizedStoreTypes }),
    enabled: normalizedStoreTypes.length > 0,
  });
};
