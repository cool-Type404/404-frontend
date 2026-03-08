import { useEffect, useState } from 'react';

import { CommonIcon } from '@/components/CommonIcon/CommonIcon';
import Modal from '@/components/Modal/Modal';
import Textarea from '@/components/Textarea/Textarea';
import {
  requestPlaceAddition,
  type PlaceRequestCategory,
} from '@/features/place-request/api/placeRequest.api';

import styles from './PlaceRequestModal.module.css';

type PlaceRequestModalProps = {
  open: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  onNeedLogin?: () => void;
};

const categoryOptions: Array<{ label: string; value: PlaceRequestCategory }> = [
  { label: '한식', value: 'KOREAN' },
  { label: '중식', value: 'CHINESE' },
  { label: '일식', value: 'JAPANESE' },
  { label: '양식', value: 'WESTERN' },
  { label: '분식', value: 'SNACK' },
  { label: '아시안', value: 'ASIAN' },
];

export default function PlaceRequestModal({
  open,
  onClose,
  isLoggedIn,
  onNeedLogin,
}: PlaceRequestModalProps) {
  const [storeName, setStoreName] = useState('');
  const [addressUrl, setAddressUrl] = useState('');
  const [storeCategory, setStoreCategory] = useState('');
  const [contents, setContents] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError('');
    setMessage('');
  }, [open]);

  const resetForm = () => {
    setStoreName('');
    setAddressUrl('');
    setStoreCategory('');
    setContents('');
    setError('');
    setMessage('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!isLoggedIn) {
      setError('로그인 후 장소 추천 요청을 보낼 수 있습니다.');
      setMessage('');
      onNeedLogin?.();
      return;
    }

    if (storeName.trim().length < 2 || storeName.trim().length > 20) {
      setError('장소명은 2자 이상 20자 이하로 입력해 주세요.');
      setMessage('');
      return;
    }

    if (contents.trim().length < 5 || contents.trim().length > 500) {
      setError('추천 이유는 5자 이상 500자 이하로 입력해 주세요.');
      setMessage('');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      const responseMessage = await requestPlaceAddition({
        storeName: storeName.trim(),
        addressUrl: addressUrl.trim() || undefined,
        contents: contents.trim(),
        storeCategory: (storeCategory || undefined) as PlaceRequestCategory | undefined,
      });

      setStoreName('');
      setAddressUrl('');
      setStoreCategory('');
      setContents('');
      setError('');
      setMessage(responseMessage || '장소 추천 요청이 완료되었습니다.');
      window.setTimeout(() => onClose(), 800);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '장소 추천 요청에 실패했습니다.');
      setMessage('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="장소 추천하기"
      closeOnOverlayClick
      className={styles.modal}
      headerLeft={
        <button type="button" className={styles.headerButton} aria-label="장소 추천 닫기" onClick={handleClose}>
          <CommonIcon name="leftdir" size={24} />
        </button>
      }
    >
      <div className={styles.body}>
        <p className={styles.notice}>
          새로 등록되면 좋을 식당을 알려주세요.
          <br />
          장소명과 추천 이유를 남겨주시면 관리자가 확인합니다.
        </p>

        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label className={styles.label} htmlFor="place-request-name">
              장소명
            </label>
            <span className={styles.hint}>필수</span>
          </div>
          <input
            id="place-request-name"
            className={styles.input}
            type="text"
            value={storeName}
            onChange={(event) => setStoreName(event.target.value)}
            placeholder="추천할 식당 이름을 입력해 주세요"
            maxLength={20}
          />
        </div>

        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label className={styles.label} htmlFor="place-request-category">
              음식 카테고리
            </label>
            <span className={styles.hint}>선택</span>
          </div>
          <select
            id="place-request-category"
            className={styles.select}
            value={storeCategory}
            onChange={(event) => setStoreCategory(event.target.value)}
          >
            <option value="">선택 안함</option>
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label className={styles.label} htmlFor="place-request-address">
              지도/주소 링크
            </label>
            <span className={styles.hint}>선택</span>
          </div>
          <input
            id="place-request-address"
            className={styles.input}
            type="text"
            value={addressUrl}
            onChange={(event) => setAddressUrl(event.target.value)}
            placeholder="주소 또는 지도 링크를 입력해 주세요"
          />
        </div>

        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label className={styles.label}>추천 이유</label>
            <span className={styles.hint}>5자 이상 500자 이하</span>
          </div>
          <Textarea
            value={contents}
            onChange={setContents}
            placeholder={'왜 등록되면 좋을지 설명해 주세요.\n예: 혼밥하기 편하고 직장인 점심 수요가 많아요.'}
            maxLength={500}
            showCount
          />
        </div>

        {error ? <p className={styles.errorText}>{error}</p> : null}
        {message ? <p className={styles.successText}>{message}</p> : null}

        <div className={styles.actions}>
          <button type="button" className={styles.secondaryButton} onClick={handleClose} disabled={isSubmitting}>
            취소
          </button>
          <button type="button" className={styles.primaryButton} onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? '요청 중...' : '추천 요청 보내기'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
