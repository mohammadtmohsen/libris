import { logos } from '_assets';
import { useStore } from '_store/useStore';
import { Button } from '_components/shared';
import authServices from '_services/authServices/authServices';
import { getInitialsFromName } from '_utils/helper';
import { UploadBook } from '_pages/dashboard/UploadBooks/UploadBooks';
import { FilterBooks } from './FilterBooks/FilterBooks';

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
        <div className='flex items-center gap-x-5 flex-wrap mr-auto'>
          <img src={logos.librisLogo} className='w-24 h-24 shrink-0' />
        </div>
        <div className='flex items-center gap-3'>
          <FilterBooks />
          <UploadBook />
          <h1 className='font-black text-right'>
            {getInitialsFromName(displayName)}
          </h1>
          <Button
            iconButton='logout'
            onClick={handleLogout}
            variant='primaryOutline'
          />
        </div>
      </div>
    </div>
  );
};
