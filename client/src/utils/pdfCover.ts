import { pdfjs } from 'react-pdf';

export type PdfCoverOptions = {
  maxWidth?: number;
  mimeType?: 'image/jpeg' | 'image/png';
  quality?: number; // only for jpeg
  fileNameHint?: string;
};

export async function extractFirstPageAsImage(
  file: File,
  {
    maxWidth = 900,
    mimeType = 'image/jpeg',
    quality = 0.9,
    fileNameHint,
  }: PdfCoverOptions = {}
): Promise<{ file: File; pageCount: number }> {
  const ab = await file.arrayBuffer();

  const loadingTask = pdfjs.getDocument({ data: ab });
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(1);

  const baseViewport = page.getViewport({ scale: 1 });
  const scale = Math.min(4, maxWidth / baseViewport.width);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    loadingTask.destroy();
    throw new Error('Canvas 2D context not available');
  }

  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);

  await page.render({ canvasContext: ctx, viewport }).promise;

  const blob: Blob = await new Promise((resolve, reject) => {
    if (mimeType === 'image/jpeg') {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('toBlob failed'))),
        mimeType,
        quality
      );
    } else {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('toBlob failed'))),
        mimeType
      );
    }
  });

  const nameBase = (fileNameHint || file.name).replace(/\.[^.]+$/, '');
  const outExt = mimeType === 'image/png' ? 'png' : 'jpg';
  const outFile = new File([blob], `${nameBase}-cover.${outExt}`, {
    type: mimeType,
  });

  try {
    page.cleanup();
    await loadingTask.destroy();
  } catch {
    // ignore
  }
  canvas.width = 0;
  canvas.height = 0;

  return { file: outFile, pageCount: pdf.numPages };
}
