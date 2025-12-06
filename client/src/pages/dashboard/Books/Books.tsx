import { Modal, useModal, BookCard, OverlayLoader } from '_components/shared';
import { Book } from '_queries/booksQueries';
import { useStore } from '_store/useStore';

import { UpdateBook } from '../UpdateBook/UpdateBook';
import PdfViewer from '../PdfViewer/PdfViewer';

export const Books = ({
  books,
  isFetching,
}: {
  books: Book[];
  isFetching: boolean;
}) => {
  const { loggingData } = useStore();
  const isAdmin = (loggingData?.role ?? 'user') === 'admin';
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

  return (
    <div className='relative flex min-h-[calc(100vh-170px)] w-full flex-col gap-5'>
      <div className='grid min-h-full w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 auto-rows-[minmax(360px,1fr)] grid-flow-row-dense gap-4 sm:gap-4 overflow-auto x!h-[calc(100vh-170px)] xbg-black-5'>
        {books.map((book: Book) => {
          return (
            <BookCard
              book={book}
              key={book._id}
              onClickBook={() => {
                pdfModal.open({ book });
              }}
              infoButton={
                isAdmin ? (
                  <UpdateBook
                    book={book}
                    buttonClassName='relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/20 text-white shadow-lg backdrop-blur hover:bg-white/35 focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-white'
                  />
                ) : null
              }
            />
          );
        })}
      </div>
      <OverlayLoader show={isFetching} />
      <Modal {...pdfModal} />
    </div>
  );
};
