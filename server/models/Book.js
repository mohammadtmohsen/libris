import mongoose from 'mongoose';

const { Schema } = mongoose;

const ProgressSchema = new Schema(
  {
    pagesRead: { type: Number, default: 0 },
    percent: { type: Number, default: 0, min: 0, max: 100 },
    lastLocation: { type: String },
    lastOpenedAt: { type: Date },
  },
  { _id: false }
);

const FileSchema = new Schema(
  {
    key: { type: String, required: true },
    mime: { type: String, required: true },
    size: { type: Number, required: true },
    originalName: { type: String },
    pageCount: { type: Number },
  },
  { _id: false }
);

const CoverSchema = new Schema(
  {
    key: { type: String, required: true },
    mime: { type: String },
    size: { type: Number },
    originalName: { type: String },
  },
  { _id: false }
);

const BookSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    author: { type: String },
    description: { type: String },
    tags: [{ type: String }],
    status: {
      type: String,
      enum: ['not_started', 'reading', 'finished', 'abandoned'],
      default: 'not_started',
      index: true,
    },
    visibility: { type: String, enum: ['private', 'public'], default: 'private' },
    file: { type: FileSchema, required: true },
    cover: { type: CoverSchema },
    progress: { type: ProgressSchema, default: () => ({}) },
  },
  { timestamps: true }
);

const Book = mongoose.models.Book || mongoose.model('Book', BookSchema);

export default Book;
