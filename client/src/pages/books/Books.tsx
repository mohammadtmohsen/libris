import { CardSkeleton, Modal, useModal, Button } from '_components/shared';
import { useGetBooks } from '_queries/booksQueries/booksQueries';
import type { Book } from '_services/booksServices/booksServices.types';
import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Configure pdf.js worker (use CDN matching installed version to avoid bundler issues)
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type PdfViewerProps = {
  title: string;
  url: string;
  onClose: () => void;
};

function PdfViewer({ title, url, onClose }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);

  return (
    <div className='flex flex-col w-full h-full xw-[95vw] xh-[90vh] xmax-w-[1200px] xmax-h-[90vh]'>
      <div className='flex items-center gap-2 p-2 sm:p-3 bg-black-3 border-b border-black-2'>
        <div className='flex-1 truncate pr-2' title={title}>
          <span className='text-sm sm:text-base'>{title}</span>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            className='!py-1 !px-3 h-[32px]'
            leftIcon='remove'
            onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
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
        {url ? (
          <Document
            file={url}
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
        ) : (
          <div className='p-4 text-sm'>No file URL</div>
        )}
      </div>
    </div>
  );
}

export const Books = () => {
  // Reuse the existing query hook which currently targets books via service
  const { data, isFetching } = useGetBooks();
  // API base; used only when composing server-relative URLs
  const apiBase = ((import.meta.env.VITE_BASE_URL as string | undefined) || '')
    .toString()
    .replace(/\/$/, '');

  // Modal with PDF viewer content
  const pdfModal = useModal({
    overrideStyle: '',
    // '!bg-black-1 !p-0 w-[95vw] h-[90vh] max-w-[1200px] max-h-[90vh]',
    content: ({ close, contentProps }) => (
      <PdfViewer
        title={(contentProps?.title as string) || 'Document'}
        url={(contentProps?.url as string) || ''}
        onClose={close}
      />
    ),
  });

  return (
    <div className='flex flex-col gap-5'>
      <div
        className={`grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4 bg-black-4 p-4 rounded-secondary max-h-[calc(100vh-300px)] overflow-auto`}
        style={{ height: 'calc(100vh - 300px)' }}
      >
        <CardSkeleton loading={isFetching} count={1} rows={12} />
        {!isFetching &&
          data?.items?.map((book: Book) => {
            // Prefer external thumbnailLink as-is; for server-proxied thumbnailUrl, prefix with API base
            const thumbUrl = book.thumbnailLink
              ? book.thumbnailLink
              : book.thumbnailUrl
              ? `${apiBase}${book.thumbnailUrl}`
              : undefined;
            return (
              <div
                key={book.id}
                className='flex flex-col gap-2 bg-black-3 rounded-md p-3 cursor-pointer hover:bg-black-2/70 transition-colors'
                onClick={() => {
                  // Always load PDF from API server
                  const url = apiBase
                    ? `${apiBase}/books/${book.id}/download`
                    : `/books/${book.id}/download`;
                  pdfModal.open({
                    url,
                    title: book.title,
                  });
                }}
              >
                <div className='w-full aspect-[3/4] bg-black-2 rounded overflow-hidden flex items-center justify-center'>
                  <img
                    src={thumbUrl ? thumbUrl : undefined}
                    alt={`Thumbnail of ${book.title}`}
                    className='w-full h-full object-cover'
                    loading='lazy'
                    onError={(e) => {
                      if (book.iconLink)
                        (e.currentTarget as HTMLImageElement).src =
                          book.iconLink;
                    }}
                  />
                </div>
                <div className='text-sm truncate' title={book.title}>
                  {book.title}
                </div>
              </div>
            );
          })}
      </div>
      {!isFetching && !!data?.items?.length && (
        <p className='absolute bottom-5 right-5 bg-blue-3/50 px-4 py-1.5 rounded-secondary'>
          <strong>{data?.items?.length}</strong> Books Found
        </p>
      )}
      <Modal {...pdfModal} />
    </div>
  );
};
