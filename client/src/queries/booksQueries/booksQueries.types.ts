import type { ProgressStatus } from '../progressQueries/progressQueries.types';

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
  tags?: string[];
  pageCount?: number;
  createdAt?: string;
  updatedAt?: string;
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
  file: Book['file'];
  cover?: Book['cover'];
  pageCount?: number;
};

export type BookFilters = {
  search?: string;
  status?: ProgressStatus[];
  tags?: string[];
};
