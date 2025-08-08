import { recordServices } from '_services/recordServices/recordServices';
import { RECORD_QUERIES_KEYS } from './recordQueriesKeys';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IRecord } from '_services/recordServices';

export const useGetAllRecords = () => {
  const queryResult = useQuery<{
    items: IRecord[];
    count: number;
  }>({
    queryKey: [RECORD_QUERIES_KEYS.GET_ALL_RECORDS],
    queryFn: () => recordServices.getAllRecords(),
    refetchOnWindowFocus: false,
  });

  return queryResult;
};

export const useAddNewRecord = () => {
  const queryClient = useQueryClient();
  const mutationResult = useMutation({
    mutationFn: (payload: IRecord) => recordServices.createRecord(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [RECORD_QUERIES_KEYS.GET_ALL_RECORDS],
      });
    },
    onError: (error) => {
      console.error('Error adding new record:', error);
    },
  });
  return mutationResult;
};

export const useUpdateRecord = () => {
  const queryClient = useQueryClient();
  const mutationResult = useMutation({
    mutationFn: ({
      recordId,
      payload,
    }: {
      recordId: string;
      payload: IRecord;
    }) => recordServices.updateRecord({ recordId, payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [RECORD_QUERIES_KEYS.GET_ALL_RECORDS],
      });
    },
    onError: (error) => {
      console.error('Error updating record:', error);
    },
  });
  return mutationResult;
}

export const useDeleteRecord = () => {
  const queryClient = useQueryClient();
  const mutationResult = useMutation({
    mutationFn: (recordId: string) => recordServices.deleteRecord(recordId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [RECORD_QUERIES_KEYS.GET_ALL_RECORDS],
      });
    },
    onError: (error) => {
      console.error('Error deleting record:', error);
    },
  });
  return mutationResult;
};