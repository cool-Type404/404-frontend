import styles from './EmptyState.module.css';
import thinkingImg from '@/assets/BobImages/sleepy.png';

export type EmptyStateProps = {
  title?: string;
  description?: string;
  className?: string;
};

export default function EmptyState({
  title = '아직 리뷰가 없어요!',
  description = '첫 리뷰를 남겨주세요!',
  className,
}: EmptyStateProps) {
  const wrapperClassName = [styles.wrapper, className].filter(Boolean).join(' ');

  return (
    <div className={wrapperClassName}>
      <div className={styles.iconWrap} aria-hidden="true">
        <img src={thinkingImg} alt="" className={styles.iconImage} draggable={false} />
      </div>

      <div className={styles.texts}>
        <p className={styles.title}>{title}</p>
        {description ? <p className={styles.description}>{description}</p> : null}
      </div>
    </div>
  );
}
