import { http } from '@/lib/api/http';
import { parseApiError } from '@/lib/api/errors';

export interface StoreListItem {
  storeInfoPK: number;
  storeName: string;
  storeCategory: string;
  isOpen: boolean;
  storeRating: number;
}

export const getStoreList = async (): Promise<StoreListItem[]> => {
  try {
    const { data } = await http.get('/api/stores');
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
};