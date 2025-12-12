import clsx from 'clsx';
import React from 'react';

type ProgressBarProps = {
  pageCount?: number;
  pagesRead?: number;
  className?: string;
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  pageCount,
  pagesRead,
  className,
}) => {
  const total = typeof pageCount === 'number' && pageCount > 0 ? pageCount : 0;

  const current =
    typeof pagesRead === 'number' && pagesRead >= 0 ? pagesRead : 0;

  const percent =
    total > 0
      ? Math.min(100, Math.max(0, Math.round((current / total) * 100)))
      : 0;

  return (
    <div
      className={clsx(
        'relative h-2 w-full overflow-hidden bg-transparent',
        className
      )}
    >
      <div
        className='h-full rounded-full bg-gradient-to-r from-blue-1 via-blue-2 to-blue-3 transition-all'
        style={{ width: `${percent}%` }}
      />
    </div>
  );
};
