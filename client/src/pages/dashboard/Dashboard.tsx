import { Books } from './Books/Books';
import clsx from 'clsx';
import { useMainHook } from './useMainHook';
import { Header } from '_components/header';
import { CountBadge } from '_components/shared';

export const Dashboard = () => {
  const { books, count, isFetching } = useMainHook();

  return (
    <main className='flex gap-4 h-screen max-h-screen m-3 sm:m-4'>
      <div className='relative flex flex-col gap-4 grow mb-4 overflow-hidden'>
        <Header />
        <div className={clsx('flex-1 overflow-auto', 'p-0 ', '')}>
          <Books books={books} isFetching={isFetching} />
          <CountBadge isFetching={isFetching} count={count} />
          <div className='h-20' />
        </div>
      </div>
    </main>
  );
};
