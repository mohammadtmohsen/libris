import {
  Button,
  IncrementDecrementInput,
  CardSkeleton,
  ButtonToggleGroup,
  RepsSelector,
} from '_components/shared';
import {
  repsOptions,
  weightUnitToggleOptions,
} from '_constants/filtersOptions';
import {
  useGetActiveRoutine,
  useUpdateRoutine,
} from '_queries/routineQueries/routineQueries';
import { IRoutine } from '_types/types';
import { getTodayRoutine } from '_utils/helper';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const TodayActiveRoutine = ({ activeRoutine }: { activeRoutine: IRoutine }) => {
  const {
    control,
    handleSubmit,
    formState: { isDirty },
    reset,
    watch,
  } = useForm<IRoutine>({
    defaultValues: {
      ...activeRoutine,
    },
  });

  useEffect(() => {
    reset(activeRoutine);
  }, [activeRoutine, reset]);

  const { mutateAsync: updateRoutine, isPending: isUpdating } =
    useUpdateRoutine({
      routineId: activeRoutine?._id,
    });

  const todayRoutine = getTodayRoutine({
    activeRoutine: activeRoutine?.routine,
  });

  const onSubmit = async (data: IRoutine) => {
    console.log('data:', data);
    if (!activeRoutine?._id) return;
    try {
      const payload = {
        name: data.name,
        routine: data.routine,
      };
      await updateRoutine({
        id: activeRoutine._id,
        routine: payload,
      });
      toast.success('Routine updated successfully');
      // Form will be reset via the useEffect when the queryClient updates activeRoutine
    } catch (error) {
      toast.error('Error updating routine');
      console.error('Error updating routine:', error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      key={todayRoutine?.day}
      className='bg-black-5 rounded-secondary overflow-hidden flex flex-col gap-0'
    >
      <div>
        <h1 className='h-16 flex items-center justify-center text-2xl font-black bg-blue-4 uppercase'>
          {todayRoutine?.day}
        </h1>
        <h1 className='h-16 flex items-center justify-center text-xl font-black bg-black-3 uppercase'>
          {todayRoutine?.workout?.type}
        </h1>
      </div>
      <ul className='p-3 sm:p-5 flex flex-col gap-2'>
        {todayRoutine?.workout?.exercises?.map((exercise, index) => (
          <li
            key={index}
            className='flex flex-col items-start gap-x-9 bg-black-2 text-lg rounded-primary p-4'
          >
            <div className='flex items-center justify-between gap-x-5 flex-wrap w-full'>
              <p className='font-black capitalize'>
                {exercise?.exercise?.exercise}
              </p>
            </div>
            <div className='flex items-center justify-between gap-x-5 flex-wrap w-full'>
              <p className='text-sm capitalize'>
                muscle group: <strong>{exercise?.exercise?.muscleGroup}</strong>
              </p>
              <p className='text-sm capitalize'>
                muscle subgroup:{' '}
                <strong>{exercise?.exercise?.muscleSubgroup}</strong>
              </p>
              <p className='text-sm capitalize'>
                equipment: <strong>{exercise?.exercise?.equipment}</strong>
              </p>
            </div>
            {exercise?.setInfo && (
              <div className='grid grid-cols-4 w-full items-center flex-wrap gap-x-2 gap-y-2 text-sm capitalize'>
                <Controller
                  control={control}
                  name={`routine.${todayRoutine?.day}.exercises.${index}.setInfo.sets`}
                  render={({ field }) => (
                    <IncrementDecrementInput
                      label='Sets'
                      {...field}
                      min={0}
                      max={10}
                      step={1}
                      placeholder='Sets'
                    />
                  )}
                  rules={{ required: true }}
                />

                <Controller
                  control={control}
                  name={`routine.${todayRoutine?.day}.exercises.${index}.setInfo.weight`}
                  render={({ field }) => (
                    <IncrementDecrementInput
                      label='Wt.'
                      {...field}
                      min={0}
                      max={500}
                      step={
                        watch(
                          `routine.${todayRoutine?.day}.exercises.${index}.setInfo.weightUnit`
                        ) === 'kg'
                          ? 2.5
                          : 1
                      }
                      placeholder='Weight'
                    />
                  )}
                  rules={{ required: true }}
                />

                <Controller
                  control={control}
                  name={`routine.${todayRoutine?.day}.exercises.${index}.setInfo.reps`}
                  render={({ field }) => (
                    <RepsSelector
                      label='Reps'
                      options={repsOptions}
                      placeholder='e.g. 8-12'
                      {...field}
                    />
                  )}
                  rules={{ required: true }}
                />

                <Controller
                  control={control}
                  name={`routine.${todayRoutine?.day}.exercises.${index}.setInfo.weightUnit`}
                  render={({ field }) => (
                    <ButtonToggleGroup
                      options={weightUnitToggleOptions}
                      label='Unit'
                      {...field}
                    />
                  )}
                  rules={{ required: true }}
                />
              </div>
            )}
          </li>
        ))}
      </ul>
      {isDirty && (
        <div className='flex items-center justify-end gap-4 px-3 md:px-5 pb-3 md:pb-5'>
          <Button type='submit' loading={isUpdating} disabled={!isDirty}>
            Save
          </Button>
          <Button
            type='button'
            onClick={() => reset()}
            disabled={!isDirty || isUpdating}
          >
            Reset
          </Button>
        </div>
      )}
    </form>
  );
};

export const TodayWorkout = () => {
  const { data: activeRoutine, isLoading } = useGetActiveRoutine();
  return (
    <div className='flex flex-col gap-5 relative min-h-[170px] w-full'>
      <h1 className='font-black'>Today Workout</h1>
      <CardSkeleton
        loading={isLoading}
        count={1}
        rows={10}
        className='grid-cols-1'
      />
      <div className='relative'>
        {activeRoutine?._id && (
          <TodayActiveRoutine activeRoutine={activeRoutine} />
        )}
      </div>
    </div>
  );
};
