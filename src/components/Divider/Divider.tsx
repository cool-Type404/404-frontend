import React from 'react';
import styles from './Divider.module.css';

export type DividerProps = {
  orientation?: 'horizontal' | 'vertical';
  thickness?: number;
  length?: number | string;
  spacing?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  decorative?: boolean;
};

export default function Divider({
  orientation = 'horizontal',
  thickness = 1,
  length = '100%',
  spacing = 12,
  color,
  className,
  style,
  decorative = true,
}: DividerProps) {
  const isHorizontal = orientation === 'horizontal';

  const dividerStyle: React.CSSProperties = {
    ...(isHorizontal
      ? {
          //가로일 때 스타일
          width: length,
          height: thickness,
          margin: `${spacing}px 0`,
        }
      : {
          //세로일 때 스타일
          width: thickness,
          height: length,
          margin: `0 ${spacing}px`,
        }),
    ...(color ? { backgroundColor: color } : {}),
    ...style,
  };

  return (
    <span
      className={[styles.divider, className].filter(Boolean).join(' ')}
      style={dividerStyle}
      role={decorative ? 'presentation' : 'separator'}
      aria-orientation={decorative ? undefined : orientation}
      aria-hidden={decorative ? true : undefined}
    />
  );
}
