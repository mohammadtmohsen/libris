import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '_axios';
import axiosRaw from 'axios';

import type {
  PresignUploadRequest,
  Book,
  PresignUploadResponse,
  UploadToPresignedUrlRequest,
  CompleteUploadRequest,
  BooksListResponse,
  SignedUrlResponse,
  UpdateBookPagesRequest,
} from './booksQueries.types';
import { BOOKS_QUERY_BASE, BOOK_QUERIES_KEYS } from './booksQueries.keys';

export const useGetBooks = (params?: object) => {
  const queryResult = useQuery({
    queryKey: [BOOK_QUERIES_KEYS.GET_BOOKS, params],
    queryFn: async () => {
      const endPoint = BOOKS_QUERY_BASE;
      const res = await axiosInstance.get<unknown, { data: { data: Book[] } }>(
        endPoint,
        {
          params,
        }
      );
      const items = res.data.data || [];
      return {
        items,
        count: items.length,
      } as BooksListResponse;
    },
  });
  return queryResult;
};

export const useGetBookById = (id?: string, enabled = true) => {
  const queryResult = useQuery({
    queryKey: [BOOK_QUERIES_KEYS.GET_BOOK_BY_ID, id],
    enabled: Boolean(id) && enabled,
    queryFn: async () => {
      if (!id) return null;
      const res = await axiosInstance.get<unknown, { data: { data: Book } }>(
        `${BOOKS_QUERY_BASE}/${id}`
      );
      return res.data.data;
    },
  });
  return queryResult;
};

export const useGetBookSignedUrl = ({
  bookId,
  includeCover = false,
  enabled = true,
}: {
  bookId?: string;
  includeCover: boolean;
  enabled?: boolean;
}) => {
  const queryResult = useQuery({
    queryKey: [BOOK_QUERIES_KEYS.GET_BOOK_URL, bookId, includeCover],
    enabled: Boolean(bookId) && enabled,
    queryFn: async () => {
      if (!bookId) return null;
      const res = await axiosInstance.get<
        unknown,
        { data: { data: SignedUrlResponse } }
      >(`${BOOKS_QUERY_BASE}/${bookId}/url`, { params: { includeCover } });
      return res.data.data;
    },
  });
  return queryResult;
};

export const usePresignUpload = () => {
  const mutation = useMutation({
    mutationKey: [BOOK_QUERIES_KEYS.PRESIGN_BOOK_UPLOAD],
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
    mutationKey: [BOOK_QUERIES_KEYS.UPLOAD_TO_PRESIGNED_URL],
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
    mutationKey: [BOOK_QUERIES_KEYS.COMPLETE_BOOK_UPLOAD],
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

export const useDeleteBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [BOOK_QUERIES_KEYS.DELETE_BOOK],
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`${BOOKS_QUERY_BASE}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GET_BOOKS'] });
    },
  });
};

export const useUpdateBookById = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [BOOK_QUERIES_KEYS.UPDATE_BOOK],
    mutationFn: async ({
      bookId,
      updateData,
    }: {
      bookId: string;
      updateData: Partial<Book>;
    }) => {
      const res = await axiosInstance.patch<unknown, { data: { data: Book } }>(
        `${BOOKS_QUERY_BASE}/${bookId}`,
        updateData
      );
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GET_BOOKS'] });
    },
  });
};

export const useUpdateBookPages = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [BOOK_QUERIES_KEYS.UPDATE_BOOK_PAGES],
    mutationFn: async ({ bookId, pagesRead }: UpdateBookPagesRequest) => {
      const res = await axiosInstance.patch<unknown, { data: { data: Book } }>(
        `${BOOKS_QUERY_BASE}/${bookId}/pages`,
        {
          ...(pagesRead !== undefined ? { pagesRead } : {}),
        }
      );
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GET_BOOKS'] });
    },
  });
};
