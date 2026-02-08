import React from 'react';
import styles from './Textarea.module.css';

export type TextareaVariant = 'single' | 'multi';

export type TextareaProps = {
  variant?: TextareaVariant;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  showCount?: boolean;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export default function Textarea({
  variant = 'multi',
  value,
  onChange,
  placeholder,
  maxLength,
  showCount = false,
  disabled = false,
  className,
  style,
}: TextareaProps) {
  const currentLength = value.length;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (variant === 'single' && e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const wrapperClassName = [styles.wrapper, className].filter(Boolean).join(' ');

  const textareaClassName = [styles.textarea, variant === 'single' ? styles.single : styles.multi]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapperClassName} style={style}>
      <textarea
        className={textareaClassName}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
      />

      {showCount && maxLength !== undefined && (
        <span className={styles.count}>
          <span className={styles.countCurrent}>{currentLength}</span>
          <span className={styles.countMax}>/{maxLength}</span>
        </span>
      )}
    </div>
  );
}
