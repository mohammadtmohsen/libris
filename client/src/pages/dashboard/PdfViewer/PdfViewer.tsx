import { Button } from '_components/shared';
import { useState } from 'react';
import { Document, Page } from 'react-pdf';
import { usePdfViewer } from './usePdfViewer';
import { Book } from '_queries/booksQueries';

type PdfViewerProps = {
  onClose: () => void;
  contentProps: { book: Book | null };
};

const PdfViewer = ({ onClose, contentProps }: PdfViewerProps) => {
  const activeBook = contentProps?.book || null;

  const {
    bookUrlData: url,
    bookUrlError: error,
    bookUrlLoading: loading,
  } = usePdfViewer({ activeBook });

  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);

  return (
    <div className='flex flex-col w-full h-full xw-[95vw] xh-[90vh] xmax-w-[1200px] xmax-h-[90vh]'>
      <div className='flex items-center gap-2 p-2 sm:p-3 bg-black-3 border-b border-black-2'>
        <div className='flex-1 truncate pr-2'>
          <span className='text-sm sm:text-base'>{activeBook?.title}</span>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            className='!py-1 !px-3 h-[32px]'
            leftIcon='remove'
            onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
            disabled={!url}
          >
            Zoom-
          </Button>
          <span className='text-xs w-12 text-center'>
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant='outline'
            className='!py-1 !px-3 h-[32px]'
            leftIcon='add'
            onClick={() => setScale((s) => Math.min(3, s + 0.1))}
            disabled={!url}
          >
            Zoom+
          </Button>
          <div className='mx-2 text-xs'>
            {pageNumber} / {numPages || '?'}
          </div>
          <Button
            variant='outline'
            className='!py-1 !px-3 h-[32px]'
            onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
            disabled={!numPages || pageNumber <= 1}
          >
            Prev
          </Button>
          <Button
            variant='outline'
            className='!py-1 !px-3 h-[32px]'
            onClick={() =>
              setPageNumber((p) =>
                numPages ? Math.min(numPages, p + 1) : p + 1
              )
            }
            disabled={!numPages || (numPages ? pageNumber >= numPages : false)}
          >
            Next
          </Button>
          <Button
            variant='outline'
            className='!py-1 !px-3 h-[32px]'
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
      <div className='flex-1 overflow-auto flex items-center justify-center bg-black-2'>
        {loading && <div className='p-4 text-sm'>Preparing viewer…</div>}
        {error && <div className='p-4 text-sm text-red-400'>{error}</div>}
        {!loading && !error && url ? (
          <Document
            file={url?.signedUrl}
            loading={<div className='p-4 text-sm'>Loading PDF…</div>}
            onLoadSuccess={({ numPages: np }) => {
              setNumPages(np);
              setPageNumber(1);
            }}
            onLoadError={(e) => {
              console.error('Failed to load PDF:', e);
            }}
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        ) : null}
        {!loading && !error && !url && (
          <div className='p-4 text-sm'>No file URL</div>
        )}
      </div>
    </div>
  );
};

export default PdfViewer;
