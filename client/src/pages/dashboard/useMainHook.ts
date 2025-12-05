import { useGetBooks } from '_queries/booksQueries';

export const useMainHook = () => {
  const { data, isFetching } = useGetBooks();
  const books = data?.items ?? [];
  const count = data?.count ?? 0;
  return { books, count, isFetching };
};
