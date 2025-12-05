import asyncHandler from 'express-async-handler';
import Book from '../models/Book.js';
import Progress from '../models/Progress.js';
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
    pageCount: Number.isFinite(pageCount) ? pageCount : 0,
  });

  res.status(201).json({ success: true, data: book });
});

export const getAllBooks = asyncHandler(async (req, res) => {
  const { status, tag, search } = req.query;
  const query = { owner: req.user._id };
  if (tag) query.tags = tag;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { author: { $regex: search, $options: 'i' } },
    ];
  }

  // Use lean() for plain objects so we can safely enhance the response
  const books = await Book.find(query).sort({ createdAt: -1 }).lean();

  let data = books;
  if (isStorageConfigured() && Array.isArray(books) && books.length > 0) {
    data = await Promise.all(
      books.map(async (b) => {
        let coverUrl = null;
        if (b?.cover?.key) {
          try {
            coverUrl = await bookStorage.getReadUrl({
              key: b.cover.key,
              expiresIn: DEFAULT_BOOK_URL_TTL_SECONDS,
            });
          } catch (_err) {
            coverUrl = null;
          }
        }
        return coverUrl ? { ...b, cover: { ...b.cover, coverUrl } } : b;
      })
    );
  }

  const bookIds = books.map((b) => b._id);
  const progresses =
    bookIds.length > 0
      ? await Progress.find({
          owner: req.user._id,
          book: { $in: bookIds },
        })
          .select('book status pagesRead')
          .lean()
      : [];
  const progressMap = new Map(
    progresses.map((p) => [String(p.book), p])
  );

  const dataWithProgress = data.map((b) => {
    const progress =
      progressMap.get(String(b._id)) ||
      { book: b._id, status: 'not_started', pagesRead: 0 };
    return progress ? { ...b, progress } : b;
  });

  const filteredByStatus = status
    ? dataWithProgress.filter(
        (b) => (b.progress?.status || 'not_started') === status
      )
    : dataWithProgress;

  res.json({ success: true, data: filteredByStatus });
});

export const searchBooks = getAllBooks;

export const getBookById = asyncHandler(async (req, res) => {
  const book = await Book.findOne({ _id: req.params.id, owner: req.user._id });
  if (!book) {
    return res.status(404).json({ success: false, error: 'Book not found' });
  }
  const progress =
    (await Progress.findOne({
      owner: req.user._id,
      book: book._id,
    })
      .select('book status pagesRead')
      .lean()) || { book: book._id, status: 'not_started', pagesRead: 0 };
  res.json({ success: true, data: { ...book.toObject(), progress } });
});

export const updateBook = asyncHandler(async (req, res) => {
  const { title, author, description, tags } = req.body;
  const updates = {};
  if (title !== undefined) updates.title = title;
  if (author !== undefined) updates.author = author;
  if (description !== undefined) updates.description = description;
  if (tags !== undefined) updates.tags = tags;

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

export const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findOne({ _id: req.params.id, owner: req.user._id });
  if (!book) {
    return res.status(404).json({ success: false, error: 'Book not found' });
  }

  await Book.deleteOne({ _id: book._id, owner: req.user._id });
  await Progress.deleteMany({ book: book._id });

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
