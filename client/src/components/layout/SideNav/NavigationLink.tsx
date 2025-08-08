import clsx from 'clsx';

import { NavigationProps } from './type';
import { NavLink } from 'react-router-dom';

export const NavigationLink = ({
  items,
  className = '',
}: {
  items: NavigationProps[];
  className?: string;
}) =>
  items.map(({ path, icon, title }, index) => {
    const isLast = index === items.length - 1;
    return (
      <>
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) =>
            clsx(
              'flex items-center gap-2 text-left',
              isActive ? 'text-blue-1' : '',
              className
            )
          }
        >
          {icon}
          {title}
        </NavLink>
        {!isLast && (
          <hr className=' border border-b-2 border-yellow-1 w-full' />
        )}
      </>
    );
  });
