export type InvitedUser = {
  _id: string;
  username: string;
  displayName?: string;
  email?: string;
  role?: 'admin' | 'user';
  createdAt?: string;
};

export type InviteUserPayload = {
  username: string;
  displayName?: string;
  role?: 'admin' | 'user';
};

export type InviteUserResponse = {
  user: InvitedUser;
  defaultPassword: string;
};

export type InvitedUsersResponse = {
  users: InvitedUser[];
  admins?: InvitedUser[];
};
