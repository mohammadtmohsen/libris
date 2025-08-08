export type MuscleGroupKeys =
  | 'chest'
  | 'shoulders'
  | 'back'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'legs'
  | 'abdominals'
  | 'cardio';

export type SubGroupKeys =
  | 'chest'
  | 'upper chest (clavicular pectoralis)'
  | 'middle chest (sternal pectoralis)'
  | 'lower chest (costal pectoralis)'
  | 'inner chest'
  | 'outer chest'
  | 'shoulders'
  | 'front deltoid (anterior deltoid)'
  | 'side deltoid (lateral deltoid)'
  | 'rear deltoid (posterior deltoid)'
  | 'back'
  | 'upper back (trapezius & rhomboids)'
  | 'lats (latissimus dorsi)'
  | 'middle back (lats, rhomboids & traps)'
  | 'lower back (erector spinae)'
  | 'biceps'
  | 'biceps brachii'
  | 'biceps brachii long head (outer biceps)'
  | 'biceps brachii short head (inner biceps)'
  | 'brachialis (underneath biceps)'
  | 'triceps'
  | 'triceps brachii'
  | 'long head (inner triceps)'
  | 'lateral head (outer triceps)'
  | 'medial head (middle triceps)'
  | 'forearms'
  | 'forearm flexors'
  | 'forearm extensors'
  | 'forearm pronators'
  | 'forearm supinators'
  | 'forearm brachioradialis'
  | 'legs'
  | 'quadriceps (front thighs)'
  | 'hamstrings (back thighs)'
  | 'glutes (buttocks)'
  | 'adductors (inner thighs)'
  | 'abductors (outer thighs)'
  | 'calves'
  | 'abdominals'
  | 'upper abs'
  | 'lower abs'
  | 'obliques (sides)'
  | 'transverse abdominis (deep core)'
  | 'cardio';

type IEquipment =
  | 'machine'
  | 'cable'
  | 'barbell'
  | 'ez-bar'
  | 'v-bar'
  | 't-bar'
  | 'trap-bar'
  | 'dumbbells'
  | 'plates'
  | 'kettlebell'
  | 'rope'
  | 'bodyweight'
  | 'bands'
  | 'none';

type IRoutineType =
  | 'full body'
  | 'push'
  | 'pull'
  | 'legs'
  | 'chest'
  | 'shoulders'
  | 'back'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'abdominals'
  | 'cardio'
  | 'chest & shoulders'
  | 'chest & triceps'
  | 'chest & biceps'
  | 'back & shoulders'
  | 'back & biceps'
  | 'back & triceps'
  | 'legs & abs'
  | 'shoulders & biceps'
  | 'shoulders & triceps'
  | 'shoulders & arms'
  | 'legs & shoulders'
  | 'arms'
  | 'forearms'
  | 'rest';

type IReps = '8-12' | '12-15' | '10-12' | '15-20' | '20-25';

export type IExerciseDetails = {
  _id?: string;
  muscleGroup?: MuscleGroupKeys;
  muscleSubgroup?: SubGroupKeys;
  exercise?: string;
  equipment?: IEquipment;
};

export type SetInfo = {
  sets?: number;
  reps?: IReps;
  weight?: number;
  weightUnit?: 'kg' | 'plates';
};

export type IExercise = {
  exercise?: IExerciseDetails;
  setInfo?: SetInfo;
};

export type IWorkout = {
  type: IRoutineType;
  exercises?: IExercise[];
};

export type IDays =
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday';

export type RoutineCardProps = {
  day: IDays;
  workout: IWorkout;
};

export type IRoutineDays = {
  sunday: IWorkout;
  monday: IWorkout;
  tuesday: IWorkout;
  wednesday: IWorkout;
  thursday: IWorkout;
  friday: IWorkout;
  saturday: IWorkout;
};

export type IRoutine = {
  _id?: string;
  routine: IRoutineDays;
  status?: 'active' | 'inactive';
  name?: string;
  time?: {
    createdAt: number | null;
    updatedAt: number | null;
    activatedAt: number | null;
  };
};
