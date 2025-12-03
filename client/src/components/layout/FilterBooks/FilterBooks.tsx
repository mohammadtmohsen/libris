import { Button, Modal, useModal } from '_components/shared';

const FilterBooksForm = ({ onCancel }: { onCancel: () => void }) => {
  return (
    <div>
      {/* Form fields for filtering books go here */}
      <h2>Filter Books</h2>
      <Button onClick={onCancel}>Close</Button>
    </div>
  );
};

export const FilterBooks = () => {
  // const { methods, handleSubmit, isSubmitting, onDeleteBook } =
  //     useUpdateBook(book);

  const uploadModal = useModal({
    content: ({ close }) => (
      <FilterBooksForm
        // isSubmitting={isSubmitting}
        // methods={methods}
        onCancel={close}
        // onSubmit={handleSubmit}
        // isEdit={true}
        // book={book}
        // onDelete={onDeleteBook}
      />
    ),
  });

  return (
    <>
      <Button
        variant='primary'
        iconButton='info'
        onClick={() => uploadModal.open({})}
      />
      <Modal {...uploadModal} />
    </>
  );
};
