import asyncHandler from 'express-async-handler';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import Book from '../models/Book.js';
import {
  DEFAULT_BOOK_URL_TTL_SECONDS,
  MAX_BOOK_URL_TTL_SECONDS,
  getBookStorage,
  isStorageConfigured,
  StorageNotConfiguredError,
} from '../services/storage/bookStorage.js';
import { getFilePath, fileExists } from '../services/storage/localStorage.js';

const MIME_MAP = {
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

export const getServiceStatus = asyncHandler(async (req, res) => {
  const storage = getBookStorage();
  res.json({
    success: true,
    data: {
      configured: isStorageConfigured(),
      type: storage.type,
    },
    message: isStorageConfigured()
      ? `Storage configured (${storage.type})`
      : 'Storage is not configured',
  });
});

export const presignUpload = asyncHandler(async (req, res) => {
  const storage = getBookStorage();
  if (!storage.isConfigured()) {
    return res
      .status(503)
      .json({ success: false, error: 'Storage not configured' });
  }

  const { fileName, mimeType, isCover = false, contentLength } = req.body;
  const ext = fileName ? path.extname(fileName) : '';
  const folder = isCover ? 'covers' : 'books';
  const key = `${folder}/${req.user._id}/${randomUUID()}${ext}`;

  if (storage.type === 'local') {
    // For local storage, return a server upload URL
    const uploadUrl = `/storage/upload/${key}`;
    return res.json({
      success: true,
      data: {
        key,
        uploadUrl,
        expiresIn: DEFAULT_BOOK_URL_TTL_SECONDS,
        headers: { 'Content-Type': mimeType },
      },
    });
  }

  // R2 flow
  const uploadUrl = await storage.presignUpload({
    key,
    contentType: mimeType,
    contentLength,
    expiresIn: DEFAULT_BOOK_URL_TTL_SECONDS,
  });

  res.json({
    success: true,
    data: {
      key,
      uploadUrl,
      expiresIn: DEFAULT_BOOK_URL_TTL_SECONDS,
      headers: { 'Content-Type': mimeType },
    },
  });
});

// Accept raw binary PUT and save to local storage
export const uploadFile = asyncHandler(async (req, res) => {
  const storage = getBookStorage();
  if (storage.type !== 'local') {
    return res
      .status(400)
      .json({ success: false, error: 'Direct upload not supported' });
  }

  const key = req.params[0];
  if (!key) {
    return res.status(400).json({ success: false, error: 'Missing file key' });
  }

  await storage.upload(key, req);
  res.json({ success: true });
});

// Serve a file from local storage
export const serveFile = asyncHandler(async (req, res) => {
  const key = req.params[0];
  if (!key || !fileExists(key)) {
    return res.status(404).json({ success: false, error: 'File not found' });
  }

  const filePath = getFilePath(key);
  const ext = path.extname(key).toLowerCase();
  const contentType = MIME_MAP[ext] || 'application/octet-stream';

  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', 'private, max-age=3600');

  // Support download mode via query param
  if (req.query.download) {
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${req.query.download}"`
    );
  }

  const stat = await fs.promises.stat(filePath);
  res.setHeader('Content-Length', stat.size);

  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
});

export const getSignedUrlForBook = asyncHandler(async (req, res) => {
  if (!isStorageConfigured()) {
    return res
      .status(503)
      .json({ success: false, error: 'Storage not configured' });
  }

  const bookStorage = getBookStorage();
  const { includeCover = false } = req.query;
  const rawExpiresIn = parseInt(req.query.expiresIn, 10);
  const expiresIn =
    Number.isFinite(rawExpiresIn) && rawExpiresIn > 0
      ? Math.min(rawExpiresIn, MAX_BOOK_URL_TTL_SECONDS)
      : DEFAULT_BOOK_URL_TTL_SECONDS;

  const book = await Book.findOne({ _id: req.params.id });
  if (!book || !book.file?.key) {
    return res.status(404).json({ success: false, error: 'Book not found' });
  }

  const signedUrl = await bookStorage.getReadUrl({
    key: book.file.key,
    expiresIn,
  });

  const response = {
    signedUrl,
    expiresIn,
    expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
    mime: book.file.mime,
  };

  if (includeCover && book.cover?.key) {
    response.coverUrl = await bookStorage.getReadUrl({
      key: book.cover.key,
      expiresIn,
    });
  }

  res.json({ success: true, data: response });
});

export const downloadBook = asyncHandler(async (req, res) => {
  if (!isStorageConfigured()) {
    return res
      .status(503)
      .json({ success: false, error: 'Storage not configured' });
  }

  const bookStorage = getBookStorage();
  const book = await Book.findOne({ _id: req.params.id });
  if (!book || !book.file?.key) {
    return res.status(404).json({ success: false, error: 'Book not found' });
  }

  const downloadName = book.file.originalName || `${book.title}.pdf`;
  const signedUrl = await bookStorage.getReadUrl({
    key: book.file.key,
    expiresIn: DEFAULT_BOOK_URL_TTL_SECONDS,
    downloadName,
  });

  res.json({
    success: true,
    data: {
      signedUrl,
      expiresIn: DEFAULT_BOOK_URL_TTL_SECONDS,
      expiresAt: new Date(
        Date.now() + DEFAULT_BOOK_URL_TTL_SECONDS * 1000
      ).toISOString(),
    },
  });
});

export const getBookThumbnail = asyncHandler(async (req, res) => {
  if (!isStorageConfigured()) {
    return res
      .status(503)
      .json({ success: false, error: 'Storage not configured' });
  }

  const bookStorage = getBookStorage();
  const book = await Book.findOne({ _id: req.params.id });
  if (!book?.cover?.key) {
    return res.status(404).json({ success: false, error: 'Cover not found' });
  }

  const coverUrl = await bookStorage.getReadUrl({
    key: book.cover.key,
    expiresIn: DEFAULT_BOOK_URL_TTL_SECONDS,
  });

  res.json({
    success: true,
    data: {
      coverUrl,
      expiresIn: DEFAULT_BOOK_URL_TTL_SECONDS,
      expiresAt: new Date(
        Date.now() + DEFAULT_BOOK_URL_TTL_SECONDS * 1000
      ).toISOString(),
    },
  });
});

export const handleStorageErrors = (err, _req, res, next) => {
  if (err instanceof StorageNotConfiguredError) {
    return res
      .status(503)
      .json({ success: false, error: 'Storage not configured' });
  }
  return next(err);
};
