import { Button, Modal, useModal } from '_components/shared';

import { UploadBulkBooksForm } from './UploadBulkBooksForm';
import { useUploadBulkBooks } from './useUploadBulkBooks';

export const UploadBulkBooks = ({ onOpen }: { onOpen?: () => void }) => {
  const { files, addFiles, clearFiles, uploadAll, isSubmitting } =
    useUploadBulkBooks();

  const uploadModal = useModal({
    content: ({ close }) => (
      <UploadBulkBooksForm
        files={files}
        isSubmitting={isSubmitting}
        onFiles={addFiles}
        onCancel={() => {
          clearFiles();
          close();
        }}
        onSubmit={async () => {
          const result = await uploadAll();
          if (result.failed.length === 0) {
            close();
          }
        }}
      />
    ),
    fullScreen: true,
  });

  const handleOpen = () => {
    onOpen?.();
    uploadModal.open({});
  };

  return (
    <>
      <Button
        variant='outline'
        iconButton='book'
        onClick={handleOpen}
        aria-label='Bulk upload books'
        title='Bulk upload books'
      />
      <Modal {...uploadModal} />
    </>
  );
};
