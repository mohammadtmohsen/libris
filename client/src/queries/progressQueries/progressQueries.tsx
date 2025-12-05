import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '_axios';

import type { Progress, ProgressUpdateRequest } from './progressQueries.types';
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
      const res = await axiosInstance.patch<
        unknown,
        { data: { data: Progress } }
      >(`${PROGRESS_QUERY_BASE}/${bookId}`, update);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [BOOK_QUERIES_KEYS.GET_BOOKS],
      });
    },
  });

  return mutation;
};
