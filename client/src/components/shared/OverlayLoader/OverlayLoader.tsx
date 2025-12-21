import clsx from 'clsx';

type OverlayLoaderProps = {
  show: boolean;
  title?: string;
  subtitle?: string;
  badgeLabel?: string;
  className?: string;
  withBackdrop?: boolean;
  mini?: boolean;
  fullWidth?: boolean;
};

export const OverlayLoader = ({
  show,
  title = 'Updating your library…',
  subtitle = 'We are fetching fresh pages. Keep an eye on the glow while we prep your books.',
  badgeLabel = 'Live Sync',
  className,
  withBackdrop = false,
  mini = false,
  fullWidth = false,
}: OverlayLoaderProps) => {
  if (!show) return null;

  const spinnerSizeClass = mini
    ? 'h-12 w-12 min-w-[3rem] sm:h-14 sm:w-14 sm:min-w-[3.5rem]'
    : 'h-16 w-16 min-w-[4rem] shrink-0 sm:h-20 sm:w-20 sm:min-w-[5rem]';

  const contentPaddingClass = mini ? 'p-4 sm:p-5 md:p-6' : 'p-6 sm:p-8 md:p-10';

  const contentGapClass = mini
    ? 'gap-4 sm:gap-5 md:gap-6'
    : 'gap-6 sm:gap-8 md:gap-10';

  const titleClass = mini
    ? 'text-base font-semibold sm:text-lg'
    : 'text-lg font-semibold sm:text-xl';

  const subtitleClass = mini
    ? 'hidden text-xs text-white/60 sm:block'
    : 'text-sm text-white/70 sm:text-base';

  const badgeTextClass = mini ? 'text-[10px] leading-[14px]' : 'text-xs';

  const skeletonLineClass = mini ? 'h-2.5' : 'h-3';
  const skeletonCardClass = mini ? 'h-12' : 'h-16';

  const outerPaddingClass = fullWidth
    ? 'px-4 sm:px-6'
    : mini
    ? 'px-0 sm:px-0'
    : 'px-4 sm:px-6';

  const cardWidthClass = fullWidth
    ? 'max-w-none'
    : mini
    ? 'max-w-none rounded-none border-x-0 shadow-none sm:rounded-secondary sm:border sm:shadow-[0_20px_80px_rgba(0,0,0,0.45)]'
    : 'max-w-5xl';

  return (
    <div
      className={clsx(
        'relative isolate w-full',
        withBackdrop && 'flex items-center justify-center',
        outerPaddingClass,
        className
      )}
      role='status'
      aria-live='polite'
    >
      {withBackdrop && (
        <>
          <div className='absolute inset-0 -z-20 bg-gradient-to-br from-black-5/45 via-black-4/35 to-blue-5/40 backdrop-blur-lg' />
          <div className='absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_20%,rgba(123,97,255,0.2),transparent_38%),radial-gradient(circle_at_82%_24%,rgba(97,231,166,0.16),transparent_32%),radial-gradient(circle_at_50%_80%,rgba(42,34,88,0.55),transparent_44%)] opacity-80 blur-3xl' />
        </>
      )}
      <div
        className={clsx(
          'relative z-10 flex w-full justify-center',
          outerPaddingClass,
          withBackdrop && 'items-center'
        )}
      >
        <div
          className={clsx(
            'relative mx-auto w-full overflow-hidden rounded-secondary border border-white/12 bg-gradient-to-b from-blue-5/90 via-black-4/90 to-black-5/95 shadow-[0_30px_120px_rgba(0,0,0,0.6)]',
            cardWidthClass
          )}
        >
          <div className='absolute inset-0 bg-gradient-to-br from-black-5/45 via-black-4/35 to-blue-5/40 backdrop-blur-lg' />
          <div className='absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(123,97,255,0.2),transparent_38%),radial-gradient(circle_at_82%_24%,rgba(97,231,166,0.16),transparent_32%),radial-gradient(circle_at_50%_80%,rgba(42,34,88,0.55),transparent_44%)] opacity-70 blur-3xl' />
          <div className='absolute -left-12 -top-24 h-64 w-64 rounded-full bg-blue-1/25 blur-3xl' />
          <div className='absolute -right-10 bottom-[-120px] h-72 w-72 rounded-full bg-green-1/20 blur-3xl' />
          <div
            className={clsx(
              'relative flex flex-col text-white md:flex-row md:items-center',
              mini ? 'md:justify-start' : 'md:justify-between',
              contentGapClass,
              contentPaddingClass
            )}
          >
            <div className='flex items-center gap-4 sm:gap-6 sm:items-start md:items-center'>
              <div className={clsx('relative shrink-0', spinnerSizeClass)}>
                <div className='absolute inset-0 rounded-full bg-gradient-to-br from-blue-2/40 to-blue-4/70 blur' />
                <div className='absolute inset-0 rounded-full border border-white/15' />
                <div className='absolute inset-0 rounded-full border-t-2 border-r-2 border-blue-1 animate-[spin_1.6s_linear_infinite]' />
                <div className='absolute inset-[8px] rounded-full bg-gradient-to-br from-blue-2/80 via-blue-4/70 to-blue-5/80 shadow-[0_12px_36px_rgba(123,97,255,0.35)]' />
                <div className='absolute inset-[18px] rounded-full bg-black-1/80 backdrop-blur-md' />
              </div>
              <div className={clsx('space-y-2 sm:space-y-3', mini && 'flex-1')}>
                <p className={titleClass}>{title}</p>
                <p className={subtitleClass}>{subtitle}</p>
                <div
                  className={clsx(
                    'flex items-center gap-2 uppercase tracking-[0.18em] text-white/50',
                    badgeTextClass
                  )}
                >
                  <span className='h-2 w-2 rounded-full bg-green-1 animate-ping' />
                  <span>{badgeLabel}</span>
                </div>
              </div>
            </div>
            {!mini && (
              <div className='w-full min-w-[260px] sm:min-w-[320px] md:min-w-[360px] md:flex-1'>
                <div className='grid gap-3 rounded-secondary border border-white/10 bg-white/5 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.25)]'>
                  <div
                    className={clsx(
                      'w-4/5 rounded-full bg-gradient-to-r from-white/70 via-white/25 to-white/60 animate-[pulse_1.4s_ease-in-out_infinite]',
                      skeletonLineClass
                    )}
                  />
                  <div
                    className={clsx(
                      'w-full rounded-full bg-gradient-to-r from-blue-1/70 via-white/25 to-blue-2/60 animate-[pulse_1.7s_ease-in-out_infinite]',
                      skeletonLineClass
                    )}
                  />
                  <div
                    className={clsx(
                      'w-3/5 rounded-full bg-gradient-to-r from-white/60 via-white/25 to-green-1/50 animate-[pulse_1.6s_ease-in-out_infinite]',
                      skeletonLineClass
                    )}
                  />
                  <div className='h-2 w-1/2 rounded-full bg-white/25' />
                  <div className='mt-1 grid grid-cols-3 gap-3'>
                    <div
                      className={clsx(
                        'rounded-secondary bg-white/5 shadow-inner shadow-blue-1/30 animate-[pulse_1.5s_ease-in-out_infinite]',
                        skeletonCardClass
                      )}
                    />
                    <div
                      className={clsx(
                        'rounded-secondary bg-white/5 shadow-inner shadow-blue-1/30 animate-[pulse_1.7s_ease-in-out_infinite]',
                        skeletonCardClass
                      )}
                    />
                    <div
                      className={clsx(
                        'rounded-secondary bg-white/5 shadow-inner shadow-blue-1/30 animate-[pulse_1.9s_ease-in-out_infinite]',
                        skeletonCardClass
                      )}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
