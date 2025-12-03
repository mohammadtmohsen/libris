import { Book } from '_queries/booksQueries';
import { ReactNode } from 'react';
import { ProgressBar } from '../ProgressBar/ProgressBar';

// const statusLabel: Record<Book['status'], string> = {
//   not_started: 'Not started',
//   reading: 'Reading',
//   finished: 'Finished',
//   abandoned: 'Abandoned',
// };

// const statusColor: Record<Book['status'], string> = {
//   not_started: 'bg-gray-600',
//   reading: 'bg-blue-500',
//   finished: 'bg-green-500',
//   abandoned: 'bg-red-500',
// };

export const BookCard = ({
  book,
  onClickBook,
  infoButton,
}: {
  book: Book;
  onClickBook: () => void;
  infoButton: ReactNode;
}) => {
  return (
    <div
      onClick={onClickBook}
      className='relative flex flex-col justify-end bg-black-3 rounded-md border border-black-2 hover:border-blue-4 transition-colors w-[320px] h-[400px] overflow-hidden'
      style={{
        backgroundImage: `url(${book?.cover?.coverUrl})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'top',
      }}
    >
      <div className='bg-white-4 flex flex-col text-right p-3 bg-opacity-90 rounded-t-primary'>
        <div className='text-sm font-semibold truncate text-right text-black-1'>
          {book?.title}
        </div>

        <div className='text-xs text-black-1/70 truncate text-right'>
          {book?.author}
        </div>
      </div>
      <div onClick={(e) => e.stopPropagation()}>{infoButton}</div>
      <ProgressBar
        pageCount={book?.pageCount || 0}
        pagesRead={book?.pagesRead || 0}
        className='bg-white-4 bg-opacity-90'
      />
    </div>
  );
};
