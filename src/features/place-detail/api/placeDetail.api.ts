import { http } from '@/lib/api/http';
import { parseApiError } from '@/lib/api/errors';

// ERD기반 types
export interface StoreDetail {
  storeInfoPK: number;
  storeName: string;
  storeCategory: string;
  storeAddress: string;
  storeNumber: string;
  isOpen: boolean;
  avgRating: number;
  eatingLevel: string;
  storeImage: string | null;
  seats: {
    singleSeat: boolean;
    doubleSeat: boolean;
    tripleSeat: boolean;
  }[];
  menus: Menu[];
  openingHours: OpeningHour[];
}

export interface Menu {
  menuId: number;
  menuName: string;
  price: string;
  isRec: boolean;
  menuImg?: string | null; // 이미지 ID (별도 API로 fetch)
}

export interface OpeningHour {
  openingHoursId: number;
  days: string;
  startTime: string;
  endTime: string;
  breakStartTime?: string | null;
  breakEndTime?: string | null;
}

export interface Review {
  reviewId: number;
  userId?: number;
  userNickname?: string;
  reviewWriter?: string;
  reviewContents: string;
  reviewRating: number;
  createdAt: string;
  hashtags?: Array<Hashtag | string>;
  reviewImages?: string[];
  likeCount?: number;
  isLiked?: boolean;
}

export interface Hashtag {
  hashtagId: number;
  hashtagName: string;
}

export interface WriteReviewRequest {
  reviewContents: string;
  reviewRating: number;
  hashtags: string[];
  images?: File[];
}

const normalizeHashtag = (value: string) => value.replace(/^#/, '').trim();

const getFirstDefined = <T>(...values: T[]): T | undefined =>
  values.find((value) => value !== undefined && value !== null);

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toBoolean = (value: unknown, fallback = false) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }
  if (typeof value === 'number') return value !== 0;
  return fallback;
};

const normalizeReview = (review: Record<string, unknown>): Review => ({
  reviewId: toNumber(getFirstDefined(review.reviewId, review.review_id)),
  userId: getFirstDefined(review.userId, review.user_id) as number | undefined,
  userNickname: getFirstDefined(
    review.userNickname,
    review.user_nickname,
    review.nickname,
  ) as string | undefined,
  reviewWriter: getFirstDefined(
    review.reviewWriter,
    review.review_writer,
    review.writer,
  ) as string | undefined,
  reviewContents: String(
    getFirstDefined(review.reviewContents, review.review_contents, review.content) ?? '',
  ),
  reviewRating: toNumber(getFirstDefined(review.reviewRating, review.review_rating, review.rating)),
  createdAt: String(getFirstDefined(review.createdAt, review.created_at) ?? ''),
  hashtags: (getFirstDefined(
    review.hashtags,
    review.hashtag,
    review.reviewHashtags,
    review.review_hashtags,
  ) ?? []) as Array<Hashtag | string>,
  reviewImages: (getFirstDefined(
    review.reviewImages,
    review.review_images,
    review.images,
  ) ?? []) as string[],
  likeCount: toNumber(
    getFirstDefined(review.likeCount, review.like_count, review.likesCount, review.likes_count),
  ),
  isLiked: toBoolean(
    getFirstDefined(
      review.isLiked,
      review.is_liked,
      review.likedByMe,
      review.liked_by_me,
      review.likeStatus,
      review.like_status,
    ),
  ),
});

export interface BookmarkStore {
  storeId: number;
  storeName: string;
  storeType: string;
  currentOpen: boolean;
  avgRating: number;
  eatingLevel: string;
}

// API 함수
// 식당 상세 정보 조회
export const getStoreDetail = async (storeId: number): Promise<StoreDetail> => {
  try {
    const { data } = await http.get(`/api/stores/${storeId}`);
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
};

// 매장 이미지 조회
export const getStoreImage = async (storeId: number): Promise<Blob> => {
  try {
    const { data } = await http.get(`/api/stores/image/${storeId}`, {
      responseType: 'blob',
    });
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
};

// 메뉴 이미지 조회
export const getMenuImage = async (menuId: number): Promise<Blob> => {
  try {
    const { data } = await http.get(`/api/stores/menu/image/${menuId}`, {
      responseType: 'blob',
    });
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
};

// 식당 리뷰 목록 조회
export const getStoreReviews = async (storeId: number): Promise<Review[]> => {
  try {
    const { data } = await http.get(`/api/stores/${storeId}/reviews`);
    if (!Array.isArray(data)) return [];
    return data.map((review) => normalizeReview(review as Record<string, unknown>));
  } catch (error) {
    throw parseApiError(error);
  }
};

//리뷰 작성 (인증 필요)
export const postReview = async (storeId: number, body: WriteReviewRequest): Promise<void> => {
  try {
    const formData = new FormData();
    const requestPayload = {
      review_contents: body.reviewContents,
      review_rating: body.reviewRating,
      hashtag: body.hashtags.slice(0, 3).map(normalizeHashtag),
    };

    formData.append(
      'request',
      new Blob([JSON.stringify(requestPayload)], { type: 'application/json' }),
    );
    body.images?.forEach((img) => formData.append('images', img));

    await http.post(`/api/stores/${storeId}/reviews`, formData);
  } catch (error) {
    throw parseApiError(error);
  }
};

// 리뷰 삭제 (인증 필요)
export const deleteReview = async (reviewId: number): Promise<void> => {
  try {
    await http.delete(`/api/reviews/${reviewId}`);
  } catch (error) {
    throw parseApiError(error);
  }
};

// 리뷰 좋아요 (인증 필요)
export const postReviewLike = async (reviewId: number): Promise<void> => {
  try {
    await http.post(`/api/reviews/${reviewId}/like`);
  } catch (error) {
    throw parseApiError(error);
  }
};

// 리뷰 좋아요 삭제 (인증 필요)
export const deleteReviewLike = async (reviewId: number): Promise<void> => {
  try {
    await http.delete(`/api/reviews/${reviewId}/like`);
  } catch (error) {
    throw parseApiError(error);
  }
};

// 리뷰 이미지 조회
export const getReviewImage = async (reviewImgId: number): Promise<Blob> => {
  try {
    const { data } = await http.get(`/api/reviews/image/${reviewImgId}`, {
      responseType: 'blob',
    });
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
};

// 북마크 추가 (인증 필요)
export const postBookmark = async (storeId: number): Promise<void> => {
  try {
    await http.post(`/api/users/bookmarks/${storeId}`);
  } catch (error) {
    throw parseApiError(error);
  }
};

// 북마크 목록 조회 (인증 필요)
export const getBookmarkList = async (): Promise<BookmarkStore[]> => {
  try {
    const { data } = await http.get('/api/users/bookmarks');
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
};

// 북마크 삭제 (인증 필요)
export const deleteBookmark = async (storeId: number): Promise<void> => {
  try {
    await http.delete(`/api/users/bookmarks/${storeId}`);
  } catch (error) {
    throw parseApiError(error);
  }
};
