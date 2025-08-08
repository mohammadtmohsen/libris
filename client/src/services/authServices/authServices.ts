import axios from '_axios';
import { LoginPayload } from './authServices.types';

const authServices = {
  login: async (payload: LoginPayload) => {
    const endpoint = '/auth';
    try {
      const res = await axios.post(endpoint, payload);
      return res?.data;
    } catch (error) {
      return error;
    }
  },

  refreshToken: async (refreshToken: string) => {
    const endpoint = '/auth/refresh';
    try {
      const res = await axios.post(endpoint, { refreshToken });
      return res?.data;
    } catch (error) {
      return error;
    }
  },
  logout: async () => {
    const endpoint = '/auth/logout';
    try {
      const res = await axios.post(endpoint);
      return res?.data;
    } catch (error) {
      return error;
    }
  },
};

export default authServices;
