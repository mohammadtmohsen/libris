import { Icon } from '../Icon/Icon';
import { Loader } from '../Loader/Loader';

export const CountBadge = ({
  isFetching,
  count,
  deliveredCount = 0,
  onClick,
}: {
  isFetching: boolean;
  count: number;
  deliveredCount?: number;
  onClick: () => void;
}) => {
  if (count)
    return (
      <button
        onClick={onClick}
        className='group overflow-hidden fixed bottom-4 right-4 z-50 flex w-fit items-center gap-2 rounded-full bg-blue-7 px-3 py-0 text-white shadow-[0_12px_30px_rgba(0,0,0,0.35)] backdrop-blur-md transition duration-200 ease-out hover:scale-105 active:scale-95 hover:brightness-110 active:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 hover:shadow-[0_14px_34px_rgba(0,0,0,0.4)] after:absolute after:inset-0 after:rounded-full after:bg-white/10 after:opacity-0 active:after:opacity-100 after:transition-opacity after:duration-150'
        aria-label='Scroll to top'
      >
        <div className='flex gap-0.5 items-center'>
          {isFetching && (
            <Loader
              className='!static bg-transparent'
              size={18}
              thickness={4}
            />
          )}
          <span className='text-sm text-white-2 font-bold'>
            {deliveredCount}
          </span>
          /<span className='text-sm text-white-2 font-bold'>{count}</span>
        </div>
        <Icon
          type='book'
          className='text-white-2 transition-transform duration-200 ease-out group-hover:-rotate-6 group-active:scale-110'
        />
      </button>
    );

  return null;
};
