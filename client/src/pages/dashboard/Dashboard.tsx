import { Books } from './Books/Books';
import clsx from 'clsx';
import { useMainHook } from './useMainHook';
import { Header } from '_components/header';

export const Dashboard = () => {
  const { books, isFetching } = useMainHook();

  return (
    <main className='flex gap-4 h-screen max-h-screen m-3 sm:m-4'>
      <div className='relative flex flex-col gap-4 grow mb-4 overflow-hidden'>
        <Header />
        <div className={clsx('flex-1 overflow-auto', 'p-0 ', '')}>
          <Books books={books} isFetching={isFetching} />
          {!isFetching && !!books.length && (
            <p className='absolute w-fit bottom-4 right-4 bg-blue-3/50 px-4 py-1.5 rounded-secondary'>
              <strong>{books.length}</strong> Books
            </p>
          )}
        </div>
      </div>
    </main>
  );
};
