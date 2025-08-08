import axios from '_axios';
import { IRoutine } from '_types/types';

export const routineServices = {
  getRoutines: async () => {
    const endPoint = '/routine';
    try {
      const res = await axios.get<
        object,
        { data: { items: IRoutine[]; count: number } }
      >(endPoint);
      return res?.data;
    } catch (error) {
      throw Promise.reject(error);
    }
  },
  getActiveRoutine: async () => {
    const endPoint = '/routine/active';
    try {
      const res = await axios.get<IRoutine>(endPoint);
      return res?.data;
    } catch (error) {
      throw Promise.reject(error);
    }
  },
  getRoutineById: async (id: string) => {
    const endPoint = `/routine/${id}`;
    try {
      const res = await axios.get<IRoutine>(endPoint);
      return res?.data;
    } catch (error) {
      throw Promise.reject(error);
    }
  },
  createRoutine: async (routine: IRoutine) => {
    const endPoint = '/routine';
    try {
      const res = await axios.post<IRoutine>(endPoint, routine);
      return res?.data;
    } catch (error) {
      throw Promise.reject(error);
    }
  },
  updateRoutine: async (id: string, routine: IRoutine) => {
    const endPoint = `/routine/${id}`;
    try {
      const res = await axios.put<IRoutine>(endPoint, routine);
      return res;
    } catch (error) {
      throw Promise.reject(error);
    }
  },
  deleteRoutine: async (id: string) => {
    const endPoint = `/routine/${id}`;
    try {
      const res = await axios.delete<IRoutine>(endPoint);
      return res?.data;
    } catch (error) {
      throw Promise.reject(error);
    }
  },
  activateRoutine: async (id: string) => {
    const endPoint = `/routine/${id}/activate`;
    try {
      const res = await axios.put<IRoutine>(endPoint);
      return res?.data;
    } catch (error) {
      throw Promise.reject(error);
    }
  },
};
