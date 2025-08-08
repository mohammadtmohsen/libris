import { IExercise } from '_types/types';

export const ExercisesCard = ({ exercise, setInfo }: IExercise) => {
  return (
    <li className='flex flex-col items-start gap-x-9 bg-black-2 text-lg rounded-primary p-4'>
      <div className='flex items-center justify-between gap-x-5 flex-wrap w-full'>
        <p className='font-black capitalize'>{exercise?.exercise}</p>
      </div>
      <div className='flex items-center justify-between gap-x-5 flex-wrap w-full'>
        <p className='text-sm capitalize'>
          muscle group: <strong>{exercise?.muscleGroup}</strong>
        </p>
        <p className='text-sm capitalize'>
          muscle subgroup: <strong>{exercise?.muscleSubgroup}</strong>
        </p>
        <p className='text-sm capitalize'>
          equipment: <strong>{exercise?.equipment}</strong>
        </p>
      </div>
      {setInfo && (
        <div className='flex items-center flex-wrap gap-x-5 text-sm capitalize'>
          <p>
            sets: <strong>{setInfo?.sets}</strong>
          </p>
          <p>
            reps: <strong>{setInfo?.reps}</strong>
          </p>
          <p>
            weight:{' '}
            <strong>
              {setInfo?.weight} {setInfo?.weightUnit}
            </strong>
          </p>
        </div>
      )}
    </li>
  );
};
