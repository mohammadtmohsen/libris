import { Button, OneDayRoutineCard, CardSkeleton } from '_components/shared';
import { BuildRoutine } from '_components/shared/form/build-routine';
import { daysNames } from '_constants/daysName';
import {
  useActivateRoutine,
  useDeleteRoutine,
  useGetRoutineById,
  useUpdateRoutine,
} from '_queries/routineQueries/routineQueries';
import { IDays, IRoutine } from '_types/types';
import useFilters from 'react-filter-hook';
import { useNavigate, useParams } from 'react-router-dom';

const RoutineDetails = () => {
  const navigate = useNavigate();
  const { filters, onChangeFilter } = useFilters({
    initialFilters: { view: 'details' as 'details' | 'update' },
  });
  const { routineId = '' } = useParams<{ routineId: string }>();
  const { data: routines, isLoading } = useGetRoutineById(routineId);
  const { mutateAsync } = useActivateRoutine();
  const { mutateAsync: updateRoutine, isPending } = useUpdateRoutine({
    routineId,
  });
  const { mutateAsync: deleteRoutine } = useDeleteRoutine();
  console.log(' routine:', routines);

  if (isLoading) {
    return (
      <div className='flex flex-col gap-5'>
        {/* Header skeleton */}
        <div className='flex items-center justify-between gap-5 flex-wrap'>
          <div className='shrink-0'>
            <div className='h-8 w-48 bg-black-3 rounded animate-pulse'></div>
          </div>
          <div className='flex ml-auto gap-5'>
            <div className='h-10 w-24 bg-black-3 rounded animate-pulse'></div>
            <div className='h-10 w-20 bg-black-3 rounded animate-pulse'></div>
            <div className='h-10 w-20 bg-black-3 rounded animate-pulse'></div>
          </div>
        </div>
        {/* Cards skeleton */}
        <CardSkeleton
          count={7}
          loading={true}
          rows={4}
          className='grid-cols-1 lg:grid-cols-2 gap-5'
        />
      </div>
    );
  }

  const handleActivateRoutine = async () => {
    try {
      await mutateAsync(routineId);
      console.log('Routine activated successfully');
    } catch (error) {
      console.error('Error activating routine:', error);
    }
  };

  const handleDeleteRoutine = async () => {
    try {
      await deleteRoutine(routineId);
      console.log('Routine deleted successfully');
      navigate('/routines');
    } catch (error) {
      console.error('Error deleting routine:', error);
    }
  };

  const handleUpdateRoutine = async (data: IRoutine) => {
    console.log('data:', data);
    const payload = {
      name: data.name,
      routine: data.routine,
    };
    if (!routineId) return;
    try {
      await updateRoutine({ id: routineId, routine: payload });
      console.log('Routine updated successfully');
      onChangeFilter('view', 'details');
    } catch (error) {
      console.error('Error updating routine:', error);
    }
  };

  return filters?.view === 'details' ? (
    <div className='flex flex-col gap-5'>
      <div className='flex items-center justify-between gap-5 flex-wrap'>
        <div className='shrink-0'>
          <h1 className='text-2xl font-bold capitalize'>{routines?.name}</h1>
        </div>
        <div className='flex ml-auto gap-5'>
          {routines?.status !== 'active' && (
            <Button
              onClick={handleActivateRoutine}
              leftIcon='check'
              variant='secondary'
            >
              Activate
            </Button>
          )}
          <Button
            onClick={() => onChangeFilter('view', 'update')}
            leftIcon='edit'
          >
            Update
          </Button>
          <Button
            variant='danger'
            onClick={handleDeleteRoutine}
            leftIcon='delete'
          >
            Delete
          </Button>
        </div>
      </div>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-5'>
        {daysNames.map((day) => {
          const routine = routines?.routine?.[day as IDays];
          return (
            day &&
            routine && (
              <OneDayRoutineCard
                key={day}
                day={day as IDays}
                workout={routine}
              />
            )
          );
        })}
      </div>
    </div>
  ) : routines ? (
    <BuildRoutine
      onSubmit={handleUpdateRoutine}
      isSubmitting={isPending}
      onCancel={() => onChangeFilter('view', 'details')}
      routine={routines}
    />
  ) : (
    <div className='flex items-center justify-center h-full'>
      <h1 className='text-2xl font-bold'>No Routine Found</h1>
    </div>
  );
};

export default RoutineDetails;
