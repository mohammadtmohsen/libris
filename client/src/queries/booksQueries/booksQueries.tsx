import { useQuery } from '@tanstack/react-query';
import { booksServices } from '_services/booksServices/booksServices';

export const useGetBooks = (params?: object) => {
  const queryResult = useQuery({
    queryKey: ['GET_BOOKS', params],
    queryFn: async () => await booksServices.getAllBooks(params),
  });
  return queryResult;
};

export const useGetBookSignedUrl = (id?: string, includeCover = false, enabled = true) => {
  const queryResult = useQuery({
    queryKey: ['GET_BOOK_URL', id, includeCover],
    enabled: Boolean(id) && enabled,
    queryFn: async () => {
      if (!id) return null;
      return booksServices.getSignedUrl(id, includeCover);
    },
  });
  return queryResult;
};
