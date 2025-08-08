import { createBrowserRouter } from 'react-router-dom';
import { Login } from '../pages/login/Login';

export const loginRouter = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '*',
    element: <Login />, // Redirect to login for any unmatched routes
  },
]);
