import { http } from '@/lib/api/http';
import { parseApiError } from '@/lib/api/errors';

export type PlaceRequestCategory =
  | 'KOREAN'
  | 'JAPANESE'
  | 'CHINESE'
  | 'WESTERN'
  | 'SNACK'
  | 'ASIAN';

export type PlaceRequestPayload = {
  storeName: string;
  addressUrl?: string;
  contents: string;
  storeCategory?: PlaceRequestCategory;
};

export const requestPlaceAddition = async (body: PlaceRequestPayload): Promise<string> => {
  try {
    const { data } = await http.post('/api/users/store-addition', body);
    return typeof data === 'string' ? data : '장소 추천 요청이 완료되었습니다.';
  } catch (error) {
    throw parseApiError(error);
  }
};
