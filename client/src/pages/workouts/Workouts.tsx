import { ExercisesCard, CardSkeleton } from '_components/shared';

import useFilter from 'react-filter-hook';
import { useGetWorkouts } from '_queries/workoutQueries/workoutQueries';
import { WorkoutsFilters } from './WorkoutsFilters';

export const Workouts = () => {
  const { filters, onChangeFilter } = useFilter({
    initialFilters: {
      exercise: '',
      equipment: 'all',
      muscleGroup: 'all',
      muscleSubgroup: 'all',
    },
  });
  const { data, isFetching } = useGetWorkouts({
    exercise: filters?.exercise !== '' ? filters?.exercise : undefined,
    equipment: filters?.equipment !== 'all' ? filters?.equipment : undefined,
    muscleGroup:
      filters?.muscleGroup !== 'all' ? filters?.muscleGroup : undefined,
    muscleSubgroup:
      filters?.muscleSubgroup !== 'all' ? filters?.muscleSubgroup : undefined,
  });

  return (
    <div className='flex flex-col gap-5'>
      <WorkoutsFilters filters={filters} onChangeFilter={onChangeFilter} />
      <div
        className={`flex flex-col gap-4 bg-black-4 p-4 rounded-secondary max-h-[calc(100vh - 300px)] overflow-auto`}
        style={{ height: 'calc(100vh - 300px)' }}
      >
        <CardSkeleton loading={isFetching} count={1} rows={20} />
        {data?.items?.map((workout) => (
          <ExercisesCard exercise={workout} key={workout?._id} />
        ))}
      </div>
      {!isFetching && !!data?.items?.length && (
        <p className='absolute bottom-5 right-5 bg-blue-3/50 px-4 py-1.5 rounded-secondary'>
          <strong>{data?.items?.length}</strong> Exercise Found
        </p>
      )}
    </div>
  );
};
