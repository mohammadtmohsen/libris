import clsx from 'clsx';

type ShimmerOverlayProps = {
  className?: string;
};

export const ShimmerOverlay = ({ className }: ShimmerOverlayProps) => {
  return (
    <div
      aria-hidden='true'
      className={clsx(
        'pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-[inherit]',
        className
      )}
    >
      <div className='absolute inset-0 bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.3),transparent)] backdrop-blur-[1px] motion-safe:animate-shimmer' />
    </div>
  );
};
