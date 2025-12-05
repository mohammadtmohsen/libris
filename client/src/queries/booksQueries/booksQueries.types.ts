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
  status: 'not_started' | 'want_to_read' | 'reading' | 'finished' | 'abandoned';
  visibility: 'private' | 'public';
  pageCount?: number;
  pagesRead?: number;
  createdAt?: string;
  updatedAt?: string;
  file: BookFile;
  cover?: BookCover;
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
  pagesRead?: number;
  pageCount?: number;
};

export type UpdateBookPagesRequest = {
  bookId: string;
  pagesRead?: number;
  pageCount?: number;
};
