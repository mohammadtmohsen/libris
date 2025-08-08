import clsx from 'clsx';
import { Icon, IconType } from '../Icon/Icon';
import { forwardRef } from 'react';

export interface ToggleOption {
  value: string;
  label: string;
  icon: IconType;
}

interface ButtonToggleGroupProps {
  options: ToggleOption[];
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  containerClass?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
}

export const ButtonToggleGroup = forwardRef<
  HTMLDivElement,
  ButtonToggleGroupProps
>(
  (
    {
      options,
      value,
      onChange,
      className = '',
      containerClass,
      label,
      error,
      disabled = false,
    },
    ref
  ) => {
    const handleToggle = (optionValue: string) => {
      if (!disabled && onChange) {
        onChange(optionValue);
      }
    };

    return (
      <div className={clsx('w-full h-full flex flex-col', containerClass)}>
        {label && (
          <label className='block text-sm font-medium mb-1 text-white-1 flex-shrink-0'>
            {label}
          </label>
        )}

        <div
          ref={ref}
          className={clsx(
            'flex flex-col w-full flex-1 rounded-primary border-2 overflow-hidden transition-colors',
            error
              ? 'border-red-1 hover:border-red-1 focus-within:border-red-1'
              : 'border-white-2 hover:border-white-1 focus-within:border-blue-1',
            disabled ? 'opacity-50 cursor-not-allowed' : '',
            className
          )}
          role='group'
          aria-label='Toggle group'
        >
          {options.map((option, index) => (
            <button
              key={option.value}
              type='button'
              onClick={() => handleToggle(option.value)}
              disabled={disabled}
              className={clsx(
                'flex items-center justify-center px-3 py-2 text-sm font-medium transition-colors w-full flex-1',
                // Border radius handling
                index === 0 && 'rounded-t-primary',
                index === options.length - 1 && 'rounded-b-primary',
                // Border between buttons
                index > 0 ? 'border-t border-white-2' : '',
                value === option.value
                  ? 'bg-blue-4 text-white-1'
                  : 'bg-black-5 text-white-4 hover:bg-black-3 hover:text-white-1',
                disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                'focus:outline-none focus:ring-0'
              )}
              aria-pressed={value === option.value}
              title={option.label}
            >
              <Icon type={option.icon} fontSize='small' />
            </button>
          ))}
        </div>

        {error && <p className='text-red-1 text-sm mt-1'>{error}</p>}
      </div>
    );
  }
);

ButtonToggleGroup.displayName = 'ButtonToggleGroup';
