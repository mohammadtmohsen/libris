export type Series = {
  _id: string;
  name: string;
  totalParts?: number | null;
};

export type SeriesInput = {
  name: string;
  totalParts?: number | null;
};

export type SeriesUpdateInput = Partial<SeriesInput>;
