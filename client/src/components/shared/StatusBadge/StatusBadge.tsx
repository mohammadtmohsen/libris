import clsx from 'clsx';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Book, useUpdateBookById } from '_queries/booksQueries';

const STATUS_ORDER: Book['status'][] = [
  'not_started',
  'want_to_read',
  'reading',
  'finished',
  'abandoned',
];

const STATUS_CONFIG: Record<
  Book['status'],
  { label: string; badgeClass: string; dotClass: string }
> = {
  not_started: {
    label: 'Not Started',
    badgeClass: 'bg-white-1/25 text-white ring-white-1',
    dotClass: 'bg-white-1',
  },
  want_to_read: {
    label: 'Want to Read',
    badgeClass: 'bg-yellow-1/25 text-yellow-2 ring-yellow-1',
    dotClass: 'bg-yellow-1',
  },
  reading: {
    label: 'Reading',
    badgeClass: 'bg-blue-1/24 text-blue-1 ring-blue-1',
    dotClass: 'bg-blue-1',
  },
  finished: {
    label: 'Finished',
    badgeClass: 'bg-green-1/24 text-green-2 ring-green-1',
    dotClass: 'bg-green-1',
  },
  abandoned: {
    label: 'Abandoned',
    badgeClass: 'bg-red-1/24 text-red-2 ring-red-1/35',
    dotClass: 'bg-red-1',
  },
};

type StatusBadgeProps = {
  status?: Book['status'];
  bookId?: string;
  className?: string;
  condensed?: boolean;
  enableDropdown?: boolean;
  onStatusChange?: (status: Book['status']) => void;
};

export const StatusBadge = ({
  status = 'not_started',
  bookId,
  className,
  condensed = false,
  enableDropdown = true,
  onStatusChange,
}: StatusBadgeProps) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.not_started;
  const sizeClass = condensed
    ? 'px-2.5 py-[6px] text-[10px] gap-1.5'
    : 'px-3.5 py-2 text-[11px] gap-2';
  const dotSize = condensed ? 'h-2.5 w-2.5' : 'h-3 w-3';

  const { mutateAsync: updateBook, isPending: isUpdating } =
    useUpdateBookById();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const canChange = enableDropdown && (!!bookId || !!onStatusChange);

  const availableStatuses = useMemo(
    () => STATUS_ORDER.filter((s) => s !== status),
    [status]
  );

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleSelect = async (nextStatus: Book['status']) => {
    if (!canChange || nextStatus === status) return;
    setOpen(false);
    try {
      if (bookId) {
        await updateBook({
          bookId,
          updateData: { status: nextStatus },
        });
      }
      onStatusChange?.(nextStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  return (
    <div ref={wrapperRef} className='relative inline-block'>
      <button
        type='button'
        aria-haspopup={canChange ? 'listbox' : undefined}
        aria-expanded={open}
        aria-busy={isUpdating}
        disabled={!canChange || isUpdating}
        onClick={(e) => {
          if (!canChange) return;
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className={clsx(
          'inline-flex items-center rounded-full font-semibold uppercase tracking-[0.09em] ring-1 ring-inset shadow-[0_10px_30px_rgba(0,0,0,0.28)] backdrop-blur-[2px]',
          'transition-all duration-200 hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-1/60',
          isUpdating && 'opacity-75',
          config.badgeClass,
          sizeClass,
          canChange ? 'cursor-pointer' : 'cursor-default',
          className
        )}
      >
        <span
          className={clsx(
            'rounded-full shadow-inner shadow-black/30',
            config.dotClass,
            dotSize,
            isUpdating && 'animate-pulse'
          )}
        />
        <span className='leading-none'>{config.label}</span>
      </button>

      {canChange && (
        <div
          className={clsx(
            'absolute left-0 z-20 mt-1 min-w-[160px] max-w-[190px] origin-top-left transition-all duration-150 ease-out space-y-1',
            open
              ? 'translate-y-0 scale-100 opacity-100 pointer-events-auto'
              : '-translate-y-1 scale-95 opacity-0 pointer-events-none'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {availableStatuses.map((s) => {
            const cfg = STATUS_CONFIG[s];
            return (
              <button
                key={s}
                type='button'
                disabled={isUpdating}
                onClick={() => handleSelect(s)}
                className={clsx(
                  'inline-flex w-full items-center justify-start gap-2 rounded-full text-left transition-colors duration-150 ring-1 ring-inset',
                  sizeClass,
                  'hover:bg-white/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-1/60',
                  cfg.badgeClass,
                  isUpdating && 'opacity-70'
                )}
              >
                <span
                  className={clsx(
                    'rounded-full shadow-inner shadow-black/30',
                    cfg.dotClass,
                    dotSize
                  )}
                />
                <span className='flex-1 text-[11px] font-semibold uppercase tracking-[0.08em] leading-none'>
                  {cfg.label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
