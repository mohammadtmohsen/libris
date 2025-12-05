import asyncHandler from 'express-async-handler';
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

const bookStorage = getBookStorage();

export const getServiceStatus = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      configured: isStorageConfigured(),
    },
    message: isStorageConfigured()
      ? 'Cloudflare R2 configured for book and cover storage'
      : 'Cloudflare R2 is not fully configured',
  });
});

export const presignUpload = asyncHandler(async (req, res) => {
  if (!isStorageConfigured()) {
    return res
      .status(503)
      .json({ success: false, error: 'Storage not configured' });
  }

  const { fileName, mimeType, isCover = false, contentLength } = req.body;
  const ext = fileName ? path.extname(fileName) : '';
  const folder = isCover ? 'covers' : 'books';
  const key = `${folder}/${req.user._id}/${randomUUID()}${ext}`;

  const uploadUrl = await bookStorage.presignUpload({
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

export const getSignedUrlForBook = asyncHandler(async (req, res) => {
  if (!isStorageConfigured()) {
    return res
      .status(503)
      .json({ success: false, error: 'Storage not configured' });
  }

  const { includeCover = false } = req.query;
  const rawExpiresIn = parseInt(req.query.expiresIn, 10);
  const expiresIn =
    Number.isFinite(rawExpiresIn) && rawExpiresIn > 0
      ? Math.min(rawExpiresIn, MAX_BOOK_URL_TTL_SECONDS)
      : DEFAULT_BOOK_URL_TTL_SECONDS;

  const book = await Book.findOne({ _id: req.params.id, owner: req.user._id });
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

  const book = await Book.findOne({ _id: req.params.id, owner: req.user._id });
  if (!book || !book.file?.key) {
    return res.status(404).json({ success: false, error: 'Book not found' });
  }

  const signedUrl = await bookStorage.getReadUrl({
    key: book.file.key,
    expiresIn: DEFAULT_BOOK_URL_TTL_SECONDS,
    downloadName: book.file.originalName || `${book.title}.pdf`,
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

  const book = await Book.findOne({ _id: req.params.id, owner: req.user._id });
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
