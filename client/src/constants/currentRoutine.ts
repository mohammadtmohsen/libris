import { IRoutine } from '_types/types';

export const currentRoutine: IRoutine = {
  routine: {
    sunday: {
      type: 'push',
      exercises: [
        {
          exercise: {
            muscleGroup: 'chest',
            muscleSubgroup: 'chest',
            exercise: 'Flat Bench Press',
            equipment: 'machine',
          },
          setInfo: {
            sets: 4,
            reps: '8-12',
            weight: 0,
            weightUnit: 'kg',
          },
        },
        {
          exercise: {
            muscleGroup: 'chest',
            muscleSubgroup: 'chest',
            exercise: 'Incline Bench Press',
            equipment: 'dumbbells',
          },
          setInfo: {
            sets: 3,
            reps: '8-12',
            weight: 0,
            weightUnit: 'kg',
          },
        },
        {
          exercise: {
            muscleGroup: 'shoulders',
            muscleSubgroup: 'shoulders',
            exercise: 'Shoulder Press',
            equipment: 'dumbbells',
          },
          setInfo: {
            sets: 3,
            reps: '8-12',
            weight: 0,
            weightUnit: 'kg',
          },
        },
        {
          exercise: {
            muscleGroup: 'shoulders',
            muscleSubgroup: 'shoulders',
            exercise: 'Lateral Raise',
            equipment: 'dumbbells',
          },
          setInfo: {
            sets: 3,
            reps: '12-15',
            weight: 0,
            weightUnit: 'kg',
          },
        },
        {
          exercise: {
            muscleGroup: 'triceps',
            muscleSubgroup: 'triceps',
            exercise: 'Triceps Pushdown',
            equipment: 'cable',
          },
          setInfo: {
            sets: 3,
            reps: '10-12',
            weight: 0,
            weightUnit: 'kg',
          },
        },
        {
          exercise: {
            muscleGroup: 'triceps',
            muscleSubgroup: 'triceps',
            exercise: 'Overhead Triceps Extension',
            equipment: 'cable',
          },
          setInfo: {
            sets: 3,
            reps: '10-12',
            weight: 0,
            weightUnit: 'kg',
          },
        },
      ],
    },
    monday: {
      type: 'pull',
      exercises: [
        {
          exercise: {
            muscleGroup: 'back',
            muscleSubgroup: 'lats (latissimus dorsi)',
            exercise: 'Lat Pulldown',
            equipment: 'cable',
          },
          setInfo: {
            sets: 4,
            reps: '8-12',
            weight: 0,
            weightUnit: 'kg',
          },
        },
        {
          exercise: {
            muscleGroup: 'back',
            muscleSubgroup: 'middle back (lats, rhomboids & traps)',
            exercise: 'Seated Row',
            equipment: 'cable',
          },
          setInfo: {
            sets: 3,
            reps: '8-12',
            weight: 0,
            weightUnit: 'kg',
          },
        },
        {
          exercise: {
            muscleGroup: 'back',
            muscleSubgroup: 'lower back (erector spinae)',
            exercise: 'Rows',
            equipment: 'cable',
          },
          setInfo: {
            sets: 3,
            reps: '8-12',
            weight: 0,
            weightUnit: 'kg',
          },
        },
        {
          exercise: {
            muscleGroup: 'shoulders',
            muscleSubgroup: 'rear deltoid (posterior deltoid)',
            exercise: 'Face Pull',
            equipment: 'cable',
          },
          setInfo: {
            sets: 3,
            reps: '12-15',
            weight: 0,
            weightUnit: 'kg',
          },
        },
        {
          exercise: {
            muscleGroup: 'biceps',
            muscleSubgroup: 'biceps',
            exercise: 'Bicep Curl',
            equipment: 'dumbbells',
          },
          setInfo: {
            sets: 3,
            reps: '10-12',
            weight: 0,
            weightUnit: 'kg',
          },
        },
        {
          exercise: {
            muscleGroup: 'biceps',
            muscleSubgroup: 'biceps',
            exercise: 'Hammer Curl',
            equipment: 'cable',
          },
          setInfo: {
            sets: 3,
            reps: '10-12',
            weight: 0,
            weightUnit: 'kg',
          },
        },
      ],
    },
    tuesday: {
      type: 'legs',
      exercises: [
        {
          exercise: {
            muscleGroup: 'legs',
            muscleSubgroup: 'quadriceps (front thighs)',
            exercise: 'Leg Press',
            equipment: 'machine',
          },
          setInfo: {
            sets: 4,
            reps: '8-12',
            weight: 0,
            weightUnit: 'kg',
          },
        },
        {
          exercise: {
            muscleGroup: 'legs',
            muscleSubgroup: 'hamstrings (back thighs)',
            exercise: 'Leg Curl',
            equipment: 'cable',
          },
          setInfo: {
            sets: 3,
            reps: '10-12',
            weight: 0,
            weightUnit: 'kg',
          },
        },
      ],
    },
    wednesday: {
      type: 'rest',
      exercises: [],
    },
    thursday: {
      type: 'push',
      exercises: [
        {
          exercise: {
            muscleGroup: 'chest',
            muscleSubgroup: 'chest',
            exercise: 'Flat Bench Press',
            equipment: 'dumbbells',
          },
          setInfo: {
            sets: 4,
            reps: '8-12',
            weight: 0,
            weightUnit: 'kg',
          },
        },
        {
          exercise: {
            muscleGroup: 'chest',
            muscleSubgroup: 'chest',
            exercise: 'Incline Bench Press',
            equipment: 'dumbbells',
          },
          setInfo: {
            sets: 3,
            reps: '8-12',
            weight: 0,
            weightUnit: 'kg',
          },
        },
        {
          exercise: {
            muscleGroup: 'shoulders',
            muscleSubgroup: 'shoulders',
            exercise: 'Shoulder Press',
            equipment: 'dumbbells',
          },
          setInfo: {
            sets: 3,
            reps: '8-12',
            weight: 0,
            weightUnit: 'kg',
          },
        },
        {
          exercise: {
            muscleGroup: 'shoulders',
            muscleSubgroup: 'shoulders',
            exercise: 'Lateral Raise',
            equipment: 'dumbbells',
          },
          setInfo: {
            sets: 3,
            reps: '12-15',
            weight: 0,
            weightUnit: 'kg',
          },
        },
        {
          exercise: {
            muscleGroup: 'triceps',
            muscleSubgroup: 'triceps',
            exercise: 'Triceps Pushdown',
            equipment: 'cable',
          },
          setInfo: {
            sets: 3,
            reps: '10-12',
            weight: 0,
            weightUnit: 'kg',
          },
        },
        {
          exercise: {
            muscleGroup: 'triceps',
            muscleSubgroup: 'triceps',
            exercise: 'Overhead Triceps Extension',
            equipment: 'cable',
          },
          setInfo: {
            sets: 3,
            reps: '10-12',
            weight: 0,
            weightUnit: 'kg',
          },
        },
      ],
    },
    friday: {
      type: 'pull',
      exercises: [
        {
          exercise: {
            muscleGroup: 'back',
            muscleSubgroup: 'lats (latissimus dorsi)',
            exercise: 'Lat Pulldown',
            equipment: 'cable',
          },
          setInfo: {
            sets: 4,
            reps: '8-12',
            weight: 0,
            weightUnit: 'kg',
          },
        },
        {
          exercise: {
            muscleGroup: 'back',
            muscleSubgroup: 'middle back (lats, rhomboids & traps)',
            exercise: 'Seated Row',
            equipment: 'cable',
          },
          setInfo: {
            sets: 3,
            reps: '8-12',
            weight: 0,
            weightUnit: 'kg',
          },
        },
        {
          exercise: {
            muscleGroup: 'back',
            muscleSubgroup: 'lower back (erector spinae)',
            exercise: 'Rows',
            equipment: 'cable',
          },
          setInfo: {
            sets: 3,
            reps: '8-12',
            weight: 0,
            weightUnit: 'kg',
          },
        },
        {
          exercise: {
            muscleGroup: 'shoulders',
            muscleSubgroup: 'rear deltoid (posterior deltoid)',
            exercise: 'Face Pull',
            equipment: 'cable',
          },
          setInfo: {
            sets: 3,
            reps: '12-15',
            weight: 0,
            weightUnit: 'kg',
          },
        },
        {
          exercise: {
            muscleGroup: 'biceps',
            muscleSubgroup: 'biceps',
            exercise: 'Bicep Curl',
            equipment: 'dumbbells',
          },
          setInfo: {
            sets: 3,
            reps: '10-12',
            weight: 0,
            weightUnit: 'kg',
          },
        },
        {
          exercise: {
            muscleGroup: 'biceps',
            muscleSubgroup: 'biceps',
            exercise: 'Hammer Curl',
            equipment: 'cable',
          },
          setInfo: {
            sets: 3,
            reps: '10-12',
            weight: 0,
            weightUnit: 'kg',
          },
        },
      ],
    },
    saturday: {
      type: 'rest',
      exercises: [],
    },
  },
  status: 'active',
  time: {
    createdAt: Date.now(),
    updatedAt: Date.now(),
    activatedAt: Date.now(),
  },
  name: 'My Routine',
};
