import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from '_components/layout/Layout';
import { Dashboard } from '_pages/dashboard/Dashboard';
import { DailyRoutine } from '_pages/DailyRoutine/DailyRoutine';
import { Books } from '_pages/books';
import { Records } from '_pages/records/Records';
import RoutineList from '_pages/routines/routineList/RoutineList';
import RoutineDetails from '_pages/routines/routineDetails/RoutineDetails';
import NewRoutine from '_pages/routines/newRoutine/NewRoutine';
import { RoutesName } from './RoutesName';

export const dashboardRouter = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: RoutesName.Dashboard, element: <Dashboard /> },
      { path: RoutesName['Daily Workout'], element: <DailyRoutine /> },
      { path: RoutesName['My Routines'], element: <RoutineList /> },
      { path: RoutesName['Routines Details'], element: <RoutineDetails /> },
      { path: RoutesName['Build Routines'], element: <NewRoutine /> },
      { path: RoutesName['My Records'], element: <Records /> },
  { path: RoutesName.Books, element: <Books /> },
      { path: '*', element: <Navigate to={'/'} /> },
    ],
  },
]);
