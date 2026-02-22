import { http } from '@/lib/api/http';
import { parseApiError } from '@/lib/api/errors';

export interface StoreListItem {
  storeId: number;
  storeName: string;
  storeType: string;
  currentOpen: boolean;
  avgRating: number;
  eatingLevel: string;
  latitude: number;
  longitude: number;
}

export const getStoreList = async (): Promise<StoreListItem[]> => {
  try {
    const { data } = await http.get('/api/stores');
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
};
