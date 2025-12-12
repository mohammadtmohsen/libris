import mongoose from 'mongoose';

const { Schema } = mongoose;

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
    seriesId: { type: Schema.Types.ObjectId, ref: 'Series' },
    part: {
      type: Number,
      min: 1,
      validate: {
        validator: function (value) {
          if (value === undefined || value === null) return true;
          const isUpdate = typeof this.getUpdate === 'function';
          if (isUpdate) {
            const update = this.getUpdate() || {};
            const set = update.$set || {};
            const unset = update.$unset || {};
            if (Object.prototype.hasOwnProperty.call(unset, 'part')) return true;

            const seriesUnset = Object.prototype.hasOwnProperty.call(
              unset,
              'seriesId'
            );
            const nextSeriesId = Object.prototype.hasOwnProperty.call(
              set,
              'seriesId'
            )
              ? set.seriesId
              : update.seriesId;

            if (seriesUnset) return false;
            if (nextSeriesId === null || nextSeriesId === undefined) return false;
            return true;
          }
          return Boolean(this.seriesId);
        },
        message: 'part requires an associated series',
      },
    },
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

BookSchema.index({
  seriesId: 1,
  part: 1,
});
BookSchema.index({
  publicationYear: -1,
  seriesId: 1,
  part: 1,
  author: 1,
  title: 1,
});

BookSchema.pre('validate', function (next) {
  if (!this.seriesId) {
    this.part = undefined;
  }
  next();
});

BookSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() || {};
  const unsetSeries =
    (update.$unset && Object.prototype.hasOwnProperty.call(update.$unset, 'seriesId')) ||
    (update.$set &&
      Object.prototype.hasOwnProperty.call(update.$set, 'seriesId') &&
      (update.$set.seriesId === null || update.$set.seriesId === undefined));

  if (unsetSeries) {
    update.$unset = { ...(update.$unset || {}), part: '' };
  }

  if (update.$set && update.$set.seriesId === null) {
    update.$set.seriesId = undefined;
  }

  this.setUpdate(update);
  next();
});

const Book = mongoose.models.Book || mongoose.model('Book', BookSchema);

export default Book;
