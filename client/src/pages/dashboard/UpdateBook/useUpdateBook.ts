import {
  Book,
  useCompleteUpload,
  usePresignUpload,
  useUploadToPresignedUrl,
} from '_queries/booksQueries';
import { useForm } from 'react-hook-form';
import { extractFirstPageAsImage } from '_utils/pdfCover';

type UploadEditBookFormPayload = {
  title: string;
  author: string;
  description: string;
  file: File | null;
};

export const useUpdateBook = (book: Book) => {
  const methods = useForm<UploadEditBookFormPayload>({
    defaultValues: {
      title: book.title || '',
      author: book.author || '',
      description: book.description || '',
      file: null as File | null,
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

  const handleSubmit = (next: () => void) =>
    methods.handleSubmit(async (payload: UploadEditBookFormPayload) => {
      if (!payload.file) {
        return;
      }

      try {
        // Auto-generate a cover from PDF first page; abort if extraction fails.
        let effectiveCover: File | null = null;
        let totalPages: number | undefined;
        if (payload.file.type === 'application/pdf') {
          try {
            const { file: coverFile, pageCount } = await extractFirstPageAsImage(
              payload.file,
              {
                maxWidth: 900,
                mimeType: 'image/jpeg',
                quality: 0.9,
                fileNameHint: payload.title || payload.file.name,
              }
            );
            effectiveCover = coverFile;
            totalPages = pageCount;
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

        await completeUploadMutateAsync({
          title: payload.title || payload.file.name.replace(/\.[^.]+$/, ''),
          author: payload.author || undefined,
          description: payload.description || undefined,
          status: 'not_started',
          visibility: 'private',
          file: {
            key: pdfPresign.key,
            mime: payload.file.type || 'application/pdf',
            size: payload.file.size,
            originalName: payload.file.name,
            pageCount: totalPages,
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
        // onClose();
      } catch (err: unknown) {
        const detailed = err instanceof Error ? err.message : String(err);
        console.error('Failed to upload book:', detailed);
      }
    });
  return { methods, handleSubmit, isSubmitting };
};
