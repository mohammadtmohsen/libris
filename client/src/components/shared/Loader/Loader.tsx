import { Skeleton } from '@mui/material';
import { colors } from '_constants/colors';
import clsx from 'clsx';

export const Loader = ({
  loading,
  className,
  circularSize = 50,
  circularThickness = 5,
  type = 'circular',
  SkeletonHeight = 18,
  accentColor,
}: {
  loading: boolean;
  type?: 'circular' | 'skeleton';
  className?: string;
  circularSize?: number;
  circularThickness?: number;
  SkeletonHeight?: number;
  accentColor?: string;
}) => {
  if (!loading) {
    return null;
  }

  if (type === 'skeleton') {
    return (
      <Skeleton
        variant='rectangular'
        height={SkeletonHeight}
        width='100%'
        sx={{ bgcolor: colors.blue[7] }}
      />
    );
  }

  const spinnerSize = Math.max(16, circularSize);
  const spinnerBorder = Math.max(2, Math.min(8, circularThickness));
  const toRgba = (hex: string, alpha: number) => {
    if (
      !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/.test(hex) ||
      Number.isNaN(alpha)
    ) {
      return hex;
    }

    const normalized = hex.slice(1, 7);
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${Math.min(Math.max(alpha, 0), 1)})`;
  };

  const accentBase =
    accentColor && /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/.test(accentColor)
      ? accentColor
      : colors.blue[1];
  const accentGlow = toRgba(accentBase, 0.12);
  const accentHalo = toRgba(accentBase, 0.2);
  const secondaryGlow = toRgba(colors.green[1], 0.1);
  const backdropGlow = `radial-gradient(circle at 25% 28%, ${accentGlow}, transparent 55%), radial-gradient(circle at 72% 70%, ${secondaryGlow}, transparent 52%)`;
  const ringGlow = `radial-gradient(circle at center, ${accentHalo}, transparent 68%)`;

  return (
    <div
      className={clsx(
        'absolute inset-0 flex items-center justify-center overflow-hidden rounded-[inherit]',
        'bg-gradient-to-br from-white/5 via-white/8 to-white/6 text-blue-1 backdrop-blur-[1px]',
        className
      )}
      role='status'
      aria-live='polite'
    >
      <span
        className='pointer-events-none absolute inset-0 blur-2xl'
        style={{ background: backdropGlow }}
      />
      <span className='pointer-events-none absolute inset-[1px] rounded-[inherit] border border-white/12' />

      <div className='relative inline-flex items-center justify-center'>
        <span
          className='pointer-events-none absolute -inset-2 rounded-full opacity-80 blur-lg'
          style={{ background: ringGlow }}
        />
        <span
          className='relative inline-flex items-center justify-center rounded-full border border-white/15 bg-black-1/40 shadow-[0_12px_30px_rgba(0,0,0,0.35)] backdrop-blur-sm'
          style={{ width: spinnerSize, height: spinnerSize }}
        >
          <span
            className='absolute inset-[18%] rounded-full bg-black-1/70 shadow-inner shadow-black/30'
            aria-hidden
          />
          <span
            className='absolute inset-[5px] rounded-full border-[3px] border-transparent animate-[spin_0.9s_linear_infinite]'
            style={{
              borderTopColor: accentBase,
              borderRightColor: accentBase,
              borderWidth: spinnerBorder,
              boxShadow: `0 0 12px ${accentBase}55`,
            }}
            aria-hidden
          />
        </span>
      </div>
    </div>
  );
};
