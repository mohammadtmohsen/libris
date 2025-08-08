import { useQuery } from '@tanstack/react-query';
import { booksServices } from '_services/booksServices/booksServices';

export const useGetBooks = (params?: object) => {
  const queryResult = useQuery({
    queryKey: ['GET_BOOKS', params],
    queryFn: async () => await booksServices.getAllBooks(params),
  });
  return queryResult;
};
