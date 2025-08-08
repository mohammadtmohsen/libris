import { RecordChart, CardSkeleton } from '_components/shared';
import { useGetAllRecords } from '_queries/recordQueries/recordQueries';

const DashboardRecordsChart = () => {
  const { data: records } = useGetAllRecords();

  if (!records?.items?.length) {
    return (
      <div className='bg-black-5 rounded-secondary overflow-hidden flex flex-col gap-0 min-h-[400px]'>
        <div className='h-16 flex items-center justify-center text-xl font-black bg-black-3 uppercase'>
          No Records Available
        </div>
        <div className='p-5 flex items-center justify-center h-full'>
          <p className='text-black-6 text-center'>
            Start tracking your measurements to see progress charts here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-black-5 rounded-secondary overflow-hidden flex flex-col gap-0'>
      <div className='h-16 flex items-center justify-center text-xl font-black bg-blue-4 uppercase'>
        Progress Overview
      </div>
      <div className='p-3 sm:p-5'>
        <RecordChart records={records?.items || []} variant='dashboard' />
      </div>
    </div>
  );
};

export const DashboardRecords = () => {
  const { isLoading } = useGetAllRecords();

  return (
    <div className='flex flex-col gap-5 relative min-h-[170px] w-full'>
      <h1 className='font-black'>Progress Charts</h1>
      <CardSkeleton loading={isLoading} count={1} rows={10} />
      <div className='relative'>{!isLoading && <DashboardRecordsChart />}</div>
    </div>
  );
};
