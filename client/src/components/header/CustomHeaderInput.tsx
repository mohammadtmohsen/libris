import { Icon } from '_components/shared';
import clsx from 'clsx';

type CustomHeaderInputProps = {
  value: string;
  placeholder?: string;
  isExpanded: boolean;
  onChange: (value: string) => void;
  onClear: () => void;
  onToggleExpand: () => void;
  showClear?: boolean;
};

export const CustomHeaderInput = ({
  value,
  placeholder,
  isExpanded,
  onChange,
  onClear,
  onToggleExpand,
  showClear = true,
}: CustomHeaderInputProps) => {
  return (
    <div
      className={clsx(
        'group flex flex-row-reverse items-center gap-3 rounded-xl bg-transparent px-3 py-2',
        'border-b border-blue-1/15 transition-colors duration-200',
        'focus-within:border-blue-1'
      )}
    >
      <button
        type='button'
        onClick={onToggleExpand}
        className={clsx(
          'p-0 text-blue-1 transition-all duration-300 hover:text-blue-1 outline-none focus-visible:outline-none',
          isExpanded && 'rotate-180'
        )}
        aria-label={isExpanded ? 'Collapse filters' : 'Expand filters'}
        style={{ outline: 'none', border: 'none' }}
      >
        <Icon type='filterOn' fontSize='medium' className='text-blue-1' />
      </button>

      <input
        dir='rtl'
        className='flex-1 bg-transparent text-right text-white placeholder-white/55 outline-none focus:outline-none border-none ring-0 text-sm'
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />

      {showClear && (
        <button
          type='button'
          onClick={onClear}
          className='p-0 text-blue-1 transition hover:text-blue-1 focus:outline-none'
          aria-label='Clear search and filters'
        >
          <Icon type='filterOff' fontSize='medium' className='text-blue-1' />
        </button>
      )}
    </div>
  );
};
