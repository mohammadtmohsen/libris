import { forwardRef, InputHTMLAttributes } from 'react';
import clsx from 'clsx';
import { ControllerRenderProps } from 'react-hook-form';

export type DropZoneProps = {
  label: string;
  accept: string;
  containerClass?: string;
  error?: string;
  file?: File | null;
  onFile?: (file: File | null) => void;
} & Partial<ControllerRenderProps> &
  InputHTMLAttributes<HTMLInputElement>;

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

export const DropZone = forwardRef<HTMLInputElement, DropZoneProps>(
  (
    {
      label,
      accept,
      containerClass,
      error,
      file,
      onFile,
      value,
      onChange,
      onBlur,
      name,
      className,
      ...rest
    },
    ref
  ) => {
    const currentFile: File | null = (value as File | null) ?? file ?? null;
    const setFile = (f: File | null) => {
      if (onChange) (onChange as unknown as (value: File | null) => void)(f);
      else if (onFile) onFile(f);
    };

    const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      const droppedFile = e.dataTransfer.files?.[0] || null;
      setFile(droppedFile);
    };

    return (
      <div className={clsx('w-full', containerClass)}>
        <label
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={clsx(
            'relative flex flex-col gap-4 overflow-hidden rounded-primary p-4 sm:p-5 cursor-pointer transition-all duration-200',
            'border border-dashed backdrop-blur-[2px]',
            error
              ? 'border-red-1/80 bg-red-1/10 hover:border-red-1 hover:bg-red-1/15'
              : 'border-blue-1/70 bg-gradient-to-br from-black/70 via-black/40 to-blue-1/15 hover:border-blue-1 hover:shadow-[0_15px_45px_rgba(0,0,0,0.35)]'
          )}
        >
          <div className='absolute inset-0 pointer-events-none opacity-60 bg-[radial-gradient(circle_at_30%_20%,rgba(102,170,255,0.25),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.18),transparent_30%)]' />
          <span className='relative text-sm font-semibold text-white drop-shadow-sm'>
            {label}
          </span>
          <input
            {...rest}
            ref={ref}
            name={name}
            type='file'
            accept={accept}
            className={clsx('hidden', className)}
            onBlur={onBlur}
            onChange={(e) => {
              const f = e.target.files?.[0] || null;
              setFile(f);
            }}
          />
          <div className='relative flex items-center gap-3 text-left text-white'>
            <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15 shadow-inner shadow-black/50'>
              <svg
                width='28'
                height='28'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
                className='text-blue-1'
              >
                <path
                  d='M12 3v12m0 0 4-4m-4 4-4-4M6 21h12'
                  stroke='currentColor'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </div>
            <div className='flex flex-col gap-1 text-sm'>
              <div className='font-semibold leading-tight text-white'>
                {currentFile
                  ? 'Ready to upload'
                  : 'Drop your PDF or click to browse'}
              </div>
              <div className='text-xs text-white/70 leading-snug line-clamp-2'>
                {currentFile
                  ? `${currentFile.name}${
                      currentFile.size
                        ? ` · ${formatBytes(currentFile.size)}`
                        : ''
                    }`
                  : `We accept ${
                      accept || 'files'
                    }. We’ll auto-name using the file title.`}
              </div>
            </div>
          </div>
          <div className='relative flex flex-wrap gap-2 text-xs text-white/70'>
            <span className='inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 backdrop-blur-[1px] ring-1 ring-white/10'>
              Drag & drop
            </span>
            <span className='inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 backdrop-blur-[1px] ring-1 ring-white/10'>
              {currentFile ? 'Replace file' : 'Click to browse'}
            </span>
            {currentFile && (
              <span className='inline-flex items-center gap-1 rounded-full bg-blue-1/15 px-3 py-1 text-blue-1 backdrop-blur-[1px] ring-1 ring-blue-1/30'>
                Selected
              </span>
            )}
          </div>
        </label>
        {error && <p className='mt-1 text-sm text-red-1'>{error}</p>}
      </div>
    );
  }
);

DropZone.displayName = 'DropZone';
