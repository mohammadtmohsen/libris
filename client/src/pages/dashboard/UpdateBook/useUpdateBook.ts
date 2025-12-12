import { Book, useDeleteBook, useUpdateBookById } from '_queries/booksQueries';
import { useForm } from 'react-hook-form';
import { UploadEditBookFormPayload } from '_components/shared/UploadEditBookForm/UploadEditBookForm';
import {
  getAbsolutePublicationYear,
  getPublicationEraFromYear,
  toSignedPublicationYear,
} from '_utils/publicationYear';
import { useGetSeries } from '_queries/seriesQueries';
import { useMemo } from 'react';

export const useUpdateBook = (book: Book) => {
  const methods = useForm<UploadEditBookFormPayload>({
    defaultValues: {
      title: book.title || '',
      author: book.author || '',
      description: book.description || '',
      file: null as File | null,
      tags: book.tags || [],
      publicationYear: getAbsolutePublicationYear(book.publicationYear) ?? '',
      publicationEra: getPublicationEraFromYear(book.publicationYear) ?? 'AD',
      seriesId: book.seriesId ?? (book.series?._id || null) ?? null,
      part: book.part ?? null,
    },
  });

  const { mutateAsync: deleteBook, isPending: isDeleteBookPending } =
    useDeleteBook();

  const { mutateAsync: updateBookMutateAsync, isPending: isUpdateBookPending } =
    useUpdateBookById();

  const { data: seriesList = [], isLoading: isSeriesLoading } = useGetSeries();
  const seriesOptions = useMemo(
    () =>
      seriesList.map((s) => ({
        value: s._id,
        label: s.name,
        totalParts: s.totalParts,
        customLabel:
          typeof s.totalParts === 'number'
            ? `${s.name} (${s.totalParts} parts)`
            : s.name,
      })),
    [seriesList]
  );

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
        const selectedSeriesId = payload.seriesId || null;
        const partValue =
          payload.part === '' ||
          payload.part === undefined ||
          payload.part === null
            ? null
            : Number(payload.part);

        await updateBookMutateAsync({
          bookId: book._id,
          updateData: {
            title: payload?.title || '',
            author: payload?.author || undefined,
            description: payload.description || undefined,
            tags: payload.tags,
            seriesId:
              selectedSeriesId === null
                ? null
                : selectedSeriesId
                ? selectedSeriesId
                : undefined,
            part: selectedSeriesId ? partValue : null,
            publicationYear:
              payload.publicationYear === ''
                ? null
                : toSignedPublicationYear(
                    payload.publicationYear,
                    payload.publicationEra
                  ),
          },
        });
        next();
        // onClose();
      } catch (err: unknown) {
        const detailed = err instanceof Error ? err.message : String(err);
        console.error('Failed to upload book:', detailed);
      }
    });
  return {
    methods,
    handleSubmit,
    isSubmitting,
    onDeleteBook,
    seriesOptions,
    isSeriesLoading,
  };
};
