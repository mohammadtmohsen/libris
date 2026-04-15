import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pipeline } from 'stream/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_DIR = path.resolve(__dirname, '..', '..', '..', 'storage');

export const STORAGE_DIR = path.resolve(
  process.env.STORAGE_DIR || DEFAULT_DIR
);

export const isLocalStorageConfigured = () =>
  Boolean(process.env.STORAGE_DIR) || fs.existsSync(DEFAULT_DIR);

const resolvePath = (key) => {
  const resolved = path.resolve(STORAGE_DIR, key);
  if (!resolved.startsWith(STORAGE_DIR + path.sep) && resolved !== STORAGE_DIR) {
    throw new Error('Invalid storage key');
  }
  return resolved;
};

export const saveFile = async (key, readableStream) => {
  const filePath = resolvePath(key);
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
  const writeStream = fs.createWriteStream(filePath);
  await pipeline(readableStream, writeStream);
};

export const getFilePath = (key) => resolvePath(key);

export const fileExists = (key) => {
  try {
    return fs.existsSync(resolvePath(key));
  } catch {
    return false;
  }
};

export const deleteFile = async (key) => {
  const filePath = resolvePath(key);
  try {
    await fs.promises.unlink(filePath);
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
};
