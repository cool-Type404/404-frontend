import { useCallback, useMemo, useRef, useState } from 'react';

import Modal from '@/components/Modal/Modal';
import IconButton from '@/components/IconButton/IconButton';
import Button from '@/components/Button/Button';
import Divider from '@/components/Divider/Divider';
import { CommonIcon } from '@/components/CommonIcon/CommonIcon';
import Textarea from '@/components/Textarea/Textarea';

import styles from './PlaceWriteReviewModal.module.css';

// ✅ 백엔드로 보낼 “작성 payload” 타입 (나중에 API 붙일 때 그대로 쓰기 좋음)
export type CreateReviewPayload = {
  placeId: number;
  rating: number; // 0~5
  hashtags: string[]; // 0~3
  content: string;
  images: File[]; // 최대 3장
};

// ✅ Flow에서 리뷰State에 추가하려면 실제 Review 타입이 필요할 수 있음.
// 여기서는 payload만 넘기고, Flow에서 Review로 변환해서 push하는 방식 권장.
type Props = {
  open: boolean;
  onClose: () => void;
  onBack: () => void;
  placeId: number;
  placeName: string;

  /** 등록 버튼 눌렀을 때 상위(Flow)로 payload 전달 */
  onSubmitReview?: (payload: CreateReviewPayload) => void;
};

const MAX_HASHTAGS = 3;
const MAX_IMAGES = 3;

export default function PlaceWriteReviewModal({
  open,
  onClose,
  onBack,
  placeName,
  placeId,
  onSubmitReview,
}: Props) {
  const [rating, setRating] = useState<number>(0);

  const hashtagOptions = useMemo(
    () => ['#혼밥가능', '#가성비', '#조용함', '#빠른회전', '#든든함', '#깔끔함'],
    [],
  );
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [content, setContent] = useState<string>('');

  const [images, setImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const toggleTag = useCallback(
    (tag: string) => {
      setSelectedTags((prev) => {
        const exists = prev.includes(tag);
        if (exists) return prev.filter((t) => t !== tag);
        if (prev.length >= MAX_HASHTAGS) return prev;
        return [...prev, tag];
      });
    },
    [setSelectedTags],
  );

  const isTagDisabled = useCallback(
    (tag: string) => {
      const selected = selectedTags.includes(tag);
      return !selected && selectedTags.length >= MAX_HASHTAGS;
    },
    [selectedTags],
  );

  const handlePickImages = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFilesChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setImages((prev) => {
      const merged = [...prev, ...files].slice(0, MAX_IMAGES);
      return merged;
    });

    e.target.value = '';
  }, []);

  const handleSubmit = useCallback(() => {
    const payload: CreateReviewPayload = {
      placeId,
      rating,
      hashtags: selectedTags,
      content: content.trim(),
      images,
    };

    // ✅ “백엔드가 있다고 가정”: 여기서 API 호출이 들어갈 자리
    // await createReview(placeId, payload) 같은 형태가 될 것
    // 지금은 상위로 넘겨서 mock state에 추가
    onSubmitReview?.(payload);

    // 등록 후 상세로 돌아가기(Flow view를 'detail'로)
    onBack();
  }, [placeId, rating, selectedTags, content, images, onSubmitReview, onBack]);

  // 모달 열릴 때마다 초기화(원하면 유지로 바꿔도 됨)
  // "작성 중 닫았다가 다시 열면 초기화"가 일반적으로 자연스러움
  const resetIfOpen = useCallback(() => {
    setRating(0);
    setSelectedTags([]);
    setContent('');
    setImages([]);
  }, []);

  // Modal 컴포넌트가 open 시점 훅을 제공하지 않으니, 간단하게 open true일 때만 최초 렌더에서 초기화하고 싶다면
  // Flow에서 view 전환 시 place-detail 쪽에서 state reset을 시켜도 됨.
  // 여기서는 “닫힐 때 onClose로 나갈 수 있으니” 닫기 버튼에서 초기화 후 닫도록 처리:
  const handleClose = useCallback(() => {
    resetIfOpen();
    onClose();
  }, [onClose, resetIfOpen]);

  const handleBack = useCallback(() => {
    resetIfOpen();
    onBack();
  }, [onBack, resetIfOpen]);

  const HeaderLeft = (
    <IconButton ariaLabel="뒤로가기" tone="green" size={25} onClick={handleBack}>
      <CommonIcon name="leftdir" />
    </IconButton>
  );

  const HeaderRight = (
    <IconButton ariaLabel="닫기" tone="green" size={25} onClick={handleClose}>
      <CommonIcon name="crossclose" />
    </IconButton>
  );

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={placeName}
      titleAlign="center"
      headerLeft={HeaderLeft}
      headerRight={HeaderRight}
      closeOnEsc
      closeOnOverlayClick={false}
      className={styles.modal}
    >
      <div className={styles.layout}>
        <div className={styles.body}>
          <h3 className={styles.heading}>리뷰 작성하기</h3>
          <Divider color="#6fbf3a" spacing={16} />

          <div className={styles.section}>
            <div className={styles.labelRow}>
              <div className={styles.label}>평점</div>
              <div className={styles.helper}>{rating}/5</div>
            </div>

            <div className={styles.stars} role="radiogroup" aria-label="평점 선택">
              {Array.from({ length: 5 }, (_, idx) => {
                const value = idx + 1;
                const filled = value <= rating;

                return (
                  <button
                    key={value}
                    type="button"
                    className={[styles.starBtn, filled ? styles.starFilled : styles.starEmpty].join(
                      ' ',
                    )}
                    onClick={() => setRating(value)}
                    aria-label={`${value}점`}
                    aria-checked={filled}
                    role="radio"
                  >
                    {filled ? '★' : '☆'}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.labelRow}>
              <div className={styles.label}>추천 해시태그</div>
              <div className={styles.helper}>최대 {MAX_HASHTAGS}개</div>
            </div>

            <div className={styles.tags}>
              {hashtagOptions.map((tag) => {
                const selected = selectedTags.includes(tag);
                const disabled = isTagDisabled(tag);

                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={[
                      styles.tagBtn,
                      selected ? styles.tagBtnSelected : '',
                      disabled ? styles.tagBtnDisabled : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    aria-pressed={selected}
                    disabled={disabled}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>

            <div className={styles.counterRow}>
              <span className={styles.counterText}>
                {selectedTags.length}/{MAX_HASHTAGS}
              </span>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.labelRow}>
              <div className={styles.label}>리뷰 작성</div>
              <div className={styles.helper}>{Math.min(200, content.length)}/200</div>
            </div>

            <Textarea
              variant="multi"
              value={content}
              onChange={(value) => setContent(value)}
              placeholder={'음식이 맛있었나요?\n혼밥러들에게 유용한 리뷰를 남겨주세요!'}
              maxLength={200}
            />
          </div>

          <div className={styles.section}>
            <div className={styles.labelRow}>
              <div className={styles.label}>사진 첨부</div>
              <div className={styles.helper}>최대 {MAX_IMAGES}장</div>
            </div>

            <div className={styles.attachWrap}>
              <button type="button" className={styles.attachBtn} onClick={handlePickImages}>
                <div className={styles.attachIcon} aria-hidden="true">
                  <span style={{ fontSize: 20, fontWeight: 900 }}>＋</span>
                </div>
                <div className={styles.attachHint}>
                  {images.length === 0
                    ? '최대 3장까지 가능'
                    : `${images.length}/${MAX_IMAGES} 선택됨`}
                </div>
              </button>

              <input
                ref={fileInputRef}
                className={styles.hiddenInput}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFilesChange}
              />
            </div>
          </div>
        </div>

        <div className={[styles.footer, styles.footerOne].join(' ')}>
          <Button variant="primary" type="button" onClick={handleSubmit}>
            리뷰 등록하기
          </Button>
        </div>
      </div>
    </Modal>
  );
}
