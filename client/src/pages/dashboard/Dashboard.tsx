import { useState, useEffect } from 'react';
import { Button, Input, Modal, useModal } from '_components/shared';
import {
  usePresignUpload,
  useCompleteUpload,
} from '_queries/booksQueries/booksQueries';
import { booksServices } from '_services/booksServices';

type DropZoneProps = {
  label: string;
  accept: string;
  file?: File | null;
  onFile: (file: File | null) => void;
};

const DropZone = ({ label, accept, file, onFile }: DropZoneProps) => {
  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) onFile(droppedFile);
  };

  return (
    <label
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className='flex flex-col gap-2 border border-dashed border-blue-4 rounded-secondary p-4 cursor-pointer hover:bg-black-2/50 transition-colors'
    >
      <span className='text-sm font-semibold'>{label}</span>
      <input
        type='file'
        accept={accept}
        className='hidden'
        onChange={(e) => onFile(e.target.files?.[0] || null)}
      />
      <div className='text-xs text-white/70'>
        {file
          ? `Selected: ${file.name}`
          : `Drag & drop or click to choose (${accept})`}
      </div>
    </label>
  );
};

const UploadBookForm = ({
  onSuccess,
  onClose,
}: {
  onSuccess: () => void;
  onClose: () => void;
}) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const presignMutation = usePresignUpload();
  const completeUploadMutation = useCompleteUpload();

  useEffect(() => {
    if (pdfFile && !title) {
      setTitle(pdfFile.name.replace(/\.[^.]+$/, ''));
    }
  }, [pdfFile, title]);

  const handleSubmit = async () => {
    if (!pdfFile) {
      setError('Please select a PDF file to upload.');
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      // Presign + upload PDF
      const pdfPresign = await presignMutation.mutateAsync({
        fileName: pdfFile.name,
        mimeType: pdfFile.type || 'application/pdf',
        contentLength: pdfFile.size,
      });
      await booksServices.uploadToPresignedUrl(pdfFile, pdfPresign);

      // Presign + upload cover if provided
      let coverKey: string | undefined;
      let coverMime: string | undefined;
      let coverSize: number | undefined;
      let coverOriginalName: string | undefined;

      if (coverFile) {
        const coverPresign = await presignMutation.mutateAsync({
          fileName: coverFile.name,
          mimeType: coverFile.type || 'image/jpeg',
          isCover: true,
          contentLength: coverFile.size,
        });
        await booksServices.uploadToPresignedUrl(coverFile, coverPresign);
        coverKey = coverPresign.key;
        coverMime = coverFile.type || 'image/jpeg';
        coverSize = coverFile.size;
        coverOriginalName = coverFile.name;
      }

      await completeUploadMutation.mutateAsync({
        title: title || pdfFile.name.replace(/\.[^.]+$/, ''),
        author: author || undefined,
        description: description || undefined,
        status: 'not_started',
        visibility: 'private',
        file: {
          key: pdfPresign.key,
          mime: pdfFile.type || 'application/pdf',
          size: pdfFile.size,
          originalName: pdfFile.name,
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

      onSuccess();
      onClose();
      // Reset form after close
      setTitle('');
      setAuthor('');
      setDescription('');
      setPdfFile(null);
      setCoverFile(null);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to upload book. Please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='flex flex-col gap-4 w-[90vw] max-w-xl'>
      <h2 className='text-lg font-semibold'>Upload a Book</h2>
      <DropZone
        label='Book PDF'
        accept='application/pdf'
        file={pdfFile}
        onFile={setPdfFile}
      />
      <DropZone
        label='Cover Image (optional)'
        accept='image/*'
        file={coverFile}
        onFile={setCoverFile}
      />
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
        <Input
          label='Title'
          placeholder='Book title'
          value={title}
          onChange={(val) => setTitle(String(val))}
        />
        <Input
          label='Author'
          placeholder='Author name'
          value={author}
          onChange={(val) => setAuthor(String(val))}
        />
      </div>
      <Input
        label='Description'
        placeholder='Short description'
        value={description}
        onChange={(val) => setDescription(String(val))}
      />
      {error && <div className='text-sm text-red-400'>{error}</div>}
      <div className='flex justify-end gap-3'>
        <Button variant='outline' onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Uploading…' : 'Upload'}
        </Button>
      </div>
    </div>
  );
};

export const Dashboard = () => {
  const uploadModal = useModal({
    content: ({ close }) => (
      <UploadBookForm
        onSuccess={() => {
          /* No-op hook; list will refetch via invalidation */
        }}
        onClose={close}
      />
    ),
  });

  return (
    <div className='flex flex-col gap-5'>
      <div className='flex justify-between items-center'>
        <h1 className='text-xl font-semibold'>Dashboard</h1>
        <Button onClick={() => uploadModal.open({})}>Upload Book</Button>
      </div>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-5'>LIBRIS</div>
      <Modal {...uploadModal} />
    </div>
  );
};
