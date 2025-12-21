import {
  InfiniteData,
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
import type { Series } from '../seriesQueries/seriesQueries.types';
import { SERIES_QUERY_KEYS } from '../seriesQueries/seriesQueries.keys';

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
      const deliveredCount = res.data?.deliveredCount ?? items.length;
      const hasMore =
        res.data?.hasMore ??
        (pageSize > 0 && Number.isFinite(count) && page * pageSize < count);

      return {
        items,
        count,
        deliveredCount,
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
    onSuccess: (updatedBook, variables) => {
      const seriesList = queryClient.getQueryData<Series[]>([
        SERIES_QUERY_KEYS.GET_SERIES,
      ]);
      const updateData = variables.updateData;
      const hasSeriesIdUpdate = Object.prototype.hasOwnProperty.call(
        updateData,
        'seriesId'
      );
      const hasPartUpdate = Object.prototype.hasOwnProperty.call(
        updateData,
        'part'
      );
      const isSeriesCleared = hasSeriesIdUpdate && updateData.seriesId === null;
      const isPartCleared =
        isSeriesCleared || (hasPartUpdate && updateData.part === null);
      const mergeBook = (current: Book): Book => {
        const mergedCover: Book['cover'] = updatedBook.cover
          ? {
              ...(current.cover ?? updatedBook.cover),
              ...updatedBook.cover,
              ...(current.cover?.coverUrl && !updatedBook.cover.coverUrl
                ? { coverUrl: current.cover.coverUrl }
                : {}),
            }
          : current.cover;
        const updatedSeriesId =
          updatedBook.seriesId ??
          updatedBook.series?._id ??
          (hasSeriesIdUpdate && typeof updateData.seriesId === 'string'
            ? updateData.seriesId
            : undefined);
        const resolvedSeries =
          updatedBook.series ??
          (updatedSeriesId
            ? seriesList?.find((series) => series._id === updatedSeriesId) ??
              (current.series?._id === updatedSeriesId
                ? current.series
                : undefined)
            : undefined);
        const shouldClearSeries =
          isSeriesCleared ||
          (updatedSeriesId &&
            !resolvedSeries &&
            current.series?._id !== updatedSeriesId);
        const nextSeries = shouldClearSeries
          ? undefined
          : resolvedSeries ?? current.series;
        const nextSeriesId = isSeriesCleared
          ? null
          : updatedBook.seriesId ??
            (hasSeriesIdUpdate && typeof updateData.seriesId === 'string'
              ? updateData.seriesId
              : current.seriesId);
        const nextPart = isPartCleared
          ? undefined
          : updatedBook.part ??
            (hasPartUpdate && typeof updateData.part === 'number'
              ? updateData.part
              : current.part);
        return {
          ...updatedBook,
          progress: updatedBook.progress ?? current.progress,
          series: nextSeries,
          seriesId: nextSeriesId,
          part: nextPart,
          cover: mergedCover,
        };
      };
      queryClient.setQueriesData<InfiniteData<BooksListResponse>>(
        { queryKey: [BOOK_QUERIES_KEYS.GET_BOOKS] },
        (old) => {
          if (!old) return old;
          let didUpdate = false;
          const pages = old.pages.map((page) => {
            let pageUpdated = false;
            const items = page.items.map((item) => {
              if (item._id !== updatedBook._id) return item;
              pageUpdated = true;
              didUpdate = true;
              return mergeBook(item);
            });
            return pageUpdated ? { ...page, items } : page;
          });
          return didUpdate ? { ...old, pages } : old;
        }
      );
      queryClient.setQueryData<Book>(
        [BOOK_QUERIES_KEYS.GET_BOOK_BY_ID, updatedBook._id],
        (old) => mergeBook(old ?? updatedBook)
      );
    },
  });
};
