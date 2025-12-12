import { Icon } from '../Icon/Icon';

export const CountBadge = ({
  isFetching,
  count,
}: {
  isFetching: boolean;
  count: number;
}) => {
  if (!isFetching && !!count)
    return (
      <p
        className='absolute bottom-4 right-4 flex w-fit items-center gap-2 rounded-full bg-blue-7 px-3 py-0 text-white shadow-[0_12px_30px_rgba(0,0,0,0.35)] backdrop-blur-md'
        aria-label={`${count} books in your library`}
      >
        <span className='text-sm text-white-2 font-bold'>{count}</span>
        <Icon type='book' className='text-white-2' />
      </p>
    );

  return null;
};
