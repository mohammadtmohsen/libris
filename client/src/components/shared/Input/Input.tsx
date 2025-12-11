import { forwardRef, InputHTMLAttributes } from 'react';
import clsx from 'clsx';
import { ControllerRenderProps } from 'react-hook-form';

export type InputProps = InputHTMLAttributes<HTMLInputElement> &
  Partial<ControllerRenderProps> & {
    label?: string;
    error?: string;
    containerClass?: string;
  };

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, containerClass, className, type, ...field }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target?.value;
      if (type === 'number') {
        if (value === '') {
          return field.onChange?.(value);
        }
        const parsedValue = Number(value);
        if (!Number.isNaN(parsedValue)) {
          return field.onChange?.(parsedValue);
        } else {
          return field.onChange?.(value);
        }
      }
      return field.onChange?.(value);
    };

    return (
      <div className={clsx('w-full', containerClass)}>
        {label && (
          <label className='mb-1 block text-left text-sm font-medium text-white-1'>
            {label}
          </label>
        )}

        <input
          {...field}
          ref={ref}
          className={clsx(
            'h-[44px] w-full px-4 py-3 text-sm transition-colors',
            'bg-black-3/70 text-white placeholder-white/60 backdrop-blur-[2px]',
            'border-0 border-b border-blue-1/15 rounded-none shadow-none',
            'focus:outline-none focus:border-blue-1',
            'hover:border-blue-1/30',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error ? 'border-red-1/60 focus:border-red-1' : 'border-blue-1/15',
            className
          )}
          type={type}
          onChange={handleChange}
        />

        {error && <p className='mt-1 text-sm text-red-1'>{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
