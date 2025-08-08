import { OneDayRoutineCard, CardSkeleton } from '_components/shared';
import { daysNames } from '_constants/daysName';
import { useGetActiveRoutine } from '_queries/routineQueries/routineQueries';
import { IDays } from '_types/types';

export const DailyRoutine = () => {
  const { data: activeRoutine, isLoading } = useGetActiveRoutine();
  console.log(' activeRoutine:', activeRoutine);

  if (isLoading) {
    return (
      <CardSkeleton
        loading={isLoading}
        count={7}
        rows={10}
        className='grid-cols-1 lg:grid-cols-2'
      />
    );
  }
  if (!activeRoutine) {
    return <div>No active routine found</div>;
  }

  if (!activeRoutine) {
    return <div>No routine data available</div>;
  }

  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-5'>
      {daysNames.map((day) => {
        const workout = activeRoutine?.routine[day as IDays];
        return (
          <OneDayRoutineCard key={day} day={day as IDays} workout={workout} />
        );
      })}
    </div>
  );
};
