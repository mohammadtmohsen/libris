import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import axiosInstance from '_axios';
import {
  INVITATIONS_QUERY_BASE,
  INVITATIONS_QUERY_KEYS,
} from './invitationsQueries.keys';
import type {
  InviteUserPayload,
  InviteUserResponse,
  InvitedUser,
  InvitedUsersResponse,
} from './invitationsQueries.types';
import type { AxiosError } from 'axios';

export const useGetInvitedUsers = () => {
  return useQuery({
    queryKey: [INVITATIONS_QUERY_KEYS.GET_INVITED_USERS],
    queryFn: async () => {
      const res = await axiosInstance.get<InvitedUsersResponse>(
        INVITATIONS_QUERY_BASE
      );
      const users = res?.data?.users ?? [];
      const admins = res?.data?.admins ?? [];
      return { users: users as InvitedUser[], admins: admins as InvitedUser[] };
    },
  });
};

export const useInviteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [INVITATIONS_QUERY_KEYS.INVITE_USER],
    mutationFn: async (payload: InviteUserPayload) => {
      const res = await axiosInstance.post<InviteUserResponse>(
        INVITATIONS_QUERY_BASE,
        payload
      );
      return res?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [INVITATIONS_QUERY_KEYS.GET_INVITED_USERS],
      });
    },
  });
};

export const useDeleteInvitedUser = () => {
  const queryClient = useQueryClient();
  return useMutation<{ id: string }, AxiosError, { id: string }>({
    mutationKey: [INVITATIONS_QUERY_KEYS.DELETE_INVITED_USER],
    mutationFn: async ({ id }) => {
      const res = await axiosInstance.delete<{ id: string }>(
        `${INVITATIONS_QUERY_BASE}/${id}`
      );
      return res?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [INVITATIONS_QUERY_KEYS.GET_INVITED_USERS],
      });
    },
  });
};
