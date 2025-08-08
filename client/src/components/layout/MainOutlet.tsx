import clsx from 'clsx';
import { Outlet } from 'react-router-dom';

export const MainOutlet = () => {
  return (
    <main
      className={clsx(
        'flex-1 overflow-auto relative',
        'mb-5 p-0 sm:p-5',
        'sm:bg-black-2 sm:rounded-secondary'
      )}
    >
      <Outlet />
    </main>
  );
};
