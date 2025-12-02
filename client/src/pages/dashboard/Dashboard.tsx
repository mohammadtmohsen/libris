import { Button, DropZone, Input, Modal, useModal } from '_components/shared';
import {
  usePresignUpload,
  useCompleteUpload,
  useUploadToPresignedUrl,
} from '_queries/booksQueries/booksQueries';
import { Controller, useForm } from 'react-hook-form';

type UploadBookFormPayload = {
  title: string;
  author: string;
  description: string;
  file: File | null;
  cover: File | null;
};

const UploadBookForm = ({ onClose }: { onClose: () => void }) => {
  const methods = useForm<UploadBookFormPayload>({
    defaultValues: {
      title: '',
      author: '',
      description: '',
      file: null as File | null,
      cover: null as File | null,
    },
  });
  console.log('🚀 > methods:', methods.watch());

  const {
    mutateAsync: presignMutateAsync,
    isPending: isPresignPending,
    isError: isPresignError,
  } = usePresignUpload();

  const {
    mutateAsync: uploadMutateAsync,
    isPending: isUploadPending,
    isError: isUploadError,
  } = useUploadToPresignedUrl();

  const {
    mutateAsync: completeUploadMutateAsync,
    isPending: isCompleteUploadPending,
    isError: isCompleteUploadError,
  } = useCompleteUpload();

  const isSubmitting =
    isPresignPending || isUploadPending || isCompleteUploadPending;

  const isError = isPresignError || isUploadError || isCompleteUploadError;

  const handleSubmit = async (payload: UploadBookFormPayload) => {
    if (!payload.file) {
      return;
    }

    try {
      // Presign + upload PDF
      const pdfPresign = await presignMutateAsync({
        fileName: payload.file.name,
        mimeType: payload.file.type || 'application/pdf',
        contentLength: payload.file.size,
      });
      await uploadMutateAsync({ file: payload.file, presign: pdfPresign });

      // Presign + upload cover if provided
      let coverKey: string | undefined;
      let coverMime: string | undefined;
      let coverSize: number | undefined;
      let coverOriginalName: string | undefined;

      if (payload.cover) {
        const coverPresign = await presignMutateAsync({
          fileName: payload.cover.name,
          mimeType: payload.cover.type || 'image/jpeg',
          isCover: true,
          contentLength: payload.cover.size,
        });
        await uploadMutateAsync({ file: payload.cover, presign: coverPresign });
        coverKey = coverPresign.key;
        coverMime = payload.cover.type || 'image/jpeg';
        coverSize = payload.cover.size;
        coverOriginalName = payload.cover.name;
      }

      await completeUploadMutateAsync({
        title: payload.title || payload.file.name.replace(/\.[^.]+$/, ''),
        author: payload.author || undefined,
        description: payload.description || undefined,
        status: 'not_started',
        visibility: 'private',
        file: {
          key: pdfPresign.key,
          mime: payload.file.type || 'application/pdf',
          size: payload.file.size,
          originalName: payload.file.name,
        },
        cover: coverKey
          ? {
              key: coverKey,
              mime: coverMime,
              size: coverSize,
              originalName: coverOriginalName,
            }
          : undefined,
      });
      onClose();
    } catch (err: unknown) {
      console.log(`'Failed to upload book. Please try again.'`, err);
    }
  };

  return (
    <form
      onSubmit={methods.handleSubmit(handleSubmit)}
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
      <Controller
        name='cover'
        control={methods.control}
        render={({ field, fieldState }) => (
          <DropZone
            label='Cover Image (optional)'
            accept='image/*'
            {...field}
            error={fieldState.error?.message}
          />
        )}
      />
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
        <Button type='submit' disabled={isSubmitting}>
          {isSubmitting ? 'Uploading…' : 'Upload'}
        </Button>
      </div>
    </form>
  );
};

export const Dashboard = () => {
  const uploadModal = useModal({
    content: ({ close }) => <UploadBookForm onClose={close} />,
  });

  return (
    <div className='flex flex-col gap-5'>
      <div className='flex justify-between items-center'>
        <h1 className='text-xl font-semibold'>Dashboard</h1>
        <Button onClick={() => uploadModal.open({})}>Upload Book</Button>
      </div>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-5'>LIBRIS</div>
      <Modal {...uploadModal} />
    </div>
  );
};
