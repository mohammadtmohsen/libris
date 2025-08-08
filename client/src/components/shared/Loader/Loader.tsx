import { CircularProgress, Skeleton } from '@mui/material';
import { colors } from '_constants/colors';
import clsx from 'clsx';

export const Loader = ({
  loading,
  className,
  circularSize = 50,
  circularThickness = 5,
  type = 'circular',
  SkeletonHeight = 18,
}: {
  loading: boolean;
  type?: 'circular' | 'skeleton';
  className?: string;
  circularSize?: number;
  circularThickness?: number;
  SkeletonHeight?: number;
}) => {
  if (!loading) {
    return null;
  }

  return type === 'circular' ? (
    <div
      className={clsx(
        'absolute top-0 right-0 bottom-0 left-0 flex items-center text-blue-1 justify-center gap-2 bg-blue-6/25',
        className
      )}
    >
      <CircularProgress
        size={circularSize}
        thickness={circularThickness}
        color='inherit'
      />
    </div>
  ) : (
    <Skeleton
      variant='rectangular'
      height={SkeletonHeight}
      width={'full'}
      sx={{ bgcolor: colors.blue[7] }}
    />
  );
};
