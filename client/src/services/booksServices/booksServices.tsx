import axios from '_axios';
import axiosRaw from 'axios';
import type {
  Book,
  BooksListResponse,
  SignedUrlResponse,
  PresignUploadRequest,
  PresignUploadResponse,
} from './booksServices.types';

export const booksServices = {
  getAllBooks: async (params?: object) => {
    const endPoint = '/books';
    const res = await axios.get<unknown, { data: { data: Book[] } }>(endPoint, {
      params,
    });
    const items = res.data.data || [];
    return {
      items,
      count: items.length,
    } as BooksListResponse;
  },

  getBookById: async (id: string) => {
    const res = await axios.get<unknown, { data: { data: Book } }>(
      `/books/${id}`
    );
    return res.data.data;
  },

  getSignedUrl: async (id: string, includeCover = false) => {
    const res = await axios.get<unknown, { data: { data: SignedUrlResponse } }>(
      `/books/${id}/url`,
      { params: { includeCover } }
    );
    return res.data.data;
  },

  getCoverUrl: async (id: string) => {
    const res = await axios.get<
      unknown,
      { data: { data: { coverUrl: string } } }
    >(`/books/${id}/thumbnail`);
    return res.data.data.coverUrl;
  },

  presignUpload: async (payload: PresignUploadRequest) => {
    const res = await axios.post<
      unknown,
      { data: { data: PresignUploadResponse } }
    >('/books/presign-upload', payload);
    return res.data.data;
  },

  uploadToPresignedUrl: async (file: File, presign: PresignUploadResponse) => {
    const headers: Record<string, string> = {
      'Content-Type': file.type || 'application/octet-stream',
      ...(presign.headers || {}),
    };
    await axiosRaw.put(presign.uploadUrl, file, { headers });
  },

  completeUpload: async (payload: {
    title: string;
    author?: string;
    description?: string;
    tags?: string[];
    status?: Book['status'];
    visibility?: Book['visibility'];
    file: Book['file'];
    cover?: Book['cover'];
  }) => {
    const res = await axios.post<unknown, { data: { data: Book } }>(
      '/books/complete',
      payload
    );
    return res.data.data;
  },
};
