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
      <div className='grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 x!h-[calc(100vh-170px)] xbg-black-5 overflow-auto'>
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
                infoButton={<UpdateBook book={book} />}
              />
            );
          })}
      </div>
      <Modal {...pdfModal} />
    </div>
  );
};
