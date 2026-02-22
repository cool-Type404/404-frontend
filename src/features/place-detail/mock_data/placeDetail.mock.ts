import type { PlaceDetail, HashTag, ReviewImage } from './placeDetail.types';

const STORE_1 = 1;
const STORE_2 = 2;

const commonStoreMenus: PlaceDetail['store_menus'] = [
  {
    menu_id: 1,
    store_info_id: STORE_1,
    menu_name: '김치찌개',
    price: 9000,
    menu_img: '/api/stores/image/4',
    is_rec: true,
  },
  {
    menu_id: 2,
    store_info_id: STORE_1,
    menu_name: '된장찌개',
    price: 8500,
    is_rec: false,
  },
  {
    menu_id: 3,
    store_info_id: STORE_1,
    menu_name: '제육볶음',
    price: 10000,
    menu_img: '/api/stores/image/7',
    is_rec: true,
  },
  {
    menu_id: 4,
    store_info_id: STORE_1,
    menu_name: '계란말이',
    price: 7000,
    is_rec: false,
  },
];

const commonStoreSeat: PlaceDetail['store_seat'] = {
  seat_id: 1,
  store_info_id: STORE_1,
  single_seat: true,
  double_seat: true,
  triple_seat: false,
};

const commonOpeningHours: PlaceDetail['opening_hours'] = [
  {
    opening_hours_id: 'oh1',
    store_info_id: STORE_1,
    days: '월',
    start_time: '11:00',
    end_time: '21:00',
    break_start_time: '15:00',
    break_end_time: '17:00',
  },
  {
    opening_hours_id: 'oh2',
    store_info_id: STORE_1,
    days: '화',
    start_time: '11:00',
    end_time: '21:00',
    break_start_time: '15:00',
    break_end_time: '17:00',
  },
  {
    opening_hours_id: 'oh3',
    store_info_id: STORE_1,
    days: '수',
    start_time: '11:00',
    end_time: '21:00',
    break_start_time: '15:00',
    break_end_time: '17:00',
  },
  {
    opening_hours_id: 'oh4',
    store_info_id: STORE_1,
    days: '목',
    start_time: '11:00',
    end_time: '21:00',
    break_start_time: '15:00',
    break_end_time: '17:00',
  },
  {
    opening_hours_id: 'oh5',
    store_info_id: STORE_1,
    days: '금',
    start_time: '11:00',
    end_time: '22:00',
    break_start_time: '15:00',
    break_end_time: '17:00',
  },
  {
    opening_hours_id: 'oh6',
    store_info_id: STORE_1,
    days: '토',
    start_time: '12:00',
    end_time: '22:00',
  },
  { opening_hours_id: 'oh7', store_info_id: STORE_1, days: '일', start_time: '', end_time: '' },
];

const makeHashtags = (review_id: number, names?: string[]): HashTag[] | undefined => {
  if (!names || names.length === 0) return undefined;
  return names.map((hashtag_name, idx) => ({
    hashtag_id: `${review_id}-tag-${idx}`,
    review_id,
    hashtag_name,
  }));
};

const makeReviewImages = (review_id: number, url?: string): ReviewImage[] | undefined => {
  if (!url) return undefined;
  return [
    {
      review_img_id: `${review_id}-img-0`,
      review_id,
      review_img_path: url,
    },
  ];
};

const reviewsWithData: PlaceDetail['reviews'] = [
  {
    review_id: 1,
    store_info_id: STORE_1,
    user_id: 1,
    user_nickname: '김혼밥',
    review_rating: 5,
    review_contents: '혼자 가기 정말 좋아요. 1인석도 있고 음식도 빨리 나와요!',
    created_at: '2026-02-15',
    like_count: 3,
    hashtags: makeHashtags(1, ['#혼밥가능', '#재방문각']),
    review_images: makeReviewImages(1),
    liked_by_me: false,
    is_mine: false,
  },
  {
    review_id: 2,
    store_info_id: STORE_1,
    user_id: 2,
    user_nickname: '홍길동',
    review_rating: 4,
    review_contents: '가성비 좋고 직원분들이 친절해요.',
    created_at: '2026-02-10',
    like_count: 1,
    hashtags: makeHashtags(2, ['#가성비']),
    liked_by_me: false,
    is_mine: false,
  },
  {
    review_id: 3,
    store_info_id: STORE_1,
    user_id: 3,
    user_nickname: '밥도둑',
    review_rating: 5,
    review_contents: '제육볶음이 진짜 맛있습니다. 또 올게요.',
    created_at: '2026-02-08',
    like_count: 5,
    hashtags: makeHashtags(3, ['#존맛']),
    liked_by_me: false,
    is_mine: false,
  },
  {
    review_id: 4,
    store_info_id: STORE_1,
    user_id: 4,
    user_nickname: '리뷰왕',
    review_rating: 3,
    review_contents: '무난합니다.',
    created_at: '2026-02-01',
    like_count: 0,
    liked_by_me: false,
    is_mine: false,
  },
  {
    review_id: 5,
    store_info_id: STORE_1,
    user_id: 5,
    user_nickname: '맛집탐방',
    review_rating: 4,
    review_contents: '점심시간엔 웨이팅 있어요.',
    created_at: '2026-01-28',
    like_count: 2,
    liked_by_me: false,
    is_mine: false,
  },
  {
    review_id: 6,
    store_info_id: STORE_1,
    user_id: 6,
    user_nickname: '프로혼밥러',
    review_rating: 2,
    review_contents: '',
    created_at: '2026-01-26',
    like_count: 0,
    liked_by_me: false,
    is_mine: false,
  },
  {
    review_id: 7,
    store_info_id: STORE_1,
    user_id: 7,
    user_nickname: '혼밥장인',
    review_rating: 5,
    review_contents: '홍대에서 혼밥하기 제일 좋아요',
    created_at: '2026-01-26',
    like_count: 0,
    liked_by_me: false,
    is_mine: true,
  },
  {
    review_id: 8,
    store_info_id: STORE_1,
    user_id: 8,
    user_nickname: '맛꿀마',
    review_rating: 5,
    review_contents: '여기 진짜 존맛이네요',
    created_at: '2026-01-26',
    like_count: 0,
    hashtags: makeHashtags(8, ['#혼밥가능', '#혼밥가능', '#혼밥가능']),
    review_images: makeReviewImages(8, '/api/stores/image/4'),
    liked_by_me: false,
    is_mine: false,
  },
];

export const mockPlaceDetailWithReviews: PlaceDetail = {
  store_info_id: STORE_1,
  store_name: '홍대 혼밥식당',
  store_number: '02-1234-5678',

  avg_rating: 4.5,
  current_open: true,
  bookmarked: false,

  store_menus: commonStoreMenus.map((m) => ({ ...m, store_info_id: STORE_1 })),
  store_seat: { ...commonStoreSeat, store_info_id: STORE_1 },
  opening_hours: commonOpeningHours.map((h) => ({ ...h, store_info_id: STORE_1 })),
  reviews: reviewsWithData,
};

export const mockPlaceDetailNoReviews: PlaceDetail = {
  store_info_id: STORE_2,
  store_name: '리뷰없는 식당',
  store_number: '02-9999-8888',

  avg_rating: 0,
  current_open: false,
  bookmarked: true,

  store_menus: commonStoreMenus.map((m) => ({ ...m, store_info_id: STORE_2 })),
  store_seat: {
    seat_id: 2,
    store_info_id: STORE_2,
    single_seat: true,
    double_seat: true,
    triple_seat: false,
  },
  opening_hours: commonOpeningHours.map((h) => ({ ...h, store_info_id: STORE_2 })),
  reviews: [],
};
