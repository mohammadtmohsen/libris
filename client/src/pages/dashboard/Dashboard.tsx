import { useState } from 'react';
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

export const Dashboard = () => {
  const [filters, setFilters] = useState<BookFilters>(cleanFilters());
  useGetSeries();
  const {
    books,
    count,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMainHook(filters);

  const handleApplyFilters = (nextFilters: BookFilters) => {
    setFilters(cleanFilters(nextFilters));
  };

  const handleResetFilters = () => setFilters(cleanFilters());

  return (
    <main className='flex gap-4 h-screen max-h-screen'>
      <div className='relative flex flex-col gap-4 grow m-0 overflow-hidden'>
        <Header
          filters={filters}
          onFilterChange={handleApplyFilters}
          onResetFilters={handleResetFilters}
        />
        <div className={clsx('flex-1 overflow-auto', 'px-3 sm:px-4')}>
          <Books
            books={books}
            isFetching={isFetching}
            hasNextPage={hasNextPage}
            fetchNextPage={fetchNextPage}
            isFetchingNextPage={isFetchingNextPage}
          />
          <CountBadge isFetching={isFetching} count={count} />
        </div>
      </div>
    </main>
  );
};
