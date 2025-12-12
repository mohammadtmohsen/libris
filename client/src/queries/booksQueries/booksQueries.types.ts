import type { ProgressStatus } from '../progressQueries/progressQueries.types';
import type { Series } from '../seriesQueries/seriesQueries.types';

export type BookFile = {
  key: string;
  mime: string;
  size: number;
  originalName?: string;
  pageCount?: number;
};

export type BookCover = {
  key: string;
  mime?: string;
  size?: number;
  originalName?: string;
  coverUrl?: string;
};

export type BookProgress = {
  status: ProgressStatus;
  pagesRead: number;
  book?: string;
  updatedAt?: string;
  createdAt?: string;
};

export type Book = {
  _id: string;
  owner?: string;
  title: string;
  author?: string;
  description?: string;
  seriesId?: string | null;
  part?: number;
  series?: Series;
  tags?: string[];
  pageCount?: number;
  createdAt?: string;
  updatedAt?: string;
  publicationYear?: number | null;
  file: BookFile;
  cover?: BookCover;
  progress?: BookProgress;
};

export type BooksListResponse = {
  items: Book[];
  count: number;
  page?: number;
  pageSize?: number;
  hasMore?: boolean;
};

export type CompleteUploadRequest = {
  title: string;
  author?: string;
  description?: string;
  tags?: string[];
  publicationYear?: number | null;
  seriesId?: string | null;
  part?: number;
  file: Book['file'];
  cover?: Book['cover'];
  pageCount?: number;
};

export type BookFilters = {
  search?: string;
  status?: ProgressStatus[];
  tags?: string[];
  part?: number;
  seriesIds?: string[];
  seriesId?: string;
};
