import React from 'react';
import styles from './Chip.module.css';

export type ChipVariant =
  | 'open'
  | 'closed'
  | 'recommend'
  | 'seatAvailable'
  | 'seatUnavailable'
  | 'hashtag';

export type ChipSize = 'sm' | 'md';

export type ChipProps = {
  children: React.ReactNode;
  variant: ChipVariant;
  size?: ChipSize;
  className?: string;
  style?: React.CSSProperties;
};

export default function Chip({ children, variant, size = 'md', className, style }: ChipProps) {
  const rootClassName = [styles.chip, styles[variant], styles[size], className]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={rootClassName} style={style}>
      {children}
    </span>
  );
}
