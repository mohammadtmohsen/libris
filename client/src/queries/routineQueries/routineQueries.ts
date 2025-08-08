import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IRoutine } from '_types/types';
import { toast } from 'react-hot-toast';
import { routineServices } from '_services/routineServices';
import { ROUTINE_QUERIES_KEYS } from './routineQueriesKeys';

// Get all routines
export const useGetRoutines = () => {
  return useQuery({
    queryKey: [ROUTINE_QUERIES_KEYS.GET_ALL_ROUTINES],
    queryFn: () => routineServices.getRoutines(),
    retry: false,
    refetchOnWindowFocus: false,
  });
};

// Get active routine
export const useGetActiveRoutine = () => {
  return useQuery({
    queryKey: [ROUTINE_QUERIES_KEYS.GET_ACTIVE_ROUTINE],
    queryFn: () => routineServices.getActiveRoutine(),
    retry: false,
    refetchOnWindowFocus: false,
  });
};

// Get routine by ID
export const useGetRoutineById = (id: string) => {
  return useQuery({
    queryKey: [ROUTINE_QUERIES_KEYS.GET_ROUTINE_BY_ID, id],
    queryFn: () => routineServices.getRoutineById(id),
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !!id,
  });
};

// Create a new routine
export const useCreateRoutine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (routine: IRoutine & { name?: string }) => {
      await routineServices.createRoutine(routine);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ROUTINE_QUERIES_KEYS.GET_ALL_ROUTINES],
      });
      toast.success('Routine created successfully');
    },
    onError: (error) => {
      console.error('Failed to create routine:', error);
      toast.error('Failed to create routine');
    },
  });
};

// Update a routine
export const useUpdateRoutine = ({
  routineId,
}: { routineId?: string } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, routine }: { id: string; routine: IRoutine }) => {
      await routineServices.updateRoutine(id, routine);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ROUTINE_QUERIES_KEYS.GET_ROUTINE_BY_ID, routineId],
      });
      queryClient.invalidateQueries({
        queryKey: [ROUTINE_QUERIES_KEYS.GET_ACTIVE_ROUTINE],
      });
      toast.success('Routine updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update routine:', error);
      toast.error('Failed to update routine');
    },
  });
};

// Activate a routine
export const useActivateRoutine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await routineServices.activateRoutine(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ROUTINE_QUERIES_KEYS.GET_ALL_ROUTINES],
      });
      queryClient.invalidateQueries({
        queryKey: [ROUTINE_QUERIES_KEYS.GET_ROUTINE_BY_ID],
      });
      toast.success('Routine activated successfully');
    },
    onError: (error) => {
      console.error('Failed to activate routine:', error);
      toast.error('Failed to activate routine');
    },
  });
};

// Delete a routine
export const useDeleteRoutine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await routineServices.deleteRoutine(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ROUTINE_QUERIES_KEYS.GET_ALL_ROUTINES],
      });
      toast.success('Routine deleted successfully');
    },
    onError: (error) => {
      console.error('Failed to delete routine:', error);
      toast.error('Failed to delete routine');
    },
  });
};
