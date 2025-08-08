import mongoose from 'mongoose';

const WorkoutSchema = new mongoose.Schema(
  {
    muscleGroup: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
    muscleSubgroup: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
    exercise: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
    equipment: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
  },
  {
    collection: 'workout',
    versionKey: false, // This will remove the __v field
  }
);

const Workout = mongoose.model('Workout', WorkoutSchema);

export default Workout;
