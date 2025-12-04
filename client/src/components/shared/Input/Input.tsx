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
      const { value } = e.target;
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
          <label className='block text-sm font-medium mb-1 text-white-1 text-left'>
            {label}
          </label>
        )}

        <input
          {...field}
          ref={ref}
          className={clsx(
            'w-full px-4 py-3 rounded-primary border-2 text-sm transition-colors',
            'bg-black-5 text-white-1 placeholder-white-4',
            'focus:outline-none focus:ring-0 focus:border-blue-1',
            'disabled:opacity-50 disabled:cursor-not-allowed h-[40px]',
            error
              ? 'border-red-1 hover:border-red-1 focus:border-red-1'
              : 'border-white-2 hover:border-white-1',
            className
          )}
          type={type}
          onChange={handleChange}
        />

        {error && <p className='text-red-1 text-sm mt-1'>{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
