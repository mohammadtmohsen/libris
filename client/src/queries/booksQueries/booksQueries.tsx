import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import axiosInstance from '_axios';

import type {
  Book,
  CompleteUploadRequest,
  BooksListResponse,
  BookFilters,
} from './booksQueries.types';
import { BOOKS_QUERY_BASE, BOOK_QUERIES_KEYS } from './booksQueries.keys';

const DEFAULT_PAGE_SIZE = 20;

export const useGetBooks = (params?: BookFilters) => {
  const queryResult = useInfiniteQuery({
    queryKey: [
      BOOK_QUERIES_KEYS.GET_BOOKS,
      JSON.stringify(params ?? {}),
      DEFAULT_PAGE_SIZE,
    ],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const page =
        typeof pageParam === 'number' && Number.isFinite(pageParam)
          ? pageParam
          : 1;
      const res = await axiosInstance.get<BooksListResponse>(BOOKS_QUERY_BASE, {
        params: { ...params, page, limit: DEFAULT_PAGE_SIZE },
      });

      const items = res.data?.items ?? [];
      const count = res.data?.count ?? 0;
      const pageSize = res.data?.pageSize ?? DEFAULT_PAGE_SIZE;
      const hasMore =
        res.data?.hasMore ??
        (pageSize > 0 && Number.isFinite(count) && page * pageSize < count);

      return {
        items,
        count,
        page: res.data?.page ?? page,
        pageSize,
        hasMore,
      };
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage?.hasMore) return undefined;
      const currentPage = Number.isFinite(lastPage.page)
        ? (lastPage.page as number)
        : 1;
      return currentPage + 1;
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
      updateData: Partial<Omit<Book, 'series' | 'part'>> & {
        seriesId?: string | null;
        part?: number | null;
      };
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
