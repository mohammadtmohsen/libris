import { useGetBooks } from '_queries/booksQueries';

export const useMainHook = () => {
  const { data, isFetching } = useGetBooks();
  const books = data?.items ?? [];
  return { books, isFetching };
};
