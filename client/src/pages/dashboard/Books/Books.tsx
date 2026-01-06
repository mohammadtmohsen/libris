import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { Modal, useModal, BookCard, NoData } from '_components/shared';
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
const CARD_HEIGHT_RATIO = 4 / 3;
const VIRTUALIZATION_OVERSCAN_ROWS = 3;

const getColumnCount = (width: number) => {
  if (width >= 1920) return 6;
  if (width >= 1536) return 5;
  if (width >= 1280) return 4;
  if (width >= 1024) return 3;
  if (width >= 600) return 2;
  return 1;
};

export const Books = ({
  books,
  isFetching,
  hasNextPage,
  fetchNextPage = () => undefined,
  isFetchingNextPage = false,
  scrollRootRef,
  title,
  count,
  enableInfiniteScroll = true,
  enableVirtualization = true,
  showSkeletons = false,
  skeletonCount = 1,
  showEmptyState = true,
  fillHeight = true,
}: {
  books: Book[];
  isFetching: boolean;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
  scrollRootRef?: RefObject<HTMLDivElement | null>;
  title?: string;
  count?: number;
  enableInfiniteScroll?: boolean;
  enableVirtualization?: boolean;
  showSkeletons?: boolean;
  skeletonCount?: number;
  showOverlayLoader?: boolean;
  showEmptyState?: boolean;
  fillHeight?: boolean;
}) => {
  const { loggingData } = useStore();
  const isAdmin = (loggingData?.role ?? 'user') === 'admin';
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [listElement, setListElement] = useState<HTMLDivElement | null>(null);
  const scrollRafRef = useRef<number | null>(null);
  const shouldVirtualize = enableVirtualization && Boolean(scrollRootRef);
  const [columnCount, setColumnCount] = useState(() =>
    typeof window === 'undefined' ? 1 : getColumnCount(window.innerWidth)
  );
  const [containerWidth, setContainerWidth] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [listOffsetTop, setListOffsetTop] = useState(0);
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
  const handleListRef = useCallback((node: HTMLDivElement | null) => {
    listRef.current = node;
    setListElement(node);
  }, []);

  useEffect(() => {
    if (!shouldVirtualize) return;
    const handleResize = () => {
      setColumnCount(getColumnCount(window.innerWidth));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [shouldVirtualize]);

  useEffect(() => {
    if (!shouldVirtualize) return;
    if (!listElement) return;

    const updateWidth = () => {
      setContainerWidth(listElement.clientWidth);
    };

    updateWidth();
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => updateWidth());
      observer.observe(listElement);
      return () => observer.disconnect();
    }

    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [listElement, shouldVirtualize]);

  useEffect(() => {
    if (!shouldVirtualize) return;
    const scrollElement = scrollRootRef?.current;
    if (!scrollElement || !listElement) return;

    const updateMetrics = () => {
      const scrollRect = scrollElement.getBoundingClientRect();
      const listRect = listElement.getBoundingClientRect();
      setViewportHeight(scrollElement.clientHeight);
      setScrollTop(scrollElement.scrollTop);
      setListOffsetTop(listRect.top - scrollRect.top + scrollElement.scrollTop);
    };

    const handleScroll = () => {
      if (scrollRafRef.current !== null) return;
      scrollRafRef.current = window.requestAnimationFrame(() => {
        scrollRafRef.current = null;
        updateMetrics();
      });
    };

    updateMetrics();
    scrollElement.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      scrollElement.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (scrollRafRef.current !== null) {
        window.cancelAnimationFrame(scrollRafRef.current);
        scrollRafRef.current = null;
      }
    };
  }, [listElement, scrollRootRef, shouldVirtualize]);

  useEffect(() => {
    if (!enableInfiniteScroll) return;
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
  }, [
    enableInfiniteScroll,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    scrollRootRef,
  ]);

  const resolvedColumnCount = Math.max(1, columnCount);
  const itemWidth =
    shouldVirtualize && resolvedColumnCount > 0
      ? Math.max(
          0,
          (containerWidth - GRID_GAP_PX * (resolvedColumnCount - 1)) /
            resolvedColumnCount
        )
      : 0;
  const cardHeight = Math.max(
    BOOK_CARD_MIN_HEIGHT_PX,
    Math.round(itemWidth * CARD_HEIGHT_RATIO)
  );
  const rowStride = cardHeight + GRID_GAP_PX;
  const totalRows = shouldVirtualize
    ? Math.ceil(books.length / resolvedColumnCount)
    : 0;
  const totalHeight =
    shouldVirtualize && totalRows > 0 ? totalRows * rowStride - GRID_GAP_PX : 0;
  const relativeScrollTop = shouldVirtualize
    ? Math.max(0, scrollTop - listOffsetTop)
    : 0;
  const startRow = shouldVirtualize
    ? Math.max(
        0,
        Math.floor(relativeScrollTop / rowStride) - VIRTUALIZATION_OVERSCAN_ROWS
      )
    : 0;
  const endRow = shouldVirtualize
    ? Math.min(
        totalRows,
        Math.ceil((relativeScrollTop + viewportHeight) / rowStride) +
          VIRTUALIZATION_OVERSCAN_ROWS
      )
    : totalRows;
  const startIndex = shouldVirtualize ? startRow * resolvedColumnCount : 0;
  const endIndex = shouldVirtualize
    ? Math.min(books.length, endRow * resolvedColumnCount)
    : books.length;
  const visibleBooks = shouldVirtualize
    ? books.slice(startIndex, endIndex)
    : books;

  const containerClassName = `relative flex w-full flex-col ${
    fillHeight ? 'h-full' : ''
  }`;
  const shouldShowEmptyState =
    showEmptyState && !isFetching && books.length === 0;
  const shouldShowSkeletons = showSkeletons && isFetching && books.length === 0;
  const renderBookCard = (book: Book, index: number) => {
    const statusAccent = getStatusAccent(book?.progress?.status);
    return (
      <BookCard
        book={book}
        index={index}
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
  };

  return (
    <div className={containerClassName}>
      {title ? (
        <div className='flex items-center justify-between pb-3'>
          <div className='flex items-center gap-1'>
            <h2 className='text-sm font-semibold text-white/85'>{title}</h2>
            {typeof count === 'number' ? (
              <span className='rounded-full bg-white/10 xpx-2 py-0.5 text-xs font-semibold text-white/70'>
                ({count})
              </span>
            ) : null}
          </div>
        </div>
      ) : null}
      {shouldShowSkeletons ? (
        <div className='grid w-full grid-cols-1 auto-rows-[minmax(360px,1fr)] grid-flow-row-dense gap-4 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 xs:gap-4'>
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className='relative flex aspect-[3/4] min-h-[320px] w-full overflow-hidden rounded-xl border border-black-2/70 bg-black-3/70 shadow-[0_10px_30px_rgba(0,0,0,0.25)]'
            >
              <div className='absolute inset-0 animate-pulse bg-gradient-to-br from-black-4/70 via-black-3/50 to-black-5/70' />
              <div className='relative z-10 mt-auto w-full space-y-2 p-3'>
                <div className='h-4 w-3/4 rounded bg-black-2/50' />
                <div className='h-3 w-1/2 rounded bg-black-2/40' />
              </div>
            </div>
          ))}
        </div>
      ) : shouldShowEmptyState ? (
        <div className='flex flex-1 items-center justify-center'>
          <NoData />
        </div>
      ) : (
        <>
          {shouldVirtualize ? (
            <div
              ref={handleListRef}
              className='relative w-full'
              style={{ height: totalHeight }}
            >
              {visibleBooks.map((book: Book, index: number) => {
                const itemIndex = startIndex + index;
                const row = Math.floor(itemIndex / resolvedColumnCount);
                const column = itemIndex % resolvedColumnCount;
                const top = row * rowStride;
                const left = column * (itemWidth + GRID_GAP_PX);
                return (
                  <div
                    key={book._id}
                    style={{
                      position: 'absolute',
                      top,
                      left,
                      width: itemWidth,
                      height: cardHeight,
                      display: 'flex',
                      alignItems: 'stretch',
                    }}
                  >
                    {renderBookCard(book, itemIndex)}
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              ref={handleListRef}
              className='grid w-full grid-cols-1 auto-rows-[minmax(360px,1fr)] grid-flow-row-dense gap-4 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 xs:gap-4'
            >
              {books.map((book: Book, index: number) => (
                <div key={book._id} className='w-full'>
                  {renderBookCard(book, index)}
                </div>
              ))}
            </div>
          )}
          {enableInfiniteScroll ? (
            <div ref={sentinelRef} className='h-4 w-full pb-3' />
          ) : null}
        </>
      )}

      {/* {showOverlayLoader && (
        <OverlayLoader
          show={isFetching}
          // show={isFetchingNextPage || isFetching}
          mini
          className='mt-auto'
        />
      )} */}

      <Modal {...pdfModal} />
    </div>
  );
};
