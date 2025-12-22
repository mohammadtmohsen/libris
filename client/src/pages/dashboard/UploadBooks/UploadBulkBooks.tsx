import { ReactNode } from 'react';
import { Button, Modal, useModal } from '_components/shared';

import { UploadBulkBooksForm } from './UploadBulkBooksForm';
import { useUploadBulkBooks } from './useUploadBulkBooks';

type UploadBulkBooksProps = {
  onOpen?: () => void;
  trigger?: (props: { onClick: () => void }) => ReactNode;
};

export const UploadBulkBooks = ({ onOpen, trigger }: UploadBulkBooksProps) => {
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
      {trigger ? (
        trigger({ onClick: handleOpen })
      ) : (
        <Button
          variant='outline'
          iconButton='book'
          onClick={handleOpen}
          aria-label='Bulk upload books'
          title='Bulk upload books'
        />
      )}
      <Modal {...uploadModal} />
    </>
  );
};
