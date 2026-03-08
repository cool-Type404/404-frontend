import { useCallback, useMemo, useRef, useState } from 'react';

import Button from '@/components/Button/Button';
import { CommonIcon } from '@/components/CommonIcon/CommonIcon';
import Divider from '@/components/Divider/Divider';
import IconButton from '@/components/IconButton/IconButton';
import Modal from '@/components/Modal/Modal';
import Textarea from '@/components/Textarea/Textarea';

import styles from './PlaceWriteReviewModal.module.css';

export type CreateReviewPayload = {
  placeId: number;
  rating: number;
  hashtags: string[];
  content: string;
  images: File[];
};

type Props = {
  open: boolean;
  onClose: () => void;
  onBack: () => void;
  placeId: number;
  placeName: string;
  isSubmitting?: boolean;
  submitError?: string;
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
  isSubmitting = false,
  submitError = '',
  onSubmitReview,
}: Props) {
  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [formError, setFormError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const hashtagOptions = useMemo(
    () => ['#가성비 좋은', '#믿고가는 맛집', '#빠른 회전률', '#쾌적한 매장', '#친절한 응대', '#든든한 한끼'],
    [],
  );

  const resetForm = useCallback(() => {
    setRating(0);
    setSelectedTags([]);
    setContent('');
    setImages([]);
    setFormError('');
  }, []);

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((value) => value !== tag);
      }

      if (prev.length >= MAX_HASHTAGS) {
        return prev;
      }

      return [...prev, tag];
    });
  }, []);

  const isTagDisabled = useCallback(
    (tag: string) => !selectedTags.includes(tag) && selectedTags.length >= MAX_HASHTAGS,
    [selectedTags],
  );

  const handlePickImages = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFilesChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) {
      return;
    }

    setImages((prev) => [...prev, ...files].slice(0, MAX_IMAGES));
    event.target.value = '';
  }, []);

  const handleSubmit = useCallback(() => {
    if (rating < 1) {
      setFormError('별점을 선택해 주세요.');
      return;
    }

    if (!content.trim()) {
      setFormError('리뷰 내용을 입력해 주세요.');
      return;
    }

    setFormError('');

    onSubmitReview?.({
      placeId,
      rating,
      hashtags: selectedTags,
      content: content.trim(),
      images,
    });
  }, [content, images, onSubmitReview, placeId, rating, selectedTags]);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  const handleBack = useCallback(() => {
    resetForm();
    onBack();
  }, [onBack, resetForm]);

  const headerLeft = (
    <IconButton ariaLabel="뒤로가기" tone="green" size={25} onClick={handleBack}>
      <CommonIcon name="leftdir" />
    </IconButton>
  );

  const headerRight = (
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
      headerLeft={headerLeft}
      headerRight={headerRight}
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
              <div className={styles.label}>별점</div>
              <div className={styles.helper}>{rating}/5</div>
            </div>

            <div className={styles.stars} role="radiogroup" aria-label="별점 선택">
              {Array.from({ length: 5 }, (_, index) => {
                const value = index + 1;
                const filled = value <= rating;

                return (
                  <button
                    key={value}
                    type="button"
                    className={[styles.starBtn, filled ? styles.starFilled : styles.starEmpty].join(' ')}
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
              placeholder={'음식은 맛있었나요?\n혼밥러들에게 유용한 리뷰를 남겨주세요.'}
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
                  <span style={{ fontSize: 20, fontWeight: 900 }}>+</span>
                </div>
                <div className={styles.attachHint}>
                  {images.length === 0 ? '최대 3장까지 가능' : `${images.length}/${MAX_IMAGES} 선택됨`}
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

          {formError ? <p className={styles.errorText}>{formError}</p> : null}
          {submitError ? <p className={styles.errorText}>{submitError}</p> : null}
        </div>

        <div className={[styles.footer, styles.footerOne].join(' ')}>
          <Button variant="primary" type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? '리뷰 등록 중...' : '리뷰 등록하기'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
