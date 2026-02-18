import Modal from '@/components/Modal/Modal';
import IconButton from '@/components/IconButton/IconButton';
import Button from '@/components/Button/Button';
import Divider from '@/components/Divider/Divider';
import { CommonIcon } from '@/components/CommonIcon/CommonIcon';

import styles from './PlaceWriteReviewModal.module.css';

type Props = {
  open: boolean;
  onClose: () => void;
  onBack: () => void;
  placeId: number;
  placeName: string;
};

export default function PlaceWriteReviewModal({
  open,
  onClose,
  onBack,
  placeName,
  placeId: _placeId,
}: Props) {
  const HeaderLeft = (
    <IconButton ariaLabel="뒤로가기" tone="green" size={25} onClick={onBack}>
      <CommonIcon name="leftdir" />
    </IconButton>
  );

  const HeaderRight = (
    <IconButton ariaLabel="닫기" tone="green" size={25} onClick={onClose}>
      <CommonIcon name="crossclose" />
    </IconButton>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
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
          <p className={styles.desc}>
            (준비중) reviews 브랜치에서 이 모달을 실제 작성 폼으로 교체할 예정!
          </p>

          <Divider color="#6fbf3a" spacing={16} />
        </div>

        <div className={styles.footer}>
          <Button variant="secondary" onClick={onBack}>
            상세로 돌아가기
          </Button>
          <Button variant="primary" onClick={() => console.log('임시 등록')}>
            임시 등록
          </Button>
        </div>
      </div>
    </Modal>
  );
}
