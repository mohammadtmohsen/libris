import { forwardRef } from 'react';
import clsx from 'clsx';
import { ControllerRenderProps } from 'react-hook-form';
import { Icon } from '../Icon/Icon';

export interface RepsOption {
  value: string;
  label: string;
}

export type RepsSelectorProps = {
  label?: string;
  error?: string;
  containerClass?: string;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  options: RepsOption[];
} & Partial<ControllerRenderProps>;

export const RepsSelector = forwardRef<HTMLDivElement, RepsSelectorProps>(
  (
    {
      label,
      error,
      containerClass,
      className,
      placeholder,
      disabled = false,
      options,
      value = '',
      onChange,
    },
    _ref
  ) => {
    const currentIndex = options.findIndex((option) => option.value === value);
    const isValidIndex = currentIndex !== -1;

    const handleIncrement = () => {
      if (disabled) return;
      let nextIndex;
      if (!isValidIndex) {
        nextIndex = 0; // Start from first option if no current selection
      } else {
        nextIndex = (currentIndex + 1) % options.length; // Cycle to beginning if at end
      }
      onChange?.(options[nextIndex].value);
    };

    const handleDecrement = () => {
      if (disabled) return;
      let prevIndex;
      if (!isValidIndex) {
        prevIndex = options.length - 1; // Start from last option if no current selection
      } else {
        prevIndex = currentIndex === 0 ? options.length - 1 : currentIndex - 1; // Cycle to end if at beginning
      }
      onChange?.(options[prevIndex].value);
    };

    const displayValue = isValidIndex
      ? options[currentIndex].label
      : value || placeholder;

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
            disabled={disabled}
            className={clsx(
              'flex shrink-0 items-center justify-center w-full h-[30px]',
              'rounded-t-primary border-2 border-b-0',
              'bg-black-3 text-white-1 transition-colors',
              'hover:bg-black-2 focus:outline-none focus:ring-0',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error
                ? 'border-red-1 hover:border-red-1'
                : 'border-white-2 hover:border-white-1'
            )}
          >
            <Icon
              type='add'
              fontSize='small'
              className={clsx('transition-opacity', disabled && 'opacity-50')}
            />
          </button>

          {/* Display Value */}
          <span
            className={clsx(
              'w-full py-3 text-center border-2 text-sm transition-colors',
              'bg-black-5 text-white-1 flex items-center justify-center',
              'h-[30px] border-t-0 border-b-0',
              disabled && 'opacity-50',
              error ? 'border-red-1' : 'border-white-2',
              className
            )}
          >
            {displayValue}
          </span>

          {/* Decrement Button */}
          <button
            type='button'
            onClick={handleDecrement}
            disabled={disabled}
            className={clsx(
              'flex shrink-0 items-center justify-center w-full h-[30px]',
              'rounded-b-primary border-2 border-t-0',
              'bg-black-3 text-white-1 transition-colors',
              'hover:bg-black-2 focus:outline-none focus:ring-0',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error
                ? 'border-red-1 hover:border-red-1'
                : 'border-white-2 hover:border-white-1'
            )}
          >
            <Icon
              type='remove'
              fontSize='small'
              className={clsx('transition-opacity', disabled && 'opacity-50')}
            />
          </button>
        </div>

        {error && <p className='text-red-1 text-sm mt-1'>{error}</p>}
      </div>
    );
  }
);

RepsSelector.displayName = 'RepsSelector';
