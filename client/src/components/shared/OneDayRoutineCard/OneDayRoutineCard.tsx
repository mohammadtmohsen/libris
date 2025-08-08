import { RoutineCardProps } from '_types/types';
import { ExercisesCard } from '../ExercisesCard/ExercisesCard';

export const OneDayRoutineCard = ({
  day,
  workout: { type, exercises },
}: RoutineCardProps) => {
  return (
    <div
      key={day}
      className='bg-black-5 rounded-secondary overflow-hidden flex flex-col gap-0'
    >
      <div>
        <h1 className='h-16 flex items-center justify-center text-2xl font-black bg-blue-4 uppercase'>
          {day}
        </h1>
        <h1 className='h-16 flex items-center justify-center text-xl font-black bg-black-3 uppercase'>
          {type}
        </h1>
      </div>
      <ul className='p-3 sm:p-5 flex flex-col gap-2'>
        {exercises?.map((exercise) => (
          <ExercisesCard key={exercise.exercise?._id} {...exercise} />
        ))}
      </ul>
    </div>
  );
};
