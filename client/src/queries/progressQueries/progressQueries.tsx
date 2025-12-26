import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import axiosInstance from '_axios';

import type { Progress, ProgressUpdateRequest } from './progressQueries.types';
import type {
  Book,
  BooksListResponse,
} from '../booksQueries/booksQueries.types';
import {
  PROGRESS_QUERY_BASE,
  PROGRESS_QUERY_KEYS,
} from './progressQueries.keys';
import { BOOK_QUERIES_KEYS } from '../booksQueries/booksQueries.keys';

export const useUpsertProgress = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationKey: [PROGRESS_QUERY_KEYS.UPSERT_PROGRESS],
    mutationFn: async ({ bookId, ...update }: ProgressUpdateRequest) => {
      const res = await axiosInstance.patch<Progress>(
        `${PROGRESS_QUERY_BASE}/${bookId}`,
        update
      );
      return res.data;
    },
    onSuccess: (updatedProgress) => {
      const bookId = updatedProgress?.book;
      if (!bookId) return;
      queryClient.setQueriesData<InfiniteData<BooksListResponse>>(
        { queryKey: [BOOK_QUERIES_KEYS.GET_BOOKS] },
        (old) => {
          if (!old) return old;
          let didUpdate = false;
          const pages = old.pages.map((page) => {
            let pageUpdated = false;
            const items = page.items.map((item) => {
              if (item._id !== bookId) return item;
              pageUpdated = true;
              didUpdate = true;
              return { ...item, progress: updatedProgress };
            });
            return pageUpdated ? { ...page, items } : page;
          });
          return didUpdate ? { ...old, pages } : old;
        }
      );
      queryClient.setQueryData<Book>(
        [BOOK_QUERIES_KEYS.GET_BOOK_BY_ID, bookId],
        (old) => (old ? { ...old, progress: updatedProgress } : old)
      );

      const isReadingStatus = updatedProgress.status === 'reading';
      const isReadingQueryKey = (queryKey: readonly unknown[]) => {
        if (queryKey[0] !== BOOK_QUERIES_KEYS.GET_BOOKS) return false;
        const paramsString = queryKey[1];
        if (typeof paramsString !== 'string') return false;
        try {
          const params = JSON.parse(paramsString) as { status?: string[] };
          const statuses = Array.isArray(params?.status) ? params.status : [];
          return statuses.length === 1 && statuses[0] === 'reading';
        } catch {
          return false;
        }
      };

      const cachedBook =
        queryClient.getQueryData<Book>([
          BOOK_QUERIES_KEYS.GET_BOOK_BY_ID,
          bookId,
        ]) ??
        queryClient
          .getQueriesData<InfiniteData<BooksListResponse>>({
            queryKey: [BOOK_QUERIES_KEYS.GET_BOOKS],
          })
          .flatMap(([, data]) => data?.pages ?? [])
          .flatMap((page) => page.items)
          .find((item) => item._id === bookId);

      queryClient
        .getQueryCache()
        .findAll({ queryKey: [BOOK_QUERIES_KEYS.GET_BOOKS] })
        .map((query) => query.queryKey)
        .filter(isReadingQueryKey)
        .forEach((queryKey) => {
          queryClient.setQueryData<InfiniteData<BooksListResponse>>(
            queryKey,
            (old) => {
              if (!old) return old;
              let found = false;
              const pages = old.pages.map((page) => {
                let pageUpdated = false;
                const items = page.items.reduce<Book[]>((acc, item) => {
                  if (item._id !== bookId) {
                    acc.push(item);
                    return acc;
                  }
                  found = true;
                  pageUpdated = true;
                  if (isReadingStatus) {
                    acc.push({ ...item, progress: updatedProgress });
                  }
                  return acc;
                }, []);
                return pageUpdated ? { ...page, items } : page;
              });

              if (isReadingStatus && !found && cachedBook) {
                const nextBook = { ...cachedBook, progress: updatedProgress };
                if (pages[0]) {
                  pages[0] = {
                    ...pages[0],
                    items: [nextBook, ...pages[0].items],
                  };
                } else {
                  pages.push({
                    items: [nextBook],
                    count: 1,
                    deliveredCount: 1,
                    page: 1,
                    pageSize: 1,
                    hasMore: false,
                  });
                }
                return { ...old, pages };
              }

              return found ? { ...old, pages } : old;
            }
          );
        });
    },
  });

  return mutation;
};
