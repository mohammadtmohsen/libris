import {
  Button,
  Modal,
  UploadEditBookForm,
  useModal,
} from '_components/shared';

import { useUploadBooks } from './useUploadBooks';

export const UploadBook = () => {
  const { methods, handleSubmit, isSubmitting, onClose } = useUploadBooks();

  const uploadModal = useModal({
    content: ({ close }) => (
      <UploadEditBookForm
        isSubmitting={isSubmitting}
        methods={methods}
        onCancel={() => {
          onClose();
          close();
        }}
        onSubmit={handleSubmit}
      />
    ),
  });

  return (
    <>
      <Button
        variant='outline'
        iconButton='add'
        onClick={() => uploadModal.open({})}
      />
      <Modal {...uploadModal} />
    </>
  );
};
