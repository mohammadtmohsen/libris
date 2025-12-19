import { RefObject, useCallback, useEffect, useRef } from 'react';
import {
  Modal,
  useModal,
  BookCard,
  OverlayLoader,
  NoData,
} from '_components/shared';
import { Book } from '_queries/booksQueries';
import { getStatusAccent } from '_constants/statusStyles';
import { useStore } from '_store/useStore';

import { UpdateBook } from '../UpdateBook/UpdateBook';
import PdfViewer from '../PdfViewer/PdfViewer';

const BOOK_CARD_MIN_HEIGHT_PX = 360;
const GRID_GAP_PX = 16;
const PREFETCH_ROWS = 5;
const PREFETCH_DISTANCE_PX =
  PREFETCH_ROWS * (BOOK_CARD_MIN_HEIGHT_PX + GRID_GAP_PX);

export const Books = ({
  books,
  isFetching,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  scrollRootRef,
}: {
  books: Book[];
  isFetching: boolean;
  hasNextPage?: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  scrollRootRef?: RefObject<HTMLDivElement | null>;
}) => {
  const { loggingData } = useStore();
  const isAdmin = (loggingData?.role ?? 'user') === 'admin';
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const pdfModal = useModal({
    overrideStyle: '!p-0 sm:!p-0',
    fullScreen: true,
    content: ({ close, contentProps }) => (
      <PdfViewer
        contentProps={contentProps as { book: Book | null }}
        onClose={close}
      />
    ),
  });
  const handleOpenBook = useCallback(
    (book: Book) => {
      pdfModal.open({ book });
    },
    [pdfModal]
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        root: scrollRootRef?.current ?? null,
        rootMargin: `0px 0px ${PREFETCH_DISTANCE_PX}px 0px`,
        threshold: 0.1,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, scrollRootRef]);

  const showEmptyState = !isFetching && books.length === 0;

  return (
    <div className='relative h-full flex w-full flex-col'>
      {showEmptyState ? (
        <div className='flex flex-1 items-center justify-center'>
          <NoData />
        </div>
      ) : (
        <>
          <div className='grid w-full grid-cols-1 auto-rows-[minmax(360px,1fr)] grid-flow-row-dense gap-4 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 xs:gap-4'>
            {books.map((book: Book) => {
              const statusAccent = getStatusAccent(book?.progress?.status);
              return (
                <BookCard
                  book={book}
                  key={book._id}
                  onClickBook={handleOpenBook}
                  infoButton={
                    isAdmin ? (
                      <UpdateBook
                        book={book}
                        accentColor={statusAccent.solid}
                        buttonClassName='relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/20 text-white shadow-lg backdrop-blur hover:bg-white/35 focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-white'
                      />
                    ) : null
                  }
                />
              );
            })}
          </div>
          <div ref={sentinelRef} className='h-4 w-full pb-3' />
        </>
      )}

      <OverlayLoader
        show={isFetchingNextPage || isFetching}
        mini
        className='mt-auto'
      />

      <Modal {...pdfModal} />
    </div>
  );
};
