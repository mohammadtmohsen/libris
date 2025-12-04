import { Button } from '_components/shared';
import { useEffect, useRef, useState } from 'react';
import { Document, Page } from 'react-pdf';
import { usePdfViewer } from './usePdfViewer';
import { Book, useUpdateBookPages } from '_queries/booksQueries';

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

  const [numPages, setNumPages] = useState<number | null>(
    activeBook?.pageCount || null
  );
  const [pageNumber, setPageNumber] = useState(activeBook?.pagesRead || 1);
  const [scale, setScale] = useState(1);
  const [controlsVisible, setControlsVisible] = useState(true);
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

  const showControls = () => {
    setControlsVisible(true);
    clearHideTimer();
    hideControlsTimeout.current = setTimeout(() => {
      setControlsVisible(false);
    }, AUTO_HIDE_DELAY);
  };

  const handleUserActivity = () => {
    showControls();
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
    if (activeBook?._id) {
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

  const handlePageAreaClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (controlsLayerRef.current?.contains(event.target as Node)) {
      return;
    }
    handleUserActivity();

    if (!viewerRef.current) return;
    const { left, width } = viewerRef.current.getBoundingClientRect();
    const relativeX = event.clientX - left;

    if (relativeX > width * 0.6) {
      goToNextPage();
    } else if (relativeX < width * 0.4) {
      goToPrevPage();
    } else {
      setControlsVisible((prev) => !prev);
    }
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (controlsLayerRef.current?.contains(event.target as Node)) {
      return;
    }
    handleUserActivity();
    const touch = event.changedTouches[0];
    if (!viewerRef.current || !touch) return;
    const { left, width } = viewerRef.current.getBoundingClientRect();
    const relativeX = touch.clientX - left;

    if (relativeX > width * 0.6) {
      goToNextPage();
    } else if (relativeX < width * 0.4) {
      goToPrevPage();
    } else {
      setControlsVisible((prev) => !prev);
    }
  };

  const handleSliderChange = (value: number) => {
    setPageNumber(() => value);
    handleUserActivity();
  };

  return (
    <div className='flex flex-col w-full h-full xw-[95vw] xh-[90vh] xmax-w-[1200px] xmax-h-[90vh] bg-black-2'>
      <div
        ref={viewerRef}
        className='relative flex-1 overflow-hidden'
        onMouseMove={handleUserActivity}
        onClick={handlePageAreaClick}
        onTouchStart={handleTouchStart}
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
          className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${
            controlsVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className='flex items-start justify-between gap-3 px-4 pt-4'>
            <div className='pointer-events-auto bg-black/60 text-white rounded-2xl px-4 py-2 backdrop-blur-sm max-w-[60%]'>
              <div className='text-[11px] uppercase tracking-wide text-white/70'>
                Reading
              </div>
              <div className='text-sm font-medium truncate'>
                {activeBook?.title || 'Untitled'}
              </div>
              <div className='text-xs text-white/70'>
                {pageNumber} / {numPages || '?'}
              </div>
            </div>
            <div className='pointer-events-auto flex items-center gap-2 bg-black/60 rounded-full px-3 py-2 backdrop-blur-sm shadow-lg'>
              <Button
                variant='outline'
                className='!py-1 !px-3 h-[32px]'
                leftIcon='remove'
                onClick={() => {
                  setScale((s) => Math.max(0.5, s - 0.1));
                  handleUserActivity();
                }}
                disabled={!url}
              >
                Zoom-
              </Button>
              <span className='text-xs w-12 text-center text-white/80'>
                {Math.round(scale * 100)}%
              </span>
              <Button
                variant='outline'
                className='!py-1 !px-3 h-[32px]'
                leftIcon='add'
                onClick={() => {
                  setScale((s) => Math.min(3, s + 0.1));
                  handleUserActivity();
                }}
                disabled={!url}
              >
                Zoom+
              </Button>
              <Button
                variant='outline'
                className='!py-1 !px-3 h-[32px]'
                onClick={() => {
                  goToPrevPage();
                  handleUserActivity();
                }}
                disabled={!numPages || pageNumber <= 1}
              >
                Prev
              </Button>
              <Button
                variant='outline'
                className='!py-1 !px-3 h-[32px]'
                onClick={() => {
                  goToNextPage();
                  handleUserActivity();
                }}
                disabled={
                  !numPages || (numPages ? pageNumber >= numPages : false)
                }
              >
                Next
              </Button>
              <Button
                variant='outline'
                className='!py-1 !px-3 h-[32px]'
                onClick={handleClose}
              >
                Close
              </Button>
            </div>
          </div>

          <div className='absolute bottom-0 left-0 right-0 px-4 pb-6'>
            <div className='pointer-events-auto bg-black/60 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg flex items-center gap-3'>
              <input
                type='range'
                min={1}
                max={numPages || pageNumber || 1}
                value={pageNumber}
                onChange={(e) => handleSliderChange(Number(e.target.value))}
                disabled={!numPages}
                className='w-full accent-blue-400'
              />
              <div className='text-xs text-white/90 min-w-[80px] text-right'>
                {pageNumber} / {numPages || '?'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfViewer;
