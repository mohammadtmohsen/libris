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
  wantToReadAt?: string | null;
  startedAt?: string | null;
  finishedAt?: string | null;
  abandonedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ProgressUpdateRequest = {
  bookId: string;
  status?: ProgressStatus;
  pagesRead?: number;
};
