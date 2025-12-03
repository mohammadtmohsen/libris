import {
  Button,
  Modal,
  UploadEditBookForm,
  useModal,
} from '_components/shared';

import { useUploadBooks } from './useUploadBooks';

export const UploadBook = () => {
  const { methods, handleSubmit, isSubmitting } = useUploadBooks();

  const uploadModal = useModal({
    content: ({ close }) => (
      <UploadEditBookForm
        isSubmitting={isSubmitting}
        methods={methods}
        onCancel={close}
        onSubmit={handleSubmit}
      />
    ),
  });

  return (
    <>
      <Button iconButton='add' onClick={() => uploadModal.open({})} />
      <Modal {...uploadModal} />
    </>
  );
};
