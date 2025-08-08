import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { dashboardRouter, loginRouter } from './router';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { useStore } from './store/useStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function App() {
  const { isLogged, loadUser, loading } = useStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <RouterProvider router={isLogged ? dashboardRouter : loginRouter} />
      </LocalizationProvider>
    </QueryClientProvider>
  );
}
