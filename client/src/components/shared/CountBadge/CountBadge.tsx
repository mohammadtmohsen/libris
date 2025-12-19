import { Icon } from '../Icon/Icon';
import { Loader } from '../Loader/Loader';

export const CountBadge = ({
  isFetching,
  count,
  deliveredCount = 0,
}: {
  isFetching: boolean;
  count: number;
  deliveredCount?: number;
}) => {
  if (count)
    return (
      <p
        className='absolute bottom-24 right-4 flex w-fit items-center gap-2 rounded-full bg-blue-7 px-3 py-0 text-white shadow-[0_12px_30px_rgba(0,0,0,0.35)] backdrop-blur-md'
        aria-label={`${count} books in your library`}
      >
        <div className='flex gap-0.5 items-center'>
          {isFetching ? (
            <Loader
              className='!static bg-transparent'
              size={18}
              thickness={4}
            />
          ) : (
            <span className='text-sm text-white-2 font-bold'>
              {deliveredCount}
            </span>
          )}
          /<span className='text-sm text-white-2 font-bold'>{count}</span>
        </div>
        <Icon type='book' className='text-white-2' />
      </p>
    );

  return null;
};
