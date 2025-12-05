export type ProgressStatus =
  | 'not_started'
  | 'want_to_read'
  | 'reading'
  | 'finished'
  | 'abandoned';

export type Progress = {
  _id?: string;
  book: string;
  owner?: string;
  status: ProgressStatus;
  pagesRead: number;
  createdAt?: string;
  updatedAt?: string;
};

export type ProgressUpdateRequest = {
  bookId: string;
  status?: ProgressStatus;
  pagesRead?: number;
};
