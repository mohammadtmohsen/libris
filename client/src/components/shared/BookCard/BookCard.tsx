import { Book } from '_queries/booksQueries';
import { ReactNode } from 'react';
import { ProgressBar } from '../ProgressBar/ProgressBar';
import { StatusBadge } from '../StatusBadge/StatusBadge';

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
      className='group relative isolate flex aspect-[3/4] min-h-[320px] w-full cursor-pointer overflow-hidden rounded-xl border border-black-2/70 bg-black-3/70 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur-[1px] transition-all duration-300 hover:-translate-y-1 hover:border-blue-4/70 hover:shadow-[0_20px_50px_rgba(0,0,0,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-4'
      style={
        book?.cover?.coverUrl
          ? {
              backgroundImage: `linear-gradient(180deg, rgba(10,14,18,0.35) 0%, rgba(10,14,18,0.65) 45%, rgba(6,10,14,0.9) 100%), url(${book.cover.coverUrl})`,
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
            }
          : {
              backgroundImage:
                'linear-gradient(180deg, rgba(10,14,18,0.6) 0%, rgba(6,10,14,0.9) 100%)',
            }
      }
    >
      <div className='absolute inset-0 bg-gradient-to-b from-white/10 via-blue-4/10 to-black/70 opacity-0 transition duration-300 group-hover:opacity-100 group-focus-visible:opacity-100' />
      <div className='relative z-10 flex h-full w-full flex-col justify-between p-4 sm:p-5'>
        <div className='flex items-start justify-between gap-3'>
          <StatusBadge
            status={book?.status}
            bookId={book?._id}
            condensed
            className='shrink-0'
          />
          <div
            className='flex flex-col items-start justify-end space-y-1 text-right'
            dir='rtl'
          >
            <div
              className='text-lg font-semibold leading-tight text-white text-right line-clamp-2 drop-shadow-sm'
              dir='rtl'
            >
              {book?.title}
            </div>
            <div
              className='text-sm text-white/80 line-clamp-1 text-right'
              dir='rtl'
            >
              {book?.author}
            </div>
          </div>
        </div>

        <div className='space-y-3'>
          <div className='flex items-center justify-between text-xs text-white/70'>
            <span className='rounded-full bg-white/15 px-2 py-[3px] font-medium backdrop-blur-[1px]'>
              {book?.pagesRead || 0} / {book?.pageCount || 0} pages
            </span>
            <span className='text-[11px] uppercase tracking-[0.09em] text-white/60'>
              Progress
            </span>
          </div>
          <ProgressBar
            pageCount={book?.pageCount || 0}
            pagesRead={book?.pagesRead || 0}
          />
          <div className='flex items-center justify-end'>
            <div
              onClick={(e) => e.stopPropagation()}
              className='flex items-center gap-2 text-xs text-white/80'
            >
              <span className='hidden sm:inline text-[11px] uppercase tracking-[0.08em]'>
                Details
              </span>
              {infoButton}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
