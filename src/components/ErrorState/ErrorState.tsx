import styles from './ErrorState.module.css';
import surprisedImg from '@/assets/BobImages/surprised.png';

export type ErrorStateProps = {
  title?: string;
  description?: string;
  variant?: 'default' | 'compact';
  className?: string;
};

export default function ErrorState({
  title = '문제가 발생했어요',
  description = '잠시 후 다시 시도해 주세요.',
  variant = 'default',
  className,
}: ErrorStateProps) {
  const wrapperClassName = [styles.wrapper, styles[variant], className].filter(Boolean).join(' ');

  return (
    <div className={wrapperClassName} role="alert" aria-live="polite">
      <div className={styles.iconWrap} aria-hidden="true">
        <img src={surprisedImg} alt="" className={styles.iconImage} draggable={false} />
      </div>

      <div className={styles.texts}>
        <p className={styles.title}>{title}</p>
        {description ? <p className={styles.description}>{description}</p> : null}
      </div>
    </div>
  );
}
