import clsx from 'clsx';
import { forwardRef } from 'react';

export type StatusToggleOption = {
  value: string;
  label: string;
  description?: string;
};

type StatusToggleProps = {
  label?: string;
  options: StatusToggleOption[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
};

export const StatusToggle = forwardRef<HTMLDivElement, StatusToggleProps>(
  (
    { label, options, value, onChange, error, disabled = false, className },
    ref
  ) => {
    return (
      <div className={clsx('w-full space-y-2', className)}>
        {label && (
          <p className='text-sm font-semibold text-white/80'>{label}</p>
        )}
        <div
          ref={ref}
          className={clsx(
            'grid grid-cols-1 gap-2 rounded-primary bg-black-3/70 p-2 ring-1 ring-blue-1/15 sm:grid-cols-3 lg:grid-cols-3',
            disabled && 'opacity-60'
          )}
        >
          {options.map((opt) => {
            const isActive = value === opt.value;
            return (
              <button
                key={opt.value}
                type='button'
                disabled={disabled}
                onClick={() => onChange?.(opt.value)}
                className={clsx(
                  'group flex h-full flex-col items-start justify-center gap-1 rounded-primary px-3 py-3 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-1/70',
                  isActive
                    ? 'bg-blue-1/15 text-white shadow-[0_10px_30px_rgba(0,0,0,0.25)] ring-1 ring-blue-1/30'
                    : 'bg-white/5 text-white/80 hover:bg-white/10 hover:text-white ring-1 ring-white/10'
                )}
                aria-pressed={isActive}
              >
                <span className='text-sm font-semibold leading-none'>
                  {opt.label}
                </span>
                {opt.description && (
                  <span className='text-[12px] text-white/65'>
                    {opt.description}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {error && <p className='text-sm text-red-1'>{error}</p>}
      </div>
    );
  }
);

StatusToggle.displayName = 'StatusToggle';
