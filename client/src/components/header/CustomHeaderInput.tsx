import { useEffect, useRef } from 'react';
import { Icon } from '_components/shared';
import clsx from 'clsx';

type CustomHeaderInputProps = {
  value: string;
  placeholder?: string;
  isExpanded: boolean;
  onChange: (value: string) => void;
  onDebouncedChange?: (value: string) => void;
  debounceDelay?: number;
  onClear: () => void;
  onToggleExpand: () => void;
  showClear?: boolean;
  toggleClassName?: string;
};

export const CustomHeaderInput = ({
  value,
  placeholder,
  isExpanded,
  onChange,
  onDebouncedChange,
  debounceDelay = 400,
  onClear,
  onToggleExpand,
  showClear = true,
  toggleClassName = '',
}: CustomHeaderInputProps) => {
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onDebouncedChangeRef = useRef(onDebouncedChange);

  useEffect(() => {
    onDebouncedChangeRef.current = onDebouncedChange;
  }, [onDebouncedChange]);

  useEffect(
    () => () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    },
    []
  );

  const clearDebounce = () => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
      debounceTimeout.current = null;
    }
  };

  const handleInputChange = (nextValue: string) => {
    onChange(nextValue);

    if (!onDebouncedChangeRef.current) {
      clearDebounce();
      return;
    }

    clearDebounce();
    debounceTimeout.current = setTimeout(() => {
      onDebouncedChangeRef.current?.(nextValue);
    }, debounceDelay);
  };

  const handleClear = () => {
    clearDebounce();
    onClear();
  };

  return (
    <div
      className={clsx(
        'group flex flex-row-reverse items-center gap-3 rounded-xl bg-transparent py-2',
        'border-b border-blue-1/15 transition-colors duration-300',
        'focus-within:border-blue-1'
      )}
    >
      <button
        type='button'
        onClick={onToggleExpand}
        className={clsx(
          'p-0 text-blue-1 transition-transform duration-300 ease-in-out hover:text-blue-1 outline-none focus-visible:outline-none',
          isExpanded && 'rotate-180 scale-110',
          toggleClassName
        )}
        aria-label={isExpanded ? 'Collapse filters' : 'Expand filters'}
        aria-expanded={isExpanded}
        style={{ outline: 'none', border: 'none' }}
      >
        <Icon type='filterOn' fontSize='medium' className='text-blue-1' />
      </button>

      <input
        dir='rtl'
        className='flex-1 bg-transparent text-right text-white placeholder-white/55 outline-none focus:outline-none border-none ring-0 text-sm min-w-[100px]'
        placeholder={placeholder}
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
      />

      {showClear && (
        <button
          type='button'
          onClick={handleClear}
          className='p-0 text-blue-1 transition hover:text-blue-1 focus:outline-none'
          aria-label='Clear search and filters'
        >
          <Icon type='filterOff' fontSize='medium' className='text-blue-1' />
        </button>
      )}
    </div>
  );
};
