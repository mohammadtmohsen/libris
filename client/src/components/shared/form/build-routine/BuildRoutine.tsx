import {
  CustomSelect,
  Button,
  Input,
  Sortable,
  IncrementDecrementInput,
  ButtonToggleGroup,
  RepsSelector,
  CardSkeleton,
} from '_components/shared';
import { useGetWorkouts } from '_queries/workoutQueries/workoutQueries';
import { IRoutine, IDays, IExerciseDetails, IExercise } from '_types/types';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { daysNames } from '_constants/daysName';
import {
  repsOptions,
  routineTypeOptions,
  weightUnitToggleOptions,
} from '_constants/filtersOptions';
import { capitalizeFirstLetter } from '_utils/helper';

export const BuildRoutine = ({
  routine,
  onSubmit,
  isSubmitting,
  onCancel,
}: {
  routine?: IRoutine;
  onSubmit: (data: IRoutine) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}) => {
  const { data, isLoading } = useGetWorkouts();

  const { control, handleSubmit, watch, setValue } = useForm<IRoutine>({
    defaultValues: {
      name: '',
      routine: {
        sunday: {
          type: 'rest',
          exercises: [],
        },
        monday: {
          type: 'rest',
          exercises: [],
        },
        tuesday: {
          type: 'rest',
          exercises: [],
        },
        wednesday: {
          type: 'rest',
          exercises: [],
        },
        thursday: {
          type: 'rest',
          exercises: [],
        },
        friday: {
          type: 'rest',
          exercises: [],
        },
        saturday: {
          type: 'rest',
          exercises: [],
        },
      },
      status: 'inactive',
      ...routine,
    },
  });

  const sundayFieldArray = useFieldArray({
    control: control,
    name: 'routine.sunday.exercises',
  });

  const mondayFieldArray = useFieldArray({
    control: control,
    name: 'routine.monday.exercises',
  });

  const tuesdayFieldArray = useFieldArray({
    control: control,
    name: 'routine.tuesday.exercises',
  });

  const wednesdayFieldArray = useFieldArray({
    control: control,
    name: 'routine.wednesday.exercises',
  });

  const thursdayFieldArray = useFieldArray({
    control: control,
    name: 'routine.thursday.exercises',
  });

  const fridayFieldArray = useFieldArray({
    control: control,
    name: 'routine.friday.exercises',
  });

  const saturdayFieldArray = useFieldArray({
    control: control,
    name: 'routine.saturday.exercises',
  });

  if (isLoading) {
    return (
      <div className=''>
        {/* Header skeleton */}
        <div className='flex flex-col md:flex-row justify-between items-center mb-6 gap-4'>
          <div className='flex items-center gap-3 w-full'>
            <div className='h-6 w-32 bg-black-3 rounded animate-pulse'></div>
            <div className='h-10 w-full bg-black-3 rounded animate-pulse'></div>
          </div>
        </div>

        {/* Form skeleton */}
        <div className=''>
          <CardSkeleton
            count={7}
            loading={true}
            rows={4}
            className='grid-cols-1 lg:grid-cols-2 gap-5'
          />
        </div>

        {/* Buttons skeleton */}
        <div className='flex justify-center sm:justify-end mt-5 gap-4'>
          <div className='h-10 w-full max-w-[130px] sm:max-w-[180px] bg-black-3 rounded animate-pulse'></div>
          <div className='h-10 w-full max-w-[130px] sm:max-w-[180px] bg-black-3 rounded animate-pulse'></div>
        </div>
      </div>
    );
  }

  const fieldArraysMap = {
    sunday: sundayFieldArray,
    monday: mondayFieldArray,
    tuesday: tuesdayFieldArray,
    wednesday: wednesdayFieldArray,
    thursday: thursdayFieldArray,
    friday: fridayFieldArray,
    saturday: saturdayFieldArray,
  };

  const dayTypes = {
    sunday: watch('routine.sunday.type'),
    monday: watch('routine.monday.type'),
    tuesday: watch('routine.tuesday.type'),
    wednesday: watch('routine.wednesday.type'),
    thursday: watch('routine.thursday.type'),
    friday: watch('routine.friday.type'),
    saturday: watch('routine.saturday.type'),
  };

  const renderDayCard = (day: IDays) => {
    const dayType = dayTypes[day] || 'rest';
    const { fields, append, remove, replace } = fieldArraysMap[day];
    const canAddExercises = dayType !== 'rest';

    const handleExercisesReorder = (reorderedItems: IExercise[]) => {
      replace(reorderedItems);
    };

    const renderExerciseItem = (exercise: IExercise, index: number) => (
      <li className='flex flex-col items-start gap-x-9 bg-black-2 text-lg rounded-primary p-3 sm:p-5'>
        <div className='flex items-center justify-between gap-x-5 flex-wrap w-full'>
          <div className='flex w-full items-center gap-x-2'>
            <Controller
              control={control}
              name={`routine.${day}.exercises.${index}.exercise._id`}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomSelect
                  placeholder='Select exercise'
                  onChange={(value) => {
                    const selectedExercise = data?.items?.find(
                      (item) => item._id === value
                    );
                    field.onChange(value);
                    setValue(
                      `routine.${day}.exercises.${index}.exercise._id`,
                      selectedExercise?._id
                    );
                    setValue(
                      `routine.${day}.exercises.${index}.exercise.exercise`,
                      selectedExercise?.exercise
                    );
                    setValue(
                      `routine.${day}.exercises.${index}.exercise.muscleGroup`,
                      selectedExercise?.muscleGroup
                    );
                    setValue(
                      `routine.${day}.exercises.${index}.exercise.muscleSubgroup`,
                      selectedExercise?.muscleSubgroup
                    );
                    setValue(
                      `routine.${day}.exercises.${index}.exercise.equipment`,
                      selectedExercise?.equipment
                    );

                    console.log('selectedExercise', selectedExercise);
                  }}
                  value={
                    field?.value as IExerciseDetails['exercise'] | undefined
                  }
                  options={
                    data?.items.map((item) => ({
                      label: capitalizeFirstLetter(item?.exercise || ''),
                      value: item?._id || '',
                    })) ?? []
                  }
                />
              )}
            />
            <div className='flex justify-end w-fit'>
              <Button
                onClick={() => remove(index)}
                variant='dangerOutline'
                iconButton='delete'
                // className='border-none'
              />
            </div>
          </div>
          <hr className='w-full border-t-2 border-black-5 my-2' />
          <div className='flex justify-between gap-x-5 flex-wrap w-full'>
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
        </div>
        <hr className='w-full border-t-2 border-black-5 my-2' />
        <div className='flex items-center justify-between gap-x-5 flex-wrap w-full'>
          <div className='grid grid-cols-4 gap-x-2 gap-y-2 text-sm capitalize w-full'>
            <Controller
              control={control}
              name={`routine.${day}.exercises.${index}.setInfo.sets`}
              render={({ field }) => (
                <IncrementDecrementInput
                  label='Sets'
                  min={0}
                  max={10}
                  step={1}
                  {...field}
                  placeholder='Sets'
                />
              )}
            />
            <Controller
              control={control}
              name={`routine.${day}.exercises.${index}.setInfo.weight`}
              render={({ field }) => (
                <IncrementDecrementInput
                  label='Wt.'
                  min={0}
                  max={500}
                  step={
                    watch(
                      `routine.${day}.exercises.${index}.setInfo.weightUnit`
                    ) === 'kg'
                      ? 2.5
                      : 1
                  }
                  {...field}
                  placeholder='Weight'
                />
              )}
            />

            <Controller
              control={control}
              name={`routine.${day}.exercises.${index}.setInfo.reps`}
              render={({ field }) => (
                <RepsSelector
                  label='Reps'
                  options={repsOptions}
                  placeholder='e.g. 8-12'
                  {...field}
                />
              )}
            />
            <Controller
              control={control}
              name={`routine.${day}.exercises.${index}.setInfo.weightUnit`}
              render={({ field }) => (
                <ButtonToggleGroup
                  label='Unit'
                  options={weightUnitToggleOptions}
                  {...field}
                />
              )}
            />
          </div>
        </div>
      </li>
    );

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
            <Controller
              name={`routine.${day}.type`}
              control={control}
              render={({ field }) => (
                <CustomSelect
                  placeholder='Select workout type'
                  customStyles={{
                    singleValue: (provided) => ({
                      ...provided,
                      width: '100%',
                      textAlign: 'center',
                      color: 'white',
                    }),
                  }}
                  onChange={(value) => {
                    field.onChange(value);
                    setValue(`routine.${day}.exercises`, []); // Clear exercises when type changes
                  }}
                  value={field.value}
                  options={routineTypeOptions}
                />
              )}
            />
          </h1>
        </div>
        <div className='p-3 sm:p-5'>
          {canAddExercises && fields.length > 0 ? (
            <Sortable
              items={fields}
              getItemId={(item) => item.id}
              onChange={handleExercisesReorder}
              renderItem={renderExerciseItem}
              className='flex flex-col gap-2'
            />
          ) : (
            <ul className='p-0 flex flex-col gap-2'></ul>
          )}

          {canAddExercises && (
            <div className='flex justify-center items-center w-full mt-2'>
              <Button
                onClick={() =>
                  append({
                    exercise: {},
                    setInfo: {
                      sets: 3,
                      reps: '8-12',
                      weight: 0,
                      weightUnit: 'kg',
                    },
                  })
                }
                variant='primaryOutline'
                iconButton='add'
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className=''>
      <div className='flex flex-col md:flex-row justify-between items-center mb-6 gap-4'>
        <div className='flex items-center gap-3 w-full'>
          <label
            htmlFor='routineName'
            className='text-xl grow whitespace-nowrap font-bold'
          >
            Routine Name:
          </label>
          <Controller
            control={control}
            name='name'
            rules={{ required: true }}
            render={({ field }) => (
              <Input
                className='bg-black-3 rounded-primary px-4 py-2 flex-grow'
                {...field}
              />
            )}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className=''>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-5'>
          {daysNames.map((day) => renderDayCard(day as IDays))}
        </div>
      </form>
      <div className='flex justify-center sm:justify-end mt-5 gap-4'>
        <Button
          type='submit'
          variant='primary'
          onClick={handleSubmit(onSubmit)}
          className='!w-full max-w-[130px] sm:max-w-[180px] shrink-0'
        >
          {routine ? 'Update Routine' : 'Create Routine'}
        </Button>
        <Button
          onClick={onCancel}
          type='button'
          variant='outline'
          disabled={isSubmitting}
          className='!w-full max-w-[130px] sm:max-w-[180px] shrink-0'
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};
