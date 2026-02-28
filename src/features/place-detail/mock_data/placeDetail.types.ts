export type SeatType = 1 | 2 | 4;

export type StoreSeat = {
  seat_id: string | number;
  storeInfoPK: number;

  single_seat: boolean;
  double_seat: boolean;
  triple_seat: boolean;
};

export type StoreMenu = {
  menu_id: string | number;
  storeInfoPK: number;

  menu_name: string;
  price: number;
  menu_img?: string | null;
  is_rec?: boolean;
};

export type OpeningHours = {
  opening_hours_id: string | number;
  storeInfoPK: number;

  days: string;
  start_time: string;
  end_time: string;

  break_start_time?: string | null;
  break_end_time?: string | null;
};

export type HashTag = {
  hashtag_id: string | number;
  review_id: string | number;
  hashtag_name: string;
};

export type ReviewImage = {
  review_img_id: string | number;
  review_id: string | number;
  review_img_path: string | null;
};

export type Review = {
  review_id: string | number;
  storeInfoPK: number;
  user_id: string | number;

  review_contents: string;
  review_rating: number;
  created_at: string;

  user_nickname?: string;
  like_count?: number;
  liked_by_me?: boolean;
  is_mine?: boolean;
  hashtags?: HashTag[];
  review_images?: ReviewImage[];
};

export type PlaceDetail = {
  storeInfoPK: number;

  store_name: string;
  store_number: string;
  current_open: boolean;

  avg_rating: number;
  eating_level?: string;
  store_address?: string;
  store_type?: string;
  store_img?: string;

  bookmarked?: boolean;

  store_menus: StoreMenu[];
  store_seat: StoreSeat;
  opening_hours: OpeningHours[];
  reviews: Review[];
};
