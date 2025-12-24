import { useCallback, useRef, useState } from 'react';
import clsx from 'clsx';
import { Books } from './Books/Books';
import { useMainHook } from './useMainHook';
import { Header } from '_components/header';
import { Button, CountBadge } from '_components/shared';
import type { BookFilters } from '_queries/booksQueries';
import { useGetSeries } from '_queries/seriesQueries';

const cleanFilters = (next?: BookFilters): BookFilters => ({
  search: next?.search ?? '',
  status: [...(next?.status ?? [])],
  tags: [...(next?.tags ?? [])],
  seriesIds: [...(next?.seriesIds ?? [])],
});

const normalizeArray = (arr?: string[]) => [...(arr ?? [])].sort().join('|');

const areFiltersEqual = (a: BookFilters, b: BookFilters) =>
  (a.search ?? '') === (b.search ?? '') &&
  normalizeArray(a.status) === normalizeArray(b.status) &&
  normalizeArray(a.tags) === normalizeArray(b.tags) &&
  normalizeArray(a.seriesIds) === normalizeArray(b.seriesIds);

const hasAnyFilters = (filters: BookFilters) =>
  Boolean(
    (filters.search ?? '').trim() ||
      (filters.status?.length ?? 0) ||
      (filters.tags?.length ?? 0) ||
      (filters.seriesIds?.length ?? 0)
  );

export const Dashboard = () => {
  const [filters, setFilters] = useState<BookFilters>(cleanFilters());
  const [isBooksEnabled, setIsBooksEnabled] = useState(false);
  useGetSeries();
  const contentRef = useRef<HTMLDivElement | null>(null);
  const {
    books,
    readingBooks,
    isReadingFetching,
    count,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    deliveredCount,
  } = useMainHook(filters, { booksEnabled: isBooksEnabled });

  const hasActiveFilters = hasAnyFilters(filters);
  const showReadingShelf =
    !hasActiveFilters && (readingBooks.length > 0 || isReadingFetching);

  const handleApplyFilters = useCallback((nextFilters: BookFilters) => {
    const cleaned = cleanFilters(nextFilters);
    if (hasAnyFilters(cleaned)) {
      setIsBooksEnabled(true);
    }
    setFilters((prev) => (areFiltersEqual(prev, cleaned) ? prev : cleaned));
  }, []);

  const handleResetFilters = useCallback(() => setFilters(cleanFilters()), []);

  const handleBrowseAllBooks = useCallback(
    () => setIsBooksEnabled(true),
    []
  );

  const handleLogoClick = useCallback(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <main className='flex h-screen max-h-screen flex-col overflow-hidden'>
      <Header
        filters={filters}
        onFilterChange={handleApplyFilters}
        onResetFilters={handleResetFilters}
      />
      <div
        ref={contentRef}
        className={clsx('flex-1 overflow-auto', 'px-3 sm:px-4')}
      >
        {showReadingShelf && (
          <section className='pb-4 pt-4'>
            <Books
              title='Currently Reading'
              count={readingBooks.length}
              books={readingBooks}
              isFetching={isReadingFetching}
              hasNextPage={false}
              isFetchingNextPage={false}
              enableInfiniteScroll={false}
              scrollRootRef={contentRef}
              showSkeletons
              showOverlayLoader={false}
              showEmptyState={false}
              fillHeight={false}
            />
            <hr className='mt-4 border-white-2/30' />
          </section>
        )}
        <section className='pb-4 pt-4'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <div className='space-y-1'>
              <h2 className='text-sm font-semibold text-white/85'>Library</h2>
              {!isBooksEnabled && (
                <p className='text-xs text-white/60'>
                  Load the full catalog to browse and search.
                </p>
              )}
            </div>
            {!isBooksEnabled && (
              <Button variant='primaryOutline' onClick={handleBrowseAllBooks}>
                Browse all books
              </Button>
            )}
          </div>
        </section>
        {isBooksEnabled && (
          <Books
            books={books}
            isFetching={isFetching}
            hasNextPage={hasNextPage}
            fetchNextPage={fetchNextPage}
            isFetchingNextPage={isFetchingNextPage}
            scrollRootRef={contentRef}
          />
        )}
        <CountBadge
          onClick={handleLogoClick}
          isFetching={isFetching || isFetchingNextPage}
          count={count}
          deliveredCount={deliveredCount}
        />
      </div>
    </main>
  );
};
