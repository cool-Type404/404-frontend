import React from 'react';
import { commonIcons, type CommonIconName } from './commonIcons';
import styles from './CommonIcon.module.css';

export type CommonIconVariant = 'inherit' | 'primary' | 'muted' | 'danger';

export type CommonIconProps = {
  name: CommonIconName;
  size?: number;
  variant?: CommonIconVariant;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  onClick?: React.MouseEventHandler<SVGElement>;
};

export function CommonIcon({
  name,
  size = 20,
  variant = 'inherit',
  className,
  style,
  title,
  onClick,
}: CommonIconProps) {
  const IconComponent = commonIcons[name];
  const combinedClassName = [styles.base, styles[variant], className].filter(Boolean).join(' ');

  return (
    <IconComponent
      size={size}
      className={combinedClassName}
      style={style}
      title={title}
      onClick={onClick}
    />
  );
}
