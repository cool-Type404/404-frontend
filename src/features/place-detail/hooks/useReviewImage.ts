// features/place-detail/hooks/useReviewImage.ts
import { useEffect, useState } from 'react';
import { getReviewImage } from '@/features/place-detail/api/placeDetail.api';

export function useReviewImage(imagePath?: string) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!imagePath) return;

    // "/api/reviews/image/1" → 1 추출
    const match = imagePath.match(/\/api\/reviews\/image\/(\d+)/);
    if (!match) return;

    const imgId = Number(match[1]);
    let revoked = false;

    getReviewImage(imgId)
      .then((blob) => {
        if (revoked) return;
        const url = URL.createObjectURL(blob);
        setObjectUrl(url);
      })
      .catch(() => {
        if (!revoked) setObjectUrl(null);
      });

    return () => {
      revoked = true;
      setObjectUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, [imagePath]);

  return objectUrl;
}