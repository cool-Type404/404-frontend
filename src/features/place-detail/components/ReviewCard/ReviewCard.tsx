import { useEffect, useRef, useState } from 'react';

import Chip from '@/components/Chip/Chip';
import { CommonIcon } from '@/components/CommonIcon/CommonIcon';
import { useReviewImage } from '@/features/place-detail/hooks/useReviewImage';

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
  const resolvedImageUrl = useReviewImage(imageUrl);

  useEffect(() => {
    if (!menuOpen) return;

    const onPointerDownCapture = (event: PointerEvent) => {
      const target = event.target as Node | null;
      const element = menuRef.current;
      if (!element || !target) return;

      if (!element.contains(target)) setMenuOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDownCapture, true);

    return () => {
      document.removeEventListener('pointerdown', onPointerDownCapture, true);
    };
  }, [menuOpen]);

  const filled = Math.max(0, Math.min(5, Math.round(rating)));
  const stars = Array.from({ length: 5 }, (_, index) =>
    index < filled ? 'starfilled' : 'starline',
  );

  const showTags = (tags?.length ?? 0) > 0;
  const showImage = Boolean(resolvedImageUrl);
  const showContent = Boolean(content && content.trim().length > 0);
  const isLiked = Boolean(likedByMe);

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
            onClick={() => setMenuOpen((value) => !value)}
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
          {stars.map((name, index) => (
            <CommonIcon key={index} name={name} size={14} />
          ))}
        </div>
        <div className={styles.date}>{date}</div>
      </div>

      {showContent ? <p className={styles.content}>{content}</p> : null}

      {showTags ? (
        <div className={styles.tags}>
          {tags?.map((tag, index) => (
            <Chip key={`${tag}-${index}`} variant="hashtag" size="sm">
              {tag}
            </Chip>
          ))}
        </div>
      ) : null}

      {showImage ? (
        <div className={styles.imageWrap}>
          <img src={resolvedImageUrl!} alt="리뷰 이미지" className={styles.image} draggable={false} />
        </div>
      ) : null}

      <footer className={styles.bottomRow}>
        <button
          type="button"
          className={`${styles.likeBtn} ${isLiked ? styles.likeBtnActive : ''}`}
          onClick={handleLike}
          aria-label="좋아요"
          aria-pressed={isLiked}
        >
          <CommonIcon
            name={isLiked ? 'thumbsupfilled' : 'thumbsupline'}
            size={16}
            variant={isLiked ? 'primary' : 'inherit'}
          />
          <span className={styles.likeCount}>{likesCount}</span>
        </button>
      </footer>
    </article>
  );
}
