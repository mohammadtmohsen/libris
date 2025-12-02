import { useCompleteUpload, usePresignUpload, useUploadToPresignedUrl } from "_queries/booksQueries/booksQueries";
import { useForm } from "react-hook-form";

type UploadBookFormPayload = {
  title: string;
  author: string;
  description: string;
  file: File | null;
  cover: File | null;
};

export const useUploadBooks = ({ onClose }: { onClose: () => void }) => {
  const methods = useForm<UploadBookFormPayload>({
    defaultValues: {
      title: '',
      author: '',
      description: '',
      file: null as File | null,
      cover: null as File | null,
    },
  });

  const {
    mutateAsync: presignMutateAsync,
    isPending: isPresignPending,
    isError: isPresignError,
  } = usePresignUpload();

  const {
    mutateAsync: uploadMutateAsync,
    isPending: isUploadPending,
    isError: isUploadError,
  } = useUploadToPresignedUrl();

  const {
    mutateAsync: completeUploadMutateAsync,
    isPending: isCompleteUploadPending,
    isError: isCompleteUploadError,
  } = useCompleteUpload();

  const isSubmitting =
    isPresignPending || isUploadPending || isCompleteUploadPending;

  const isError = isPresignError || isUploadError || isCompleteUploadError;

  const handleSubmit = methods.handleSubmit(async (payload: UploadBookFormPayload) => {
    if (!payload.file) {
      return;
    }

    try {
      // Presign + upload PDF
      const pdfPresign = await presignMutateAsync({
        fileName: payload.file.name,
        mimeType: payload.file.type || 'application/pdf',
        contentLength: payload.file.size,
      });
      await uploadMutateAsync({ file: payload.file, presign: pdfPresign });

      // Presign + upload cover if provided
      let coverKey: string | undefined;
      let coverMime: string | undefined;
      let coverSize: number | undefined;
      let coverOriginalName: string | undefined;

      if (payload.cover) {
        const coverPresign = await presignMutateAsync({
          fileName: payload.cover.name,
          mimeType: payload.cover.type || 'image/jpeg',
          isCover: true,
          contentLength: payload.cover.size,
        });
        await uploadMutateAsync({ file: payload.cover, presign: coverPresign });
        coverKey = coverPresign.key;
        coverMime = payload.cover.type || 'image/jpeg';
        coverSize = payload.cover.size;
        coverOriginalName = payload.cover.name;
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
      onClose();
    } catch (err: unknown) {
      console.log(`'Failed to upload book. Please try again.'`, err);
    }
  });
  return { methods, handleSubmit, isSubmitting, isError };
};
