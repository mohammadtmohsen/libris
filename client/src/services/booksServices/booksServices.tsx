import axios from '_axios';
import type { Book, BooksListResponse, SignedUrlResponse } from './booksServices.types';

const mapBook = (book: Book): Book => ({
  ...book,
  id: book.id || book._id || '',
});

export const booksServices = {
  getAllBooks: async (params?: object) => {
    const endPoint = '/books';
    const res = await axios.get<unknown, { data: { data: Book[] } }>(endPoint, { params });
    const items = (res.data.data || []).map(mapBook);
    return {
      items,
      count: items.length,
    } as BooksListResponse;
  },

  getBookById: async (id: string) => {
    const res = await axios.get<unknown, { data: { data: Book } }>(`/books/${id}`);
    return mapBook(res.data.data);
  },

  getSignedUrl: async (id: string, includeCover = false) => {
    const res = await axios.get<unknown, { data: { data: SignedUrlResponse } }>(
      `/books/${id}/url`,
      { params: { includeCover } }
    );
    return res.data.data;
  },

  getCoverUrl: async (id: string) => {
    const res = await axios.get<unknown, { data: { data: { coverUrl: string } } }>(
      `/books/${id}/thumbnail`
    );
    return res.data.data.coverUrl;
  },
};
