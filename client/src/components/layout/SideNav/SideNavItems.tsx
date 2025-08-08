import clsx from 'clsx';

import { NavigationLink } from './NavigationLink';
import { navigationItems } from './navigationList';

export const SideNavItems = ({ className }: { className?: string }) => {
  return (
    <div
      className={clsx('flex gap-5 items-center w-max mx-auto mt-24', className)}
    >
      <NavigationLink items={navigationItems} />
    </div>
  );
};
