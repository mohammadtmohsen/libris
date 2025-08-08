import axios from '_axios';
import { IRecord } from './recordServices.types';

export const recordServices = {
  getAllRecords: async () => {
    const endpoint = '/record';
    try {
      const res = await axios.get(endpoint);
      return res.data;
    } catch (error) {
      return error;
    }
  },
  createRecord: async (payload: IRecord) => {
    const endpoint = '/record';
    try {
      const res = await axios.post(endpoint, payload);
      return res?.data;
    } catch (error) {
      return error;
    }
  },
  updateRecord: async ({
    recordId,
    payload,
  }: {
    recordId: string;
    payload: IRecord;
  }) => {
    const endpoint = `/record/${recordId}`;
    try {
      const res = await axios.put(endpoint, payload);
      return res?.data;
    } catch (error) {
      return error;
    }
  },
  deleteRecord: async (recordId: string) => {
    const endpoint = `/record/${recordId}`;
    try {
      const res = await axios.delete(endpoint);
      return res?.data;
    } catch (error) {
      return error;
    }
  },
};
