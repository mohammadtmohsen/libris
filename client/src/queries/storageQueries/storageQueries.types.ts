export type SignedUrlResponse = {
  signedUrl: string;
  expiresIn: number;
  expiresAt: string;
  mime?: string;
  coverUrl?: string;
};

export type PresignUploadRequest = {
  fileName: string;
  mimeType: string;
  isCover?: boolean;
  contentLength?: number;
};

export type PresignUploadResponse = {
  key: string;
  uploadUrl: string;
  expiresIn: number;
  headers?: Record<string, string>;
};

export type UploadToPresignedUrlRequest = {
  file: File;
  presign: PresignUploadResponse;
};
