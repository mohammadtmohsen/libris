import mongoose from 'mongoose';

const { Schema } = mongoose;

const ProgressSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    book: {
      type: Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['not_started', 'want_to_read', 'reading', 'finished', 'abandoned'],
      default: 'not_started',
    },
    wantToReadAt: { type: Date },
    startedAt: { type: Date },
    finishedAt: { type: Date },
    abandonedAt: { type: Date },
    pagesRead: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true, versionKey: false }
);

ProgressSchema.index({ owner: 1, book: 1 }, { unique: true });

const Progress =
  mongoose.models.Progress || mongoose.model('Progress', ProgressSchema);

export default Progress;
