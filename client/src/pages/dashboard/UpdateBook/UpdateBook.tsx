import { Button, Modal, UploadEditBookForm, useModal } from '_components/shared';

import { useUpdateBook } from './useUpdateBook';
import { Book } from '_queries/booksQueries';

export const UpdateBook = ({
  book,
  buttonClassName,
  accentColor,
}: {
  book: Book;
  buttonClassName?: string;
  accentColor?: string;
}) => {
  const {
    methods,
    handleSubmit,
    isSubmitting,
    onDeleteBook,
    seriesOptions,
    isSeriesLoading,
  } = useUpdateBook(book);

  const uploadModal = useModal({
    content: ({ close }) => (
      <UploadEditBookForm
        isSubmitting={isSubmitting}
        methods={methods}
        onCancel={close}
        onSubmit={handleSubmit}
        isEdit={true}
        book={book}
        onDelete={onDeleteBook}
        seriesOptions={seriesOptions}
        isSeriesLoading={isSeriesLoading}
      />
    ),
  });

  return (
    <>
      <Button
        variant='outline'
        iconButton='editNote'
        onClick={() => uploadModal.open({})}
        className={buttonClassName ?? 'absolute top-3 right-3 z-10'}
        iconProps={accentColor ? { htmlColor: accentColor } : undefined}
      />
      <Modal {...uploadModal} />
    </>
  );
};
