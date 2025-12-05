import { Book } from '_queries/booksQueries';
import { useGetBookSignedUrl } from '_queries/storageQueries';

export const usePdfViewer = ({ activeBook }: { activeBook: Book | null }) => {
  const {
    data: bookUrlData,
    isFetching: bookUrlLoading,
    error: bookUrlErrorObj,
  } = useGetBookSignedUrl({
    bookId: activeBook?._id,
    includeCover: false,
    enabled: Boolean(activeBook?._id),
  });

  const bookUrlError =
    bookUrlErrorObj && bookUrlErrorObj instanceof Error
      ? bookUrlErrorObj.message
      : null;

  return {
    bookUrlData,
    bookUrlLoading,
    bookUrlError,
  };
};
