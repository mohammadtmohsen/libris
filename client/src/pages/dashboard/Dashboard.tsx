import { Books } from './Books/Books';
import { UploadBook } from './UploadBooks/UploadBooks';

export const Dashboard = () => {
  return (
    <div className='flex flex-col gap-5'>
      <div className='flex justify-between items-center'>
        <h1 className='text-xl font-semibold'>Dashboard</h1>
        <UploadBook />
      </div>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-5'>LIBRIS</div>
      <Books />
    </div>
  );
};
