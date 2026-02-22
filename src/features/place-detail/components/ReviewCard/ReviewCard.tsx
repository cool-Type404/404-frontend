import { useEffect, useRef, useState } from 'react';

import { toApiAssetUrl } from '@/utils/assetUrl';

import Chip from '@/components/Chip/Chip';
import { CommonIcon } from '@/components/CommonIcon/CommonIcon';

import styles from './ReviewCard.module.css';

export type ReviewCardProps = {
  id: string | number;
  author: string;
  date: string;
  rating: number;
  content?: string;
  tags?: string[];
  imageUrl?: string;
  likesCount: number;
  likedByMe?: boolean;
  isMine?: boolean;

  onToggleLike?: (id: string | number) => void;
  onDelete?: (id: string | number) => void;
};

export default function ReviewCard({
  id,
  author,
  date,
  rating,
  content,
  tags,
  imageUrl,
  likesCount,
  likedByMe = false,
  isMine = false,
  onToggleLike,
  onDelete,
}: ReviewCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const onPointerDownCapture = (e: PointerEvent) => {
      const target = e.target as Node | null;
      const el = menuRef.current;
      if (!el || !target) return;

      if (!el.contains(target)) setMenuOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDownCapture, true);

    return () => {
      document.removeEventListener('pointerdown', onPointerDownCapture, true);
    };
  }, [menuOpen]);

  const filled = Math.max(0, Math.min(5, Math.round(rating)));
  const stars = Array.from({ length: 5 }, (_, i) => (i < filled ? 'starfilled' : 'starline'));

  const showTags = (tags?.length ?? 0) > 0;
  const showImage = Boolean(imageUrl);
  const showContent = Boolean(content && content.trim().length > 0);

  const handleLike = () => onToggleLike?.(id);

  const handleDelete = () => {
    setMenuOpen(false);
    onDelete?.(id);
  };

  return (
    <article className={styles.card}>
      <header className={styles.topRow}>
        <div className={styles.author}>{author}</div>

        <div className={styles.menuWrap} ref={menuRef}>
          <button
            type="button"
            className={styles.iconBtn}
            aria-label="리뷰 메뉴"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <CommonIcon name="threedots" size={18} />
          </button>

          {menuOpen && isMine ? (
            <div className={styles.menu}>
              <button type="button" className={styles.menuItemDanger} onClick={handleDelete}>
                리뷰 삭제하기
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <div className={styles.metaRow}>
        <div className={styles.stars} aria-label={`평점 ${rating}점`}>
          {stars.map((name, idx) => (
            <CommonIcon key={idx} name={name} size={14} />
          ))}
        </div>
        <div className={styles.date}>{date}</div>
      </div>

      {showContent ? <p className={styles.content}>{content}</p> : null}

      {showTags ? (
        <div className={styles.tags}>
          {tags?.map((t, i) => (
            <Chip key={`${t}-${i}`} variant="hashtag" size="sm">
              {t}
            </Chip>
          ))}
        </div>
      ) : null}

      {showImage ? (
        <div className={styles.imageWrap}>
          <img
            src={toApiAssetUrl(imageUrl)}
            alt="리뷰 이미지"
            className={styles.image}
            draggable={false}
          />
        </div>
      ) : null}

      <footer className={styles.bottomRow}>
        <button type="button" className={styles.likeBtn} onClick={handleLike} aria-label="좋아요">
          <CommonIcon name={likedByMe ? 'thumbsupfilled' : 'thumbsupline'} size={16} />
          <span className={styles.likeCount}>{likesCount}</span>
        </button>
      </footer>
    </article>
  );
}
