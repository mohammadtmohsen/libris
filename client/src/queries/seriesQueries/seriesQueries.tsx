import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '_axios';
import { BOOK_QUERIES_KEYS } from '../booksQueries/booksQueries.keys';
import { SERIES_QUERY_BASE, SERIES_QUERY_KEYS } from './seriesQueries.keys';
import type {
  Series,
  SeriesInput,
  SeriesUpdateInput,
} from './seriesQueries.types';

export const useGetSeries = () =>
  useQuery({
    queryKey: [SERIES_QUERY_KEYS.GET_SERIES],
    queryFn: async () => {
      const res = await axiosInstance.get<Series[]>(SERIES_QUERY_BASE);
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

export const useCreateSeries = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [SERIES_QUERY_KEYS.CREATE_SERIES],
    mutationFn: async (payload: SeriesInput) => {
      const res = await axiosInstance.post<Series>(
        SERIES_QUERY_BASE,
        payload
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [SERIES_QUERY_KEYS.GET_SERIES],
      });
      queryClient.invalidateQueries({
        queryKey: [BOOK_QUERIES_KEYS.GET_BOOKS],
      });
    },
  });
};

export const useUpdateSeries = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [SERIES_QUERY_KEYS.UPDATE_SERIES],
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: SeriesUpdateInput;
    }) => {
      const res = await axiosInstance.patch<Series>(
        `${SERIES_QUERY_BASE}/${id}`,
        payload
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [SERIES_QUERY_KEYS.GET_SERIES],
      });
      queryClient.invalidateQueries({
        queryKey: [BOOK_QUERIES_KEYS.GET_BOOKS],
      });
    },
  });
};

export const useDeleteSeries = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [SERIES_QUERY_KEYS.DELETE_SERIES],
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`${SERIES_QUERY_BASE}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [SERIES_QUERY_KEYS.GET_SERIES],
      });
      queryClient.invalidateQueries({
        queryKey: [BOOK_QUERIES_KEYS.GET_BOOKS],
      });
    },
  });
};
