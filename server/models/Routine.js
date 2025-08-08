import mongoose from 'mongoose';

const ExerciseSetInfoSchema = new mongoose.Schema(
  {
    sets: { type: mongoose.Schema.Types.Number, required: true },
    reps: { type: mongoose.Schema.Types.String, required: true },
    weight: { type: mongoose.Schema.Types.Number, required: true },
    weightUnit: { type: mongoose.Schema.Types.String, required: true },
  },
  { _id: false }
);

const ExerciseSchema = new mongoose.Schema(
  {
    exercise: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workout',
        required: true,
      },
      muscleGroup: { type: mongoose.Schema.Types.String, required: true },
      muscleSubgroup: { type: mongoose.Schema.Types.String, required: true },
      exercise: { type: mongoose.Schema.Types.String, required: true },
      equipment: { type: mongoose.Schema.Types.String, required: true },
    },
    setInfo: { type: ExerciseSetInfoSchema, required: true },
  },
  { _id: false }
);

const DaySchema = new mongoose.Schema(
  {
    type: { type: mongoose.Schema.Types.String, required: true },
    exercises: { type: [ExerciseSchema], required: false },
  },
  { _id: false }
);

const RoutineDetailsSchema = new mongoose.Schema(
  {
    sunday: { type: DaySchema, required: true },
    monday: { type: DaySchema, required: true },
    tuesday: { type: DaySchema, required: true },
    wednesday: { type: DaySchema, required: true },
    thursday: { type: DaySchema, required: true },
    friday: { type: DaySchema, required: true },
    saturday: { type: DaySchema, required: true },
  },
  { _id: false }
);

const RoutineSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: { type: mongoose.Schema.Types.String, required: true },
    routine: { type: RoutineDetailsSchema, required: true },
    status: { type: mongoose.Schema.Types.String, required: true },
    time: {
      createdAt: { type: mongoose.Schema.Types.Number, required: false },
      updatedAt: { type: mongoose.Schema.Types.Number, required: false },
      activatedAt: { type: mongoose.Schema.Types.Number, required: false },
    },
  },
  {
    collection: 'routine',
    versionKey: false, // This will remove the __v field
  }
);

const Routine = mongoose.model('Routine', RoutineSchema);

export default Routine;
