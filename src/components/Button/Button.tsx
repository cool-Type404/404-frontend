import React from 'react';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'third';

export type ButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> & {
  variant?: ButtonVariant;
  disabled?: boolean;
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  shadow?: boolean;
};

function toCssSize(v?: number | string) {
  if (v === undefined) return undefined;
  return typeof v === 'number' ? `${v}px` : v;
}

function createClassName(...args: Array<string | false | undefined | null>) {
  return args.filter(Boolean).join(' ');
}

export default function Button({
  variant = 'primary',
  disabled = false,
  width,
  height,
  radius = 9999,
  shadow = true,
  className,
  style,
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={createClassName(
        styles.button,
        styles[variant],
        shadow && styles.shadow,
        disabled && styles.disabled,
        className,
      )}
      disabled={disabled}
      aria-disabled={disabled}
      style={{
        ...style,
        width: toCssSize(width),
        height: toCssSize(height),
        borderRadius: toCssSize(radius),
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
