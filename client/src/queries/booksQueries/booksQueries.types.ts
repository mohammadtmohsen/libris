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
  pagesRead?: number;
  percent?: number;
  lastLocation?: string;
  lastOpenedAt?: string;
};

export type Book = {
  _id: string;
  owner?: string;
  title: string;
  author?: string;
  description?: string;
  tags?: string[];
  status: 'not_started' | 'reading' | 'finished' | 'abandoned';
  visibility: 'private' | 'public';
  file: BookFile;
  cover?: BookCover;
  progress?: BookProgress;
  createdAt?: string;
  updatedAt?: string;
};

export type BooksListResponse = {
  items: Book[];
  count?: number;
};

export type SignedUrlResponse = {
  signedUrl: string;
  expiresIn: number;
  expiresAt: string;
  mime?: string;
  coverUrl?: string;
};

export type PresignUploadRequest = {
  fileName: string;
  mimeType: string;
  isCover?: boolean;
  contentLength?: number;
};

export type PresignUploadResponse = {
  key: string;
  uploadUrl: string;
  expiresIn: number;
  headers?: Record<string, string>;
};

export type UploadToPresignedUrlRequest = {
  file: File;
  presign: PresignUploadResponse;
};

export type CompleteUploadRequest = {
  title: string;
  author?: string;
  description?: string;
  tags?: string[];
  status?: Book['status'];
  visibility?: Book['visibility'];
  file: Book['file'];
  cover?: Book['cover'];
};
