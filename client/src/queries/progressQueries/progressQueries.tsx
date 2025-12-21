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
    },
  });

  return mutation;
};
