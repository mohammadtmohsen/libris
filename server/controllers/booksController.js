import asyncHandler from 'express-async-handler';
import Book from '../models/Book.js';
import {
  DEFAULT_BOOK_URL_TTL_SECONDS,
  getBookStorage,
  isStorageConfigured,
} from '../services/storage/bookStorage.js';

const bookStorage = getBookStorage();

export const completeUpload = asyncHandler(async (req, res) => {
  const {
    title,
    author,
    description,
    tags = [],
    status = 'not_started',
    file,
    cover,
    pageCount,
  } = req.body;

  const book = await Book.create({
    owner: req.user._id,
    title,
    author,
    description,
    tags,
    status,
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
    pagesRead: 0,
    pageCount: Number.isFinite(pageCount) ? pageCount : 0,
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
  if (isStorageConfigured() && Array.isArray(books) && books.length > 0) {
    data = await Promise.all(
      books.map(async (b) => {
        if (b?.cover?.key) {
          try {
            const coverUrl = await bookStorage.getReadUrl({
              key: b.cover.key,
              expiresIn: DEFAULT_BOOK_URL_TTL_SECONDS,
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

export const updateBook = asyncHandler(async (req, res) => {
  const { title, author, description, tags, status } = req.body;
  const updates = {};
  if (title !== undefined) updates.title = title;
  if (author !== undefined) updates.author = author;
  if (description !== undefined) updates.description = description;
  if (tags !== undefined) updates.tags = tags;
  if (status !== undefined) updates.status = status;

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
  const { pagesRead, pageCount } = req.body;

  if (pagesRead === undefined && pageCount === undefined) {
    return res
      .status(400)
      .json({ success: false, error: 'No page fields provided' });
  }

  const updates = {};
  if (pagesRead !== undefined) updates.pagesRead = pagesRead;
  if (pageCount !== undefined) updates.pageCount = pageCount;

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
  const { errors = [] } = await bookStorage.deleteAssets({
    fileKey: book.file?.key,
    coverKey: book.cover?.key,
  });

  res.json({
    success: errors.length === 0,
    data: { id: book._id },
    warnings: errors,
  });
});
