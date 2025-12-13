import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Button,
  Icon,
  Input,
  Modal,
  StatusToggle,
  useModal,
  useActionToast,
} from '_components/shared';
import {
  useGetInvitedUsers,
  useInviteUser,
  useDeleteInvitedUser,
} from '_queries/invitationsQueries';
import type { InvitedUser } from '_queries/invitationsQueries';
import { useStore } from '_store/useStore';

type InviteForm = {
  displayName?: string;
  username: string;
  role?: 'admin' | 'user';
};

const UsersModalContent = ({
  close,
}: {
  close: () => void;
  contentProps?: Record<string, unknown> | null;
}) => {
  const { data, isLoading, error, isFetching } = useGetInvitedUsers();
  const users = data?.users ?? [];
  const admins = data?.admins ?? [];
  const { loggingData } = useStore();
  const {
    mutateAsync: inviteUser,
    error: inviteError,
    isPending: isInviting,
  } = useInviteUser();
  const { mutateAsync: deleteUser, isPending: isDeleting } =
    useDeleteInvitedUser();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteForm>({
    defaultValues: { displayName: '', username: '', role: 'user' },
  });
  const [lastInvite, setLastInvite] = useState<{
    username?: string;
    password?: string;
  } | null>(null);
  const toast = useActionToast();

  const onSubmit = handleSubmit(async (payload) => {
    try {
      const trimmedPayload = {
        ...payload,
        displayName: payload.displayName?.trim(),
        username: payload.username.trim(),
      };
      toast.showToast({
        title: 'Inviting user…',
        description: `Creating access for "${trimmedPayload.username}".`,
      });
      const res = await inviteUser(trimmedPayload);
      setLastInvite({
        username: res?.user?.username ?? trimmedPayload.username,
        password: res?.defaultPassword ?? 'password',
      });
      toast.showSuccess({
        title: 'User invited',
        description: `Sent invite for "${
          res?.user?.username ?? trimmedPayload.username
        }".`,
      });
      reset({ displayName: '', username: '' });
    } catch (e) {
      console.error('Failed to invite user', e);
      const message =
        e instanceof Error ? e.message : 'Could not send the invitation.';
      toast.showError({
        title: 'Invite failed',
        description: `"${payload.username}": ${message}`,
      });
    }
  });

  const errorMessage = useMemo(() => {
    if (inviteError && inviteError instanceof Error) return inviteError.message;
    if (error && error instanceof Error) return error.message;
    return '';
  }, [inviteError, error]);

  return (
    <div className='m-auto w-[100vw] max-w-5xl space-y-6 rounded-primary bg-black-3/70 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] ring-1 ring-blue-1/15 backdrop-blur-sm'>
      <div className='flex items-center justify-between gap-3'>
        <div className='flex items-center gap-2'>
          <Icon type='users' className='text-blue-1' />
          <div className='text-lg font-semibold text-white'>Manage users</div>
        </div>
        <span className='rounded-full bg-blue-1/15 px-3 py-1 text-xs font-semibold text-blue-1'>
          {users.length} total
        </span>
      </div>

      <div className='grid gap-3 rounded-primary bg-black-2/60 p-4 shadow-inner shadow-black/40 ring-1 ring-blue-1/15'>
        <div className='flex items-center justify-between text-sm text-white/80'>
          <span className='text-xs uppercase tracking-[0.12em] text-white/60'>
            Invited admins
          </span>
          {isLoading || isFetching ? (
            <span className='text-xs text-white/60'>Loading...</span>
          ) : null}
        </div>
        <div className='max-h-[200px] space-y-2 overflow-y-auto'>
          {admins.length === 0 && !isLoading ? (
            <p className='text-sm text-white/60'>No admins available.</p>
          ) : (
            admins.map((u: InvitedUser) => {
              const isSelf = String(u._id) === String(loggingData?._id);
              return (
                <div
                  key={`admin-${u._id}`}
                  className='flex min-h-[50px] items-center justify-between gap-2 rounded-xl bg-gradient-to-br from-blue-1/15 via-black/35 to-blue-1/12 px-3 py-2 ring-1 ring-blue-1/15'
                >
                  <div className='flex flex-col gap-[2px]'>
                    <span className='text-sm font-semibold text-white'>
                      {u.displayName || u.username}
                    </span>
                    {u.email ? (
                      <span className='text-xs text-white/65'>{u.email}</span>
                    ) : null}
                  </div>
                  {!isSelf && (
                    <button
                      type='button'
                      onClick={async () => {
                        try {
                          toast.showToast({
                            title: 'Removing admin…',
                            description: `Revoking access for "${u.username}".`,
                          });
                          await deleteUser({ id: u._id });
                          toast.showSuccess({
                            title: 'Admin removed',
                            description: `"${u.username}" no longer has access.`,
                          });
                        } catch (err) {
                          console.error('Failed to delete user', err);
                          const message =
                            err instanceof Error
                              ? err.message
                              : 'Could not delete this admin.';
                          toast.showError({
                            title: 'Remove failed',
                            description: `"${u.username}": ${message}`,
                          });
                        }
                      }}
                      aria-label={`Delete admin ${u.username}`}
                      disabled={isDeleting}
                      className='p-1 text-red-1 transition hover:text-red-2 focus-visible:outline-none disabled:opacity-60 disabled:cursor-not-allowed'
                    >
                      <Icon type='delete' fontSize='medium' />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className='grid gap-3 rounded-primary bg-black-2/60 p-4 shadow-inner shadow-black/40 ring-1 ring-blue-1/15'>
        <div className='flex items-center justify-between text-sm text-white/80'>
          <span className='text-xs uppercase tracking-[0.12em] text-white/60'>
            Invited users
          </span>
          {isLoading || isFetching ? (
            <span className='text-xs text-white/60'>Loading...</span>
          ) : null}
        </div>
        <div className='max-h-[240px] space-y-2 overflow-y-auto'>
          {users.length === 0 && !isLoading ? (
            <p className='text-sm text-white/60'>No users invited yet.</p>
          ) : (
            users.map((u: InvitedUser) => (
              <div
                key={u._id}
                className='flex min-h-[50px] items-center justify-between gap-2 rounded-xl bg-gradient-to-br from-blue-1/10 via-black/40 to-blue-1/12 px-3 py-2 ring-1 ring-blue-1/15'
              >
                <div className='flex flex-col gap-[2px]'>
                  <span className='text-sm font-semibold text-white'>
                    {u.displayName || u.username}
                  </span>
                  {u.email ? (
                    <span className='text-xs text-white/65'>{u.email}</span>
                  ) : null}
                </div>
                <button
                  type='button'
                  onClick={async () => {
                    try {
                      toast.showToast({
                        title: 'Removing user…',
                        description: `Revoking access for "${u.username}".`,
                      });
                      await deleteUser({ id: u._id });
                      toast.showSuccess({
                        title: 'User removed',
                        description: `"${u.username}" no longer has access.`,
                      });
                    } catch (err) {
                      console.error('Failed to delete user', err);
                      const message =
                        err instanceof Error
                          ? err.message
                          : 'Could not delete this user.';
                      toast.showError({
                        title: 'Remove failed',
                        description: `"${u.username}": ${message}`,
                      });
                    }
                  }}
                  aria-label={`Delete user ${u.username}`}
                  disabled={isDeleting}
                  className='p-1 text-red-1 transition hover:text-red-2 focus-visible:outline-none disabled:opacity-60 disabled:cursor-not-allowed'
                >
                  <Icon type='delete' fontSize='medium' />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <form
        className='grid gap-4 rounded-primary bg-black-2/60 p-5 shadow-inner shadow-black/40 ring-1 ring-blue-1/15'
        onSubmit={onSubmit}
      >
        <div className='flex items-center justify-between text-sm text-white/80'>
          <span className='text-xs uppercase tracking-[0.12em] text-white/60'>
            Invite a new user
          </span>
          <span className='text-xs text-white/60'>
            Default password: password
          </span>
        </div>
        <Controller
          name='displayName'
          control={control}
          render={({ field }) => (
            <Input label='Display name' placeholder='Optional' {...field} />
          )}
        />
        <Controller
          name='username'
          control={control}
          render={({ field }) => (
            <Input
              label='Username'
              placeholder='e.g. johndoe'
              {...field}
              error={errors.username?.message}
            />
          )}
        />
        <Controller
          name='role'
          control={control}
          render={({ field }) => (
            <StatusToggle
              label='Role'
              options={[
                {
                  value: 'user',
                  label: 'User',
                  description: 'Can read books and update their progress',
                },
                {
                  value: 'admin',
                  label: 'Admin',
                  description: 'Full access: upload, edit, delete, invite',
                },
              ]}
              {...field}
            />
          )}
        />

        {errorMessage ? (
          <p className='text-sm text-red-1'>{errorMessage}</p>
        ) : null}
        {lastInvite ? (
          <div className='rounded-lg bg-gradient-to-r from-green-3/20 via-black/35 to-green-3/20 px-3 py-2 text-sm text-green-1 ring-1 ring-green-2/35'>
            Invited <span className='font-semibold'>{lastInvite.username}</span>{' '}
            with password <code className='font-semibold'>password</code>. Share
            it with the user to log in.
          </div>
        ) : null}
        <div className='flex items-center justify-end gap-2'>
          <Button
            type='button'
            variant='neutral'
            onClick={() => close()}
            disabled={isInviting}
            className='px-4'
          >
            Close
          </Button>
          <Button
            type='submit'
            variant='primary'
            disabled={isInviting}
            className='px-4'
          >
            Invite user
          </Button>
        </div>
      </form>
    </div>
  );
};

export const UsersModalTrigger = ({ onOpen }: { onOpen?: () => void }) => {
  const modal = useModal({
    content: ({ close }) => <UsersModalContent close={close} />,
  });

  return (
    <>
      <Button
        variant='outline'
        iconButton='users'
        onClick={() => {
          onOpen?.();
          modal.open({});
        }}
        aria-label='Manage users'
      />
      <Modal {...modal} />
    </>
  );
};
