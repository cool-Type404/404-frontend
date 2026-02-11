import React from 'react';
import styles from './Spinner.module.css';
import spinnerSrc from '@/assets/icons/spinner/spinner.svg';

export type SpinnerProps = {
  size?: number;
  variant?: 'inline' | 'center';
  ariaLabel?: string;
  className?: string;
  style?: React.CSSProperties;
};

export default function Spinner({
  size = 100,
  variant = 'inline',
  ariaLabel = '로딩 중',
  className,
  style,
}: SpinnerProps) {
  const wrapperClassName = [
    styles.wrapper,
    variant === 'center' ? styles.center : styles.inline,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={wrapperClassName} style={style} role="status" aria-label={ariaLabel}>
      <img
        src={spinnerSrc}
        alt=""
        className={styles.spinner}
        style={{ width: size, height: size }}
        draggable={false}
      />
    </span>
  );
}
