import { Button, DropZone, Input, Modal, useModal } from '_components/shared';

import { Controller } from 'react-hook-form';
import { useUploadBooks } from './useUploadBooks';

const UploadBookForm = ({ onClose }: { onClose: () => void }) => {
  const { methods, handleSubmit, isSubmitting, isError } = useUploadBooks({
    onClose,
  });

  return (
    <form
      onSubmit={handleSubmit}
      className='flex flex-col gap-4 m-auto w-[90vw] max-w-xl'
    >
      <h2 className='text-lg font-semibold'>Upload a Book</h2>
      <Controller
        name='file'
        control={methods.control}
        render={({ field, fieldState }) => (
          <DropZone
            label='Book PDF'
            accept='application/pdf'
            {...field}
            onChange={(f) => {
              field.onChange(f);
              methods.setValue('title', f.name.replace(/\.[^.]+$/, ''));
            }}
            error={fieldState.error?.message}
          />
        )}
        rules={{ required: 'This Field is required ' }}
      />
      {/* Cover input removed: cover image is auto-generated from the PDF */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
        <Controller
          name='title'
          control={methods.control}
          render={({ field, fieldState }) => (
            <Input
              label='Title'
              placeholder='Book title'
              {...field}
              error={fieldState.error?.message}
            />
          )}
          rules={{ required: 'This Field is required ' }}
        />
        <Controller
          name='author'
          control={methods.control}
          render={({ field, fieldState }) => (
            <Input
              label='Author'
              placeholder='Author name'
              {...field}
              error={fieldState.error?.message}
            />
          )}
          rules={{ required: 'This Field is required ' }}
        />
      </div>
      <Controller
        name='description'
        control={methods.control}
        render={({ field, fieldState }) => (
          <Input
            label='Description'
            placeholder='Short description'
            {...field}
            error={fieldState.error?.message}
          />
        )}
      />
      {isError && (
        <p className='text-red-1'>Failed to upload book. Please try again.</p>
      )}
      <div className='flex justify-end gap-3'>
        <Button variant='outline' onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type='submit' disabled={isSubmitting} loading={isSubmitting}>
          Upload
        </Button>
      </div>
    </form>
  );
};

export const UploadBook = () => {
  const uploadModal = useModal({
    content: ({ close }) => <UploadBookForm onClose={close} />,
  });

  return (
    <>
      <Button onClick={() => uploadModal.open({})}>Upload Book</Button>
      <Modal {...uploadModal} />
    </>
  );
};
