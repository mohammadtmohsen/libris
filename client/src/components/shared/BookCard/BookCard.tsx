import { Book } from '_queries/booksQueries';
import { Button } from '../Button/Button';

const statusLabel: Record<Book['status'], string> = {
  not_started: 'Not started',
  reading: 'Reading',
  finished: 'Finished',
  abandoned: 'Abandoned',
};

const statusColor: Record<Book['status'], string> = {
  not_started: 'bg-gray-600',
  reading: 'bg-blue-500',
  finished: 'bg-green-500',
  abandoned: 'bg-red-500',
};

export const BookCard = ({
  book,
  onClickBook,
  onClickInfo,
}: {
  book: Book;
  onClickBook: () => void;
  onClickInfo: () => void;
}) => {
  const percent = book.progress?.percent ?? '50';
  return (
    <div
      onClick={onClickBook}
      key={book._id}
      className='relative flex flex-col justify-end bg-black-3 rounded-md border border-black-2 hover:border-blue-4 transition-colors w-[320px] h-[400px] overflow-hidden'
      style={{
        backgroundImage: `url(${book?.cover?.coverUrl})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'top',
      }}
    >
      <div className='bg-white-4 flex flex-col text-right pt-3 px-3'>
        <div className='text-sm font-semibold truncate text-right text-black-1'>
          {book?.title}
        </div>

        <div className='text-xs text-black-1/70 truncate text-right'>
          {book?.author}
        </div>
        <Button
          variant='primary'
          iconButton='info'
          onClick={onClickInfo}
          className='absolute top-3 right-3 z-10'
        />
      </div>
      {typeof percent === 'number' && (
        <div className='mt-1 h-2 w-full rounded bg-black-2 overflow-hidden'>
          <div
            className='h-full bg-blue-1 transition-all'
            style={{
              width: `${Math.min(100, Math.max(0, percent))}%`,
            }}
          />
        </div>
      )}
    </div>
  );
};
