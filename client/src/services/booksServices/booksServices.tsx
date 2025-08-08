import axios from '_axios';
import type { Book, BooksListResponse } from './booksServices.types';
export const booksServices = {
  getAllBooks: async (params?: object) => {
    const endPoint = '/books';
    try {
      const res = await axios.get<
        unknown,
        { data: { data: Book[]; total: number } }
      >(endPoint, { params });
      // Normalize to items/count for existing components contract
      return {
        items: res.data.data,
        count: res.data.total,
      } as BooksListResponse;
    } catch (error) {
      throw Promise.reject(error);
    }
  },
  getBookById: async (id: string) => {
    const res = await axios.get<unknown, { data: { data: Book } }>(
      `/books/${id}`
    );
    return res.data.data;
  },
  getThumbnailUrl: (book: Pick<Book, 'id' | 'thumbnailUrl'>) => {
    // thumbnailUrl is already relative path from server; caller should prefix with baseURL if needed
    return book.thumbnailUrl ?? `/books/${book.id}/thumbnail`;
  },
};
