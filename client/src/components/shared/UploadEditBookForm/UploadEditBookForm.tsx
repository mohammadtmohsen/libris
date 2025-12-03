import { Controller, UseFormReturn } from 'react-hook-form';
import { DropZone } from '../DropZone/DropZone';
import { Input } from '../Input/Input';
import { Button } from '../Button/Button';
import { Book } from '_queries/booksQueries';
import { CustomSelect } from '../CustomSelect/CustomSelect';
import { ARABIC_BOOK_TAGS, READING_STATUSES } from '_constants/filtersOptions';

export type UploadEditBookFormPayload = {
  title: string;
  author: string;
  description: string;
  file?: File | null;
  tags: string[];
  status: Book['status'];
};

export const UploadEditBookForm = ({
  onSubmit,
  methods,
  onCancel,
  isSubmitting,
  isEdit = false,
  book,
  onDelete,
}: {
  onSubmit: (
    next: () => void
  ) => (e?: React.BaseSyntheticEvent) => Promise<void>;
  methods: UseFormReturn<UploadEditBookFormPayload>;
  onCancel: () => void;
  isSubmitting: boolean;
  isEdit?: boolean;
  book?: Book;
  onDelete?: (next: () => void) => Promise<void>;
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
      <Controller
        name='tags'
        control={methods.control}
        render={({ field, fieldState }) => (
          <CustomSelect
            options={ARABIC_BOOK_TAGS}
            placeholder='Select by category'
            label='Category'
            isMulti
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        name='status'
        control={methods.control}
        render={({ field, fieldState }) => (
          <CustomSelect
            options={READING_STATUSES}
            placeholder='Select reading status'
            label='Reading Status'
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />
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
        {isEdit && onDelete && (
          <Button
            type='button'
            onClick={() => onDelete(onCancel)}
            disabled={isSubmitting}
            loading={isSubmitting}
          >
            Delete
          </Button>
        )}
      </div>
    </form>
  );
};
