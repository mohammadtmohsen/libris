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
  const coverUrl = book?.cover?.coverUrl;

  return (
    <form
      onSubmit={onSubmit(onCancel)}
      className='m-auto w-[95vw] max-w-5xl space-y-6 rounded-primary bg-black-3/70 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] ring-1 ring-blue-1/15 backdrop-blur-sm'
    >
      <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
        <div>
          <p className='text-xs uppercase tracking-[0.14em] text-white/60'>
            {isEdit ? 'Book details' : 'Upload PDF'}
          </p>
          <h2 className='text-2xl font-semibold text-white leading-tight'>
            {isEdit ? 'Update book details' : 'Upload a new book'}
          </h2>
          <p className='text-sm text-white/70'>
            {isEdit
              ? 'PDF stays as-is; refresh the title, author, and metadata.'
              : 'Drag a PDF, tweak the metadata, and keep the library polished.'}
          </p>
        </div>
        {isEdit && (
          <span className='inline-flex items-center gap-2 rounded-full bg-blue-1/15 px-3 py-1 text-xs text-blue-1'>
            Editing existing book
          </span>
        )}
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_1fr]'>
        <div className='space-y-4 rounded-primary bg-black-2/60 p-5 shadow-inner shadow-black/40 ring-1 ring-blue-1/15'>
          {!isEdit ? (
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
                    if (f) {
                      methods.setValue('title', f.name.replace(/\.[^.]+$/, ''));
                    }
                  }}
                  error={fieldState.error?.message}
                />
              )}
              rules={{ required: 'This Field is required' }}
            />
          ) : (
            <div className='grid grid-cols-1 gap-3 rounded-primary bg-gradient-to-br from-blue-1/12 via-black/55 to-blue-1/20 p-4 sm:p-5 shadow-[0_10px_50px_rgba(0,0,0,0.35)] ring-1 ring-blue-1/15'>
              <div className='flex items-center justify-between gap-3'>
                <div className='flex flex-col'>
                  <span className='text-[11px] uppercase tracking-[0.12em] text-white/60'>
                    Current PDF
                  </span>
                  <span className='text-base font-semibold text-white'>
                    {book?.title}
                  </span>
                  <span className='text-xs text-white/70 line-clamp-1'>
                    {book?.author}
                  </span>
                </div>
                <span className='rounded-full bg-blue-1/15 px-3 py-1 text-[11px] uppercase tracking-[0.08em] text-blue-1 backdrop-blur-[1px]'>
                  PDF locked
                </span>
              </div>
              <div className='relative overflow-hidden rounded-primary bg-black/40 ring-1 ring-blue-1/15'>
                <div className='absolute inset-0 bg-gradient-to-b from-black/25 via-black/50 to-black/80' />
                <img
                  src={coverUrl}
                  className='aspect-[3/4] w-full object-cover'
                  alt={book?.title || 'Book cover'}
                />
                <div className='absolute inset-0 flex items-end justify-between p-4 text-white'>
                  <div className='space-y-1 text-sm'>
                    <div className='text-xs uppercase tracking-[0.08em] text-white/70'>
                      Thumbnail
                    </div>
                    <div className='text-lg font-semibold leading-tight drop-shadow'>
                      {book?.title}
                    </div>
                    <div className='text-xs text-white/75'>
                      {book?.author}
                    </div>
                  </div>
                  <div className='rounded-full bg-blue-1/20 px-3 py-1 text-xs text-blue-1 backdrop-blur-[2px]'>
                    View only
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className='space-y-4 rounded-primary bg-black-2/60 p-5 shadow-inner shadow-black/40 ring-1 ring-blue-1/15'>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <Controller
              name='title'
              control={methods.control}
              render={({ field, fieldState }) => (
                <Input
                  label='Title'
                  placeholder='Book title'
                  dir='rtl'
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
                  dir='rtl'
                  {...field}
                  error={fieldState.error?.message}
                />
              )}
              rules={{ required: 'This Field is required ' }}
            />
          </div>
          <Controller
            name='tags'
            control={methods.control}
            render={({ field, fieldState }) => (
              <CustomSelect
                options={ARABIC_BOOK_TAGS}
                placeholder='Select by category'
                label='Category'
                dir='rtl'
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
                dir='rtl'
                {...field}
                error={fieldState.error?.message}
              />
            )}
          />
        </div>
      </div>

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
