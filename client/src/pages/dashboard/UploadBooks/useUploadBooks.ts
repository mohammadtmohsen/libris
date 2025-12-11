import { useCompleteUpload } from '_queries/booksQueries';
import {
  usePresignUpload,
  useUploadToPresignedUrl,
} from '_queries/storageQueries';
import { useForm } from 'react-hook-form';
import { extractFirstPageAsImage } from '_utils/pdfCover';
import { UploadEditBookFormPayload } from '_components/shared/UploadEditBookForm/UploadEditBookForm';
import { toSignedPublicationYear } from '_utils/publicationYear';

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
    },
  });

  const { mutateAsync: presignMutateAsync, isPending: isPresignPending } =
    usePresignUpload();

  const { mutateAsync: uploadMutateAsync, isPending: isUploadPending } =
    useUploadToPresignedUrl();

  const {
    mutateAsync: completeUploadMutateAsync,
    isPending: isCompleteUploadPending,
  } = useCompleteUpload();

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

      try {
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

        await completeUploadMutateAsync({
          title: payload.title || payload.file.name.replace(/\.[^.]+$/, ''),
          author: payload.author || undefined,
          description: payload.description || undefined,
          tags: payload.tags,
          pageCount,
          publicationYear: signedPublicationYear,
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
        next();
        onClose();
      } catch (err: unknown) {
        const detailed = err instanceof Error ? err.message : String(err);
        console.error('Failed to upload book:', detailed);
      }
    });
  return { methods, handleSubmit, isSubmitting, onClose };
};
