import axios from '_axios';
import { IExerciseDetails } from '_types/types';
export const workoutServices = {
  getAllWorkouts: async (params?: object) => {
    const endPoint = '/workout';
    try {
      const res = await axios.get<
        object,
        { data: { items: IExerciseDetails[]; count: number } }
      >(endPoint, { params });
      return res?.data;
    } catch (error) {
      throw Promise.reject(error);
    }
  },
};
