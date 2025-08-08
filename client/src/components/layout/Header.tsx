import { logos } from '_assets';
import { SideNav } from './SideNav/SideNav';
import { useStore } from '_store/useStore';
import { Button, TitleWithBackButton } from '_components/shared';
import authServices from '_services/authServices/authServices';
import { getInitialsFromName } from '_utils/helper';

export const Header = () => {
  const { loggingData, logoutUser } = useStore();
  const displayName = loggingData?.displayName;

  const handleLogout = async () => {
    try {
      await authServices.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      logoutUser();
    }
  };

  return (
    <div className='shrink-0 bg-black-1'>
      <div className='shrink-0 h-16 bg-black-1 flex items-center'>
        <SideNav />
        <div className='flex items-center gap-x-5 flex-wrap mr-auto'>
          <img src={logos.librisLogo} className='w-24 h-24 shrink-0' />
          <TitleWithBackButton className='hidden sm:flex' />
        </div>
        <div className='flex items-center gap-3'>
          <h1 className='font-black text-right'>
            Welcome, {getInitialsFromName(displayName)}
          </h1>
          <Button
            iconButton='logout'
            onClick={handleLogout}
            variant='primaryOutline'
          />
        </div>
      </div>
      <TitleWithBackButton className='sm:hidden mt-3' />
    </div>
  );
};
