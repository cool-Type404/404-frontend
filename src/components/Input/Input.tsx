import React, { useId } from 'react';
import styles from './Input.module.css';

export type InputVariant = 'default' | 'search';

export type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  label?: string;
  helperText?: string;
  errorText?: string;
  isInvalid?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: InputVariant;
  containerClassName?: string;
};

export default function Input({
  label,
  helperText,
  errorText,
  isInvalid,
  leftIcon,
  rightIcon,
  variant = 'default',
  containerClassName,
  id,
  className,
  disabled,
  ...rest
}: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;

  const invalid = Boolean(isInvalid || errorText);
  const describedById = helperText || errorText ? `${inputId}-desc` : undefined;

  return (
    <div
      className={[styles.container, styles[variant], containerClassName].filter(Boolean).join(' ')}
      data-disabled={disabled ? 'true' : 'false'}
      data-invalid={invalid ? 'true' : 'false'}
    >
      {label && (
        <label className={styles.label} htmlFor={inputId}>
          {label}
        </label>
      )}

      <div className={styles.field}>
        {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}

        <input
          id={inputId}
          className={[styles.input, className].filter(Boolean).join(' ')}
          aria-invalid={invalid ? 'true' : 'false'}
          aria-describedby={describedById}
          disabled={disabled}
          {...rest}
        />

        {rightIcon && <span className={styles.rightIcon}>{rightIcon}</span>}
      </div>

      {(errorText || helperText) && (
        <p
          id={describedById}
          className={[styles.message, errorText ? styles.error : styles.helper]
            .filter(Boolean)
            .join(' ')}
        >
          {errorText || helperText}
        </p>
      )}
    </div>
  );
}
