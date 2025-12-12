import mongoose from 'mongoose';

const { Schema } = mongoose;

const SeriesSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    totalParts: { type: Number, min: 1 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

SeriesSchema.index({ name: 1 });

const Series = mongoose.models.Series || mongoose.model('Series', SeriesSchema);

export default Series;
