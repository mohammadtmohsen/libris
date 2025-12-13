import {
  Button,
  OverlayLoader,
  StatusBadge,
  useActionToast,
} from '_components/shared';
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { Document, Page } from 'react-pdf';
import { usePdfViewer } from './usePdfViewer';
import { Book } from '_queries/booksQueries';
import { useUpsertProgress } from '_queries/progressQueries';
import clsx from 'clsx';
import {
  getAbsolutePublicationYear,
  getPublicationEraFromYear,
} from '_utils/publicationYear';

type PdfViewerProps = {
  onClose: () => void;
  contentProps: { book: Book | null };
};

const PdfViewer = ({ onClose, contentProps }: PdfViewerProps) => {
  const AUTO_HIDE_DELAY = 2800;
  const activeBook = contentProps?.book || null;

  const {
    bookUrlData: url,
    bookUrlError: error,
    bookUrlLoading: loading,
  } = usePdfViewer({ activeBook });
  const toast = useActionToast();

  const [numPages, setNumPages] = useState<number | null>(
    activeBook?.pageCount || null
  );
  const [pageNumber, setPageNumber] = useState(
    activeBook?.progress?.pagesRead && activeBook.progress.pagesRead > 0
      ? activeBook.progress.pagesRead
      : 1
  );
  const [scale, setScale] = useState(1);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [manualHidden, setManualHidden] = useState(false);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const touchMovedRef = useRef(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const MOVE_TOLERANCE_PX = 25;

  const viewerRef = useRef<HTMLDivElement | null>(null);
  const controlsLayerRef = useRef<HTMLDivElement | null>(null);
  const hideControlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const updateProgressMutation = useUpsertProgress();
  const publicationEra = getPublicationEraFromYear(activeBook?.publicationYear);
  const publicationYear = getAbsolutePublicationYear(
    activeBook?.publicationYear
  );
  const publicationDisplay =
    publicationYear !== undefined && publicationYear !== null
      ? publicationEra === 'BC'
        ? `${publicationYear} ق.م`
        : `${publicationYear} م`
      : null;
  const seriesName = activeBook?.series?.name || null;
  const seriesDisplay = seriesName ? `المجموعة: ${seriesName}` : null;
  const totalParts = activeBook?.series?.totalParts;
  const partDisplay = activeBook?.part
    ? `الجزء ${activeBook.part}${totalParts ? ` من ${totalParts}` : ''}`
    : null;
  const seriesLine = [seriesDisplay, partDisplay].filter(Boolean).join(' • ');
  const metaLine = [activeBook?.author, publicationDisplay]
    .filter(Boolean)
    .join(' • ');

  const clearHideTimer = () => {
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }
  };

  useEffect(() => {
    setPageNumber(
      activeBook?.progress?.pagesRead && activeBook.progress.pagesRead > 0
        ? activeBook.progress.pagesRead
        : 1
    );
    setNumPages(activeBook?.pageCount || null);
  }, [activeBook?._id, activeBook?.progress?.pagesRead, activeBook?.pageCount]);

  const showControls = (options?: { respectManual?: boolean }) => {
    const respectManual = options?.respectManual ?? true;
    if (respectManual && manualHidden) return;
    setControlsVisible(true);
    clearHideTimer();
    hideControlsTimeout.current = setTimeout(() => {
      setControlsVisible(false);
    }, AUTO_HIDE_DELAY);
  };

  const handleUserActivity = () => {
    if (manualHidden || !controlsVisible) return;
    showControls({ respectManual: false });
  };

  useEffect(() => {
    showControls();
    return () => clearHideTimer();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (loading || error || !url) {
      setControlsVisible(true);
      clearHideTimer();
      return;
    }
    showControls();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, error, url]);

  useEffect(() => {
    if (!viewerRef.current) return;

    const updateWidth = () => {
      if (!viewerRef.current) return;
      setContainerWidth(Math.max(0, viewerRef.current.clientWidth));
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(viewerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  const handleClose = () => {
    if (
      activeBook?._id &&
      activeBook.progress?.pagesRead !== pageNumber &&
      pageNumber > 0 &&
      activeBook.progress?.status === 'reading'
    ) {
      // Update pages read with the current page number
      const title = activeBook.title || 'This book';
      toast.showToast({
        title: 'Updating progress…',
        description: `Saving page ${pageNumber} for "${title}".`,
      });
      updateProgressMutation.mutate(
        {
          bookId: activeBook._id,
          pagesRead: pageNumber || undefined,
          status: activeBook.progress?.status,
        },
        {
          onSuccess: () => {
            toast.showSuccess({
              title: 'Progress saved',
              description: `"${title}" saved at page ${pageNumber}.`,
            });
          },
          onError: (err) => {
            const message =
              err instanceof Error ? err.message : 'Could not save progress.';
            toast.showError({
              title: 'Save failed',
              description: `"${title}": ${message}`,
            });
          },
        }
      );
    }
    onClose();
  };

  const goToPrevPage = () => {
    setPageNumber((p) => Math.max(1, p - 1));
  };

  const goToNextPage = () => {
    setPageNumber((p) => (numPages ? Math.min(numPages, p + 1) : p + 1));
  };

  const toggleControlsVisibility = () => {
    if (manualHidden || !controlsVisible) {
      setManualHidden(false);
      showControls({ respectManual: false });
      return;
    }

    setManualHidden(true);
    clearHideTimer();
    setControlsVisible(false);
  };

  const performTapAction = (clientX: number) => {
    const bounds = viewerRef.current?.getBoundingClientRect();
    const width =
      bounds?.width && bounds.width > 0 ? bounds.width : window.innerWidth;
    const left = bounds?.left ?? 0;
    const relativeX = clientX - left;
    const NEXT_THRESHOLD = width * 0.8;
    const PREV_THRESHOLD = width * 0.2;

    if (relativeX >= NEXT_THRESHOLD) {
      goToNextPage();
    } else if (relativeX <= PREV_THRESHOLD) {
      goToPrevPage();
    } else {
      toggleControlsVisibility();
    }
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (controlsLayerRef.current?.contains(event.target as Node)) {
      touchStartRef.current = null;
      touchMovedRef.current = false;
      return;
    }

    if (event.pointerType === 'touch') {
      touchStartRef.current = { x: event.clientX, y: event.clientY };
      touchMovedRef.current = false;
      return;
    }

    performTapAction(event.clientX);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    handleUserActivity();

    const start = touchStartRef.current;
    if (event.pointerType !== 'touch' || !start) return;

    const deltaX = Math.abs(event.clientX - start.x);
    const deltaY = Math.abs(event.clientY - start.y);

    if (deltaX > MOVE_TOLERANCE_PX || deltaY > MOVE_TOLERANCE_PX) {
      touchMovedRef.current = true;
    }
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = touchStartRef.current;
    if (event.pointerType !== 'touch' || !start) return;

    const shouldIgnore = touchMovedRef.current;
    touchStartRef.current = null;
    touchMovedRef.current = false;

    if (shouldIgnore) return;
    if (controlsLayerRef.current?.contains(event.target as Node)) return;

    performTapAction(start.x);
  };

  const handlePointerCancel = () => {
    touchStartRef.current = null;
    touchMovedRef.current = false;
  };

  const handleSliderChange = (value: number) => {
    setPageNumber(() => value);
    handleUserActivity();
  };

  const controlInteractivityClass = controlsVisible
    ? 'pointer-events-auto'
    : 'pointer-events-none';

  return (
    <div className='flex flex-col w-full h-full bg-black-2'>
      <div
        ref={viewerRef}
        className='relative flex-1 overflow-hidden'
        onMouseMove={handleUserActivity}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        <div className='absolute inset-0 overflow-auto flex items-start justify-center py-0 px-0'>
          {loading && (
            <OverlayLoader
              show
              withBackdrop
              title='Loading your Book…'
              subtitle='We are preparing the pages and optimizing the view.'
              badgeLabel='Viewer Sync'
              className='min-h-screen h-full px-4 sm:px-6'
            />
          )}
          {error && <div className='p-4 text-sm text-red-400'>{error}</div>}
          {!loading && !error && url ? (
            <Document
              file={url?.signedUrl}
              loading={
                <OverlayLoader
                  show
                  withBackdrop
                  title='Loading your Book…'
                  subtitle='We are preparing the pages and optimizing the view.'
                  badgeLabel='Viewer Sync'
                  className='min-h-screen h-full px-4 sm:px-6'
                />
              }
              onLoadSuccess={({ numPages: np }) => {
                setNumPages(np);
                setPageNumber((prev) => Math.min(prev || 1, np));
              }}
              onLoadError={(e) => {
                console.error('Failed to load PDF:', e);
              }}
              className='w-full flex justify-center'
            >
              <Page
                pageNumber={pageNumber}
                width={
                  containerWidth
                    ? Math.max(0, containerWidth * scale)
                    : undefined
                }
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </Document>
          ) : null}
          {!loading && !error && !url && (
            <div className='p-4 text-sm'>No file URL</div>
          )}
        </div>

        <div
          ref={controlsLayerRef}
          className={clsx(
            'absolute inset-0 transition-opacity duration-300 pointer-events-none',
            controlsVisible ? 'opacity-100' : 'opacity-0'
          )}
        >
          <div className='flex items-start justify-center gap-3 px-4 pt-4'>
            <div
              className={clsx(
                'flex flex-wrap items-center justify-center gap-2 bg-blue-7 rounded-secondary px-3 py-2 backdrop-blur-sm shadow-lg max-w-[100%]',
                controlInteractivityClass
              )}
            >
              <StatusBadge
                status={activeBook?.progress?.status}
                bookId={activeBook?._id}
                condensed
                enableDropdown={false}
                bookTitle={activeBook?.title || undefined}
              />
              <div className='flex flex-col items-end text-right min-w-0'>
                <div
                  dir='rtl'
                  className={clsx(
                    'text-sm font-bold text-blue-1',
                    'text-right'
                  )}
                >
                  {activeBook?.title || 'Untitled'}
                </div>
                {metaLine ? (
                  <div
                    dir='rtl'
                    className='text-[11px] text-blue-2 truncate max-w-full'
                  >
                    {metaLine}
                  </div>
                ) : null}
                {seriesLine ? (
                  <div
                    dir='rtl'
                    className='text-[11px] text-blue-2 truncate max-w-full'
                  >
                    {seriesLine}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className='absolute bottom-11 left-4 right-4 pb-6'>
            <div
              className={clsx(
                'flex justify-center items-center gap-1 bg-blue-7 rounded-secondary px-1 py-1 backdrop-blur-sm shadow-lg w-fit mx-auto mb-5',
                controlInteractivityClass
              )}
            >
              <Button
                variant='outline'
                className='!py-1 !px-3 !h-[32px] !w-[32px]'
                iconButton='remove'
                onClick={() => {
                  setScale((s) => Math.max(0.5, s - 0.1));
                  handleUserActivity();
                }}
                disabled={!url}
              />
              <span className='text-xs w-12 text-center text-blue-1'>
                {Math.round(scale * 100)}%
              </span>
              <Button
                variant='outline'
                className='!py-1 !px-3 !h-[32px] !w-[32px]'
                iconButton='add'
                onClick={() => {
                  setScale((s) => Math.min(3, s + 0.1));
                  handleUserActivity();
                }}
                disabled={!url}
              />
            </div>
          </div>
          <div className='flex items-center gap-1 justify-between absolute bottom-0 right-0 left-0 px-4 pb-6'>
            <div
              className={clsx(
                'bg-blue-7 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg flex items-center gap-3 rounded-full flex-1',
                controlInteractivityClass
              )}
            >
              <input
                type='range'
                min={1}
                max={numPages || pageNumber || 1}
                value={pageNumber}
                onChange={(e) => handleSliderChange(Number(e.target.value))}
                disabled={!numPages}
                className='w-full accent-blue-1'
              />
              <div className='text-xs text-blue-1 xmin-w-[60px] font-bold text-right whitespace-nowrap'>
                {pageNumber} / {numPages || '?'}
              </div>
            </div>
            <div
              className={clsx(
                'bg-blue-7 backdrop-blur-sm rounded-2xl px-1 py-1 shadow-lg flex items-center gap-3 rounded-full',
                controlInteractivityClass
              )}
            >
              <Button
                variant='outline'
                iconButton='logout'
                className='!py-1 !px-3 !h-[32px] !w-[32px]'
                onClick={handleClose}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfViewer;
