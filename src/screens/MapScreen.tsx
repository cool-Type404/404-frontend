import KakaoMap from '../components/KakaoMap';
import Button from '../components/Button/Button';
import Input from '../components/Input/Input';
import Chip from '../components/Chip/Chip';
import { CommonIcon } from '../components/CommonIcon/CommonIcon';
import { FoodCategoryIcon } from '../components/FoodCategoryIcon'; // ✅ 경로는 실제 위치에 맞게 수정

import styles from './MapScreen.module.css';

type FoodCategory =
  | 'korean'
  | 'japanese'
  | 'western'
  | 'chinese'
  | 'asian'
  | 'cafe'
  | 'bunsik'
  | 'etc';

type Store = {
  id: string;
  name: string;
  isOpen: boolean;
  rating: number;
  category: FoodCategory; // ✅ 카테고리 아이콘용
};

const MOCK_STORES: Store[] = [
  { id: '1', name: '요소쿠야코우', isOpen: true, rating: 4.6, category: 'japanese' },
  { id: '2', name: '서담헌', isOpen: true, rating: 4.8, category: 'chinese' },
  { id: '3', name: '가츠모토', isOpen: false, rating: 4.5, category: 'japanese' },
  { id: '4', name: '밥장인 돼지찌개', isOpen: true, rating: 4.2, category: 'korean' },
  { id: '5', name: '구씨네부엌', isOpen: false, rating: 4.5, category: 'western' },
  { id: '6', name: '연남토마', isOpen: true, rating: 4.6, category: 'cafe' },
];

export default function MapScreen() {
  return (
    <div className={styles.root}>
      {/* ✅ 상단 헤더 */}
      <header className={styles.header}>
        <h1 className={styles.title}>혼밥지도</h1>
      </header>

      {/* 지도 */}
      <div className={styles.mapLayer}>
        <KakaoMap />
      </div>

      {/* 좌상단: 메뉴 버튼 */}
      <div className={styles.topLeft}>
        <Button variant="primary" width={56} height={56} radius={16} aria-label="메뉴">
          <CommonIcon name="hamburger" size={28} variant="inherit" />
        </Button>
      </div>

      {/* 상단 중앙: 필터 */}
      <div className={styles.topCenter}>
        <Button variant="third" height={44} radius={16}>
          <span className={styles.inlineIcon}>
            <CommonIcon name="filter" size={20} />
          </span>
          필터
        </Button>
      </div>

      {/* 우측 패널 */}
      <aside className={styles.rightPanel}>
        <div className={styles.searchWrap}>
          <Input
            variant="search"
            placeholder="지금, 먹고 싶은 음식은?"
            leftIcon={<CommonIcon name="search" size={22} />}
          />
        </div>

        <div className={styles.list}>
          {MOCK_STORES.map((s) => (
            <div key={s.id} className={styles.card}>
              {/* ✅ 카드 왼쪽: 카테고리 아이콘 + 가게명 */}
              <div className={styles.cardLeft}>
                <div className={styles.catIconBox} aria-label={`카테고리: ${s.category}`}>
                  <FoodCategoryIcon category={s.category} size={26} />
                </div>

                <div className={styles.storeInfo}>
                  <div className={styles.storeNameRow}>
                    <CommonIcon name="forkknife" size={18} />
                    <span className={styles.storeName}>{s.name}</span>
                  </div>

                  {/* 아래 줄은 선택: 카테고리 텍스트를 같이 보여주고 싶으면 */}
                  <div className={styles.storeMeta}>
                    <span className={styles.metaText}>{categoryLabel(s.category)}</span>
                  </div>
                </div>
              </div>

              {/* ✅ 카드 오른쪽: 영업상태 + 평점 */}
              <div className={styles.cardRight}>
                <Chip variant={s.isOpen ? 'open' : 'closed'} size="sm">
                  {s.isOpen ? '영업중' : '영업전'}
                </Chip>

                <div className={styles.rating}>
                  <span className={styles.ratingLabel}>평점</span>
                  <span className={styles.star} aria-hidden="true">
                    <CommonIcon name="starfilled" size={14} />
                  </span>
                  <span className={styles.ratingValue}>{s.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* 좌하단: 장소 추천 */}
      <div className={styles.bottomLeft}>
        <Button variant="primary" height={48} radius={9999}>
          <span className={styles.inlineIcon}>
            <CommonIcon name="plus" size={16} />
          </span>
          장소 추천하기
        </Button>
      </div>
    </div>
  );
}

/** 카테고리 한글 라벨(원하면 수정) */
function categoryLabel(category: FoodCategory) {
  switch (category) {
    case 'korean':
      return '한식';
    case 'japanese':
      return '일식';
    case 'western':
      return '양식';
    case 'chinese':
      return '중식';
    case 'asian':
      return '아시안';
    case 'cafe':
      return '카페';
    case 'bunsik':
      return '분식';
    case 'etc':
      return '기타';
    default:
      return '';
  }
}
