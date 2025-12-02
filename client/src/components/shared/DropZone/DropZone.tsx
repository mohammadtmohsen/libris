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
            'flex flex-col gap-2 rounded-secondary p-4 cursor-pointer transition-colors',
            'border border-dashed',
            error
              ? 'border-red-1 hover:bg-black-2/50'
              : 'border-blue-4 hover:bg-black-2/50'
          )}
        >
          <span className='text-sm font-semibold'>{label}</span>
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
          <div className='text-xs text-white/70'>
            {currentFile
              ? `Selected: ${currentFile.name}`
              : `Drag & drop or click to choose (${accept})`}
          </div>
        </label>
        {error && <p className='text-red-1 text-sm mt-1'>{error}</p>}
      </div>
    );
  }
);

DropZone.displayName = 'DropZone';
