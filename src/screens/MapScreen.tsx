import { useEffect, useMemo, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { useQueries } from '@tanstack/react-query';

import KakaoMap from '../components/KakaoMap';
import Button from '../components/Button/Button';
import Input from '../components/Input/Input';
import Chip from '../components/Chip/Chip';
import Modal from '../components/Modal/Modal';
import { CommonIcon } from '../components/CommonIcon/CommonIcon';
import { FoodCategoryIcon } from '@/components/FoodCategoryIcon';
import { login, logout, sendVerificationEmail, signUp, verifyEmailCode } from '@/features/auth/api/auth.api';
import { useRestaurantList } from '@/features/main-map/hooks/useRestaurantList';
import { useStoreLocations } from '@/features/main-map/hooks/useStoreLocations';
import { useFilteredStores } from '@/features/main-map/hooks/useFilteredStores';
import MyPageModal from '@/features/mypage/components/MyPageModal/MyPageModal';
import PlaceRequestModal from '@/features/place-request/components/PlaceRequestModal/PlaceRequestModal';
import { getStoreDetail, getStoreReviews } from '@/features/place-detail/api/placeDetail.api';
import PlaceDetailModalFlow from '@/features/place-detail/flow/PlaceDetailModalFlow';
import { getIsStoreOpen } from '@/utils/openingHours';
import defaultImg from '@/assets/BobImages/default.png';
import deliciousImg from '@/assets/BobImages/delicious.png';
import happyImg from '@/assets/BobImages/happy.png';
import surprisedImg from '@/assets/BobImages/surprised.png';
import thinkingImg from '@/assets/BobImages/thinking.png';

import styles from './MapScreen.module.css';

type StoreCategory = 'KOREAN' | 'JAPANESE' | 'CHINESE' | 'WESTERN' | 'SNACK' | 'ASIAN';
type SortKey = 'recommend' | 'rating' | 'eatingLevel' | 'reviews';

type StoreSummary = {
  id: number;
  name: string;
  category: StoreCategory;
  isOpen: boolean;
  rating: number;
};

type CategoryOption = {
  label: string;
  value: StoreCategory;
};

type FoodCategory = 'korean' | 'japanese' | 'western' | 'chinese' | 'asian' | 'cafe' | 'bunsik' | 'etc';

const categoryOptions: CategoryOption[] = [
  { label: '한식', value: 'KOREAN' },
  { label: '중식', value: 'CHINESE' },
  { label: '일식', value: 'JAPANESE' },
  { label: '양식', value: 'WESTERN' },
  { label: '분식', value: 'SNACK' },
  { label: '아시안', value: 'ASIAN' },
];

const sortOptions: Array<{ key: SortKey; label: string }> = [
  { key: 'recommend', label: '추천순' },
  { key: 'rating', label: '평점 높은순' },
  { key: 'eatingLevel', label: '혼밥 레벨순' },
  { key: 'reviews', label: '리뷰 많은순' },
];

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;

const signUpLevelOptions = [
  {
    value: '1레벨',
    title: '레벨 1',
    description: '혼자 먹는 길이 어색해요!\n분식처럼 빨리 먹을 수 있는\n메뉴가 편해요',
    image: thinkingImg,
  },
  {
    value: '2레벨',
    title: '레벨 2',
    description: '가끔은 혼밥도 괜찮아요!\n부담 덜한 메뉴와 식사는\n혼자도 좋아요',
    image: defaultImg,
  },
  {
    value: '3레벨',
    title: '레벨 3',
    description: '혼밥? 은근히 좋아요!\n고기·파스타도\n혼자서 부담 없이 먹어요',
    image: deliciousImg,
  },
  {
    value: '4레벨',
    title: '레벨 4',
    description: '혼밥은 내 일상이에요!\n혼자 고기도 좋고 술집도\n거리낌 없어요',
    image: happyImg,
  },
] as const;

const getEatingLevelRank = (value: string | undefined) => {
  if (!value) return Number.MAX_SAFE_INTEGER;
  const rank = Number.parseInt(value, 10);
  return Number.isNaN(rank) ? Number.MAX_SAFE_INTEGER : rank;
};

const normalizeSearchValue = (value: string) => value.replace(/\s+/g, '').toLocaleLowerCase();

const toStoreSummary = (store: {
  storeInfoPK: number;
  storeName: string;
  storeCategory: string;
  isOpen: boolean;
  storeRating: number;
}): StoreSummary => ({
  id: store.storeInfoPK,
  name: store.storeName,
  category: store.storeCategory as StoreCategory,
  isOpen: store.isOpen,
  rating: store.storeRating,
});

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

const foodCategoryLabel = (category: FoodCategory) => {
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
    default:
      return '기타';
  }
};

export default function MapScreen() {
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [detailStoreId, setDetailStoreId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSignUpIntroOpen, setIsSignUpIntroOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isEatingLevelModalOpen, setIsEatingLevelModalOpen] = useState(false);
  const [isEatingLevelAlertOpen, setIsEatingLevelAlertOpen] = useState(false);
  const [isPrivacyConsentOpen, setIsPrivacyConsentOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isMyPageOpen, setIsMyPageOpen] = useState(false);
  const [isPlaceRequestOpen, setIsPlaceRequestOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isWithdrawDoneOpen, setIsWithdrawDoneOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [appliedSort, setAppliedSort] = useState<SortKey>('recommend');
  const [draftSort, setDraftSort] = useState<SortKey>('recommend');
  const [appliedCategories, setAppliedCategories] = useState<StoreCategory[]>([]);
  const [draftCategories, setDraftCategories] = useState<StoreCategory[]>([]);
  const [debouncedQuery] = useDebounce(searchQuery, 300);

  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpCode, setSignUpCode] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpNickname, setSignUpNickname] = useState('');
  const [signUpGender, setSignUpGender] = useState('');
  const [signUpAge, setSignUpAge] = useState('');
  const [signUpEatingLevel, setSignUpEatingLevel] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isPrivacyConsentAgreed, setIsPrivacyConsentAgreed] = useState(false);
  const [signUpMessage, setSignUpMessage] = useState('');
  const [signUpError, setSignUpError] = useState('');
  const [signUpFieldErrors, setSignUpFieldErrors] = useState({
    email: false,
    code: false,
    password: false,
    nickname: false,
    privacyConsent: false,
  });

  useEffect(() => {
    setIsLoggedIn(Boolean(window.localStorage.getItem('accessToken')));
  }, []);

  const {
    data: stores = [],
    isLoading: isStoreListLoading,
    isError: isStoreListError,
  } = useRestaurantList();
  const {
    data: filteredStores = [],
    isLoading: isFilteredStoresLoading,
    isError: isFilteredStoresError,
  } = useFilteredStores(appliedCategories);
  const {
    data: locationsData,
    isLoading: isLocationsLoading,
    isError: isLocationsError,
  } = useStoreLocations();

  const candidateStores = useMemo(() => {
    if (appliedCategories.length > 0) return filteredStores;
    return stores;
  }, [appliedCategories.length, filteredStores, stores]);

  const normalizedSearchQuery = useMemo(() => normalizeSearchValue(debouncedQuery.trim()), [debouncedQuery]);

  const searchDetailQueries = useQueries({
    queries: candidateStores.map((store) => ({
      queryKey: ['storeSearchDetail', store.storeInfoPK],
      queryFn: () => getStoreDetail(store.storeInfoPK),
      enabled: normalizedSearchQuery.length > 0,
      staleTime: 5 * 60 * 1000,
    })),
  });

  const menuMatchedStoreIds = useMemo(() => {
    if (!normalizedSearchQuery) return new Set<number>();

    return new Set(
      searchDetailQueries
        .map((query) => query.data)
        .filter((detail): detail is NonNullable<typeof detail> => Boolean(detail))
        .filter((detail) =>
          detail.menus.some((menu) => normalizeSearchValue(menu.menuName).includes(normalizedSearchQuery)),
        )
        .map((detail) => detail.storeInfoPK),
    );
  }, [normalizedSearchQuery, searchDetailQueries]);

  const baseStores = useMemo(() => {
    if (!normalizedSearchQuery) return candidateStores;

    return candidateStores.filter((store) => {
      const normalizedStoreName = normalizeSearchValue(store.storeName);
      return normalizedStoreName.includes(normalizedSearchQuery) || menuMatchedStoreIds.has(store.storeInfoPK);
    });
  }, [candidateStores, menuMatchedStoreIds, normalizedSearchQuery]);

  const baseSummaries = useMemo(() => {
    const summaries = baseStores.map(toStoreSummary);
    if (!normalizedSearchQuery || appliedCategories.length === 0) return summaries;
    return summaries.filter((store) => appliedCategories.includes(store.category));
  }, [appliedCategories, baseStores, normalizedSearchQuery]);

  const sortMetaQueries = useQueries({
    queries: baseSummaries.map((store) => {
      if (appliedSort === 'eatingLevel') {
        return {
          queryKey: ['storeEatingLevel', store.id],
          queryFn: async () => {
            const detail = await getStoreDetail(store.id);
            return { storeId: store.id, eatingLevel: detail.eatingLevel };
          },
          staleTime: 5 * 60 * 1000,
        };
      }

      if (appliedSort === 'reviews') {
        return {
          queryKey: ['storeReviewCount', store.id],
          queryFn: async () => {
            const reviews = await getStoreReviews(store.id);
            return { storeId: store.id, reviewCount: reviews.length };
          },
          staleTime: 5 * 60 * 1000,
        };
      }

      return {
        queryKey: ['storeSortPlaceholder', store.id, appliedSort],
        queryFn: async () => ({ storeId: store.id }),
        enabled: false,
      };
    }),
  });

  const eatingLevelMap = useMemo(
    () =>
      new Map(
        sortMetaQueries
          .map((query) => query.data)
          .filter(
            (item): item is { storeId: number; eatingLevel: string } =>
              Boolean(item && 'eatingLevel' in item && typeof item.eatingLevel === 'string'),
          )
          .map((item) => [item.storeId, item.eatingLevel]),
      ),
    [sortMetaQueries],
  );

  const reviewCountMap = useMemo(
    () =>
      new Map(
        sortMetaQueries
          .map((query) => query.data)
          .filter(
            (item): item is { storeId: number; reviewCount: number } =>
              Boolean(item && 'reviewCount' in item && typeof item.reviewCount === 'number'),
          )
          .map((item) => [item.storeId, item.reviewCount]),
      ),
    [sortMetaQueries],
  );

  const openStatusQueries = useQueries({
    queries: baseSummaries.map((store) => ({
      queryKey: ['storeOpenStatus', store.id],
      queryFn: async () => {
        const detail = await getStoreDetail(store.id);
        return {
          storeId: store.id,
          isOpen: getIsStoreOpen(
            detail.openingHours.map((openingHour) => ({
              days: openingHour.days,
              start_time: openingHour.startTime,
              end_time: openingHour.endTime,
              break_start_time: openingHour.breakStartTime ?? null,
              break_end_time: openingHour.breakEndTime ?? null,
            })),
          ),
        };
      },
      staleTime: 60 * 1000,
    })),
  });

  const openStatusMap = useMemo(
    () =>
      new Map(
        openStatusQueries
          .map((query) => query.data)
          .filter(
            (item): item is { storeId: number; isOpen: boolean } =>
              Boolean(item && 'isOpen' in item && typeof item.isOpen === 'boolean'),
          )
          .map((item) => [item.storeId, item.isOpen]),
      ),
    [openStatusQueries],
  );

  const displayedStores = useMemo(() => {
    const copied = [...baseSummaries];

    switch (appliedSort) {
      case 'rating':
        copied.sort((a, b) => b.rating - a.rating);
        break;
      case 'eatingLevel':
        copied.sort(
          (a, b) =>
            getEatingLevelRank(eatingLevelMap.get(a.id)) - getEatingLevelRank(eatingLevelMap.get(b.id)),
        );
        break;
      case 'reviews':
        copied.sort((a, b) => (reviewCountMap.get(b.id) ?? -1) - (reviewCountMap.get(a.id) ?? -1));
        break;
      default:
        break;
    }

    return copied;
  }, [appliedSort, baseSummaries, eatingLevelMap, reviewCountMap]);

  const locationMap = useMemo(
    () =>
      new Map(
        (locationsData?.stores ?? []).map((store) => [
          store.store_id,
          { lat: store.latitude, lng: store.longitude },
        ]),
      ),
    [locationsData],
  );

  const mapMarkers = useMemo(
    () =>
      displayedStores
        .map((store) => {
          const location = locationMap.get(store.id);
          if (!location) return null;
          return { id: store.id, lat: location.lat, lng: location.lng, name: store.name };
        })
        .filter((marker): marker is NonNullable<typeof marker> => marker !== null),
    [displayedStores, locationMap],
  );

  useEffect(() => {
    if (displayedStores.length === 0) {
      setSelectedStoreId(null);
      return;
    }

    if (!displayedStores.some((store) => store.id === selectedStoreId)) {
      setSelectedStoreId(displayedStores[0].id);
    }
  }, [displayedStores, selectedStoreId]);

  const handleOpenFilter = () => {
    setDraftSort(appliedSort);
    setDraftCategories(appliedCategories);
    setIsFilterOpen(true);
  };

  const handleToggleDraftCategory = (category: StoreCategory) => {
    setDraftCategories((current) =>
      current.includes(category) ? current.filter((value) => value !== category) : [...current, category],
    );
  };

  const handleResetFilter = () => {
    setDraftSort('recommend');
    setDraftCategories([]);
  };

  const handleApplyFilter = () => {
    setAppliedSort(draftSort);
    setAppliedCategories(draftCategories);
    setIsFilterOpen(false);
  };

  const handleOpenSignUp = () => {
    setIsMenuOpen(false);
    setIsSignUpIntroOpen(true);
  };

  const handleOpenSignUpForm = () => {
    setIsSignUpIntroOpen(false);
    setSignUpMessage('');
    setSignUpError('');
    setIsPrivacyConsentAgreed(false);
    setSignUpFieldErrors({
      email: false,
      code: false,
      password: false,
      nickname: false,
      privacyConsent: false,
    });
    setSignUpEatingLevel('');
    setIsEatingLevelModalOpen(false);
    setIsEatingLevelAlertOpen(false);
    setIsSignUpOpen(true);
  };

  const handleOpenLogin = () => {
    setIsMenuOpen(false);
    setIsSignUpIntroOpen(false);
    setLoginError('');
    setIsLoginOpen(true);
  };

  const handleOpenMyPage = () => {
    setIsMenuOpen(false);
    setIsMyPageOpen(true);
  };

  const handleOpenPlaceRequest = () => {
    setIsPlaceRequestOpen(true);
  };

  const handleOpenWithdraw = () => {
    setIsMenuOpen(false);
    setIsWithdrawOpen(true);
  };

  const handleCompleteWithdraw = () => {
    setIsWithdrawOpen(false);
    setIsWithdrawDoneOpen(true);
  };

  const handleCloseLogin = () => {
    setIsLoginOpen(false);
    setShowLoginPassword(false);
  };

  const handleCloseSignUp = () => {
    setIsSignUpOpen(false);
    setIsEatingLevelModalOpen(false);
    setIsEatingLevelAlertOpen(false);
    setIsPrivacyConsentOpen(false);
    setIsPrivacyConsentAgreed(false);
    setSignUpEatingLevel('');
    setShowSignUpPassword(false);
    setSignUpFieldErrors({
      email: false,
      code: false,
      password: false,
      nickname: false,
      privacyConsent: false,
    });
  };

  const handleOpenPrivacyConsent = () => {
    setIsPrivacyConsentOpen(true);
  };

  const handleAgreePrivacyConsent = () => {
    setIsPrivacyConsentAgreed(true);
    setSignUpFieldErrors((prev) => ({ ...prev, privacyConsent: false }));
    setIsPrivacyConsentOpen(false);
  };

  const handleSendVerification = async () => {
    if (!signUpEmail.trim()) {
      setSignUpFieldErrors((prev) => ({ ...prev, email: true }));
      setSignUpError('이메일을 먼저 입력해 주세요.');
      setSignUpMessage('');
      return;
    }

    try {
      setIsSendingCode(true);
      setSignUpError('');
      setSignUpMessage('');
      setIsEmailVerified(false);
      await sendVerificationEmail({ email: signUpEmail.trim() });
      setSignUpMessage('인증 메일을 전송했습니다.');
    } catch (error) {
      setSignUpError(error instanceof Error ? error.message : '인증 메일 전송에 실패했습니다.');
      setSignUpMessage('');
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!signUpEmail.trim() || !signUpCode.trim()) {
      setSignUpFieldErrors((prev) => ({
        ...prev,
        email: !signUpEmail.trim(),
        code: !signUpCode.trim(),
      }));
      setSignUpError('이메일과 인증 코드를 입력해 주세요.');
      setSignUpMessage('');
      return;
    }

    try {
      setIsVerifyingCode(true);
      setSignUpError('');
      setSignUpMessage('');
      await verifyEmailCode({ email: signUpEmail.trim(), authCode: signUpCode.trim() });
      setIsEmailVerified(true);
      setSignUpMessage('이메일 인증이 완료되었습니다.');
    } catch (error) {
      const message =
        error instanceof Error && 'status' in error && (error as { status?: number }).status === 400
          ? '인증 코드가 올바르지 않거나 만료되었습니다.'
          : error instanceof Error
            ? error.message
            : '인증 코드 확인에 실패했습니다.';
      setIsEmailVerified(false);
      setSignUpError(message);
      setSignUpMessage('');
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleSubmitSignUp = () => {
    const requiredFieldErrors = {
      email: !signUpEmail.trim(),
      code: !signUpCode.trim(),
      password: !signUpPassword.trim(),
      nickname: !signUpNickname.trim(),
      privacyConsent: !isPrivacyConsentAgreed,
    };

    setSignUpFieldErrors(requiredFieldErrors);

    if (
      !signUpEmail.trim() ||
      !signUpCode.trim() ||
      !signUpPassword.trim() ||
      !signUpNickname.trim()
    ) {
      setSignUpError('필수 항목을 모두 입력해 주세요.');
      setSignUpMessage('');
      return;
    }

    if (!isPrivacyConsentAgreed) {
      setSignUpError('개인정보 동의를 완료해 주세요.');
      setSignUpMessage('');
      return;
    }

    if (!isEmailVerified) {
      setSignUpError('이메일 인증을 먼저 완료해 주세요.');
      setSignUpMessage('');
      return;
    }

    if (signUpPassword.length < 8 || signUpPassword.length > 20 || !passwordPattern.test(signUpPassword)) {
      setSignUpError('비밀번호는 8~20자이며 영문 대소문자, 숫자, 특수문자를 모두 포함해야 합니다.');
      setSignUpMessage('');
      return;
    }

    if (signUpNickname.trim().length < 2 || signUpNickname.trim().length > 10) {
      setSignUpError('닉네임은 2자 이상 10자 이하로 입력해 주세요.');
      setSignUpMessage('');
      return;
    }

    if (signUpEmail.trim().length > 50) {
      setSignUpError('이메일은 50자 이하로 입력해 주세요.');
      setSignUpMessage('');
      return;
    }

    setSignUpError('');
    setSignUpMessage('');
    setIsEatingLevelModalOpen(true);
  };

  const handleCompleteSignUp = async () => {
    if (!signUpEatingLevel) {
      setIsEatingLevelAlertOpen(true);
      return;
    }

    try {
      setIsSigningUp(true);
      setSignUpError('');
      setSignUpMessage('');
      const nextEmail = signUpEmail.trim();
      const nextPassword = signUpPassword;

      await signUp({
        email: nextEmail,
        password: nextPassword,
        nickname: signUpNickname.trim(),
        gender: signUpGender || undefined,
        age: signUpAge || undefined,
        eatingLevel: signUpEatingLevel,
      });
      setSignUpMessage('회원가입이 완료되었습니다. 로그인 중입니다.');

      try {
        const loginResponse = await login({ email: nextEmail, password: nextPassword });
        window.localStorage.setItem('accessToken', loginResponse.accessToken);
        window.localStorage.setItem('refreshToken', loginResponse.refreshToken);
        window.localStorage.setItem('loginEmail', loginResponse.email);
        setIsLoggedIn(true);
        setIsLoginOpen(false);
        setLoginEmail('');
        setLoginPassword('');
        setShowLoginPassword(false);
      } catch {
        setLoginEmail(nextEmail);
        setLoginPassword('');
        setLoginError('회원가입은 완료되었습니다. 로그인 후 이용해 주세요.');
        setIsLoginOpen(true);
      }

      setSignUpCode('');
      setSignUpPassword('');
      setSignUpNickname('');
      setSignUpGender('');
      setSignUpAge('');
      setSignUpEatingLevel('');
      setIsEmailVerified(false);
      setIsPrivacyConsentAgreed(false);
      setIsEatingLevelModalOpen(false);
      setShowSignUpPassword(false);
      setSignUpFieldErrors({
        email: false,
        code: false,
        password: false,
        nickname: false,
        privacyConsent: false,
      });
      window.setTimeout(() => setIsSignUpOpen(false), 600);
    } catch (error) {
      setSignUpError(error instanceof Error ? error.message : '회원가입에 실패했습니다.');
      setSignUpMessage('');
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleSubmitLogin = async () => {
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('이메일과 비밀번호를 입력해 주세요.');
      return;
    }

    try {
      setIsLoggingIn(true);
      setLoginError('');
      const response = await login({ email: loginEmail.trim(), password: loginPassword });
      window.localStorage.setItem('accessToken', response.accessToken);
      window.localStorage.setItem('refreshToken', response.refreshToken);
      window.localStorage.setItem('loginEmail', response.email);
      setIsLoggedIn(true);
      setIsLoginOpen(false);
      setLoginEmail('');
      setLoginPassword('');
      setShowLoginPassword(false);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : '로그인에 실패했습니다.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Ignore server logout failure and clear local session anyway.
    } finally {
      window.localStorage.removeItem('accessToken');
      window.localStorage.removeItem('refreshToken');
      window.localStorage.removeItem('loginEmail');
      setIsLoggedIn(false);
      setIsMyPageOpen(false);
      setIsMenuOpen(false);
    }
  };

  const isLoading =
    isStoreListLoading || isLocationsLoading || (appliedCategories.length > 0 && isFilteredStoresLoading);
  const isSearching =
    normalizedSearchQuery.length > 0 &&
    searchDetailQueries.some((query) => query.isLoading || query.isFetching);
  const isSortMetaLoading =
    (appliedSort === 'eatingLevel' || appliedSort === 'reviews') &&
    sortMetaQueries.some((query) => query.isLoading || query.isFetching);
  const isSearchError = searchDetailQueries.some((query) => query.isError);
  const hasError = isStoreListError || isLocationsError || isSearchError || isFilteredStoresError;
  const handleMarkerClick = (storeId: number) => {
    setSelectedStoreId(storeId);
    setDetailStoreId(storeId);
  };

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <img src={deliciousImg} alt="" className={styles.brandImage} draggable={false} aria-hidden="true" />
          <h1 className={styles.title}>홍밥</h1>
        </div>
      </header>

      <div className={styles.mapLayer}>
        <KakaoMap markers={mapMarkers} onMarkerClick={handleMarkerClick} />
        <div className={styles.mapDimmer} />
      </div>

      <div className={styles.topLeft}>
        <Button
          variant="primary"
          width={56}
          height={56}
          radius={16}
          aria-label="메뉴 열기"
          className={styles.menuButton}
          onClick={() => setIsMenuOpen(true)}
        >
          <CommonIcon name="hamburger" size={28} variant="inherit" />
        </Button>
      </div>

      <div className={styles.topCenter}>
        <Button variant="third" height={44} radius={16} className={styles.filterButton} aria-label="필터" onClick={handleOpenFilter}>
          <span className={styles.inlineIcon}>
            <CommonIcon name="filter" size={20} className={styles.filterIcon} />
          </span>
          필터
        </Button>
      </div>

      <aside className={styles.rightPanel}>
        <div className={styles.searchWrap}>
          <Input
            variant="search"
            placeholder="지금, 먹고 싶은 음식은?"
            leftIcon={<CommonIcon name="search" size={22} />}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            containerClassName={styles.searchInput}
          />
        </div>

        {hasError ? <div className={styles.feedbackCard}>식당 정보를 불러오지 못했습니다.</div> : null}

        <div className={styles.list}>
          {isLoading || isSearching || isSortMetaLoading ? (
            <div className={styles.feedbackCard}>식당 정보를 불러오는 중입니다.</div>
          ) : displayedStores.length === 0 ? (
            <div className={styles.feedbackCard}>조건에 맞는 식당이 없습니다.</div>
          ) : (
            displayedStores.map((store) => {
              const isSelected = selectedStoreId === store.id;
              const isStoreOpen = openStatusMap.get(store.id) ?? store.isOpen;

              return (
                <button
                  key={store.id}
                  type="button"
                  className={`${styles.card} ${isSelected ? styles.cardSelected : ''}`}
                  onClick={() => {
                    setSelectedStoreId(store.id);
                    setDetailStoreId(store.id);
                  }}
                >
                  <div className={styles.cardLeft}>
                    <div className={styles.catIconBox}>
                      <FoodCategoryIcon category={toFoodCategory(store.category)} size={26} />
                    </div>
                    <div className={styles.storeInfo}>
                      <div className={styles.storeNameRow}>
                        <CommonIcon name="forkknife" size={18} className={styles.forkIcon} />
                        <span className={styles.storeName}>{store.name}</span>
                      </div>
                      <div className={styles.storeMeta}>
                        <span className={styles.metaText}>{foodCategoryLabel(toFoodCategory(store.category))}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.cardRight}>
                    <Chip variant={isStoreOpen ? 'open' : 'closed'} size="sm">
                      {isStoreOpen ? '영업중' : '영업전'}
                    </Chip>

                    <div className={styles.rating}>
                      <span className={styles.ratingLabel}>평점</span>
                      <span className={styles.star}>
                        <CommonIcon name="starfilled" size={14} />
                      </span>
                      <span className={styles.ratingValue}>{store.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      <div className={styles.bottomLeft}>
        <Button
          variant="primary"
          height={48}
          radius={9999}
          className={styles.recommendButton}
          onClick={handleOpenPlaceRequest}
        >
          <span className={styles.inlineIcon}>
            <CommonIcon name="plus" size={16} />
          </span>
          장소 추천하기
        </Button>
      </div>

      <PlaceDetailModalFlow
        open={detailStoreId !== null}
        onClose={() => setDetailStoreId(null)}
        storeId={detailStoreId}
      />

      <MyPageModal open={isMyPageOpen} onClose={() => setIsMyPageOpen(false)} />
      <PlaceRequestModal
        open={isPlaceRequestOpen}
        onClose={() => setIsPlaceRequestOpen(false)}
        isLoggedIn={isLoggedIn}
        onNeedLogin={() => setIsLoginOpen(true)}
      />
      <Modal
        open={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        closeOnOverlayClick
        className={styles.withdrawModal}
        headerRight={
          <button
            type="button"
            className={styles.withdrawCloseButton}
            aria-label="회원 탈퇴 닫기"
            onClick={() => setIsWithdrawOpen(false)}
          >
            <CommonIcon name="crossclose" size={20} />
          </button>
        }
      >
        <div className={styles.withdrawBody}>
          <h2 className={styles.withdrawTitle}>회원 탈퇴하기</h2>

          <img
            src={surprisedImg}
            alt=""
            className={styles.withdrawImage}
            draggable={false}
            aria-hidden="true"
          />

          <p className={styles.withdrawHeadline}>정말 탈퇴하시겠습니까?</p>
          <p className={styles.withdrawDescription}>
            회원 탈퇴 시
            <br />
            계정 정보와 이용 기록은 모두 삭제되며,
            <br />
            삭제된 정보는 복구할 수 없습니다.
          </p>

          <button type="button" className={styles.withdrawSubmitButton} onClick={handleCompleteWithdraw}>
            탈퇴하기
          </button>
        </div>
      </Modal>
      <Modal
        open={isWithdrawDoneOpen}
        onClose={() => setIsWithdrawDoneOpen(false)}
        closeOnOverlayClick
        className={styles.withdrawModal}
        headerRight={
          <button
            type="button"
            className={styles.withdrawCloseButton}
            aria-label="회원 탈퇴 완료 닫기"
            onClick={() => setIsWithdrawDoneOpen(false)}
          >
            <CommonIcon name="crossclose" size={20} />
          </button>
        }
        >
          <div className={styles.withdrawBody}>
            <div className={styles.withdrawDoneIcon} aria-hidden="true">
              <CommonIcon name="check" size={56} />
            </div>

          <p className={styles.withdrawDoneHeadline}>회원 탈퇴가 완료되었습니다.</p>
          <p className={styles.withdrawDoneDescription}>
            그동안 홍밥을
            <br />
            이용해주셔서 감사합니다.
          </p>
        </div>
      </Modal>

      {isMenuOpen ? (
        <div className={styles.menuOverlay} onClick={() => setIsMenuOpen(false)} role="presentation">
          <div className={styles.menuPanel} onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
            <div className={styles.menuHeader}>
              <button
                type="button"
                className={styles.menuCloseButton}
                aria-label="메뉴 닫기"
                onClick={() => setIsMenuOpen(false)}
              >
                <CommonIcon name="crossclose" size={22} />
              </button>
            </div>

            {isLoggedIn ? (
              <div className={styles.menuContent}>
                <button type="button" className={styles.menuAction} onClick={handleOpenMyPage}>
                  <span className={styles.menuActionIcon}>
                    <CommonIcon name="mypage2" size={26} />
                  </span>
                  <span>마이페이지</span>
                </button>

                <div className={styles.menuDivider} />

                <button type="button" className={styles.menuAction} onClick={handleLogout}>
                  <span className={styles.menuActionIcon}>
                    <CommonIcon name="exit" size={24} />
                  </span>
                  <span>로그아웃</span>
                </button>

                <button type="button" className={styles.menuAction} onClick={handleOpenWithdraw}>
                  <span className={styles.menuActionIcon}>
                    <CommonIcon name="ban" size={24} />
                  </span>
                  <span>회원탈퇴</span>
                </button>
              </div>
            ) : (
              <div className={styles.menuGuestContent}>
                <button type="button" className={styles.menuGuestPrimary} onClick={handleOpenLogin}>
                  <span className={styles.menuGuestButtonIcon}>
                    <CommonIcon name="exit" size={18} />
                  </span>
                  <span>로그인</span>
                </button>
                <button type="button" className={styles.menuGuestSecondary} onClick={handleOpenSignUp}>
                  <span className={styles.menuGuestButtonIcon}>
                    <CommonIcon name="check" size={18} />
                  </span>
                  <span>회원가입</span>
                </button>
              </div>
            )}
          </div>
        </div>
      ) : null}

      <Modal open={isLoginOpen} onClose={handleCloseLogin} closeOnOverlayClick className={styles.loginModal}>
        <form
          className={styles.loginBody}
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmitLogin();
          }}
        >
          <h2 className={styles.loginTitle}>로그인 하기</h2>

          <div className={styles.signUpField}>
            <label className={styles.signUpLabel}>이메일</label>
            <input
              className={styles.signUpInput}
              type="email"
              value={loginEmail}
              onChange={(event) => setLoginEmail(event.target.value)}
              placeholder="example@email.com"
            />
          </div>

          <div className={styles.signUpField}>
            <label className={styles.signUpLabel}>비밀번호</label>
            <div className={styles.passwordRow}>
              <input
                className={styles.signUpInput}
                type={showLoginPassword ? 'text' : 'password'}
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
              />
              <button
                type="button"
                className={styles.passwordToggleButton}
                aria-label="비밀번호 보기"
                onClick={() => setShowLoginPassword((prev) => !prev)}
              >
                <CommonIcon name={showLoginPassword ? 'passwordopen' : 'passwordhide'} size={16} />
              </button>
            </div>
          </div>

          {loginError ? <p className={styles.signUpErrorText}>{loginError}</p> : null}

          <button type="submit" className={styles.signUpSubmitButton} disabled={isLoggingIn}>
            {isLoggingIn ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </Modal>

      <Modal
        open={isSignUpIntroOpen}
        onClose={() => setIsSignUpIntroOpen(false)}
        closeOnOverlayClick
        className={styles.signUpIntroModal}
        headerRight={
          <button
            type="button"
            className={styles.signUpIntroCloseButton}
            aria-label="회원가입 안내 닫기"
            onClick={() => setIsSignUpIntroOpen(false)}
          >
            <CommonIcon name="crossclose" size={20} />
          </button>
        }
      >
        <div className={styles.signUpIntroBody}>
          <img
            src={happyImg}
            alt=""
            className={styles.signUpIntroImage}
            draggable={false}
            aria-hidden="true"
          />

          <div className={styles.signUpIntroTextGroup}>
            <h2 className={styles.signUpIntroTitle}>첫 방문이신가요?</h2>
            <p className={styles.signUpIntroDescription}>계정을 생성하여 서비스를 이용해보세요!</p>
          </div>

          <button type="button" className={styles.signUpIntroPrimaryButton} onClick={handleOpenSignUpForm}>
            계정 생성하기
          </button>

          <div className={styles.signUpIntroSecondaryActions}>
            <button type="button" className={styles.signUpIntroSecondaryButton} onClick={handleOpenLogin}>
              이미 계정이 있다면?
            </button>
            <button
              type="button"
              className={styles.signUpIntroSecondaryButton}
              onClick={() => setIsSignUpIntroOpen(false)}
            >
              로그인 없이 둘러보기
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={isSignUpOpen} onClose={handleCloseSignUp} closeOnOverlayClick className={styles.signUpModal}>
        <div className={styles.signUpBody}>
          <h2 className={styles.signUpTitle}>계정 생성하기</h2>

          <div className={styles.signUpField}>
            <label className={styles.signUpLabel}>이메일</label>
            <div className={styles.emailRow}>
              <input
                className={`${styles.signUpInput} ${signUpFieldErrors.email ? styles.signUpInputError : ''}`}
                type="email"
                value={signUpEmail}
                onChange={(event) => {
                  setSignUpEmail(event.target.value);
                  setIsEmailVerified(false);
                  setSignUpFieldErrors((prev) => ({ ...prev, email: false }));
                }}
                placeholder="example@email.com"
              />
              <button type="button" className={styles.emailCheckButton} onClick={handleSendVerification} disabled={isSendingCode}>
                {isSendingCode ? '전송 중...' : '인증'}
              </button>
            </div>
          </div>

          <div className={styles.signUpField}>
            <label className={styles.signUpLabel}>인증 코드</label>
            <div className={styles.emailRow}>
              <input
                className={`${styles.signUpInput} ${signUpFieldErrors.code ? styles.signUpInputError : ''}`}
                type="text"
                value={signUpCode}
                onChange={(event) => {
                  setSignUpCode(event.target.value);
                  setIsEmailVerified(false);
                  setSignUpFieldErrors((prev) => ({ ...prev, code: false }));
                }}
                placeholder="6자리 코드를 입력해 주세요"
              />
              <button type="button" className={styles.emailCheckButton} onClick={handleVerifyCode} disabled={isVerifyingCode}>
                {isVerifyingCode ? '확인 중...' : '확인'}
              </button>
            </div>
          </div>

          <div className={styles.signUpField}>
            <label className={styles.signUpLabel}>비밀번호</label>
            <div className={styles.passwordRow}>
              <input
                className={`${styles.signUpInput} ${signUpFieldErrors.password ? styles.signUpInputError : ''}`}
                type={showSignUpPassword ? 'text' : 'password'}
                value={signUpPassword}
                onChange={(event) => {
                  setSignUpPassword(event.target.value);
                  setSignUpFieldErrors((prev) => ({ ...prev, password: false }));
                }}
              />
              <button
                type="button"
                className={styles.passwordToggleButton}
                aria-label="비밀번호 보기"
                onClick={() => setShowSignUpPassword((prev) => !prev)}
              >
                <CommonIcon name={showSignUpPassword ? 'passwordopen' : 'passwordhide'} size={16} />
              </button>
            </div>
            <p className={styles.signUpHint}>영문대문자 + 소문자 + 숫자 + 특수문자</p>
          </div>

          <div className={styles.signUpField}>
            <label className={styles.signUpLabel}>닉네임</label>
            <input
              className={`${styles.signUpInput} ${signUpFieldErrors.nickname ? styles.signUpInputError : ''}`}
              type="text"
              value={signUpNickname}
              onChange={(event) => {
                setSignUpNickname(event.target.value);
                setSignUpFieldErrors((prev) => ({ ...prev, nickname: false }));
              }}
              placeholder="닉네임"
            />
          </div>

          <div className={styles.signUpSelectRow}>
            <div className={styles.signUpField}>
              <label className={styles.signUpLabel}>성별</label>
              <select className={styles.signUpSelect} value={signUpGender} onChange={(event) => setSignUpGender(event.target.value)}>
                <option value="">선택</option>
                <option value="남성">남성</option>
                <option value="여성">여성</option>
                <option value="선택안함">선택안함</option>
              </select>
            </div>

            <div className={styles.signUpField}>
              <label className={styles.signUpLabel}>나이대</label>
              <select className={styles.signUpSelect} value={signUpAge} onChange={(event) => setSignUpAge(event.target.value)}>
                <option value="">선택</option>
                <option value="10대 이하">10대 이하</option>
                <option value="10대">10대</option>
                <option value="20대">20대</option>
                <option value="30대">30대</option>
                <option value="40대">40대</option>
                <option value="50대 이상">50대 이상</option>
                <option value="선택안함">선택안함</option>
              </select>
            </div>
          </div>

          <div className={styles.signUpMetaRow}>
            <span className={styles.signUpMetaMuted}>완료 확인</span>
            <button
              type="button"
              className={`${styles.signUpConsentTrigger} ${signUpFieldErrors.privacyConsent ? styles.signUpConsentTriggerError : ''}`}
              onClick={handleOpenPrivacyConsent}
            >
              <span className={styles.signUpTermsButton}>개인정보 동의</span>
              <span
                className={`${styles.signUpConsentCheckbox} ${isPrivacyConsentAgreed ? styles.signUpConsentCheckboxChecked : ''}`}
                aria-hidden="true"
              >
                {isPrivacyConsentAgreed ? <CommonIcon name="check" size={12} /> : null}
              </span>
            </button>
          </div>

          {signUpError ? <p className={styles.signUpErrorText}>{signUpError}</p> : null}
          {signUpMessage ? <p className={styles.signUpSuccessText}>{signUpMessage}</p> : null}

          <button type="button" className={styles.signUpSubmitButton} onClick={handleSubmitSignUp} disabled={isSigningUp}>
            {isSigningUp ? '가입 중...' : '회원가입'}
          </button>
        </div>
      </Modal>

      <Modal
        open={isPrivacyConsentOpen}
        onClose={() => setIsPrivacyConsentOpen(false)}
        closeOnOverlayClick
        className={styles.privacyConsentModal}
        title="개인정보 동의"
        headerRight={
          <button
            type="button"
            className={styles.privacyConsentCloseButton}
            aria-label="개인정보 동의 닫기"
            onClick={() => setIsPrivacyConsentOpen(false)}
          >
            <CommonIcon name="crossclose" size={20} />
          </button>
        }
      >
        <div className={styles.privacyConsentBody}>
          <div className={styles.privacyConsentSection}>
            <h3 className={styles.privacyConsentSectionTitle}>수집 항목</h3>
            <p className={styles.privacyConsentText}>
              이메일, 비밀번호, 닉네임, 성별, 나이대, 혼밥 레벨 정보를 회원가입 및 서비스 제공을 위해 수집합니다.
            </p>
          </div>

          <div className={styles.privacyConsentSection}>
            <h3 className={styles.privacyConsentSectionTitle}>이용 목적</h3>
            <p className={styles.privacyConsentText}>
              회원 식별, 계정 관리, 맞춤형 서비스 제공 및 이용 기록 관리에 활용됩니다.
            </p>
          </div>

          <div className={styles.privacyConsentSection}>
            <h3 className={styles.privacyConsentSectionTitle}>보관 기간</h3>
            <p className={styles.privacyConsentText}>
              회원 탈퇴 시까지 보관하며, 관련 법령에 따라 필요한 경우 일정 기간 추가 보관될 수 있습니다.
            </p>
          </div>

          <button type="button" className={styles.privacyConsentAgreeButton} onClick={handleAgreePrivacyConsent}>
            최종 동의
          </button>
        </div>
      </Modal>

      <Modal
        open={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="필터"
        closeOnOverlayClick
        className={styles.filterModal}
        headerLeft={
          <button type="button" className={styles.filterBackButton} aria-label="필터 닫기" onClick={() => setIsFilterOpen(false)}>
            <CommonIcon name="leftdir" size={28} />
          </button>
        }
      >
        <div className={styles.filterModalBody}>
          <section className={styles.filterSection}>
            <div className={styles.filterSectionHeader}>
              <h3 className={styles.filterSectionTitle}>정렬</h3>
              <span className={styles.filterBadge}>
                {sortOptions.find((option) => option.key === draftSort)?.label ?? '추천순'}
              </span>
            </div>

            <div className={styles.filterGrid}>
              {sortOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  className={`${styles.filterPill} ${draftSort === option.key ? styles.filterPillActive : ''}`}
                  onClick={() => setDraftSort(option.key)}
                >
                  <span>{option.label}</span>
                  <span className={styles.filterRadio} />
                </button>
              ))}
            </div>
          </section>

          <section className={styles.filterSection}>
            <div className={styles.filterSectionHeader}>
              <h3 className={styles.filterSectionTitle}>음식 카테고리</h3>
            </div>

            <div className={styles.categoryGrid}>
              {categoryOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`${styles.categoryPill} ${draftCategories.includes(option.value) ? styles.categoryPillActive : ''}`}
                  onClick={() => handleToggleDraftCategory(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </section>

          <div className={styles.filterActions}>
            <button type="button" className={styles.resetButton} onClick={handleResetFilter}>
              초기화
            </button>
            <button type="button" className={styles.applyButton} onClick={handleApplyFilter}>
              적용
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={isEatingLevelModalOpen}
        onClose={() => setIsEatingLevelModalOpen(false)}
        closeOnOverlayClick
        className={styles.eatingLevelModal}
        title="혼밥 레벨 확인"
      >
        <div className={styles.eatingLevelBody}>
          <div className={styles.eatingLevelGrid}>
            {signUpLevelOptions.map((option) => {
              const isSelected = signUpEatingLevel === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  className={`${styles.eatingLevelCard} ${isSelected ? styles.eatingLevelCardSelected : ''}`}
                  onClick={() => setSignUpEatingLevel(option.value)}
                >
                  <img src={option.image} alt="" className={styles.eatingLevelImage} draggable={false} aria-hidden="true" />
                  <strong className={styles.eatingLevelCardTitle}>{option.title}</strong>
                  <p className={styles.eatingLevelCardDescription}>
                    {option.description.split('\n').map((line) => (
                      <span key={`${option.value}-${line}`} className={styles.eatingLevelLine}>
                        {line}
                      </span>
                    ))}
                  </p>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className={styles.eatingLevelSubmitButton}
            onClick={() => {
              void handleCompleteSignUp();
            }}
            disabled={isSigningUp}
          >
            {isSigningUp ? '가입 중...' : '시작하기'}
          </button>
        </div>
      </Modal>

      <Modal
        open={isEatingLevelAlertOpen}
        onClose={() => setIsEatingLevelAlertOpen(false)}
        closeOnOverlayClick
        className={styles.eatingLevelAlertModal}
      >
        <div className={styles.eatingLevelAlertBody}>
          <p className={styles.eatingLevelAlertText}>혼밥 레벨을 선택해 주세요.</p>
          <button
            type="button"
            className={styles.eatingLevelAlertButton}
            onClick={() => setIsEatingLevelAlertOpen(false)}
          >
            확인
          </button>
        </div>
      </Modal>
    </div>
  );
}
