import { useQuery } from '@tanstack/react-query';
import { workoutServices } from '_services/workoutServices/workoutServices';

export const useGetWorkouts = (params?: object) => {
  const queryResult = useQuery({
    queryKey: ['GET_WORKOUTS', params],
    queryFn: async () => await workoutServices.getAllWorkouts(params),
  });
  return queryResult;
};
