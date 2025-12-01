import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { booksServices } from '_services/booksServices/booksServices';
import type {
  PresignUploadRequest,
  Book,
} from '_services/booksServices/booksServices.types';

export const useGetBooks = (params?: object) => {
  const queryResult = useQuery({
    queryKey: ['GET_BOOKS', params],
    queryFn: async () => await booksServices.getAllBooks(params),
  });
  return queryResult;
};

export const useGetBookSignedUrl = (
  id?: string,
  includeCover = false,
  enabled = true
) => {
  const queryResult = useQuery({
    queryKey: ['GET_BOOK_URL', id, includeCover],
    enabled: Boolean(id) && enabled,
    queryFn: async () => {
      if (!id) return null;
      return booksServices.getSignedUrl(id, includeCover);
    },
  });
  return queryResult;
};

export const usePresignUpload = () => {
  return useMutation({
    mutationKey: ['PRESIGN_BOOK_UPLOAD'],
    mutationFn: (payload: PresignUploadRequest) =>
      booksServices.presignUpload(payload),
  });
};

export const useCompleteUpload = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['COMPLETE_BOOK_UPLOAD'],
    mutationFn: (payload: {
      title: string;
      author?: string;
      description?: string;
      tags?: string[];
      status?: Book['status'];
      visibility?: Book['visibility'];
      file: Book['file'];
      cover?: Book['cover'];
    }) => booksServices.completeUpload(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GET_BOOKS'] });
    },
  });
};
