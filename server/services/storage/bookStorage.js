import {
  createReadUrl,
  createUploadUrl,
  deleteObject,
  isR2Configured,
} from '../r2Client.js';

export const DEFAULT_BOOK_URL_TTL_SECONDS = 3600; // 60 minutes
export const MAX_BOOK_URL_TTL_SECONDS = 7200; // 2 hours cap to limit signed URL churn

export class StorageNotConfiguredError extends Error {
  constructor() {
    super('Storage not configured');
    this.name = 'StorageNotConfiguredError';
  }
}

const r2BookStorage = {
  type: 'r2',
  isConfigured: () => isR2Configured(),
  async presignUpload({ key, contentType, contentLength, expiresIn }) {
    return createUploadUrl({ key, contentType, contentLength, expiresIn });
  },
  async getReadUrl({ key, expiresIn, downloadName }) {
    return createReadUrl({ key, expiresIn, downloadName });
  },
  async deleteAssets({ fileKey, coverKey }) {
    const errors = [];
    if (fileKey) {
      try {
        await deleteObject({ key: fileKey });
      } catch (err) {
        errors.push('Failed to delete book file from storage');
        console.error('R2 delete file error', err);
      }
    }
    if (coverKey) {
      try {
        await deleteObject({ key: coverKey });
      } catch (err) {
        errors.push('Failed to delete cover from storage');
        console.error('R2 delete cover error', err);
      }
    }
    return { errors };
  },
};

const disabledBookStorage = {
  type: 'disabled',
  isConfigured: () => false,
  async presignUpload() {
    throw new StorageNotConfiguredError();
  },
  async getReadUrl() {
    throw new StorageNotConfiguredError();
  },
  async deleteAssets() {
    return { errors: [] };
  },
};

export const isStorageConfigured = () => isR2Configured();

export const getBookStorage = () =>
  isR2Configured() ? r2BookStorage : disabledBookStorage;
