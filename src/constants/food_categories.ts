import korean from "../assets/icons/food_categories/korean.svg";
import japanese from "../assets/icons/food_categories/japanese.svg";
import western from "../assets/icons/food_categories/western.svg";
import chinese from "../assets/icons/food_categories/chinese.svg";
import asian from "../assets/icons/food_categories/asian.svg";
import cafe from "../assets/icons/food_categories/cafe.svg";
import bunsik from "../assets/icons/food_categories/bunsik.svg";
import etc from "../assets/icons/food_categories/etc.svg";



export const FOOD_CATEGORY_KEYS = [
  "korean",
  "japanese",
  "western",
  "chinese",
  "asian",
  "cafe",
  "bunsik",
  "etc",
] as const;

export type FoodCategoryKey = (typeof FOOD_CATEGORY_KEYS)[number];

export type FoodCategoryMeta = {
  key: FoodCategoryKey;
  label: string;
  iconSrc: string;
};

export const FOOD_CATEGORIES: Record<FoodCategoryKey, FoodCategoryMeta> = {
  korean: { key: "korean", label: "한식", iconSrc: korean },
  japanese: { key: "japanese", label: "일식", iconSrc: japanese },
  western: { key: "western", label: "양식", iconSrc: western },
  chinese: { key: "chinese", label: "중식", iconSrc: chinese },
  asian: { key: "asian", label: "아시안", iconSrc: asian },
  cafe: { key: "cafe", label: "카페", iconSrc: cafe },
  bunsik: { key: "bunsik", label: "분식", iconSrc: bunsik },
  etc: { key: "etc", label: "기타", iconSrc: etc },
};

export function isFoodCategoryKey(value: string): value is FoodCategoryKey {
  return (FOOD_CATEGORY_KEYS as readonly string[]).includes(value);
}
