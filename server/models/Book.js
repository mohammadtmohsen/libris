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
    file: { type: FileSchema, required: true },
    cover: { type: CoverSchema },
    pageCount: { type: Number, default: 0, min: 0 },
    publicationYear: {
      type: Number,
      min: -9999,
      max: 9999,
      validate: {
        validator: (value) =>
          value === undefined || value === null || value !== 0,
        message: 'publicationYear cannot be zero',
      },
    },
  },
  { timestamps: true, versionKey: false }
);

// Composite index to support default sorting
BookSchema.index({ publicationYear: -1, author: 1, title: 1 });

const Book = mongoose.models.Book || mongoose.model('Book', BookSchema);

export default Book;
