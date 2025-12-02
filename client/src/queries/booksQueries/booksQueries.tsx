import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '_axios';
import axiosRaw from 'axios';

import { booksServices } from '_services/booksServices/booksServices';
import type {
  PresignUploadRequest,
  Book,
  PresignUploadResponse,
  UploadToPresignedUrlRequest,
  CompleteUploadRequest,
} from '_services/booksServices/booksServices.types';
import { BOOKS_QUERY_BASE, BOOK_QUERIES_KEYS } from './booksQueriesKeys';

export const useGetBooks = (params?: object) => {
  const queryResult = useQuery({
    queryKey: [BOOK_QUERIES_KEYS.GET_BOOKS, params],
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
  const mutation = useMutation({
    mutationKey: ['PRESIGN_BOOK_UPLOAD'],
    mutationFn: async (payload: PresignUploadRequest) => {
      const res = await axiosInstance.post<
        unknown,
        { data: { data: PresignUploadResponse } }
      >(`${BOOKS_QUERY_BASE}/presign-upload`, payload);
      return res.data.data;
    },
  });
  return mutation;
};

export const useUploadToPresignedUrl = () => {
  const mutation = useMutation({
    mutationKey: ['UPLOAD_TO_PRESIGNED_URL'],
    mutationFn: async (payload: UploadToPresignedUrlRequest) => {
      const { file, presign } = payload;
      const headers: Record<string, string> = {
        'Content-Type': file.type || 'application/octet-stream',
        ...(presign.headers || {}),
      };
      await axiosRaw.put(presign.uploadUrl, file, { headers });
    },
  });
  return mutation;
};

export const useCompleteUpload = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['COMPLETE_BOOK_UPLOAD'],
    mutationFn: async (payload: CompleteUploadRequest) => {
      const res = await axiosInstance.post<unknown, { data: { data: Book } }>(
        `${BOOKS_QUERY_BASE}/complete`,
        payload
      );
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GET_BOOKS'] });
    },
  });
};
