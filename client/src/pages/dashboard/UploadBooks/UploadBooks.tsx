import {
  Button,
  Modal,
  UploadEditBookForm,
  useModal,
} from '_components/shared';

import { useUploadBooks } from './useUploadBooks';

export const UploadBook = ({ onOpen }: { onOpen?: () => void }) => {
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

  const handleOpen = () => {
    onOpen?.();
    uploadModal.open({});
  };

  return (
    <>
      <Button variant='outline' iconButton='add' onClick={handleOpen} />
      <Modal {...uploadModal} />
    </>
  );
};
