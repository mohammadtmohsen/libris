import clsx from 'clsx';
import React from 'react';

type ProgressBarProps = {
  pageCount?: number;
  pagesRead?: number;
  className?: string;
  withLabel?: boolean;
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  pageCount,
  pagesRead,
  className,
  withLabel = false,
}) => {
  const barRef = React.useRef<HTMLDivElement>(null);
  const labelRef = React.useRef<HTMLSpanElement>(null);
  const [labelFillPercent, setLabelFillPercent] = React.useState(0);

  const total = typeof pageCount === 'number' && pageCount > 0 ? pageCount : 0;

  const current =
    typeof pagesRead === 'number' && pagesRead >= 0 ? pagesRead : 0;

  const percent =
    total > 0
      ? Math.min(100, Math.max(0, Math.round((current / total) * 100)))
      : 0;

  const updateLabelFill = React.useCallback(() => {
    const barElement = barRef.current;
    const labelElement = labelRef.current;

    if (!barElement || !labelElement) {
      setLabelFillPercent(0);
      return;
    }

    const barWidth = barElement.getBoundingClientRect().width;
    const labelWidth = labelElement.getBoundingClientRect().width;

    if (!barWidth || !labelWidth) {
      setLabelFillPercent(0);
      return;
    }

    const filledWidth = (percent / 100) * barWidth;
    const fillPercent = Math.min(
      100,
      Math.max(0, (filledWidth / labelWidth) * 100)
    );

    setLabelFillPercent(fillPercent);
  }, [percent]);

  React.useEffect(() => {
    if (!withLabel) {
      setLabelFillPercent(0);
      return;
    }

    updateLabelFill();

    const barElement = barRef.current;
    let resizeObserver: ResizeObserver | null = null;

    if (typeof ResizeObserver !== 'undefined' && barElement) {
      resizeObserver = new ResizeObserver(() => updateLabelFill());
      resizeObserver.observe(barElement);
    } else {
      window.addEventListener('resize', updateLabelFill);
    }

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updateLabelFill);
    };
  }, [updateLabelFill, withLabel, current, total]);

  return (
    <div
      ref={barRef}
      className={clsx('relative h-1.5 w-full bg-transparent', className)}
    >
      {withLabel && (
        <span
          ref={labelRef}
          className='absolute bottom-0 left-2 shrink-0 whitespace-nowrap rounded-full bg-gradient-to-r from-blue-1 via-blue-2 to-blue-1 px-1 text-[10px] text-white-1 shadow-sm transition-all'
          style={{
            backgroundSize: `${labelFillPercent}% 100%`,
            backgroundRepeat: 'no-repeat',
          }}
          dir='ltr'
        >
          {current} / {total} pages
        </span>
      )}
      <div
        className='h-full rounded-full bg-gradient-to-r from-blue-1 via-blue-2 to-blue-3 transition-all'
        style={{ width: `${percent}%` }}
      />
    </div>
  );
};
