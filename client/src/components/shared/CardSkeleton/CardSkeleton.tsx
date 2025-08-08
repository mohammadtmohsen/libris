import clsx from 'clsx';

interface CardSkeletonProps {
  count?: number;
  loading?: boolean;
  rows?: number;
  className?: string;
}

export const CardSkeleton = ({
  count = 6,
  loading = true,
  rows = 2,
  className,
}: CardSkeletonProps) => {
  if (!loading) return null;

  return (
    <div className={clsx('grid grid-cols-1 gap-4', className)}>
      {[...Array(count)].map((_, index) => (
        <div
          key={index}
          className='bg-black-5 rounded-secondary p-5 animate-pulse'
        >
          <div className='h-6 bg-black-3 rounded mb-4'></div>
          <div className='space-y-2 mb-4'>
            {[...Array(rows)].map((_, rowIndex) => (
              <div key={rowIndex} className='h-4 bg-black-3 rounded'></div>
            ))}
          </div>
          <div className='h-4 bg-black-3 rounded'></div>
        </div>
      ))}
    </div>
  );
};
