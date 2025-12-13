import { Book } from '_queries/booksQueries';
import {
  getAbsolutePublicationYear,
  getPublicationEraFromYear,
} from '_utils/publicationYear';
import { ReactNode } from 'react';
import { formatDate } from '_utils/helper';
import { getStatusAccent } from '_constants/statusStyles';
import { ProgressBar } from '../ProgressBar/ProgressBar';
import { StatusBadge } from '../StatusBadge/StatusBadge';

export const BookCard = ({
  book,
  onClickBook,
  infoButton,
}: {
  book: Book;
  onClickBook: () => void;
  infoButton?: ReactNode;
}) => {
  const tags = book?.tags ?? [];
  const tagsDisplay = tags.length > 0 ? tags.join(' • ') : null;
  const publicationEra = getPublicationEraFromYear(book.publicationYear);
  const publicationYear = getAbsolutePublicationYear(book.publicationYear);
  const publicationDisplay =
    publicationYear !== undefined && publicationYear !== null
      ? publicationEra === 'BC'
        ? `${publicationYear} ق.م`
        : `${publicationYear} م`
      : null;
  const seriesName = book?.series?.name || null;
  const seriesDisplay = seriesName ? `المجموعة: ${seriesName}` : null;
  const totalParts = book?.series?.totalParts;
  const partDisplay = book?.part
    ? `الجزء ${book.part}${totalParts ? ` من ${totalParts}` : ''}`
    : null;
  const seriesLine = [seriesDisplay, partDisplay].filter(Boolean).join(' • ');
  const progressStatusLabelMap = {
    want_to_read: 'Want to Read',
    reading: 'Started',
    finished: 'Finished',
    abandoned: 'Abandoned',
  } as const;
  const progressDateDisplay = (() => {
    const progress = book?.progress;
    if (!progress || !progress.status || progress.status === 'not_started') {
      return null;
    }
    const statusLabel = progressStatusLabelMap[progress.status];
    if (!statusLabel) return null;
    const statusDate =
      progress.status === 'want_to_read'
        ? progress.wantToReadAt
        : progress.status === 'reading'
        ? progress.startedAt
        : progress.status === 'finished'
        ? progress.finishedAt
        : progress.abandonedAt;
    const fallbackDate = progress.updatedAt || progress.createdAt;
    const dateToUse = statusDate || fallbackDate;
    if (!dateToUse) return null;
    const formattedDate = formatDate(dateToUse, 'DD/MM/YYYY');
    if (!formattedDate) return null;
    return {
      label: statusLabel,
      date: formattedDate,
    };
  })();

  const statusAccent = getStatusAccent(book?.progress?.status);

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
      <div className='absolute inset-0 bg-gradient-to-b from-white-6 via-blue-4/10 to-black-5 opacity-0 transition duration-300 group-hover:opacity-100 group-focus-visible:opacity-100' />
      <div className='relative z-10 flex h-full w-full flex-col justify-between p-1 pb-3.5'>
        <div className='flex items-start justify-between gap-3'>
          <StatusBadge
            status={book?.progress?.status}
            bookId={book?._id}
            condensed
            statusDateLabel={progressDateDisplay?.date || null}
            bookTitle={book?.title}
            className='shrink-0'
          />
          {infoButton ? (
            <div
              onClick={(e) => e.stopPropagation()}
              className='flex items-center justify-end'
            >
              {infoButton}
            </div>
          ) : null}
        </div>
        <div className='' dir='rtl'>
          <div className='flex flex-col items-start justify-end space-y-1 text-right'>
            <div className='text-lg font-semibold leading-tight text-white-1 text-right line-clamp-2 drop-shadow-sm'>
              {book?.title}
            </div>
            <div className='text-sm text-white-1 line-clamp-1 text-right'>
              {book?.author}{' '}
              {publicationDisplay ? `• ${publicationDisplay}` : ''}
            </div>
          </div>

          {seriesLine && (
            <span className='text-[12px] font-medium text-white-1'>
              {seriesLine}
            </span>
          )}

          {(tagsDisplay || book?.pageCount !== undefined) && (
            <div className='min-w-0 flex-1 text-white-1 text-[12px] font-medium'>
              {tagsDisplay ? `التصنيفات: ${tagsDisplay}` : '\u00a0'}
            </div>
          )}
        </div>
      </div>
      <div className='absolute inset-x-0 bottom-0'>
        <ProgressBar
          pageCount={book?.pageCount || 0}
          pagesRead={book?.progress?.pagesRead || 0}
          withLabel
          className='rounded-none border-0 shadow-none ring-0 bg-transparent'
          accentGradient={statusAccent.barGradient}
          accentLabelGradient={statusAccent.labelGradient}
        />
      </div>
    </div>
  );
};
