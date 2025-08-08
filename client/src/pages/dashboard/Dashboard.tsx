import { TodayWorkout } from './todayWorkout/TodayWorkout';
import { DashboardRecords } from './dashboardRecords';

export const Dashboard = () => {
  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-5'>
      <TodayWorkout />
      <DashboardRecords />
    </div>
  );
};
