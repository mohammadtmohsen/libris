import { useMemo } from 'react';
import { useGetBooks } from '_queries/booksQueries';
import type { BookFilters } from '_queries/booksQueries';

export const useMainHook = (filters?: BookFilters) => {
  const queryParams = useMemo(() => {
    if (!filters) return undefined;

    const params: BookFilters = {};
    const trimmedSearch = filters.search?.trim();

    if (trimmedSearch) params.search = trimmedSearch;
    if (filters.status?.length) params.status = filters.status;
    if (filters.tags?.length) params.tags = filters.tags;

    return Object.keys(params).length ? params : undefined;
  }, [filters]);

  const { data, isFetching } = useGetBooks(queryParams);
  const books = data?.items ?? [];
  const count = data?.count ?? 0;
  return { books, count, isFetching };
};
