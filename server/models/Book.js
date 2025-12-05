import mongoose from 'mongoose';

const { Schema } = mongoose;

// Removed ProgressSchema as progress tracking is no longer used

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
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    author: { type: String },
    description: { type: String },
    tags: [{ type: String }],
    status: {
      type: String,
      enum: ['not_started', 'want_to_read', 'reading', 'finished', 'abandoned'],
      default: 'not_started',
      index: true,
    },
    file: { type: FileSchema, required: true },
    cover: { type: CoverSchema },
    pageCount: { type: Number, default: 0, min: 0 },
    pagesRead: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

const Book = mongoose.models.Book || mongoose.model('Book', BookSchema);

export default Book;
