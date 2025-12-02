import { Controller, UseFormReturn } from 'react-hook-form';
import { DropZone } from '../DropZone/DropZone';
import { Input } from '../Input/Input';
import { Button } from '../Button/Button';
import { Book } from '_queries/booksQueries';

export type UploadEditBookFormPayload = {
  title: string;
  author: string;
  description: string;
  file: File | null;
};

export const UploadEditBookForm = ({
  onSubmit,
  methods,
  onCancel,
  isSubmitting,
  isEdit = false,
  book,
}: {
  onSubmit: (
    next: () => void
  ) => (e?: React.BaseSyntheticEvent) => Promise<void>;
  methods: UseFormReturn<UploadEditBookFormPayload>;
  onCancel: () => void;
  isSubmitting: boolean;
  isEdit?: boolean;
  book?: Book;
}) => {
  return (
    <form
      onSubmit={onSubmit(onCancel)}
      className='flex flex-col gap-4 m-auto w-[90vw] max-w-xl'
    >
      <h2 className='text-lg font-semibold'>
        {isEdit ? 'Edit Book' : 'Upload a Book'}
      </h2>
      {isEdit && (
        <div className=''>
          <img src={book?.cover?.coverUrl} className='max-h-60 mx-auto' />
        </div>
      )}
      {!isEdit && (
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
          rules={{ required: 'This Field is required' }}
        />
      )}
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

      <div className='flex justify-end gap-3'>
        <Button
          type='button'
          variant='outline'
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type='submit' disabled={isSubmitting} loading={isSubmitting}>
          {isEdit ? 'Save' : 'Upload'}
        </Button>
      </div>
    </form>
  );
};
