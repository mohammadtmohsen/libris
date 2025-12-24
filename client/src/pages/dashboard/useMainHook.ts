import { useEffect, useMemo } from 'react';
import { useGetBooks } from '_queries/booksQueries';
import type { BookFilters } from '_queries/booksQueries';
import { ProgressStatus } from '_queries/progressQueries';

const PREFETCH_DELAY_MS = 150;
type UseMainHookOptions = {
  booksEnabled?: boolean;
};

export const useMainHook = (
  filters?: BookFilters,
  options?: UseMainHookOptions
) => {
  const booksEnabled = options?.booksEnabled ?? true;
  const queryParams = useMemo(() => {
    if (!filters) return undefined;

    const params: BookFilters = {};
    const trimmedSearch = filters.search?.trim();

    if (trimmedSearch) params.search = trimmedSearch;
    if (filters.status?.length) params.status = filters.status;
    if (filters.tags?.length) params.tags = filters.tags;
    if (filters.seriesIds?.length) params.seriesIds = filters.seriesIds;

    return Object.keys(params).length ? params : undefined;
  }, [filters]);

  const {
    data: readingData,
    isFetching: isReadingFetching,
    isLoading: isReadingLoading,
  } = useGetBooks({
    status: ['reading'] as ProgressStatus[],
  });

  const readingBooks = useMemo(
    () => readingData?.pages?.flatMap((page) => page.items) ?? [],
    [readingData]
  );
  const isReadingInitialLoading =
    (isReadingLoading || isReadingFetching) &&
    (readingData?.pages?.length ?? 0) === 0;

  const {
    data,
    isFetching,
    isFetchingNextPage,
    isLoading,
    fetchNextPage,
    hasNextPage,
  } = useGetBooks(queryParams, { enabled: booksEnabled });
  const pagesLoaded = data?.pages?.length ?? 0;

  useEffect(() => {
    if (
      !booksEnabled ||
      !hasNextPage ||
      isFetchingNextPage ||
      isLoading ||
      pagesLoaded === 0
    ) {
      return;
    }
    const timeoutId = setTimeout(() => {
      void fetchNextPage();
    }, PREFETCH_DELAY_MS);

    return () => clearTimeout(timeoutId);
  }, [
    booksEnabled,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    pagesLoaded,
  ]);

  const books = useMemo(
    () => data?.pages?.flatMap((page) => page.items) ?? [],
    [data]
  );

  const count = data?.pages?.[0]?.count ?? 0;

  const deliveredCount = useMemo(
    () =>
      data?.pages?.reduce(
        (acc, p) => acc + (p?.deliveredCount ?? p?.items?.length ?? 0),
        0
      ) ?? 0,
    [data]
  );
  const isInitialLoading =
    (isLoading || isFetching) && (data?.pages?.length ?? 0) === 0;

  return {
    books,
    readingBooks,
    isReadingFetching: isReadingInitialLoading,
    count,
    deliveredCount,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching: isInitialLoading,
  };
};
