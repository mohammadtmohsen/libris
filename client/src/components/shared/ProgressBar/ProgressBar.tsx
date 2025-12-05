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
        'relative h-2 w-full overflow-hidden rounded-full bg-black-3/70 ring-1 ring-blue-1/15 shadow-[0_6px_20px_rgba(0,0,0,0.25)] backdrop-blur-sm border border-white-6 ',
        className
      )}
    >
      <div
        className='h-full rounded-full bg-gradient-to-r from-blue-1/70 via-blue-1 to-blue-1/80 transition-all'
        style={{ width: `${percent}%` }}
      />
    </div>
  );
};
