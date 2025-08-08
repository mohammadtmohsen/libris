import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from '_components/layout/Layout';
import { Dashboard } from '_pages/dashboard/Dashboard';
import { Books } from '_pages/books';
import { RoutesName } from './RoutesName';

export const dashboardRouter = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: RoutesName.Dashboard, element: <Dashboard /> },
      { path: RoutesName.Books, element: <Books /> },
      { path: '*', element: <Navigate to={'/'} /> },
    ],
  },
]);
