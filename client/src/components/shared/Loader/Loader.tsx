import clsx from 'clsx';
import { colors } from '_constants/colors';
import type { HTMLAttributes } from 'react';

type LoaderProps = {
  loading?: boolean;
  size?: number;
  color?: string;
  thickness?: number;
  className?: string;
  ariaLabel?: string;
  role?: string;
} & HTMLAttributes<HTMLSpanElement>;

export const Loader = ({
  loading = true,
  size = 24,
  color = colors.blue[1],
  thickness = 3,
  className,
  ariaLabel = 'Loading',
  role = 'status',
  style,
  ...rest
}: LoaderProps) => {
  if (!loading) return null;
  const spinnerSize = Math.max(12, size);
  const spinnerBorder = Math.max(2, Math.min(8, thickness));

  return (
    <span
      className={clsx('inline-block rounded-full animate-spin', className)}
      role={role}
      aria-label={ariaLabel}
      style={{
        width: spinnerSize,
        height: spinnerSize,
        borderWidth: spinnerBorder,
        borderStyle: 'solid',
        borderColor: color,
        borderTopColor: 'transparent',
        ...style,
      }}
      {...rest}
    />
  );
};
