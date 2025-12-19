import { useMemo, type FormEvent } from 'react';
import clsx from 'clsx';
import { Button, DropZone } from '_components/shared';
import { parseBookMetadataFromFilename } from '_utils/bookMetadata';

type UploadBulkBooksFormProps = {
  files: File[];
  isSubmitting: boolean;
  onFiles: (files: File[]) => void;
  onCancel: () => void;
  onSubmit: () => Promise<void>;
};

const formatBytes = (bytes?: number) => {
  if (!bytes) return '';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    sizes.length - 1
  );
  const value = bytes / 1024 ** i;
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${sizes[i]}`;
};

const getDisplayTitle = (file: File, parsedTitle?: string) =>
  parsedTitle?.trim() || file.name.replace(/\.[^.]+$/, '') || 'Your book';

export const UploadBulkBooksForm = ({
  files,
  isSubmitting,
  onFiles,
  onCancel,
  onSubmit,
}: UploadBulkBooksFormProps) => {
  const parsedFiles = useMemo(
    () =>
      files.map((file) => {
        const parsed = parseBookMetadataFromFilename(file.name);
        return {
          file,
          title: getDisplayTitle(file, parsed.title),
          author: parsed.author,
          publicationYear: parsed.publicationYear,
        };
      }),
    [files]
  );

  const totalSize = useMemo(
    () => files.reduce((sum, file) => sum + (file.size || 0), 0),
    [files]
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await onSubmit();
  };

  const handleFiles = (incoming: File[]) => {
    if (isSubmitting) return;
    onFiles(incoming);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className='m-auto w-[100vw] min-h-[100vh] max-w-5xl space-y-6 rounded-primary bg-black-3/70 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] ring-1 ring-blue-1/15 backdrop-blur-sm'
    >
      <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
        <div>
          <p className='text-xs uppercase tracking-[0.14em] text-white/60'>
            Bulk upload PDFs
          </p>
          <h2 className='text-2xl font-semibold text-white leading-tight'>
            Upload multiple books
          </h2>
          <p className='text-sm text-white/70'>
            We auto-extract the title, author, year, cover thumbnail, and page
            count for every PDF.
          </p>
        </div>
        <span
          className={clsx(
            'inline-flex items-center gap-2 rounded-full bg-blue-1/15 px-3 py-1 text-xs text-blue-1',
            files.length ? 'ring-1 ring-blue-1/25' : 'text-white/50'
          )}
        >
          {files.length ? `${files.length} selected` : 'No files selected yet'}
        </span>
      </div>

      <div className='space-y-4 rounded-primary bg-black-2/60 p-5 shadow-inner shadow-black/40 ring-1 ring-blue-1/15'>
        <DropZone
          label='Book PDFs'
          accept='application/pdf'
          multiple
          selectedFiles={files}
          onFiles={handleFiles}
          disabled={isSubmitting}
        />
        <div className='flex items-center justify-between text-xs uppercase tracking-[0.14em] text-white/60'>
          <span>Selected books</span>
          {files.length ? (
            <span className='text-[11px] normal-case text-white/50'>
              {formatBytes(totalSize)}
            </span>
          ) : null}
        </div>
        {files.length ? (
          <div className='max-h-[280px] space-y-2 overflow-y-auto pr-1'>
            {parsedFiles.map(({ file, title, author, publicationYear }) => {
              const metaParts = [
                author,
                publicationYear ? String(publicationYear) : null,
              ].filter(Boolean);
              return (
                <div
                  key={`${file.name}-${file.size}-${file.lastModified}`}
                  className='flex flex-wrap items-start justify-between gap-3 rounded-xl bg-black/35 px-3 py-2 ring-1 ring-blue-1/12'
                >
                  <div className='flex flex-col gap-1'>
                    <span className='text-sm font-semibold text-white'>
                      {title}
                    </span>
                    {metaParts.length ? (
                      <span className='text-xs text-white/60'>
                        {metaParts.join(' - ')}
                      </span>
                    ) : null}
                    <span className='text-[11px] text-white/40'>
                      {file.name}
                    </span>
                  </div>
                  <span className='text-xs text-white/60'>
                    {formatBytes(file.size)}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className='text-sm text-white/60'>
            Drop PDFs above to start. You can edit details after the upload.
          </p>
        )}
      </div>

      <div className='flex flex-col gap-3 rounded-primary bg-black-2/60 p-4 shadow-[0_12px_35px_rgba(0,0,0,0.28)] ring-1 ring-blue-1/12 backdrop-blur-[2px] sm:flex-row sm:items-center sm:justify-end'>
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
          disabled={isSubmitting || files.length === 0}
          className='min-w-[140px]'
        >
          Upload all
        </Button>
      </div>
    </form>
  );
};
