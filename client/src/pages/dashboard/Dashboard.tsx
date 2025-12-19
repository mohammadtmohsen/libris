import { useCallback, useRef, useState } from 'react';
import clsx from 'clsx';
import { Books } from './Books/Books';
import { useMainHook } from './useMainHook';
import { Header } from '_components/header';
import { CountBadge } from '_components/shared';
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

export const Dashboard = () => {
  const [filters, setFilters] = useState<BookFilters>(cleanFilters());
  useGetSeries();
  const contentRef = useRef<HTMLDivElement | null>(null);
  const {
    books,
    count,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMainHook(filters);

  const handleApplyFilters = useCallback((nextFilters: BookFilters) => {
    const cleaned = cleanFilters(nextFilters);
    setFilters((prev) => (areFiltersEqual(prev, cleaned) ? prev : cleaned));
  }, []);

  const handleResetFilters = useCallback(() => setFilters(cleanFilters()), []);

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
        onLogoClick={handleLogoClick}
      />
      <div
        ref={contentRef}
        className={clsx('flex-1 overflow-auto', 'px-3 sm:px-4')}
      >
        <Books
          books={books}
          isFetching={isFetching}
          hasNextPage={hasNextPage}
          fetchNextPage={fetchNextPage}
          isFetchingNextPage={isFetchingNextPage}
          scrollRootRef={contentRef}
        />
        <CountBadge isFetching={isFetching} count={count} />
      </div>
    </main>
  );
};
