import clsx from 'clsx';
import { Icon } from '../Icon/Icon';

type NoDataProps = {
  title?: string;
  subtitle?: string;
  hints?: string[];
  className?: string;
  withBackdrop?: boolean;
};

export const NoData = ({
  title = 'No books found',
  subtitle = 'Try adjusting your search or filters to discover more titles.',
  hints = ['Clear filters', 'Check spelling', 'Upload a new book'],
  className,
  withBackdrop = false,
}: NoDataProps) => {
  return (
    <div
      className={clsx(
        'relative isolate w-full px-0 sm:px-2',
        withBackdrop && 'flex items-center justify-center',
        className
      )}
    >
      {withBackdrop && (
        <>
          <div className='absolute inset-0 -z-20 bg-gradient-to-br from-black-5/45 via-black-4/35 to-blue-5/40 backdrop-blur-lg' />
          <div className='absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_20%,rgba(123,97,255,0.2),transparent_38%),radial-gradient(circle_at_82%_24%,rgba(97,231,166,0.16),transparent_32%),radial-gradient(circle_at_50%_80%,rgba(42,34,88,0.55),transparent_44%)] opacity-80 blur-3xl' />
        </>
      )}
      <div className='relative mx-auto w-full max-w-4xl overflow-hidden rounded-secondary border border-white/12 bg-gradient-to-b from-blue-5/90 via-black-4/90 to-black-5/95 shadow-[0_30px_120px_rgba(0,0,0,0.6)]'>
        <div className='absolute inset-0 bg-gradient-to-br from-black-5/45 via-black-4/35 to-blue-5/40 backdrop-blur-lg' />
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(123,97,255,0.2),transparent_38%),radial-gradient(circle_at_82%_24%,rgba(97,231,166,0.16),transparent_32%),radial-gradient(circle_at_50%_80%,rgba(42,34,88,0.55),transparent_44%)] opacity-70 blur-3xl' />
        <div className='absolute -left-12 -top-24 h-64 w-64 rounded-full bg-blue-1/25 blur-3xl' />
        <div className='absolute -right-10 bottom-[-120px] h-72 w-72 rounded-full bg-green-1/20 blur-3xl' />
        <div className='relative z-10 flex flex-col gap-6 px-6 py-8 sm:px-10 sm:py-12 md:flex-row md:items-center md:justify-between'>
          <div className='flex items-center gap-4 sm:gap-6'>
            <div className='relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-2/40 to-blue-4/70 shadow-[0_12px_36px_rgba(123,97,255,0.35)] sm:h-20 sm:w-20'>
              <div className='absolute inset-0 rounded-full border border-white/15' />
              <div className='absolute inset-[6px] rounded-full bg-black-1/80 backdrop-blur-md' />
              <Icon
                type='book'
                className='relative text-white'
                fontSize='large'
              />
            </div>
            <div className='space-y-2'>
              <p className='text-lg font-semibold text-white sm:text-xl'>
                {title}
              </p>
              <p className='text-sm text-white/70 sm:text-base'>{subtitle}</p>
              <div className='flex flex-wrap gap-2'>
                {hints.map((hint) => (
                  <span
                    key={hint}
                    className='rounded-full border border-white/12 bg-white/8 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-white/70 backdrop-blur-[2px]'
                  >
                    {hint}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className='relative w-full max-w-sm overflow-hidden rounded-secondary border border-white/10 bg-white/5 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.25)]'>
            <div className='absolute inset-0 bg-gradient-to-br from-blue-1/20 via-white/5 to-green-1/15 opacity-70' />
            <div className='relative flex flex-col gap-3 text-white/80'>
              <div className='h-3 w-3/4 rounded-full bg-gradient-to-r from-white/70 via-white/25 to-white/60' />
              <div className='h-3 w-full rounded-full bg-gradient-to-r from-blue-1/70 via-white/25 to-blue-2/60' />
              <div className='h-3 w-2/3 rounded-full bg-gradient-to-r from-white/60 via-white/25 to-green-1/50' />
              <div className='grid grid-cols-3 gap-3 pt-1'>
                <div className='h-14 rounded-secondary bg-white/10 shadow-inner shadow-blue-1/30' />
                <div className='h-14 rounded-secondary bg-white/10 shadow-inner shadow-blue-1/30' />
                <div className='h-14 rounded-secondary bg-white/10 shadow-inner shadow-blue-1/30' />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
