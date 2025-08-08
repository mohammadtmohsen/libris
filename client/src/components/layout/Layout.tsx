import { MainOutlet } from './MainOutlet';
import { Header } from './Header';
import { MainSideNav } from './SideNav/MainSideNav';

export const Layout = () => {
  return (
    <div className='flex gap-5 h-screen max-h-screen m-3 sm:m-5'>
      <MainSideNav />
      <div className='flex flex-col gap-5 grow mb-5 overflow-hidden'>
        <Header />
        <MainOutlet />
      </div>
    </div>
  );
};
