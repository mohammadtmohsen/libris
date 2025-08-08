import { IRoutine } from '_types/types';
import { formatDate } from '_utils/helper';
import clsx from 'clsx';

interface RoutineCardProps {
  routine: IRoutine;
  onClick?: (routine: IRoutine) => void;
}

export const RoutineCard = ({ routine, onClick }: RoutineCardProps) => {
  const handleClick = () => {
    onClick?.(routine);
  };

  const getAllDays = () => {
    const days = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ] as const;
    return days.map((day) => ({
      day,
      routine: routine.routine?.[day],
      isRest: routine.routine?.[day]?.type === 'rest',
    }));
  };

  const allDays = getAllDays();

  return (
    <div
      className={clsx(
        'bg-black-5 rounded-secondary p-4 sm:p-5 cursor-pointer transition-all duration-200',
        'hover:bg-black-4 hover:shadow-lg border-2 border-transparent hover:border-blue-7',
        'flex flex-col gap-4'
      )}
      onClick={handleClick}
    >
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
        <h3 className='text-xl font-bold text-white-1 capitalize'>
          {routine.name}
        </h3>
        <div className='flex items-center gap-2'>
          <span
            className={clsx(
              'px-3 py-1 rounded-full text-sm font-medium capitalize',
              routine.status === 'active'
                ? 'bg-green-7 text-green-1 border border-green-1'
                : 'bg-red-7 text-red-2 border border-red-2'
            )}
          >
            {routine.status}
          </span>
        </div>
      </div>

      {/* Routine Days Summary */}
      <div className='space-y-2'>
        <h4 className='text-sm font-medium text-white-2 uppercase tracking-wide'>
          Workout Schedule
        </h4>
        {allDays.length > 0 ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
            {allDays.map(({ day, routine: dayRoutine, isRest }) => {
              return (
                <div
                  key={day}
                  className={clsx(
                    'flex items-center md:flex-col md:items-start md:justify-normal justify-between rounded-primary gap-x-2 px-3 py-2',
                    isRest ? 'bg-black-4 border border-black-2' : 'bg-black-3'
                  )}
                >
                  <span className='text-sm capitalize font-medium text-white-1'>
                    {day}
                  </span>
                  <span
                    className={clsx(
                      'text-xs capitalize font-medium',
                      isRest ? 'text-white-4 italic' : 'text-blue-1'
                    )}
                  >
                    {dayRoutine?.type || 'rest'}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className='bg-black-3 rounded-primary px-3 py-2 text-center'>
            <span className='text-sm text-white-4 italic'>
              No schedule defined
            </span>
          </div>
        )}
      </div>

      {/* Footer with timestamps */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-3 border-t border-black-3'>
        <div className='text-xs text-white-4'>
          Created:{' '}
          {routine.time?.createdAt ? formatDate(routine.time.createdAt) : 'N/A'}
        </div>
        {routine.time?.updatedAt && (
          <div className='text-xs text-white-4'>
            Updated: {formatDate(routine.time.updatedAt)}
          </div>
        )}
        {routine.status === 'active' && routine.time?.activatedAt && (
          <div className='text-xs text-green-1'>
            Activated: {formatDate(routine.time.activatedAt)}
          </div>
        )}
      </div>
    </div>
  );
};
