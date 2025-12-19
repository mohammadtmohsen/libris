import clsx from 'clsx';
import { Controller, UseFormReturn } from 'react-hook-form';
import { useEffect } from 'react';
import type { BaseSyntheticEvent, ReactNode } from 'react';
import { DropZone } from '../DropZone/DropZone';
import { Input } from '../Input/Input';
import { Button } from '../Button/Button';
import { Book } from '_queries/booksQueries';
import { CustomSelect } from '../CustomSelect/CustomSelect';
import { ARABIC_BOOK_TAGS } from '_constants/filtersOptions';
import { parseBookMetadataFromFilename } from '_utils/bookMetadata';

export type UploadEditBookFormPayload = {
  title: string;
  author: string;
  description: string;
  file?: File | null;
  tags: string[];
  publicationYear?: number | '';
  publicationEra?: 'BC' | 'AD' | '';
  seriesId?: string | null;
  part?: number | null | '';
};

export const UploadEditBookForm = ({
  onSubmit,
  methods,
  onCancel,
  onSuccess,
  isSubmitting,
  isEdit = false,
  book,
  onDelete,
  seriesOptions = [],
  isSeriesLoading = false,
}: {
  onSubmit: (next: () => void) => (e?: BaseSyntheticEvent) => Promise<void>;
  methods: UseFormReturn<UploadEditBookFormPayload>;
  onCancel: () => void;
  onSuccess?: () => void;
  isSubmitting: boolean;
  isEdit?: boolean;
  book?: Book;
  onDelete?: (next: () => void) => Promise<void>;
  seriesOptions?: {
    label: string;
    value: string;
    customLabel?: ReactNode;
    totalParts?: number | null;
  }[];
  isSeriesLoading?: boolean;
}) => {
  const coverUrl = book?.cover?.coverUrl;
  const selectedSeriesId = methods.watch('seriesId');
  const selectedSeries = seriesOptions.find(
    (s) => s.value === selectedSeriesId
  );

  useEffect(() => {
    if (!selectedSeries?.totalParts) {
      methods.setValue('part', null);
    }
  }, [methods, selectedSeries]);

  return (
    <form
      onSubmit={onSubmit(onSuccess ?? onCancel)}
      className='m-auto w-[100vw] max-w-5xl space-y-6 rounded-primary bg-black-3/70 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] ring-1 ring-blue-1/15 backdrop-blur-sm'
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
                      const parsed = parseBookMetadataFromFilename(f.name);
                      methods.setValue('title', parsed.title);
                      methods.setValue('author', parsed.author || '');
                      methods.setValue(
                        'publicationYear',
                        parsed.publicationYear ?? ''
                      );
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
                    <div className='text-xs text-white/75'>{book?.author}</div>
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
          <div className='flex items-center gap-2'>
            <div className='flex-1'>
              <Controller
                name='seriesId'
                control={methods.control}
                render={({ field, fieldState }) => (
                  <CustomSelect
                    options={seriesOptions}
                    placeholder='Select series (optional)'
                    label='Series'
                    isMulti={false}
                    isClearable
                    dir='rtl'
                    isLoading={isSeriesLoading}
                    value={field.value || null}
                    onChange={(value) => {
                      field.onChange(value);
                      const pickedSeries = seriesOptions.find(
                        (s) => s.value === value
                      );
                      if (!value || !pickedSeries?.totalParts) {
                        methods.setValue('part', null);
                      }
                    }}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </div>
            {selectedSeriesId &&
              typeof selectedSeries?.totalParts === 'number' && (
                <span className='shrink-0 rounded-full bg-blue-1/15 px-3 py-1 text-xs font-semibold text-blue-1 ring-1 ring-blue-1/25 mt-auto'>
                  {selectedSeries.totalParts} Parts
                </span>
              )}
          </div>
          {selectedSeriesId &&
          typeof selectedSeries?.totalParts === 'number' ? (
            <Controller
              name='part'
              control={methods.control}
              rules={{
                validate: (value) => {
                  if (value === '' || value === undefined || value === null)
                    return true;
                  if (typeof value !== 'number') return 'Part must be a number';
                  if (value < 1) return 'Part must be at least 1';
                  if (
                    typeof selectedSeries?.totalParts === 'number' &&
                    value > selectedSeries.totalParts
                  ) {
                    return `Part cannot exceed total parts (${selectedSeries.totalParts})`;
                  }
                  return true;
                },
              }}
              render={({ field, fieldState }) => (
                <Input
                  label='Part (optional)'
                  placeholder='e.g., 1'
                  type='number'
                  min={1}
                  value={field?.value ?? ''}
                  onChange={(v) => field.onChange(v === '' ? null : Number(v))}
                  error={fieldState.error?.message}
                />
              )}
            />
          ) : null}
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]'>
            <Controller
              name='publicationYear'
              control={methods.control}
              render={({ field, fieldState }) => (
                <Input
                  label='Publication Year'
                  placeholder='e.g., 2021 or 350'
                  type='number'
                  min={1}
                  maxLength={9999}
                  value={field?.value || ''}
                  onChange={(v) => {
                    field.onChange(v === '' ? '' : Number(v));
                  }}
                  error={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name='publicationEra'
              control={methods.control}
              render={({ field, fieldState }) => (
                <CustomSelect
                  options={[
                    { label: 'AD', value: 'AD' },
                    { label: 'BC', value: 'BC' },
                  ]}
                  placeholder='Era'
                  label='Era'
                  dir='rtl'
                  isMulti={false}
                  {...field}
                  error={fieldState.error?.message}
                />
              )}
            />
          </div>
        </div>
      </div>

      <div
        className={clsx(
          'flex flex-col gap-3 rounded-primary bg-black-2/60 p-4 shadow-[0_12px_35px_rgba(0,0,0,0.28)] ring-1 ring-blue-1/12 backdrop-blur-[2px] sm:flex-row sm:items-center',
          isEdit && onDelete ? 'sm:justify-between' : 'sm:justify-end'
        )}
      >
        {isEdit && onDelete && (
          <Button
            type='button'
            variant='dangerOutline'
            onClick={() => onDelete(onCancel)}
            disabled={isSubmitting}
            className='w-full sm:w-auto'
          >
            Delete
          </Button>
        )}
        <div className='flex flex-wrap justify-end gap-3 sm:justify-end'>
          <Button
            type='button'
            variant='neutral'
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type='submit'
            disabled={isSubmitting}
            className='min-w-[110px]'
          >
            {isEdit ? 'Save' : 'Upload'}
          </Button>
        </div>
      </div>
    </form>
  );
};
