import { useCallback, useState } from 'react';
import { useActionToast } from '_components/shared';
import { useCompleteUpload } from '_queries/booksQueries';
import {
  usePresignUpload,
  useUploadToPresignedUrl,
} from '_queries/storageQueries';
import { parseBookMetadataFromFilename } from '_utils/bookMetadata';
import { extractFirstPageAsImage } from '_utils/pdfCover';
import { toSignedPublicationYear } from '_utils/publicationYear';

type FailedUpload = {
  file: File;
  title: string;
  error: string;
};

const getFileKey = (file: File) =>
  `${file.name}-${file.size}-${file.lastModified}`;

const mergeFiles = (current: File[], incoming: File[]) => {
  const map = new Map<string, File>();
  current.forEach((file) => map.set(getFileKey(file), file));
  incoming.forEach((file) => map.set(getFileKey(file), file));
  return Array.from(map.values());
};

const isPdfFile = (file: File) =>
  file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

const getDisplayTitle = (file: File, parsedTitle?: string) =>
  parsedTitle?.trim() ||
  file.name.replace(/\.[^.]+$/, '') ||
  'Your book';

const getErrorMessage = (err: unknown) => {
  if (err instanceof Error) return err.message;
  const maybeError = err as {
    response?: { data?: { error?: string; message?: string } };
    message?: string;
  };
  return (
    maybeError?.response?.data?.error ||
    maybeError?.response?.data?.message ||
    maybeError?.message ||
    'Something went wrong while uploading the book.'
  );
};

const formatFailureNames = (names: string[], limit = 3) => {
  const filtered = names.filter(Boolean);
  if (filtered.length <= limit) return filtered.join(', ');
  const visible = filtered.slice(0, limit).join(', ');
  return `${visible} and ${filtered.length - limit} more`;
};

export const useUploadBulkBooks = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const actionToast = useActionToast();

  const { mutateAsync: presignMutateAsync, isPending: isPresignPending } =
    usePresignUpload();

  const { mutateAsync: uploadMutateAsync, isPending: isUploadPending } =
    useUploadToPresignedUrl();

  const {
    mutateAsync: completeUploadMutateAsync,
    isPending: isCompleteUploadPending,
  } = useCompleteUpload();

  const isSubmitting =
    isUploading || isPresignPending || isUploadPending || isCompleteUploadPending;

  const addFiles = useCallback((incoming: File[]) => {
    const filtered = incoming.filter(isPdfFile);
    if (!filtered.length) return;
    setFiles((current) => mergeFiles(current, filtered));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  const uploadAll = useCallback(async () => {
    if (!files.length) {
      return { total: 0, successCount: 0, failed: [] as FailedUpload[] };
    }

    setIsUploading(true);
    const failures: FailedUpload[] = [];
    const total = files.length;

    actionToast.showToast({
      title: `Uploading ${total} book${total === 1 ? '' : 's'}...`,
      description: 'Preparing PDFs, covers, and metadata.',
    });

    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      const parsed = parseBookMetadataFromFilename(file.name);
      const displayTitle = getDisplayTitle(file, parsed.title);

      try {
        actionToast.updateMessage({
          title: `Uploading ${index + 1} of ${total}`,
          description: `Processing "${displayTitle}".`,
        });

        let effectiveCover: File | null = null;
        let pageCount: number | undefined;

        if (isPdfFile(file)) {
          try {
            const { file: coverFile, pageCount: extractedPageCount } =
              await extractFirstPageAsImage(file, {
                maxWidth: 900,
                mimeType: 'image/jpeg',
                quality: 0.9,
                fileNameHint: displayTitle,
              });
            effectiveCover = coverFile;
            pageCount = extractedPageCount;
          } catch (error) {
            console.error('Cover extraction failed; aborting upload.', error);
            throw new Error('Cover page extraction failed. Upload aborted.');
          }
        }

        const pdfPresign = await presignMutateAsync({
          fileName: file.name,
          mimeType: file.type || 'application/pdf',
          contentLength: file.size,
        });
        await uploadMutateAsync({ file, presign: pdfPresign });

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
          parsed.publicationYear,
          'AD'
        );

        await completeUploadMutateAsync({
          title: displayTitle,
          author: parsed.author || undefined,
          description: undefined,
          tags: [],
          pageCount,
          publicationYear: signedPublicationYear,
          file: {
            key: pdfPresign.key,
            mime: file.type || 'application/pdf',
            size: file.size,
            originalName: file.name,
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
      } catch (err: unknown) {
        const message = getErrorMessage(err);
        console.error(`Failed to upload "${displayTitle}":`, message);
        failures.push({ file, title: displayTitle, error: message });
      }
    }

    const successCount = total - failures.length;

    if (failures.length === 0) {
      actionToast.showSuccess({
        title: 'Bulk upload complete',
        description: `${successCount} book${
          successCount === 1 ? '' : 's'
        } uploaded successfully.`,
      });
      setFiles([]);
    } else {
      const failedNames = formatFailureNames(
        failures.map((failure) => failure.title)
      );
      actionToast.showError({
        title: `${failures.length} upload${
          failures.length === 1 ? '' : 's'
        } failed`,
        description: `${successCount} succeeded. Failed: ${failedNames}.`,
      });
      setFiles(failures.map((failure) => failure.file));
    }

    setIsUploading(false);
    return { total, successCount, failed: failures };
  }, [
    actionToast,
    completeUploadMutateAsync,
    files,
    presignMutateAsync,
    uploadMutateAsync,
  ]);

  return {
    files,
    addFiles,
    clearFiles,
    uploadAll,
    isSubmitting,
  };
};
