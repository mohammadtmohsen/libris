import { Icon } from '../Icon/Icon';
import { ShimmerOverlay } from '../ShimmerOverlay/ShimmerOverlay';

export const CountBadge = ({
  isFetching,
  count = 0,
  onClick,
}: {
  isFetching: boolean;
  count: number;
  onClick: () => void;
}) => {
  return (
    <div className='fixed bottom-4 right-4 z-50'>
      <button
        onClick={onClick}
        className='group relative flex w-fit items-center gap-2 overflow-hidden rounded-full bg-blue-7 px-3 py-0 text-white shadow-[0_12px_30px_rgba(0,0,0,0.35)] backdrop-blur-md transition duration-200 ease-out hover:scale-105 active:scale-95 hover:brightness-110 active:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 hover:shadow-[0_14px_34px_rgba(0,0,0,0.4)] after:absolute after:inset-0 after:rounded-full after:bg-white/10 after:opacity-0 active:after:opacity-100 after:transition-opacity after:duration-150'
        aria-label='Scroll to top'
      >
        <div className='flex items-center gap-0.5'>
          <span className='text-sm font-bold text-white-2'>{count}</span>
        </div>
        <Icon
          type='book'
          className='text-white-2 transition-transform duration-200 ease-out group-hover:-rotate-6 group-active:scale-110'
        />
        {isFetching && <ShimmerOverlay />}
      </button>
    </div>
  );
};
