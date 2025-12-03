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
        'h-1.5 w-full rounded bg-black-4 overflow-hidden',
        className
      )}
    >
      <div
        className='h-full bg-blue-1 transition-all'
        style={{ width: `${percent}%` }}
      />
    </div>
  );
};
