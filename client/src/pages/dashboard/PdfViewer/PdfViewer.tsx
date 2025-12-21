import {
  Button,
  OverlayLoader,
  StatusBadge,
  useActionToast,
} from '_components/shared';
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type PointerEvent,
  type RefObject,
} from 'react';
import { Document, Page } from 'react-pdf';
import { usePdfViewer } from './usePdfViewer';
import { Book } from '_queries/booksQueries';
import { useUpsertProgress } from '_queries/progressQueries';
import clsx from 'clsx';
import {
  getAbsolutePublicationYear,
  getPublicationEraFromYear,
} from '_utils/publicationYear';

const AUTO_HIDE_DELAY = 2800;
const MOVE_TOLERANCE_PX = 25;
const MIN_SCALE = 0.5;
const MAX_SCALE = 3;
const SCALE_STEP = 0.1;

type PdfViewerProps = {
  onClose: () => void;
  contentProps: { book: Book | null };
};

type MemoPageProps = {
  pageNumber: number;
  width?: number;
  onRenderSuccess?: (page: { pageNumber?: number }) => void;
};

const MemoPage = memo(
  ({ pageNumber, width, onRenderSuccess }: MemoPageProps) => (
    <Page
      pageNumber={pageNumber}
      width={width}
      renderTextLayer={false}
      renderAnnotationLayer={false}
      loading={null}
      onRenderSuccess={onRenderSuccess}
    />
  ),
  (prev, next) =>
    prev.pageNumber === next.pageNumber && prev.width === next.width
);

type ViewerCoreProps = {
  url: string | null;
  loading: boolean;
  error: string | null;
  documentReady: boolean;
  pageWidth?: number;
  pagesToRender: number[];
  visiblePageNumber: number;
  onDocumentLoadSuccess: ({ numPages }: { numPages: number }) => void;
  onDocumentLoadError: (error: Error) => void;
  onPageRenderSuccess: (page: { pageNumber?: number }) => void;
};

const ViewerCore = memo(
  ({
    url,
    loading,
    error,
    documentReady,
    pageWidth,
    pagesToRender,
    visiblePageNumber,
    onDocumentLoadSuccess,
    onDocumentLoadError,
    onPageRenderSuccess,
  }: ViewerCoreProps) => {
    const showOverlay = !error && (loading || (Boolean(url) && !documentReady));
    const shouldRenderDocument = !loading && !error && url;

    return (
      <div className='absolute inset-0 overflow-auto flex items-start justify-center py-0 px-0'>
        {showOverlay && (
          <OverlayLoader
            show
            withBackdrop
            fullWidth
            title='Loading your Book…'
            subtitle='We are preparing the pages and optimizing the view.'
            badgeLabel='Viewer Sync'
            className='h-full w-full !absolute inset-0'
          />
        )}
        {error && <div className='p-4 text-sm text-red-400'>{error}</div>}
        {shouldRenderDocument ? (
          <Document
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            className='relative w-full flex justify-center'
            loading={null}
          >
            {pagesToRender.map((page) => {
              const isVisible = page === visiblePageNumber;
              return (
                <div
                  key={page}
                  className={clsx(
                    'flex w-full justify-center',
                    isVisible
                      ? 'relative'
                      : 'absolute inset-0 opacity-0 pointer-events-none'
                  )}
                  aria-hidden={!isVisible}
                >
                  <MemoPage
                    pageNumber={page}
                    width={pageWidth}
                    onRenderSuccess={onPageRenderSuccess}
                  />
                </div>
              );
            })}
          </Document>
        ) : null}
        {!loading && !error && !url && (
          <div className='p-4 text-sm'>No file URL</div>
        )}
      </div>
    );
  }
);

type ControlsLayerProps = {
  controlsVisible: boolean;
  controlsLayerRef: RefObject<HTMLDivElement>;
  activeBook: Book | null;
  metaLine: string;
  seriesLine: string;
  pageNumber: number;
  numPages: number | null;
  scale: number;
  isFileAvailable: boolean;
  onZoomOut: () => void;
  onZoomIn: () => void;
  onSliderChange: (value: number) => void;
  onClose: () => void;
};

const ControlsLayer = memo(
  ({
    controlsVisible,
    controlsLayerRef,
    activeBook,
    metaLine,
    seriesLine,
    pageNumber,
    numPages,
    scale,
    isFileAvailable,
    onZoomOut,
    onZoomIn,
    onSliderChange,
    onClose,
  }: ControlsLayerProps) => {
    const controlInteractivityClass = controlsVisible
      ? 'pointer-events-auto'
      : 'pointer-events-none';

    const handleSliderInputChange = useCallback(
      (event: ChangeEvent<HTMLInputElement>) => {
        onSliderChange(Number(event.target.value));
      },
      [onSliderChange]
    );

    return (
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
              'flex flex-wrap items-start justify-center gap-2 bg-blue-7 rounded-secondary px-3 py-2 backdrop-blur-sm shadow-lg max-w-[100%]',
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
                className={clsx('text-sm font-bold text-blue-1', 'text-right')}
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
              onClick={onZoomOut}
              disabled={!isFileAvailable}
            />
            <span className='text-xs w-12 text-center text-blue-1'>
              {Math.round(scale * 100)}%
            </span>
            <Button
              variant='outline'
              className='!py-1 !px-3 !h-[32px] !w-[32px]'
              iconButton='add'
              onClick={onZoomIn}
              disabled={!isFileAvailable}
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
              onChange={handleSliderInputChange}
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
              onClick={onClose}
            />
          </div>
        </div>
      </div>
    );
  }
);

const PdfViewer = ({ onClose, contentProps }: PdfViewerProps) => {
  const activeBook = contentProps?.book || null;

  const {
    bookUrlData: url,
    bookUrlError: error,
    bookUrlLoading: loading,
  } = usePdfViewer({ activeBook });
  const toast = useActionToast();

  const initialPageNumber =
    activeBook?.progress?.pagesRead && activeBook.progress.pagesRead > 0
      ? activeBook.progress.pagesRead
      : 1;

  const [numPages, setNumPages] = useState<number | null>(
    activeBook?.pageCount || null
  );
  const [pageNumber, setPageNumber] = useState(initialPageNumber);
  const [scale, setScale] = useState(1);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [manualHidden, setManualHidden] = useState(false);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const [frozenWidth, setFrozenWidth] = useState<number | null>(null);
  const [documentReady, setDocumentReady] = useState(false);
  const [isPageRendering, setIsPageRendering] = useState(true);

  const latestPageRef = useRef(initialPageNumber);
  const lastRenderedPageRef = useRef(initialPageNumber);
  const renderedPagesRef = useRef<Set<number>>(new Set());
  const containerWidthRef = useRef<number | null>(null);

  const touchMovedRef = useRef(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const viewerRef = useRef<HTMLDivElement | null>(null);
  const controlsLayerRef = useRef<HTMLDivElement | null>(null);
  const hideControlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const updateProgressMutation = useUpsertProgress();

  const fileUrl = url?.signedUrl ?? null;
  const isFileAvailable = Boolean(fileUrl);
  const activeBookId = activeBook?._id ?? null;
  const activeBookTitle = activeBook?.title || 'This book';
  const activeBookStatus = activeBook?.progress?.status;
  const activeBookPagesRead = activeBook?.progress?.pagesRead;

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

  const clearHideTimer = useCallback(() => {
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }
  }, []);

  const showControls = useCallback(
    (options?: { respectManual?: boolean }) => {
      const respectManual = options?.respectManual ?? true;
      if (respectManual && manualHidden) return;
      setControlsVisible(true);
      clearHideTimer();
      hideControlsTimeout.current = setTimeout(() => {
        setControlsVisible(false);
      }, AUTO_HIDE_DELAY);
    },
    [manualHidden, clearHideTimer]
  );

  const handleUserActivity = useCallback(() => {
    if (manualHidden || !controlsVisible) return;
    showControls({ respectManual: false });
  }, [manualHidden, controlsVisible, showControls]);

  useEffect(() => {
    showControls();
    return () => clearHideTimer();
  }, [showControls, clearHideTimer]);

  useEffect(() => {
    if (loading || error || !fileUrl) {
      setControlsVisible(true);
      clearHideTimer();
      return;
    }
    showControls();
  }, [loading, error, fileUrl, showControls, clearHideTimer]);

  useEffect(() => {
    const element = viewerRef.current;
    if (!element) return;

    let frameId: number | null = null;

    const commitWidth = (nextWidth: number) => {
      const floored = Math.max(0, Math.floor(nextWidth));
      if (containerWidthRef.current === floored) return;
      containerWidthRef.current = floored;
      setContainerWidth(floored);
    };

    commitWidth(element.clientWidth);

    const resizeObserver = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect?.width ?? element.clientWidth;
      if (frameId) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => commitWidth(width));
    });

    resizeObserver.observe(element);

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    setDocumentReady(false);
  }, [fileUrl]);

  const pageWidth = useMemo(() => {
    const baseWidth = frozenWidth ?? containerWidth;
    if (!baseWidth || baseWidth <= 0) return undefined;
    return Math.floor(baseWidth * scale);
  }, [frozenWidth, containerWidth, scale]);

  useEffect(() => {
    renderedPagesRef.current.clear();
  }, [fileUrl, pageWidth]);

  useEffect(() => {
    const nextPage =
      activeBook?.progress?.pagesRead && activeBook.progress.pagesRead > 0
        ? activeBook.progress.pagesRead
        : 1;

    latestPageRef.current = nextPage;
    lastRenderedPageRef.current = nextPage;
    renderedPagesRef.current.clear();
    setFrozenWidth(null);
    setIsPageRendering(true);
    setPageNumber(nextPage);
    setNumPages(activeBook?.pageCount || null);
  }, [activeBook?._id, activeBook?.progress?.pagesRead, activeBook?.pageCount]);

  useEffect(() => {
    latestPageRef.current = pageNumber;

    if (renderedPagesRef.current.has(pageNumber)) {
      lastRenderedPageRef.current = pageNumber;
      setIsPageRendering(false);
      setFrozenWidth(null);
      return;
    }

    setIsPageRendering(true);
  }, [pageNumber]);

  const pagesToRender = useMemo(() => {
    if (!pageNumber) return [];
    const pages = new Set<number>();
    pages.add(pageNumber);
    if (pageNumber > 1) pages.add(pageNumber - 1);
    if (!numPages || pageNumber < numPages) pages.add(pageNumber + 1);

    const lastRendered = lastRenderedPageRef.current;
    if (lastRendered) pages.add(lastRendered);

    return Array.from(pages)
      .filter((page) => page > 0 && (!numPages || page <= numPages))
      .sort((a, b) => a - b);
  }, [pageNumber, numPages]);

  const visiblePageNumber = isPageRendering
    ? lastRenderedPageRef.current || pageNumber
    : pageNumber;

  const setPageNumberWithFreeze = useCallback(
    (nextPage: number) => {
      const bounded =
        nextPage < 1 ? 1 : numPages ? Math.min(numPages, nextPage) : nextPage;
      const alreadyRendered = renderedPagesRef.current.has(bounded);

      if (alreadyRendered) {
        lastRenderedPageRef.current = bounded;
        setIsPageRendering(false);
        setFrozenWidth(null);
      } else {
        const widthToFreeze = containerWidthRef.current;
        setFrozenWidth(
          widthToFreeze && widthToFreeze > 0 ? widthToFreeze : null
        );
        setIsPageRendering(true);
      }

      setPageNumber(bounded);
    },
    [numPages]
  );

  const handleDocumentLoadSuccess = useCallback(
    ({ numPages: loadedPages }: { numPages: number }) => {
      setNumPages(loadedPages);
      setDocumentReady(true);

      const nextPage = Math.min(latestPageRef.current || 1, loadedPages);
      if (nextPage !== latestPageRef.current) {
        setIsPageRendering(true);
        setPageNumber(nextPage);
      }
    },
    []
  );

  const handleDocumentLoadError = useCallback((e: Error) => {
    console.error('Failed to load PDF:', e);
    setDocumentReady(true);
  }, []);

  const handlePageRenderSuccess = useCallback(
    (page: { pageNumber?: number }) => {
      const renderedPage = page?.pageNumber ?? 0;
      if (!renderedPage) return;

      renderedPagesRef.current.add(renderedPage);

      if (renderedPage !== latestPageRef.current) return;

      lastRenderedPageRef.current = renderedPage;
      setIsPageRendering(false);
      setFrozenWidth(null);
    },
    []
  );

  const handleClose = useCallback(async () => {
    const latestPage = latestPageRef.current;

    if (
      activeBookId &&
      activeBookPagesRead !== latestPage &&
      latestPage > 0 &&
      activeBookStatus === 'reading'
    ) {
      const title = activeBookTitle;
      toast.showToast({
        title: 'Updating progress…',
        description: `Saving page ${latestPage} for "${title}".`,
      });
      await updateProgressMutation.mutateAsync(
        {
          bookId: activeBookId,
          pagesRead: latestPage || undefined,
          status: activeBookStatus,
        },
        {
          onSuccess: () => {
            toast.showSuccess({
              title: 'Progress saved',
              description: `"${title}" saved at page ${latestPage}.`,
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
      toast.showSuccess({
        title: 'Progress saved',
        description: `"${title}" saved at page ${latestPage}.`,
      });
    }

    onClose();
  }, [
    activeBookId,
    activeBookPagesRead,
    activeBookStatus,
    activeBookTitle,
    onClose,
    toast,
    updateProgressMutation,
  ]);

  const goToPrevPage = useCallback(() => {
    setPageNumberWithFreeze(latestPageRef.current - 1);
  }, [setPageNumberWithFreeze]);

  const goToNextPage = useCallback(() => {
    setPageNumberWithFreeze(latestPageRef.current + 1);
  }, [setPageNumberWithFreeze]);

  const toggleControlsVisibility = useCallback(() => {
    if (manualHidden || !controlsVisible) {
      setManualHidden(false);
      showControls({ respectManual: false });
      return;
    }

    setManualHidden(true);
    clearHideTimer();
    setControlsVisible(false);
  }, [manualHidden, controlsVisible, showControls, clearHideTimer]);

  const performTapAction = useCallback(
    (clientX: number) => {
      const bounds = viewerRef.current?.getBoundingClientRect();
      const width =
        bounds?.width && bounds.width > 0 ? bounds.width : window.innerWidth;
      const left = bounds?.left ?? 0;
      const relativeX = clientX - left;
      const nextThreshold = width * 0.8;
      const prevThreshold = width * 0.2;

      if (relativeX >= nextThreshold) {
        goToNextPage();
      } else if (relativeX <= prevThreshold) {
        goToPrevPage();
      } else {
        toggleControlsVisibility();
      }
    },
    [goToNextPage, goToPrevPage, toggleControlsVisibility]
  );

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
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
    },
    [performTapAction]
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      handleUserActivity();

      const start = touchStartRef.current;
      if (event.pointerType !== 'touch' || !start) return;

      const deltaX = Math.abs(event.clientX - start.x);
      const deltaY = Math.abs(event.clientY - start.y);

      if (deltaX > MOVE_TOLERANCE_PX || deltaY > MOVE_TOLERANCE_PX) {
        touchMovedRef.current = true;
      }
    },
    [handleUserActivity]
  );

  const handlePointerUp = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const start = touchStartRef.current;
      if (event.pointerType !== 'touch' || !start) return;

      const shouldIgnore = touchMovedRef.current;
      touchStartRef.current = null;
      touchMovedRef.current = false;

      if (shouldIgnore) return;
      if (controlsLayerRef.current?.contains(event.target as Node)) return;

      performTapAction(start.x);
    },
    [performTapAction]
  );

  const handlePointerCancel = useCallback(() => {
    touchStartRef.current = null;
    touchMovedRef.current = false;
  }, []);

  const handleSliderChange = useCallback(
    (value: number) => {
      setPageNumberWithFreeze(value);
      handleUserActivity();
    },
    [setPageNumberWithFreeze, handleUserActivity]
  );

  const handleZoomOut = useCallback(() => {
    setScale((s) => Math.max(MIN_SCALE, s - SCALE_STEP));
    handleUserActivity();
  }, [handleUserActivity]);

  const handleZoomIn = useCallback(() => {
    setScale((s) => Math.min(MAX_SCALE, s + SCALE_STEP));
    handleUserActivity();
  }, [handleUserActivity]);

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
        <ViewerCore
          url={fileUrl}
          loading={loading}
          error={error}
          documentReady={documentReady}
          pageWidth={pageWidth}
          pagesToRender={pagesToRender}
          visiblePageNumber={visiblePageNumber}
          onDocumentLoadSuccess={handleDocumentLoadSuccess}
          onDocumentLoadError={handleDocumentLoadError}
          onPageRenderSuccess={handlePageRenderSuccess}
        />
        <ControlsLayer
          controlsVisible={controlsVisible}
          controlsLayerRef={controlsLayerRef}
          activeBook={activeBook}
          metaLine={metaLine}
          seriesLine={seriesLine}
          pageNumber={pageNumber}
          numPages={numPages}
          scale={scale}
          isFileAvailable={isFileAvailable}
          onZoomOut={handleZoomOut}
          onZoomIn={handleZoomIn}
          onSliderChange={handleSliderChange}
          onClose={handleClose}
        />
      </div>
    </div>
  );
};

export default PdfViewer;
