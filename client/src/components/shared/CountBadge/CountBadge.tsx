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
        className='absolute bottom-4 right-4 flex w-fit items-center gap-3 rounded-full bg-blue-7 px-4 py-0 text-white shadow-[0_12px_30px_rgba(0,0,0,0.35)] backdrop-blur-md'
        aria-label={`${count} books in your library`}
      >
        <span className='text-sm flex h-9 items-center justify-center rounded-full bg-white/15 font-black leading-none shadow-inner shadow-blue-3/40'>
          {count}
        </span>
        <span className='pr-1 text-xs font-semibold uppercase tracking-wide text-white/90'>
          Books
        </span>
      </p>
    );

  return null;
};
