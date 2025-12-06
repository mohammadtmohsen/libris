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

  const {
    data,
    isFetching,
    isFetchingNextPage,
    isLoading,
    fetchNextPage,
    hasNextPage,
  } = useGetBooks(queryParams);

  const books = useMemo(
    () => data?.pages?.flatMap((page) => page.items) ?? [],
    [data]
  );
  const count = data?.pages?.[0]?.count ?? 0;
  const isInitialLoading =
    (isLoading || isFetching) && (data?.pages?.length ?? 0) === 0;

  return {
    books,
    count,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching: isInitialLoading,
  };
};
