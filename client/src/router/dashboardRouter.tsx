import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Dashboard } from '_pages/dashboard/Dashboard';

export const dashboardRouter = createBrowserRouter([
  {
    path: '/',
    element: <Dashboard />,
  },
  { path: '*', element: <Navigate to={'/'} /> },
]);
