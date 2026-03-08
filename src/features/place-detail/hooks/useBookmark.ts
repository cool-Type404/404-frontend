import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postBookmark, deleteBookmark } from '../api/placeDetail.api';

export const useBookmark = (storeId: number) => {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['placeDetail', storeId] });
    window.dispatchEvent(new Event('mypage:refresh'));
  };

  const addBookmark = useMutation({
    mutationFn: () => postBookmark(storeId),
    onSuccess: invalidate,
  });

  const removeBookmark = useMutation({
    mutationFn: () => deleteBookmark(storeId),
    onSuccess: invalidate,
  });

  return { addBookmark, removeBookmark };
};
