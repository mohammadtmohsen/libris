import { Button, RoutineCard, CardSkeleton } from '_components/shared';
import { useGetRoutines } from '_queries/routineQueries/routineQueries';
import { useNavigate } from 'react-router-dom';

const RoutineList = () => {
  const navigate = useNavigate();
  const { data: routines, isFetching } = useGetRoutines();

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center justify-end'>
        <Button onClick={() => navigate('/routines/build-plan')} leftIcon='add'>
          New Routine
        </Button>
      </div>

      {/* Loading State */}
      <CardSkeleton
        loading={isFetching}
        rows={10}
        className='md:grid-cols-2 lg:grid-cols-3 gap-4'
      />

      {/* Empty State */}
      {!isFetching && (!routines?.items || routines.items.length === 0) && (
        <div className='flex flex-col items-center justify-center min-h-[300px] text-center'>
          <div className='text-white-4 text-lg mb-2'>No routines found</div>
          <div className='text-white-5 text-sm mb-4'>
            Create your first routine to get started
          </div>
          <Button
            onClick={() => navigate('/routines/build-plan')}
            leftIcon='add'
          >
            Create Routine
          </Button>
        </div>
      )}

      {/* Routines Grid */}
      {!isFetching && routines?.items && routines.items.length > 0 && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {routines.items.map((routine) => (
            <RoutineCard
              key={routine._id}
              routine={routine}
              onClick={(routine) => navigate(`${routine._id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RoutineList;
