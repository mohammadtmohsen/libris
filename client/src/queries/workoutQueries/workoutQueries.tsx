import { useQuery } from '@tanstack/react-query';
import { workoutServices } from '_services/booksServices/booksServices';

export const useGetWorkouts = (params?: object) => {
  const queryResult = useQuery({
    queryKey: ['GET_BOOKS', params],
    queryFn: async () => await workoutServices.getAllBooks(params),
  });
  return queryResult;
};
