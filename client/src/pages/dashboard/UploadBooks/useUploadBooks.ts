import { useCompleteUpload } from '_queries/booksQueries';
import {
  usePresignUpload,
  useUploadToPresignedUrl,
} from '_queries/storageQueries';
import { useForm } from 'react-hook-form';
import { extractFirstPageAsImage } from '_utils/pdfCover';
import { UploadEditBookFormPayload } from '_components/shared/UploadEditBookForm/UploadEditBookForm';
import { toSignedPublicationYear } from '_utils/publicationYear';
import { useGetSeries } from '_queries/seriesQueries';
import { useMemo } from 'react';
import { useActionToast } from '_components/shared';

export const useUploadBooks = () => {
  const methods = useForm<UploadEditBookFormPayload>({
    defaultValues: {
      title: '',
      author: '',
      description: '',
      file: null as File | null,
      tags: [],
      publicationYear: '',
      publicationEra: 'AD',
      seriesId: null,
      part: '',
    },
  });

  const actionToast = useActionToast();
  const { mutateAsync: presignMutateAsync, isPending: isPresignPending } =
    usePresignUpload();

  const { mutateAsync: uploadMutateAsync, isPending: isUploadPending } =
    useUploadToPresignedUrl();

  const {
    mutateAsync: completeUploadMutateAsync,
    isPending: isCompleteUploadPending,
  } = useCompleteUpload();

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

  const isSubmitting =
    isPresignPending || isUploadPending || isCompleteUploadPending;

  const onClose = () => {
    methods.reset();
  };

  const handleSubmit = (next: () => void) =>
    methods.handleSubmit(async (payload: UploadEditBookFormPayload) => {
      if (!payload.file) {
        return;
      }

      const displayTitle =
        payload.title?.trim() ||
        payload.file.name.replace(/\.[^.]+$/, '') ||
        'Your book';

      try {
        actionToast.showToast({
          title: 'Uploading book…',
          description: `Preparing "${displayTitle}" with its PDF, cover, and metadata.`,
        });
        // Auto-generate a cover from PDF first page; abort if extraction fails.
        let effectiveCover: File | null = null;
        let pageCount: number | undefined;
        if (payload.file.type === 'application/pdf') {
          try {
            const { file: coverFile, pageCount: extractedPageCount } =
              await extractFirstPageAsImage(payload.file, {
                maxWidth: 900,
                mimeType: 'image/jpeg',
                quality: 0.9,
                fileNameHint: payload.title || payload.file.name,
              });
            effectiveCover = coverFile;
            pageCount = extractedPageCount;
          } catch (e) {
            console.error('Cover extraction failed; aborting upload.', e);
            throw new Error('Cover page extraction failed. Upload aborted.');
          }
        }
        // Presign + upload PDF
        const pdfPresign = await presignMutateAsync({
          fileName: payload.file.name,
          mimeType: payload.file.type || 'application/pdf',
          contentLength: payload.file.size,
        });
        await uploadMutateAsync({ file: payload.file, presign: pdfPresign });

        // Presign + upload cover if provided (manually or auto-generated)
        let coverKey: string | undefined;
        let coverMime: string | undefined;
        let coverSize: number | undefined;
        let coverOriginalName: string | undefined;

        if (effectiveCover) {
          const coverPresign = await presignMutateAsync({
            fileName: effectiveCover.name,
            mimeType: effectiveCover.type || 'image/jpeg',
            isCover: true,
            contentLength: effectiveCover.size,
          });
          await uploadMutateAsync({
            file: effectiveCover,
            presign: coverPresign,
          });
          coverKey = coverPresign.key;
          coverMime = effectiveCover.type || 'image/jpeg';
          coverSize = effectiveCover.size;
          coverOriginalName = effectiveCover.name;
        }

        const signedPublicationYear = toSignedPublicationYear(
          payload.publicationYear,
          payload.publicationEra
        );

        const selectedSeriesId = payload.seriesId || null;
        const part =
          payload.part === '' ||
          payload.part === undefined ||
          payload.part === null
            ? undefined
            : Number(payload.part);

        await completeUploadMutateAsync({
          title: displayTitle,
          author: payload.author || undefined,
          description: payload.description || undefined,
          tags: payload.tags,
          pageCount,
          publicationYear: signedPublicationYear,
          seriesId: selectedSeriesId || undefined,
          part: selectedSeriesId ? part : undefined,
          file: {
            key: pdfPresign.key,
            mime: payload.file.type || 'application/pdf',
            size: payload.file.size,
            originalName: payload.file.name,
          },
          cover: coverKey
            ? {
                key: coverKey,
                mime: coverMime,
                size: coverSize,
                originalName: coverOriginalName,
              }
            : undefined,
        });
        actionToast.showSuccess({
          title: 'Upload complete',
          description: `"${displayTitle}" is synced and ready to view.`,
        });
        next();
        onClose();
      } catch (err: unknown) {
        const detailed =
          err instanceof Error
            ? err.message
            : 'Something went wrong while uploading the book.';
        console.error('Failed to upload book:', detailed);
        actionToast.showError({
          title: 'Upload failed',
          description: `"${displayTitle}": ${detailed}`,
        });
      }
    });
  return {
    methods,
    handleSubmit,
    isSubmitting,
    onClose,
    seriesOptions,
    isSeriesLoading,
  };
};
