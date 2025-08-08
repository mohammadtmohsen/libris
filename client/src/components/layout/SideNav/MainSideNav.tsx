import clsx from 'clsx';
import { navigationItems } from './navigationList';
import { NavLink } from 'react-router-dom';

export const MainSideNav = () => {
  return (
    <div
      className={clsx(
        'hidden sm:block',
        'shrink-0 min-h-screen bg-black-1 flex items-center',
        'pt-24',
        'group',
        'w-16 hover:w-48 2xl:w-48',
        'transform transition-all duration-200'
      )}
    >
      <nav className='flex flex-col gap-5'>
        {navigationItems.map(({ id, path, title, icon }) => (
          <NavLink
            key={id}
            to={path}
            className={({ isActive }) =>
              clsx(
                'flex items-center justify-center text-white',
                'group-hover:gap-x-2 group-hover:justify-start',
                '2xl:gap-x-2 2xl:justify-start',
                'p-4  rounded-primary hover:bg-blue-5',
                isActive ? 'bg-blue-3' : ''
              )
            }
          >
            {icon}
            <span
              className={clsx(
                'hidden 2xl:inline overflow-hidden group-hover:inline whitespace-nowrap'
              )}
            >
              {title}
            </span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
