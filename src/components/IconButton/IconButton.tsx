import React from 'react';
import styles from './IconButton.module.css';

export type IconButtonTone = 'default' | 'green' | 'danger';

type IconLikeProps = {
  size?: number | string;
  width?: number | string;
  height?: number | string;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
};

export type IconButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'type' | 'children'
> & {
  ariaLabel: string;
  size?: number;
  children: React.ReactElement<IconLikeProps>;
  tone?: IconButtonTone;
  loading?: boolean;
  hoverBg?: boolean;
};

function toNumberPx(v: unknown): number | undefined {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const n = Number.parseFloat(v);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

function extractIconSizePx(icon: React.ReactElement<IconLikeProps>): number | undefined {
  const p = icon.props;

  return toNumberPx(p.size) ?? toNumberPx(p.width) ?? toNumberPx(p.height) ?? undefined;
}

export default function IconButton({
  ariaLabel,
  size,
  children,
  tone = 'default',
  loading = false,
  disabled,
  hoverBg = true,
  className,
  style,
  onClick,
  ...rest
}: IconButtonProps) {
  const isDisabled = disabled || loading;
  const iconSizeFromChild = extractIconSizePx(children);
  const resolvedSize = size ?? iconSizeFromChild ?? 40;
  const hasExplicitIconSize =
    children.props.size !== undefined ||
    children.props.width !== undefined ||
    children.props.height !== undefined;

  const resolvedIcon = hasExplicitIconSize
    ? children
    : React.cloneElement(children, { size: resolvedSize });

  const buttonClassName = [
    styles.iconButton,
    styles[tone],
    hoverBg ? styles.hoverBg : styles.noHoverBg,
    isDisabled ? styles.disabled : '',
    loading ? styles.loading : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    if (isDisabled) return;
    onClick?.(e);
  };

  return (
    <button
      type="button"
      className={buttonClassName}
      aria-label={ariaLabel}
      disabled={isDisabled}
      onClick={handleClick}
      style={{
        width: resolvedSize,
        height: resolvedSize,
        ...style,
      }}
      {...rest}
    >
      <span className={styles.icon} aria-hidden="true">
        {resolvedIcon}
      </span>
    </button>
  );
}
