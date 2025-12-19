import {
  Button,
  Modal,
  UploadEditBookForm,
  useModal,
} from '_components/shared';

import { useUploadBooks } from './useUploadBooks';

export const UploadBook = ({ onOpen }: { onOpen?: () => void }) => {
  const {
    methods,
    handleSubmit,
    isSubmitting,
    onClose,
    seriesOptions,
    isSeriesLoading,
  } = useUploadBooks();

  const uploadModal = useModal({
    content: ({ close }) => (
      <UploadEditBookForm
        isSubmitting={isSubmitting}
        methods={methods}
        onCancel={() => {
          onClose();
          close();
        }}
        // TODO:add this to keep the modal open after successful upload
        // onSuccess={onClose}
        onSubmit={handleSubmit}
        seriesOptions={seriesOptions}
        isSeriesLoading={isSeriesLoading}
      />
    ),
    // TODO:this is temporary remove it when doe uploading books
    fullScreen: true,
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
