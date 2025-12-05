import { Book, useDeleteBook, useUpdateBookById } from '_queries/booksQueries';
import { useForm } from 'react-hook-form';
import { UploadEditBookFormPayload } from '_components/shared/UploadEditBookForm/UploadEditBookForm';

export const useUpdateBook = (book: Book) => {
  const methods = useForm<UploadEditBookFormPayload>({
    defaultValues: {
      title: book.title || '',
      author: book.author || '',
      description: book.description || '',
      file: null as File | null,
      tags: book.tags || [],
    },
  });

  const { mutateAsync: deleteBook, isPending: isDeleteBookPending } =
    useDeleteBook();

  const { mutateAsync: updateBookMutateAsync, isPending: isUpdateBookPending } =
    useUpdateBookById();

  const onDeleteBook = async (next: () => void) => {
    if (!book._id) {
      return;
    }
    try {
      await deleteBook(book._id);
      next();
      // Optionally, you can add a success message or refresh the book list here
    } catch (error) {
      console.error('Failed to delete book:', error);
      // Optionally, you can show an error message to the user here
    }
  };

  const isSubmitting = isDeleteBookPending || isUpdateBookPending;

  const handleSubmit = (next: () => void) =>
    methods.handleSubmit(async (payload: UploadEditBookFormPayload) => {
      if (!book._id) {
        return;
      }
      try {
        await updateBookMutateAsync({
          bookId: book._id,
          updateData: {
            title: payload?.title || '',
            author: payload?.author || undefined,
            description: payload.description || undefined,
            tags: payload.tags,
          },
        });
        next();
        // onClose();
      } catch (err: unknown) {
        const detailed = err instanceof Error ? err.message : String(err);
        console.error('Failed to upload book:', detailed);
      }
    });
  return { methods, handleSubmit, isSubmitting, onDeleteBook };
};
