import { Button } from '_components/shared';
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { Document, Page } from 'react-pdf';
import { usePdfViewer } from './usePdfViewer';
import { Book, useUpdateBookPages } from '_queries/booksQueries';
import clsx from 'clsx';

type PdfViewerProps = {
  onClose: () => void;
  contentProps: { book: Book | null };
};

const PdfViewer = ({ onClose, contentProps }: PdfViewerProps) => {
  const AUTO_HIDE_DELAY = 11112800;
  const activeBook = contentProps?.book || null;

  const {
    bookUrlData: url,
    bookUrlError: error,
    bookUrlLoading: loading,
  } = usePdfViewer({ activeBook });

  const [numPages, setNumPages] = useState<number | null>(
    activeBook?.pageCount || null
  );
  const [pageNumber, setPageNumber] = useState(activeBook?.pagesRead || 1);
  const [scale, setScale] = useState(1);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [manualHidden, setManualHidden] = useState(false);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);

  const viewerRef = useRef<HTMLDivElement | null>(null);
  const controlsLayerRef = useRef<HTMLDivElement | null>(null);
  const hideControlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const updatePagesMutation = useUpdateBookPages();

  const clearHideTimer = () => {
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }
  };

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
      activeBook.pagesRead !== pageNumber &&
      pageNumber > 0 &&
      activeBook?.status === 'reading'
    ) {
      // Update pages read with the current page number, and pageCount if known
      updatePagesMutation.mutate({
        bookId: activeBook._id,
        pagesRead: pageNumber || undefined,
        pageCount: numPages || undefined,
      });
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

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (controlsLayerRef.current?.contains(event.target as Node)) {
      return;
    }
    const isTouch = event.pointerType === 'touch';
    if (isTouch) {
      event.preventDefault();
    }

    if (!viewerRef.current) return;
    const { left, width } = viewerRef.current.getBoundingClientRect();
    const relativeX = event.clientX - left;

    if (relativeX > width * 0.6) {
      goToNextPage();
    } else if (relativeX < width * 0.4) {
      goToPrevPage();
    }
  };

  const handleSliderChange = (value: number) => {
    setPageNumber(() => value);
    handleUserActivity();
  };

  return (
    <div className='flex flex-col w-full h-full bg-black-2'>
      <div
        ref={viewerRef}
        className='relative flex-1 overflow-hidden'
        onMouseMove={handleUserActivity}
        onPointerMove={handleUserActivity}
        onPointerDown={handlePointerDown}
      >
        <div className='absolute inset-0 overflow-auto flex items-start justify-center py-0 px-0'>
          {loading && <div className='p-4 text-sm'>Preparing viewer…</div>}
          {error && <div className='p-4 text-sm text-red-400'>{error}</div>}
          {!loading && !error && url ? (
            <Document
              file={url?.signedUrl}
              loading={<div className='p-4 text-sm'>Loading PDF…</div>}
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
            <div className='pointer-events-auto flex justify-center items-center gap-2 bg-blue-7 rounded-secondary px-3 py-2 backdrop-blur-sm shadow-lg max-w-[100%]'>
              <div className='text-[11px] font-bold tracking-wide text-blue-1'>
                ({activeBook?.status})
              </div>
              <div className='text-sm font-bold truncate text-blue-1'>
                {activeBook?.title || 'Untitled'}
              </div>
            </div>
          </div>

          <div className='absolute bottom-11 left-4 right-4 pb-6'>
            <div className='pointer-events-auto flex justify-center items-center gap-1 bg-blue-7 rounded-secondary px-3 py-2 backdrop-blur-sm shadow-lg w-fit mx-auto mb-5'>
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
          <div className='absolute bottom-0 left-14 right-4 xpx-4 pb-6'>
            <div className='pointer-events-auto bg-blue-7 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg flex items-center gap-3 rounded-full'>
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
          </div>
          <div className='pointer-events-auto absolute bottom-12 left-4 pb-6'>
            <Button
              variant='outline'
              iconButton='logout'
              className='!py-1 !px-3 !h-[32px] !w-[32px]'
              onClick={handleClose}
            />
          </div>
        </div>

        <div className='absolute bottom-7 left-4 pointer-events-auto z-20'>
          <Button
            variant='outline'
            className='!py-1 !px-3 !h-[32px] !w-[32px]'
            iconButton={controlsVisible ? 'visibilityOff' : 'visibility'}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              toggleControlsVisibility();
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PdfViewer;
