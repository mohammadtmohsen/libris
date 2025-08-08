export type Book = {
  id: string;
  title: string;
  fileName: string;
  mimeType?: string;
  size?: string;
  modifiedTime?: string;
  hasThumbnail?: boolean;
  thumbnailLink?: string | null;
  iconLink?: string | null;
  // Provided by server controller for proxying
  thumbnailUrl?: string; // e.g., "/books/:id/thumbnail"
};

export type BooksListResponse = {
  items: Book[];
  count: number;
};
