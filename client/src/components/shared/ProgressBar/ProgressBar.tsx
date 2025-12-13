import clsx from 'clsx';
import React from 'react';
import { colors } from '_constants/colors';

type ProgressBarProps = {
  pageCount?: number;
  pagesRead?: number;
  className?: string;
  withLabel?: boolean;
  accentGradient?: string[];
  accentLabelGradient?: string[];
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  pageCount,
  pagesRead,
  className,
  withLabel = false,
  accentGradient,
  accentLabelGradient,
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

  const fallbackBarGradient = accentGradient?.length
    ? accentGradient
    : [colors.blue[1], colors.blue[2], colors.blue[3]];

  const fallbackLabelGradient = accentLabelGradient?.length
    ? accentLabelGradient
    : accentGradient?.length
    ? accentGradient
    : [colors.blue[1], colors.blue[2], colors.blue[1]];

  const barGradientStyle = `linear-gradient(90deg, ${fallbackBarGradient.join(
    ', '
  )})`;
  const labelGradientStyle = `linear-gradient(90deg, ${fallbackLabelGradient.join(
    ', '
  )})`;

  return (
    <div
      ref={barRef}
      className={clsx('relative h-1.5 w-full bg-transparent', className)}
    >
      {withLabel && (
        <span
          ref={labelRef}
          className='absolute bottom-0 left-2 shrink-0 whitespace-nowrap rounded-full px-1 text-[10px] text-white-1 shadow-sm transition-all'
          style={{
            backgroundImage: labelGradientStyle,
            backgroundSize: `${labelFillPercent}% 100%`,
            backgroundRepeat: 'no-repeat',
          }}
          dir='ltr'
        >
          {current} / {total} pages
        </span>
      )}
      <div
        className='h-full rounded-full transition-all'
        style={{ width: `${percent}%`, backgroundImage: barGradientStyle }}
      />
    </div>
  );
};
