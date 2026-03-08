import { getStoreList, type StoreListItem } from '@/features/main-map/api/mainMap.api';
import { http } from '@/lib/api/http';
import { parseApiError } from '@/lib/api/errors';

export type MyPageProfile = {
  email: string;
  nickname: string;
  gender?: string;
  age?: string;
  profileImg?: string;
  eatingLevel?: string;
};

export type MyPageBookmark = {
  storeId: number;
  storeName: string;
  storeCategory: string;
  storeRating: number;
};

type StoreReviewResponse = {
  reviewId: number;
  reviewWriter: string;
  reviewContents: string;
  reviewRating: number;
  createdAt: string;
};

export type MyPageReview = {
  reviewId: number;
  storeId: number;
  storeName: string;
  storeCategory: string;
  storeRating: number;
  reviewWriter: string;
  reviewContents: string;
  reviewRating: number;
  createdAt: string;
};

const normalize = (value: string) => value.trim();

const getStoreReviews = async (storeId: number): Promise<StoreReviewResponse[]> => {
  try {
    const { data } = await http.get(`/api/stores/${storeId}/reviews`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    throw parseApiError(error);
  }
};

export const getMyPageProfile = async (): Promise<MyPageProfile> => {
  try {
    const { data } = await http.get('/api/users/me');
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
};

export const getMyBookmarks = async (): Promise<MyPageBookmark[]> => {
  try {
    const { data } = await http.get('/api/users/bookmarks');
    return Array.isArray(data) ? data : [];
  } catch (error) {
    throw parseApiError(error);
  }
};

export const getMyWrittenReviews = async (nickname: string): Promise<MyPageReview[]> => {
  const safeNickname = normalize(nickname);

  if (!safeNickname) {
    return [];
  }

  try {
    const stores = await getStoreList();
    const reviewLists = await Promise.allSettled(
      stores.map(async (store) => {
        const reviews = await getStoreReviews(store.storeInfoPK);
        return { store, reviews };
      }),
    );

    return reviewLists
      .flatMap((result) => {
        if (result.status !== 'fulfilled') {
          return [];
        }

        const { store, reviews } = result.value;

        return reviews
          .filter((review) => normalize(review.reviewWriter) === safeNickname)
          .map((review) => toMyPageReview(store, review));
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    throw parseApiError(error);
  }
};

const toMyPageReview = (store: StoreListItem, review: StoreReviewResponse): MyPageReview => ({
  reviewId: review.reviewId,
  storeId: store.storeInfoPK,
  storeName: store.storeName,
  storeCategory: store.storeCategory,
  storeRating: store.storeRating,
  reviewWriter: review.reviewWriter,
  reviewContents: review.reviewContents,
  reviewRating: review.reviewRating,
  createdAt: review.createdAt,
});
