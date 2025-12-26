import { useDeferredValue, useMemo } from 'react';
import { useGetBooks } from '_queries/booksQueries';
import type { Book, BookFilters } from '_queries/booksQueries';
import type { ProgressStatus } from '_queries/progressQueries';

const FULL_LIBRARY_PAGE_SIZE = 10000;
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
    if (filters.seriesId) params.seriesId = filters.seriesId;
    if (Number.isFinite(filters.part) && (filters.part ?? 0) > 0) {
      params.part = filters.part;
    }

    return Object.keys(params).length ? params : undefined;
  }, [filters]);

  const deferredSearch = useDeferredValue(queryParams?.search ?? '');

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

  const { data, isFetching, isLoading } = useGetBooks(undefined, {
    enabled: booksEnabled,
    pageSize: FULL_LIBRARY_PAGE_SIZE,
  });

  const allBooks = useMemo(
    () => data?.pages?.flatMap((page) => page.items) ?? [],
    [data]
  );

  const books = useMemo(() => {
    if (!allBooks.length) return [];

    const searchTerm = deferredSearch.trim().toLowerCase();
    const statusFilter = queryParams?.status ?? [];
    const tagFilter = queryParams?.tags ?? [];
    const seriesIdsFilter = queryParams?.seriesIds ?? [];
    const seriesIdFilter = queryParams?.seriesId ?? null;
    const partFilter = queryParams?.part;

    const hasSearch = Boolean(searchTerm);
    const hasStatus = statusFilter.length > 0;
    const hasTags = tagFilter.length > 0;
    const hasSeriesIds = seriesIdsFilter.length > 0;
    const hasSeriesId =
      typeof seriesIdFilter === 'string' && seriesIdFilter.length > 0;
    const hasPart = typeof partFilter === 'number' && partFilter > 0;

    if (
      !hasSearch &&
      !hasStatus &&
      !hasTags &&
      !hasSeriesIds &&
      !hasSeriesId &&
      !hasPart
    ) {
      return allBooks;
    }

    return allBooks.filter((book: Book) => {
      if (hasSearch) {
        const searchTarget = [
          book.title ?? '',
          book.author ?? '',
          book.series?.name ?? '',
        ]
          .join(' ')
          .toLowerCase();
        if (!searchTarget.includes(searchTerm)) return false;
      }

      if (hasStatus) {
        const status = book.progress?.status ?? 'not_started';
        if (!statusFilter.includes(status)) return false;
      }

      if (hasTags) {
        const tags = book.tags ?? [];
        if (!tagFilter.some((tag) => tags.includes(tag))) return false;
      }

      if (hasSeriesId || hasSeriesIds) {
        const bookSeriesId = book.seriesId ?? book.series?._id ?? null;
        if (!bookSeriesId) return false;
        if (hasSeriesId && bookSeriesId !== seriesIdFilter) return false;
        if (hasSeriesIds && !seriesIdsFilter.includes(bookSeriesId))
          return false;
      }

      if (hasPart && book.part !== partFilter) {
        return false;
      }

      return true;
    });
  }, [allBooks, deferredSearch, queryParams]);

  const count = books.length;
  const deliveredCount = books.length;
  const isInitialLoading =
    (isLoading || isFetching) && (data?.pages?.length ?? 0) === 0;

  return {
    books,
    readingBooks,
    isReadingFetching: isReadingInitialLoading,
    count,
    deliveredCount,
    fetchNextPage: undefined,
    hasNextPage: false,
    isFetchingNextPage: false,
    isFetching: isInitialLoading,
  };
};
