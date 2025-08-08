import { forwardRef } from 'react';
import clsx from 'clsx';
import { ControllerRenderProps } from 'react-hook-form';
import { Icon } from '../Icon/Icon';

export type IncrementDecrementInputProps = {
  label?: string;
  error?: string;
  containerClass?: string;
  className?: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  disabled?: boolean;
} & Partial<ControllerRenderProps>;

export const IncrementDecrementInput = forwardRef<
  HTMLDivElement,
  IncrementDecrementInputProps
>(
  (
    {
      label,
      error,
      containerClass,
      className,
      min = 0,
      max = 100,
      step = 1,
      placeholder,
      disabled = false,
      value = '',
      onChange,
    },
    _ref
  ) => {
    const numericValue = Number(value) || 0;

    const handleIncrement = () => {
      if (disabled) return;
      const newValue = Math.min(numericValue + step, max);
      onChange?.(newValue);
    };

    const handleDecrement = () => {
      if (disabled) return;
      const newValue = Math.max(numericValue - step, min);
      onChange?.(newValue);
    };

    return (
      <div className={clsx('w-full', containerClass)}>
        {label && (
          <label className='block text-sm font-medium mb-1 text-white-1'>
            {label}
          </label>
        )}

        <div className='relative flex flex-col items-center'>
          {/* Increment Button */}
          <button
            type='button'
            onClick={handleIncrement}
            disabled={disabled || numericValue >= max}
            className={clsx(
              'flex shrink-0 items-center justify-center w-full h-[30px]',
              'rounded-t-primary border-2 border-b-0',
              'bg-black-3 text-white-1 transition-colors',
              'hover:bg-black-2 focus:outline-none focus:ring-0',
              'disabled:cursor-not-allowed',
              error
                ? 'border-red-1 hover:border-red-1'
                : 'border-white-2 hover:border-white-1'
            )}
          >
            <Icon
              type='add'
              fontSize='small'
              className={clsx(
                'transition-opacity',
                (disabled || numericValue >= max) && 'opacity-50'
              )}
            />
          </button>

          {/* Display Value */}
          <span
            className={clsx(
              'w-full py-3 text-center border-2 text-sm transition-colors',
              'bg-black-5 text-white-1 flex items-center justify-center',
              'disabled:opacity-50 h-[30px]',
              'border-t-0 border-b-0',
              error ? 'border-red-1' : 'border-white-2',
              className
            )}
          >
            {value || placeholder}
          </span>

          {/* Decrement Button */}
          <button
            type='button'
            onClick={handleDecrement}
            disabled={disabled || numericValue <= min}
            className={clsx(
              'flex shrink-0 items-center justify-center w-full h-[30px]',
              'rounded-b-primary border-2 border-t-0',
              'bg-black-3 text-white-1 transition-colors',
              'hover:bg-black-2 focus:outline-none focus:ring-0',
              'disabled:cursor-not-allowed',
              error
                ? 'border-red-1 hover:border-red-1'
                : 'border-white-2 hover:border-white-1'
            )}
          >
            <Icon
              type='remove'
              fontSize='small'
              className={clsx(
                'transition-opacity',
                (disabled || numericValue <= min) && 'opacity-50'
              )}
            />
          </button>
        </div>

        {error && <p className='text-red-1 text-sm mt-1'>{error}</p>}
      </div>
    );
  }
);

IncrementDecrementInput.displayName = 'IncrementDecrementInput';
