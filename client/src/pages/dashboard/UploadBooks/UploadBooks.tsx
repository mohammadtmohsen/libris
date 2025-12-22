import { ReactNode } from 'react';
import {
  Button,
  Modal,
  UploadEditBookForm,
  useModal,
} from '_components/shared';

import { useUploadBooks } from './useUploadBooks';

type UploadBookProps = {
  onOpen?: () => void;
  trigger?: (props: { onClick: () => void }) => ReactNode;
};

export const UploadBook = ({ onOpen, trigger }: UploadBookProps) => {
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
      {trigger ? (
        trigger({ onClick: handleOpen })
      ) : (
        <Button variant='outline' iconButton='add' onClick={handleOpen} />
      )}
      <Modal {...uploadModal} />
    </>
  );
};
