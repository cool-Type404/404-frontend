import { useEffect, useState } from 'react';

import Chip from '@/components/Chip/Chip';
import { CommonIcon } from '@/components/CommonIcon/CommonIcon';
import { FoodCategoryIcon } from '@/components/FoodCategoryIcon';
import Modal from '@/components/Modal/Modal';
import {
  getMyBookmarks,
  getMyPageProfile,
  getMyWrittenReviews,
  type MyPageBookmark,
  type MyPageProfile,
  type MyPageReview,
} from '@/features/mypage/api/myPage.api';

import styles from './MyPageModal.module.css';

type MyPageModalProps = {
  open: boolean;
  onClose: () => void;
};

type FoodCategory = 'korean' | 'japanese' | 'western' | 'chinese' | 'asian' | 'cafe' | 'bunsik' | 'etc';

const toFoodCategory = (storeType: string): FoodCategory => {
  const map: Record<string, FoodCategory> = {
    KOREAN: 'korean',
    JAPANESE: 'japanese',
    WESTERN: 'western',
    CHINESE: 'chinese',
    ASIAN: 'asian',
    CAFE: 'cafe',
    BUNSIK: 'bunsik',
    SNACK: 'bunsik',
  };

  return map[storeType] ?? 'etc';
};

const categoryLabel = (category: string) => {
  switch (category) {
    case 'KOREAN':
      return '한식';
    case 'JAPANESE':
      return '일식';
    case 'WESTERN':
      return '양식';
    case 'CHINESE':
      return '중식';
    case 'ASIAN':
      return '아시안';
    case 'SNACK':
      return '분식';
    default:
      return '기타';
  }
};

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export default function MyPageModal({ open, onClose }: MyPageModalProps) {
  const [profile, setProfile] = useState<MyPageProfile | null>(null);
  const [bookmarks, setBookmarks] = useState<MyPageBookmark[]>([]);
  const [reviews, setReviews] = useState<MyPageReview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const handleRefresh = () => {
      if (!open) {
        return;
      }

      setRefreshKey((prev) => prev + 1);
    };

    window.addEventListener('mypage:refresh', handleRefresh);
    return () => window.removeEventListener('mypage:refresh', handleRefresh);
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        setIsLoading(true);
        setError('');

        const profileData = await getMyPageProfile();

        if (cancelled) {
          return;
        }

        setProfile(profileData);
        window.localStorage.setItem('userNickname', profileData.nickname);

        const [bookmarkData, reviewData] = await Promise.all([
          getMyBookmarks(),
          getMyWrittenReviews(profileData.nickname),
        ]);

        if (cancelled) {
          return;
        }

        setBookmarks(bookmarkData);
        setReviews(reviewData);
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : '마이페이지 정보를 불러오지 못했습니다.');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [open, refreshKey]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="마이페이지"
      closeOnOverlayClick
      className={styles.modal}
      headerLeft={
        <button type="button" className={styles.headerButton} aria-label="마이페이지 닫기" onClick={onClose}>
          <CommonIcon name="leftdir" size={24} />
        </button>
      }
    >
      <div className={styles.body}>
        {isLoading ? (
          <div className={styles.feedback}>
            <span className={styles.spinner} />
            마이페이지 정보를 불러오는 중입니다.
          </div>
        ) : error ? (
          <div className={`${styles.feedback} ${styles.error}`}>{error}</div>
        ) : (
          <>
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>기본 회원정보</h3>
              </div>

              <div className={styles.profileCard}>
                <div className={styles.avatar} aria-hidden="true">
                  {profile?.profileImg ? <img src={profile.profileImg} alt="" /> : <CommonIcon name="mypage2" size={54} />}
                </div>

                <div>
                  <div className={styles.profileTop}>
                    <div>
                      <p className={styles.nickname}>{profile?.nickname ?? '사용자'}</p>
                      <p className={styles.email}>{profile?.email ?? window.localStorage.getItem('loginEmail') ?? ''}</p>
                    </div>
                    <Chip variant="recommend" size="sm">
                      {profile?.eatingLevel ?? '레벨 정보 없음'}
                    </Chip>
                  </div>

                  <div className={styles.profileGrid}>
                    <div className={styles.profileItem}>
                      <span className={styles.profileLabel}>성별</span>
                      <span className={styles.profileValue}>{profile?.gender ?? '선택안함'}</span>
                    </div>
                    <div className={styles.profileItem}>
                      <span className={styles.profileLabel}>나이대</span>
                      <span className={styles.profileValue}>{profile?.age ?? '선택안함'}</span>
                    </div>
                    <div className={styles.profileItem}>
                      <span className={styles.profileLabel}>북마크 수</span>
                      <span className={styles.profileValue}>{bookmarks.length}개</span>
                    </div>
                    <div className={styles.profileItem}>
                      <span className={styles.profileLabel}>작성한 리뷰</span>
                      <span className={styles.profileValue}>{reviews.length}개</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>북마크한 식당</h3>
                <span className={styles.sectionCount}>{bookmarks.length}</span>
              </div>

              {bookmarks.length === 0 ? (
                <div className={styles.feedback}>아직 북마크한 식당이 없습니다.</div>
              ) : (
                <div className={styles.list}>
                  {bookmarks.map((bookmark) => (
                    <div key={bookmark.storeId} className={styles.bookmarkCard}>
                      <div className={styles.bookmarkLeft}>
                        <div className={styles.categoryIcon}>
                          <FoodCategoryIcon category={toFoodCategory(bookmark.storeCategory)} size={26} />
                        </div>
                        <div>
                          <p className={styles.itemTitle}>{bookmark.storeName}</p>
                          <div className={styles.itemMeta}>
                            <span>{categoryLabel(bookmark.storeCategory)}</span>
                          </div>
                        </div>
                      </div>

                      <div className={styles.rating}>
                        <CommonIcon name="starfilled" size={14} />
                        <span>{bookmark.storeRating.toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>내가 작성한 리뷰</h3>
                <span className={styles.sectionCount}>{reviews.length}</span>
              </div>

              {reviews.length === 0 ? (
                <div className={styles.feedback}>아직 작성한 리뷰가 없습니다.</div>
              ) : (
                <div className={styles.list}>
                  {reviews.map((review) => (
                    <div key={review.reviewId} className={styles.reviewCard}>
                      <div className={styles.reviewLeft}>
                        <div className={styles.categoryIcon}>
                          <FoodCategoryIcon category={toFoodCategory(review.storeCategory)} size={26} />
                        </div>
                        <div>
                          <p className={styles.itemTitle}>{review.storeName}</p>
                          <div className={styles.itemMeta}>
                            <span>{categoryLabel(review.storeCategory)}</span>
                            <span className={styles.rating}>
                              <CommonIcon name="starfilled" size={14} />
                              <span>{review.reviewRating.toFixed(1)}</span>
                            </span>
                          </div>
                          <p className={styles.reviewContent}>{review.reviewContents}</p>
                        </div>
                      </div>

                      <div className={styles.reviewDate}>{formatDate(review.createdAt)}</div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </Modal>
  );
}
