import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import axiosInstance from '_axios';

import type {
  Book,
  CompleteUploadRequest,
  BooksListResponse,
  BookFilters,
} from './booksQueries.types';
import { BOOKS_QUERY_BASE, BOOK_QUERIES_KEYS } from './booksQueries.keys';

export const useGetBooks = (params?: BookFilters) => {
  const queryResult = useQuery({
    queryKey: [BOOK_QUERIES_KEYS.GET_BOOKS, params],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const endPoint = BOOKS_QUERY_BASE;
      const res = await axiosInstance.get<BooksListResponse>(endPoint, {
        params,
      });
      const items = res.data?.items ?? [];
      const count = res.data?.count ?? 0;
      return { items, count };
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
      const res = await axiosInstance.get<Book>(`${BOOKS_QUERY_BASE}/${id}`);
      return res.data;
    },
  });
  return queryResult;
};

export const useCompleteUpload = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [BOOK_QUERIES_KEYS.COMPLETE_BOOK_UPLOAD],
    mutationFn: async (payload: CompleteUploadRequest) => {
      const res = await axiosInstance.post<Book>(
        `${BOOKS_QUERY_BASE}/complete`,
        payload
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [BOOK_QUERIES_KEYS.GET_BOOKS],
      });
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
      queryClient.invalidateQueries({
        queryKey: [BOOK_QUERIES_KEYS.GET_BOOKS],
      });
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
      const res = await axiosInstance.patch<Book>(
        `${BOOKS_QUERY_BASE}/${bookId}`,
        updateData
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [BOOK_QUERIES_KEYS.GET_BOOKS],
      });
    },
  });
};
