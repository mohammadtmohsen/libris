import mongoose from 'mongoose';

const MeasurementSchema = new mongoose.Schema(
  {
    weight: {
      type: mongoose.Schema.Types.Number,
      required: true,
    },
    neck: {
      type: mongoose.Schema.Types.Number,
      required: true,
    },
    shoulders: {
      type: mongoose.Schema.Types.Number,
      required: true,
    },
    chest: {
      type: mongoose.Schema.Types.Number,
      required: true,
    },
    arms: {
      type: mongoose.Schema.Types.Number,
      required: true,
    },
    forearms: {
      type: mongoose.Schema.Types.Number,
      required: true,
    },
    waist: {
      type: mongoose.Schema.Types.Number,
      required: true,
    },
    hips: {
      type: mongoose.Schema.Types.Number,
      required: true,
    },
    thighs: {
      type: mongoose.Schema.Types.Number,
      required: true,
    },
    calves: {
      type: mongoose.Schema.Types.Number,
      required: true,
    },
  },
  { _id: false }
); // Add this option to disable _id generation

const RecordSchema = new mongoose.Schema(
  {
    date: {
      type: mongoose.Schema.Types.Number,
      required: true,
    },
    measurements: {
      type: MeasurementSchema,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    collection: 'record',
    versionKey: false, // This will remove the __v field
  }
);

const Record = mongoose.model('Record', RecordSchema);

export default Record;
