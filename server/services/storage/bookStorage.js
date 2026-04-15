import {
  createReadUrl,
  createUploadUrl,
  deleteObject,
  isR2Configured,
} from '../r2Client.js';
import {
  isLocalStorageConfigured,
  saveFile,
  deleteFile,
} from './localStorage.js';

export const DEFAULT_BOOK_URL_TTL_SECONDS = 3600; // 60 minutes
export const MAX_BOOK_URL_TTL_SECONDS = 7200; // 2 hours cap to limit signed URL churn

export class StorageNotConfiguredError extends Error {
  constructor() {
    super('Storage not configured');
    this.name = 'StorageNotConfiguredError';
  }
}

const localBookStorage = {
  type: 'local',
  isConfigured: () => isLocalStorageConfigured(),
  async upload(key, readableStream) {
    await saveFile(key, readableStream);
  },
  async getReadUrl({ key }) {
    return `/storage/files/${key}`;
  },
  async deleteAssets({ fileKey, coverKey }) {
    const errors = [];
    if (fileKey) {
      try {
        await deleteFile(fileKey);
      } catch (err) {
        errors.push('Failed to delete book file from storage');
        console.error('Local delete file error', err);
      }
    }
    if (coverKey) {
      try {
        await deleteFile(coverKey);
      } catch (err) {
        errors.push('Failed to delete cover from storage');
        console.error('Local delete cover error', err);
      }
    }
    return { errors };
  },
};

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

export const isStorageConfigured = () =>
  isLocalStorageConfigured() || isR2Configured();

export const getBookStorage = () => {
  if (isLocalStorageConfigured()) return localBookStorage;
  if (isR2Configured()) return r2BookStorage;
  return disabledBookStorage;
};
