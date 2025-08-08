import { Controller, useForm } from 'react-hook-form';
import { useStore } from '../../store/useStore';
import authServices from '_services/authServices/authServices';
import { LoginPayload } from '_services/authServices';
import { Button, Input } from '_components/shared';
import { logos } from '_assets';
import { useState } from 'react';

export const Login = () => {
  const { loginUser } = useStore();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit } = useForm<LoginPayload>({
    defaultValues: { username: '', password: '' },
  });

  const onSubmit = async (data: LoginPayload) => {
    try {
      setLoading(true);
      const userData = await authServices.login(data);
      if (
        userData?.user?._id &&
        userData.accessToken &&
        userData.refreshToken
      ) {
        loginUser({
          user: userData.user,
          accessToken: userData.accessToken,
          refreshToken: userData.refreshToken,
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex flex-col items-center justify-center h-screen bg-black-2 p-3 sm:p-5'>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='flex flex-col items-center gap-5 bg-black-1 border-2 border-blue-2 rounded p-5 rounded-secondary shadow-lg w-full max-w-md'
      >
        <img src={logos.librisLogo} className='w-24 h-24' />
        <Controller
          name='username'
          control={control}
          render={({ field }) => <Input {...field} placeholder='Username' />}
          rules={{ required: true }}
        />
        <Controller
          name='password'
          control={control}
          render={({ field }) => (
            <Input {...field} type='password' placeholder='Password' />
          )}
          rules={{ required: true }}
        />
        <Button type='submit' className='!w-full' loading={loading}>
          Login
        </Button>
      </form>
    </div>
  );
};
