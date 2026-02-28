import { http } from '@/lib/api/http';
import { parseApiError } from '@/lib/api/errors';

export interface StoreListItem {
  storeInfoPK: number;
  storeName: string;
  storeCategory: string;
  isOpen: boolean;
  storeRating: number;
  latitude: number;
  longitude: number;
}

export interface StoreLocation {
  store_id: number;
  latitude: number;
  longitude: number;
}

export interface StoreLocationsResponse {
  stores: StoreLocation[];
}

export const getStoreList = async (): Promise<StoreListItem[]> => {
  try {
    const { data } = await http.get('/api/stores');
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
};

export const getStoreLocations = async (): Promise<StoreLocationsResponse> => {
  try {
    const { data } = await http.post('/api/stores/locations');
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
};

export const searchStores = async (storeName: string): Promise<StoreListItem[]> => {
  try {
    const { data } = await http.get('/api/stores/search', {
      params: { storeName },
    });
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
};