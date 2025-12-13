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
import { useActionToast } from '_components/shared';

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

  const actionToast = useActionToast();
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
    const bookTitle = book.title || 'Selected book';
    if (!book._id) {
      actionToast.showError({
        title: 'Delete failed',
        description: `Missing identifier for "${bookTitle}".`,
      });
      return;
    }
    try {
      actionToast.showToast({
        title: 'Deleting book…',
        description: `Removing "${bookTitle}" from your library.`,
      });
      await deleteBook(book._id);
      actionToast.showSuccess({
        title: 'Book deleted',
        description: `"${bookTitle}" has been removed.`,
      });
      next();
      // Optionally, you can add a success message or refresh the book list here
    } catch (error) {
      console.error('Failed to delete book:', error);
      const message =
        error instanceof Error
          ? error.message
          : 'Could not delete the selected book.';
      actionToast.showError({
        title: 'Delete failed',
        description: `"${bookTitle}": ${message}`,
      });
      // Optionally, you can show an error message to the user here
    }
  };

  const isSubmitting = isDeleteBookPending || isUpdateBookPending;

  const handleSubmit = (next: () => void) =>
    methods.handleSubmit(async (payload: UploadEditBookFormPayload) => {
      const targetTitle =
        payload.title?.trim() || book.title || 'Selected book';

      if (!book._id) {
        actionToast.showError({
          title: 'Update failed',
          description: `Missing identifier for "${targetTitle}".`,
        });
        return;
      }
      try {
        actionToast.showToast({
          title: 'Saving changes…',
          description: `Updating "${targetTitle}" details and metadata.`,
        });
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
        actionToast.showSuccess({
          title: 'Book updated',
          description: `"${targetTitle}" has been updated.`,
        });
        next();
        // onClose();
      } catch (err: unknown) {
        const detailed =
          err instanceof Error ? err.message : 'Failed to update the book.';
        console.error('Failed to update book:', detailed);
        actionToast.showError({
          title: 'Update failed',
          description: `"${targetTitle}": ${detailed || 'Please try again.'}`,
        });
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
