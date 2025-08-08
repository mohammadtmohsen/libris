import clsx from 'clsx';
import { forwardRef } from 'react';

export interface TabOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface TabsProps {
  options: TabOption[];
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  containerClass?: string;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      options,
      value,
      onChange,
      className = '',
      containerClass = '',
      variant = 'default',
      size = 'md',
      fullWidth = false,
    },
    ref
  ) => {
    const handleTabClick = (tabValue: string, disabled?: boolean) => {
      if (!disabled && onChange) {
        onChange(tabValue);
      }
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    const getVariantClasses = () => {
      switch (variant) {
        case 'pills':
          return {
            container: 'bg-black-5 p-1 rounded-primary',
            tab: 'rounded-primary transition-all duration-200',
            active: 'bg-blue-4 text-white-1 shadow-sm',
            inactive: 'text-white-4 hover:bg-black-3 hover:text-white-1',
          };
        case 'underline':
          return {
            container: 'border-b-2 border-black-3',
            tab: 'border-b-2 border-transparent transition-all duration-200 relative',
            active: 'border-blue-4 text-blue-1',
            inactive: 'text-white-4 hover:text-white-1 hover:border-white-6',
          };
        default:
          return {
            container: 'bg-black-5 rounded-primary overflow-hidden',
            tab: 'transition-all duration-200 border-r border-black-3 last:border-r-0',
            active: 'bg-blue-4 text-white-1',
            inactive:
              'bg-black-5 text-white-4 hover:bg-black-3 hover:text-white-1',
          };
      }
    };

    const variantClasses = getVariantClasses();

    return (
      <div className={clsx('w-full', containerClass)}>
        <div
          ref={ref}
          className={clsx(
            'flex',
            fullWidth ? 'w-full' : 'w-fit',
            variantClasses.container,
            className
          )}
          role='tablist'
          aria-label='Tabs'
        >
          {options.map((option) => (
            <button
              key={option.value}
              type='button'
              role='tab'
              aria-selected={value === option.value}
              aria-disabled={option.disabled}
              onClick={() => handleTabClick(option.value, option.disabled)}
              disabled={option.disabled}
              className={clsx(
                'font-medium transition-colors duration-200 focus:outline-none focus:ring-0',
                sizeClasses[size],
                variantClasses.tab,
                fullWidth ? 'flex-1' : '',
                value === option.value
                  ? variantClasses.active
                  : variantClasses.inactive,
                option.disabled
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer',
                'whitespace-nowrap'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    );
  }
);

Tabs.displayName = 'Tabs';
