import { CardSkeleton, Modal, useModal, BookCard } from '_components/shared';
import { Book } from '_queries/booksQueries';

import { UpdateBook } from '../UpdateBook/UpdateBook';
import PdfViewer from '../PdfViewer/PdfViewer';

export const Books = ({
  books,
  isFetching,
}: {
  books: Book[];
  isFetching: boolean;
}) => {
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
    <div className='flex flex-col gap-5'>
      <div className='grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 auto-rows-[minmax(360px,1fr)] grid-flow-row-dense gap-4 sm:gap-6 overflow-auto x!h-[calc(100vh-170px)] xbg-black-5'>
        <CardSkeleton loading={isFetching} count={1} rows={12} />
        {!isFetching &&
          books.map((book: Book) => {
            return (
              <BookCard
                book={book}
                key={book._id}
                onClickBook={() => {
                  pdfModal.open({ book });
                }}
                infoButton={
                  <UpdateBook
                    book={book}
                    buttonClassName='relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/20 text-white shadow-lg backdrop-blur hover:bg-white/35 focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-white'
                  />
                }
              />
            );
          })}
      </div>
      <Modal {...pdfModal} />
    </div>
  );
};
