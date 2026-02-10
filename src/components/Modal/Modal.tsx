import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.css';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  titleAlign?: 'left' | 'center';
  headerLeft?: React.ReactNode;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  className?: string;
};

export default function Modal({
  open,
  onClose,
  title,
  titleAlign = 'center',
  children,
  headerLeft,
  headerRight,
  closeOnOverlayClick = false,
  closeOnEsc = false,
  className,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (!closeOnEsc) return;
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, closeOnEsc, onClose]);

  if (!open) return null;

  const modalClassName = [styles.modal, className].filter(Boolean).join(' ');

  const handleOverlayMouseDown = () => {
    if (!closeOnOverlayClick) return;
    onClose();
  };

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  const ariaLabel = title && title.trim().length > 0 ? title : 'modal';

  const renderTitle = title ? <h2 className={styles.title}>{title}</h2> : null;

  return createPortal(
    <div className={styles.overlay} role="presentation" onMouseDown={handleOverlayMouseDown}>
      <div
        className={modalClassName}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        onMouseDown={stop}
      >
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            {headerLeft}
            {titleAlign === 'left' ? renderTitle : null}
          </div>

          <div className={styles.headerCenter}>{titleAlign === 'center' ? renderTitle : null}</div>

          <div className={styles.headerRight}>{headerRight}</div>
        </div>

        <div className={styles.content}>{children}</div>
      </div>
    </div>,
    document.body,
  );
}
