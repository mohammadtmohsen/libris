import clsx from 'clsx';

type OverlayLoaderProps = {
  show: boolean;
  title?: string;
  subtitle?: string;
  badgeLabel?: string;
  className?: string;
  withBackdrop?: boolean;
};

export const OverlayLoader = ({
  show,
  title = 'Updating your library…',
  subtitle = 'We are fetching fresh pages. Keep an eye on the glow while we prep your books.',
  badgeLabel = 'Live Sync',
  className,
  withBackdrop = false,
}: OverlayLoaderProps) => {
  if (!show) return null;

  return (
    <div
      className={clsx(
        'relative isolate w-full',
        withBackdrop && 'flex items-center justify-center',
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
          'relative z-10 flex w-full justify-center px-4 sm:px-6',
          withBackdrop && 'items-center'
        )}
      >
        <div className='relative mx-auto w-full max-w-5xl overflow-hidden rounded-secondary border border-white/12 bg-gradient-to-b from-blue-5/90 via-black-4/90 to-black-5/95 shadow-[0_30px_120px_rgba(0,0,0,0.6)]'>
          <div className='absolute inset-0 bg-gradient-to-br from-black-5/45 via-black-4/35 to-blue-5/40 backdrop-blur-lg' />
          <div className='absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(123,97,255,0.2),transparent_38%),radial-gradient(circle_at_82%_24%,rgba(97,231,166,0.16),transparent_32%),radial-gradient(circle_at_50%_80%,rgba(42,34,88,0.55),transparent_44%)] opacity-70 blur-3xl' />
          <div className='absolute -left-12 -top-24 h-64 w-64 rounded-full bg-blue-1/25 blur-3xl' />
          <div className='absolute -right-10 bottom-[-120px] h-72 w-72 rounded-full bg-green-1/20 blur-3xl' />
          <div className='relative flex flex-col gap-6 p-6 text-white sm:gap-8 sm:p-8 md:flex-row md:items-center md:justify-between md:gap-10 md:p-10'>
            <div className='flex items-center gap-4 sm:gap-6 sm:items-start md:items-center'>
              <div className='relative h-16 w-16 min-w-[4rem] shrink-0 sm:h-20 sm:w-20 sm:min-w-[5rem]'>
                <div className='absolute inset-0 rounded-full bg-gradient-to-br from-blue-2/40 to-blue-4/70 blur' />
                <div className='absolute inset-0 rounded-full border border-white/15' />
                <div className='absolute inset-0 rounded-full border-t-2 border-r-2 border-blue-1 animate-[spin_1.6s_linear_infinite]' />
                <div className='absolute inset-[8px] rounded-full bg-gradient-to-br from-blue-2/80 via-blue-4/70 to-blue-5/80 shadow-[0_12px_36px_rgba(123,97,255,0.35)]' />
                <div className='absolute inset-[18px] rounded-full bg-black-1/80 backdrop-blur-md' />
              </div>
              <div className='space-y-2 sm:space-y-3'>
                <p className='text-lg font-semibold sm:text-xl'>{title}</p>
                <p className='text-sm text-white/70 sm:text-base'>{subtitle}</p>
                <div className='flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/50'>
                  <span className='h-2 w-2 rounded-full bg-green-1 animate-ping' />
                  <span>{badgeLabel}</span>
                </div>
              </div>
            </div>
            <div className='w-full min-w-[260px] sm:min-w-[320px] md:min-w-[360px] md:flex-1'>
              <div className='grid gap-3 rounded-secondary border border-white/10 bg-white/5 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.25)]'>
                <div className='h-3 w-4/5 rounded-full bg-gradient-to-r from-white/70 via-white/25 to-white/60 animate-[pulse_1.4s_ease-in-out_infinite]' />
                <div className='h-3 w-full rounded-full bg-gradient-to-r from-blue-1/70 via-white/25 to-blue-2/60 animate-[pulse_1.7s_ease-in-out_infinite]' />
                <div className='h-3 w-3/5 rounded-full bg-gradient-to-r from-white/60 via-white/25 to-green-1/50 animate-[pulse_1.6s_ease-in-out_infinite]' />
                <div className='h-2 w-1/2 rounded-full bg-white/25' />
                <div className='mt-1 grid grid-cols-3 gap-3'>
                  <div className='h-16 rounded-secondary bg-white/5 shadow-inner shadow-blue-1/30 animate-[pulse_1.5s_ease-in-out_infinite]' />
                  <div className='h-16 rounded-secondary bg-white/5 shadow-inner shadow-blue-1/30 animate-[pulse_1.7s_ease-in-out_infinite]' />
                  <div className='h-16 rounded-secondary bg-white/5 shadow-inner shadow-blue-1/30 animate-[pulse_1.9s_ease-in-out_infinite]' />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
