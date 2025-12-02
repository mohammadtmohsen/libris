import asyncHandler from 'express-async-handler';
import path from 'path';
import { randomUUID } from 'crypto';
import Book from '../models/Book.js';
import {
  createReadUrl,
  createUploadUrl,
  deleteObject,
  isR2Configured,
} from '../services/r2Client.js';

const DEFAULT_URL_TTL_SECONDS = 3600; // 60 minutes
const MAX_URL_TTL_SECONDS = 7200; // 2 hours cap to limit signed URL churn

export const getServiceStatus = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      configured: isR2Configured(),
    },
    message: isR2Configured()
      ? 'Cloudflare R2 configured for book and cover storage'
      : 'Cloudflare R2 is not fully configured',
  });
});

export const presignUpload = asyncHandler(async (req, res) => {
  if (!isR2Configured()) {
    return res
      .status(503)
      .json({ success: false, error: 'Storage not configured' });
  }

  const { fileName, mimeType, isCover = false, contentLength } = req.body;
  const ext = fileName ? path.extname(fileName) : '';
  const folder = isCover ? 'covers' : 'books';
  const key = `${folder}/${req.user._id}/${randomUUID()}${ext}`;

  const uploadUrl = await createUploadUrl({
    key,
    contentType: mimeType,
    contentLength,
    expiresIn: DEFAULT_URL_TTL_SECONDS,
  });

  res.json({
    success: true,
    data: {
      key,
      uploadUrl,
      expiresIn: DEFAULT_URL_TTL_SECONDS,
      headers: { 'Content-Type': mimeType },
    },
  });
});

export const completeUpload = asyncHandler(async (req, res) => {
  const {
    title,
    author,
    description,
    tags = [],
    status = 'not_started',
    visibility = 'private',
    file,
    cover,
    totalPages,
  } = req.body;

  const book = await Book.create({
    owner: req.user._id,
    title,
    author,
    description,
    tags,
    status,
    visibility,
    file: {
      key: file.key,
      mime: file.mime,
      size: file.size,
      originalName: file.originalName,
    },
    cover: cover?.key
      ? {
          key: cover.key,
          mime: cover.mime,
          size: cover.size,
          originalName: cover.originalName,
        }
      : undefined,
    // initialize page tracking
    currentPage: 0,
    totalPages: Number.isFinite(totalPages) ? totalPages : 0,
  });

  res.status(201).json({ success: true, data: book });
});

export const getAllBooks = asyncHandler(async (req, res) => {
  const { status, tag, search } = req.query;
  const query = { owner: req.user._id };
  if (status) query.status = status;
  if (tag) query.tags = tag;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { author: { $regex: search, $options: 'i' } },
    ];
  }

  // Use lean() for plain objects so we can safely enhance the response
  const books = await Book.find(query).sort({ updatedAt: -1 }).lean();

  let data = books;
  if (isR2Configured() && Array.isArray(books) && books.length > 0) {
    data = await Promise.all(
      books.map(async (b) => {
        if (b?.cover?.key) {
          try {
            const coverUrl = await createReadUrl({
              key: b.cover.key,
              expiresIn: DEFAULT_URL_TTL_SECONDS,
            });
            return { ...b, cover: { ...b.cover, coverUrl } };
          } catch (_err) {
            // If generating a signed URL fails, return the book as-is
            return b;
          }
        }
        return b;
      })
    );
  }

  res.json({ success: true, data });
});

export const searchBooks = getAllBooks;

export const getBookById = asyncHandler(async (req, res) => {
  const book = await Book.findOne({ _id: req.params.id, owner: req.user._id });
  if (!book) {
    return res.status(404).json({ success: false, error: 'Book not found' });
  }
  res.json({ success: true, data: book });
});

export const getSignedUrlForBook = asyncHandler(async (req, res) => {
  if (!isR2Configured()) {
    return res
      .status(503)
      .json({ success: false, error: 'Storage not configured' });
  }

  const { includeCover = false } = req.query;
  const rawExpiresIn = parseInt(req.query.expiresIn, 10);
  const expiresIn =
    Number.isFinite(rawExpiresIn) && rawExpiresIn > 0
      ? Math.min(rawExpiresIn, MAX_URL_TTL_SECONDS)
      : DEFAULT_URL_TTL_SECONDS;

  const book = await Book.findOne({ _id: req.params.id, owner: req.user._id });
  if (!book || !book.file?.key) {
    return res.status(404).json({ success: false, error: 'Book not found' });
  }

  const signedUrl = await createReadUrl({
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
    response.coverUrl = await createReadUrl({
      key: book.cover.key,
      expiresIn,
    });
  }

  res.json({ success: true, data: response });
});

export const downloadBook = asyncHandler(async (req, res) => {
  if (!isR2Configured()) {
    return res
      .status(503)
      .json({ success: false, error: 'Storage not configured' });
  }

  const book = await Book.findOne({ _id: req.params.id, owner: req.user._id });
  if (!book || !book.file?.key) {
    return res.status(404).json({ success: false, error: 'Book not found' });
  }

  const signedUrl = await createReadUrl({
    key: book.file.key,
    expiresIn: DEFAULT_URL_TTL_SECONDS,
    downloadName: book.file.originalName || `${book.title}.pdf`,
  });

  res.json({
    success: true,
    data: {
      signedUrl,
      expiresIn: DEFAULT_URL_TTL_SECONDS,
      expiresAt: new Date(
        Date.now() + DEFAULT_URL_TTL_SECONDS * 1000
      ).toISOString(),
    },
  });
});

export const getBookThumbnail = asyncHandler(async (req, res) => {
  if (!isR2Configured()) {
    return res
      .status(503)
      .json({ success: false, error: 'Storage not configured' });
  }

  const book = await Book.findOne({ _id: req.params.id, owner: req.user._id });
  if (!book?.cover?.key) {
    return res.status(404).json({ success: false, error: 'Cover not found' });
  }

  const coverUrl = await createReadUrl({
    key: book.cover.key,
    expiresIn: DEFAULT_URL_TTL_SECONDS,
  });

  res.json({
    success: true,
    data: {
      coverUrl,
      expiresIn: DEFAULT_URL_TTL_SECONDS,
      expiresAt: new Date(
        Date.now() + DEFAULT_URL_TTL_SECONDS * 1000
      ).toISOString(),
    },
  });
});

export const updateBook = asyncHandler(async (req, res) => {
  const { title, author, description, tags, status, visibility } = req.body;
  const updates = {};
  if (title !== undefined) updates.title = title;
  if (author !== undefined) updates.author = author;
  if (description !== undefined) updates.description = description;
  if (tags !== undefined) updates.tags = tags;
  if (status !== undefined) updates.status = status;
  if (visibility !== undefined) updates.visibility = visibility;

  if (Object.keys(updates).length === 0) {
    return res
      .status(400)
      .json({ success: false, error: 'No updates provided' });
  }

  const book = await Book.findOneAndUpdate(
    { _id: req.params.id, owner: req.user._id },
    { $set: updates },
    { new: true }
  );

  if (!book) {
    return res.status(404).json({ success: false, error: 'Book not found' });
  }

  res.json({ success: true, data: book });
});

export const updatePages = asyncHandler(async (req, res) => {
  const { currentPage, totalPages } = req.body;

  if (currentPage === undefined && totalPages === undefined) {
    return res
      .status(400)
      .json({ success: false, error: 'No page fields provided' });
  }

  const updates = {};
  if (currentPage !== undefined) updates.currentPage = currentPage;
  if (totalPages !== undefined) updates.totalPages = totalPages;

  const book = await Book.findOneAndUpdate(
    { _id: req.params.id, owner: req.user._id },
    { $set: updates },
    { new: true }
  );

  if (!book) {
    return res.status(404).json({ success: false, error: 'Book not found' });
  }

  res.json({ success: true, data: book });
});

export const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findOne({ _id: req.params.id, owner: req.user._id });
  if (!book) {
    return res.status(404).json({ success: false, error: 'Book not found' });
  }

  await Book.deleteOne({ _id: book._id, owner: req.user._id });

  // Best-effort cleanup of files; failures reported but do not block deletion response.
  const errors = [];
  if (book.file?.key) {
    try {
      await deleteObject({ key: book.file.key });
    } catch (err) {
      errors.push('Failed to delete book file from storage');
      console.error('R2 delete file error', err);
    }
  }
  if (book.cover?.key) {
    try {
      await deleteObject({ key: book.cover.key });
    } catch (err) {
      errors.push('Failed to delete cover from storage');
      console.error('R2 delete cover error', err);
    }
  }

  res.json({
    success: errors.length === 0,
    data: { id: book._id },
    warnings: errors,
  });
});
