import {
  Button,
  Modal,
  UploadEditBookForm,
  useModal,
} from '_components/shared';

import { useUpdateBook } from './useUpdateBook';
import { Book } from '_queries/booksQueries';

export const UpdateBook = ({ book }: { book: Book }) => {
  const { methods, handleSubmit, isSubmitting, onDeleteBook } =
    useUpdateBook(book);

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
      />
    ),
  });

  return (
    <>
      <Button
        variant='outline'
        iconButton='info'
        onClick={() => uploadModal.open({})}
        className='absolute top-3 right-3 z-10'
      />
      <Modal {...uploadModal} />
    </>
  );
};
