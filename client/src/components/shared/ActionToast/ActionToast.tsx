import clsx from 'clsx';

export type ActionToastStatus = 'loading' | 'success' | 'error' | 'info';

type ActionToastProps = {
  show: boolean;
  status?: ActionToastStatus;
  title?: string;
  description?: string;
  onClose?: () => void;
  className?: string;
};

const statusDefaults: Record<
  ActionToastStatus,
  { title: string; description?: string; label: string }
> = {
  loading: {
    title: 'Working on it…',
    description: 'Hang tight while we process your request.',
    label: 'In Progress',
  },
  success: {
    title: 'All set!',
    description: 'Your changes were saved successfully.',
    label: 'Success',
  },
  error: {
    title: 'Something went wrong',
    description: 'Please review and try again.',
    label: 'Error',
  },
  info: {
    title: 'Heads up',
    description: 'We are preparing your update.',
    label: 'Notice',
  },
};

const indicatorGradients: Record<ActionToastStatus, string> = {
  loading: 'from-blue-2/35 via-blue-3/40 to-blue-5/60',
  success: 'from-green-1/35 via-green-2/45 to-green-3/60',
  error: 'from-red-1/30 via-red-2/45 to-red-3/60',
  info: 'from-blue-1/35 via-blue-2/45 to-blue-3/60',
};

const badgeStyles: Record<ActionToastStatus, string> = {
  loading: 'bg-blue-1/15 text-blue-1 ring-blue-1/35',
  success: 'bg-green-1/15 text-green-1 ring-green-1/35',
  error: 'bg-red-1/18 text-red-1 ring-red-1/30',
  info: 'bg-blue-1/18 text-blue-1 ring-blue-1/30',
};

const dotStyles: Record<ActionToastStatus, string> = {
  loading: 'bg-blue-1',
  success: 'bg-green-1',
  error: 'bg-red-1',
  info: 'bg-blue-1',
};

const CloseGlyph = ({ className }: { className?: string }) => (
  <span className={clsx('text-base leading-none', className)} aria-hidden>
    ×
  </span>
);

const StatusGlyph = ({ status }: { status: ActionToastStatus }) => {
  const isLoading = status === 'loading';
  const gradient = indicatorGradients[status];

  return (
    <div className='relative h-11 w-11 shrink-0 sm:h-12 sm:w-12'>
      <div
        className={clsx(
          'absolute inset-0 rounded-full bg-gradient-to-br blur-sm',
          gradient
        )}
      />
      <div className='absolute inset-0 rounded-full border border-white/12 bg-black-3/50 backdrop-blur-sm' />

      {isLoading ? (
        <>
          <div className='absolute inset-0 rounded-full border-t-2 border-r-2 border-blue-1/70 animate-[spin_1.5s_linear_infinite]' />
          <div className='absolute inset-[10px] rounded-full bg-black-1/80 backdrop-blur-sm' />
        </>
      ) : (
        <>
          <div
            className={clsx(
              'absolute inset-0 rounded-full border border-white/15 shadow-[0_12px_30px_rgba(0,0,0,0.35)]',
              status === 'success' && 'border-green-1/45',
              status === 'error' && 'border-red-1/45',
              status === 'info' && 'border-blue-1/45'
            )}
          />
          <div
            className={clsx(
              'absolute inset-[9px] flex items-center justify-center rounded-full bg-gradient-to-br shadow-[0_10px_24px_rgba(0,0,0,0.45)]',
              gradient
            )}
          >
            {status === 'success' ? (
              <Checkmark />
            ) : status === 'error' ? (
              <Cross />
            ) : (
              <PulseDot />
            )}
          </div>
        </>
      )}
    </div>
  );
};

const Checkmark = () => (
  <svg
    aria-hidden
    viewBox='0 0 24 24'
    className='h-5 w-5 stroke-white'
    strokeWidth={2.4}
    fill='none'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M5.5 12.5 10.2 17l8.3-10.5' />
  </svg>
);

const Cross = () => (
  <svg
    aria-hidden
    viewBox='0 0 24 24'
    className='h-5 w-5 stroke-white'
    strokeWidth={2.4}
    fill='none'
    strokeLinecap='round'
  >
    <path d='M7 7l10 10M17 7 7 17' />
  </svg>
);

const PulseDot = () => (
  <span
    className='block h-3 w-3 rounded-full bg-blue-1 animate-pulse'
    aria-hidden
  />
);

export const ActionToast = ({
  show,
  status = 'loading',
  title,
  description,
  onClose,
  className,
}: ActionToastProps) => {
  if (!show) return null;

  const defaults = statusDefaults[status];
  const label = defaults.label;
  const resolvedTitle = title || defaults.title;
  const resolvedDescription =
    description !== undefined ? description : defaults.description;
  const badgeClass = badgeStyles[status];
  const dotClass = dotStyles[status];

  return (
    <div
      className={clsx(
        'pointer-events-none fixed inset-x-3 top-4 z-[999999] flex justify-center sm:top-6',
        className
      )}
      role='status'
      aria-live='polite'
    >
      <div className='pointer-events-auto relative w-full max-w-[500px] overflow-hidden rounded-secondary border border-white/12 bg-gradient-to-br from-blue-5/90 via-black-4/92 to-black-5/95 shadow-[0_26px_110px_rgba(0,0,0,0.55)] ring-1 ring-white/10 backdrop-blur-xl'>
        <div className='absolute inset-0 bg-gradient-to-br from-black-5/45 via-black-4/35 to-blue-5/40 opacity-90' />
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(123,97,255,0.26),transparent_38%),radial-gradient(circle_at_82%_24%,rgba(97,231,166,0.2),transparent_34%),radial-gradient(circle_at_50%_80%,rgba(42,34,88,0.5),transparent_48%)] opacity-70 blur-2xl' />
        <div className='absolute -left-10 -top-16 h-44 w-44 rounded-full bg-blue-1/20 blur-3xl' />
        <div className='absolute -right-12 bottom-[-140px] h-52 w-52 rounded-full bg-green-1/15 blur-3xl' />

        <div className='relative flex items-start gap-3 px-4 py-3 sm:gap-4 sm:px-5 sm:py-4'>
          <StatusGlyph status={status} />
          <div className='flex-1 space-y-1 text-white'>
            <div className='flex flex-wrap items-center gap-2'>
              <p className='text-sm font-semibold leading-tight sm:text-base'>
                {resolvedTitle}
              </p>
              <span
                className={clsx(
                  'inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] ring-1 ring-inset backdrop-blur-[2px] whitespace-nowrap flex-shrink-0',
                  badgeClass
                )}
              >
                <span
                  className={clsx(
                    'h-2 w-2 rounded-full flex-shrink-0',
                    dotClass
                  )}
                />
                <span className='whitespace-nowrap'>{label}</span>
              </span>
            </div>
            {resolvedDescription ? (
              <p className='text-xs leading-relaxed text-white/70 sm:text-sm'>
                {resolvedDescription}
              </p>
            ) : null}
          </div>
          {onClose ? (
            <button
              type='button'
              onClick={onClose}
              className='mt-1 rounded-full p-1 text-white/60 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40'
              aria-label='Dismiss toast'
            >
              <CloseGlyph />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
