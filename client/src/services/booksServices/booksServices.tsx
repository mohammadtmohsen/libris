import axios from '_axios';
import { IExerciseDetails } from '_types/types';
export const workoutServices = {
  getAllBooks: async (params?: object) => {
    const endPoint = '/books';
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
