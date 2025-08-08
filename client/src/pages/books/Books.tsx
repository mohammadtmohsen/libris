import { CardSkeleton } from '_components/shared';
import { useGetWorkouts } from '_queries/workoutQueries/workoutQueries';
import { workoutServices } from '_services/booksServices';

export const Books = () => {
  // Reuse the existing query hook which currently targets books via service
  const { data, isFetching } = useGetWorkouts();

  return (
    <div className='flex flex-col gap-5'>
      <div
        className={`grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4 bg-black-4 p-4 rounded-secondary max-h-[calc(100vh-300px)] overflow-auto`}
        style={{ height: 'calc(100vh - 300px)' }}
      >
        <CardSkeleton loading={isFetching} count={1} rows={12} />
        {!isFetching &&
          data?.items?.map((book) => {
            const thumbUrl = workoutServices.getThumbnailUrl(book);
            return (
              <div
                key={book.id}
                className='flex flex-col gap-2 bg-black-3 rounded-md p-3'
              >
                <div className='w-full aspect-[3/4] bg-black-2 rounded overflow-hidden flex items-center justify-center'>
                  <img
                    src={thumbUrl}
                    alt={`Thumbnail of ${book.title}`}
                    className='w-full h-full object-cover'
                    loading='lazy'
                    onError={(e) => {
                      if (book.iconLink)
                        (e.currentTarget as HTMLImageElement).src =
                          book.iconLink;
                    }}
                  />
                </div>
                <div className='text-sm truncate' title={book.title}>
                  {book.title}
                </div>
              </div>
            );
          })}
      </div>
      {!isFetching && !!data?.items?.length && (
        <p className='absolute bottom-5 right-5 bg-blue-3/50 px-4 py-1.5 rounded-secondary'>
          <strong>{data?.items?.length}</strong> Books Found
        </p>
      )}
    </div>
  );
};
