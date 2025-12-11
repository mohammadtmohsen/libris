import asyncHandler from 'express-async-handler';
import Book from '../models/Book.js';
import Progress from '../models/Progress.js';
import {
  DEFAULT_BOOK_URL_TTL_SECONDS,
  getBookStorage,
  isStorageConfigured,
} from '../services/storage/bookStorage.js';

const bookStorage = getBookStorage();
export const READING_STATUS_VALUES = [
  'not_started',
  'want_to_read',
  'reading',
  'finished',
  'abandoned',
];
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

const parseArrayQuery = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .filter((v) => typeof v === 'string')
      .map((v) => v.trim())
      .filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
};

export const completeUpload = asyncHandler(async (req, res) => {
  if (req.user?.role !== 'admin') {
    return res
      .status(403)
      .json({ success: false, error: 'Only admins can upload books' });
  }

  const {
    title,
    author,
    description,
    tags = [],
    file,
    cover,
    pageCount,
    publicationYear,
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
    publicationYear,
  });

  res.status(201).json({ success: true, data: book });
});

export const getAllBooks = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const searchTerm = typeof search === 'string' ? search.trim() : '';
  const statusFilter = parseArrayQuery(req.query.status).filter((s) =>
    READING_STATUS_VALUES.includes(s)
  );
  const tagFilters = [
    ...parseArrayQuery(req.query.tag),
    ...parseArrayQuery(req.query.tags),
  ];
  const page =
    Number.isFinite(req.query.page) && req.query.page > 0 ? req.query.page : 1;
  const requestedLimit =
    Number.isFinite(req.query.limit) && req.query.limit > 0
      ? req.query.limit
      : DEFAULT_PAGE_SIZE;
  const pageSize = Math.min(Math.max(requestedLimit, 1), MAX_PAGE_SIZE);
  const skip = (page - 1) * pageSize;
  const query = {};
  if (tagFilters.length > 0) query.tags = { $in: tagFilters };
  if (searchTerm) {
    query.$or = [
      { title: { $regex: searchTerm, $options: 'i' } },
      { author: { $regex: searchTerm, $options: 'i' } },
    ];
  }

  const matchStage = { $match: { ...query } };
  const withProgressPipeline = [
    matchStage,
    {
      $lookup: {
        from: 'progresses',
        let: { bookId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$book', '$$bookId'] },
                  { $eq: ['$owner', req.user._id] },
                ],
              },
            },
          },
          { $project: { book: 1, status: 1, pagesRead: 1 } },
        ],
        as: 'progresses',
      },
    },
    {
      $addFields: {
        progress: {
          $ifNull: [
            { $arrayElemAt: ['$progresses', 0] },
            { book: '$_id', status: 'not_started', pagesRead: 0 },
          ],
        },
      },
    },
    { $project: { progresses: 0 } },
  ];

  const statusPipeline =
    statusFilter.length > 0
      ? [{ $match: { 'progress.status': { $in: statusFilter } } }]
      : [];

  const [countResult, books] = await Promise.all([
    Book.aggregate([
      ...(statusFilter.length > 0 ? withProgressPipeline : [matchStage]),
      ...statusPipeline,
      { $count: 'count' },
    ]),
    Book.aggregate([
      ...withProgressPipeline,
      ...statusPipeline,
      { $sort: { publicationYear: -1, author: 1, title: 1 } },
      { $skip: skip },
      { $limit: pageSize },
    ]),
  ]);

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

  const totalCount = countResult?.[0]?.count ?? 0;
  const totalPages = pageSize > 0 ? Math.ceil(totalCount / pageSize) : 0;
  const hasMore = page < totalPages;

  res.json({
    success: true,
    data: {
      items: data,
      count: totalCount,
      page,
      pageSize,
      hasMore,
    },
  });
});

export const searchBooks = getAllBooks;

export const getBookById = asyncHandler(async (req, res) => {
  const book = await Book.findOne({ _id: req.params.id });
  if (!book) {
    return res.status(404).json({ success: false, error: 'Book not found' });
  }
  const progress = (await Progress.findOne({
    owner: req.user._id,
    book: book._id,
  })
    .select('book status pagesRead')
    .lean()) || { book: book._id, status: 'not_started', pagesRead: 0 };
  res.json({ success: true, data: { ...book.toObject(), progress } });
});

export const updateBook = asyncHandler(async (req, res) => {
  if (req.user?.role !== 'admin') {
    return res
      .status(403)
      .json({ success: false, error: 'Only admins can update books' });
  }

  const { title, author, description, tags, publicationYear } = req.body;
  const updates = {};
  const unsets = {};

  if (title !== undefined) updates.title = title;
  if (author !== undefined) updates.author = author;
  if (description !== undefined) updates.description = description;
  if (tags !== undefined) updates.tags = tags;
  if (Object.prototype.hasOwnProperty.call(req.body, 'publicationYear')) {
    if (publicationYear === undefined || publicationYear === null) {
      unsets.publicationYear = '';
    } else {
      updates.publicationYear = publicationYear;
    }
  }

  if (Object.keys(updates).length === 0 && Object.keys(unsets).length === 0) {
    return res
      .status(400)
      .json({ success: false, error: 'No updates provided' });
  }

  const updateDocument = {};
  if (Object.keys(updates).length > 0) {
    updateDocument.$set = updates;
  }
  if (Object.keys(unsets).length > 0) {
    updateDocument.$unset = unsets;
  }

  const book = await Book.findOneAndUpdate(
    { _id: req.params.id, owner: req.user._id },
    updateDocument,
    { new: true }
  );

  if (!book) {
    return res.status(404).json({ success: false, error: 'Book not found' });
  }

  res.json({ success: true, data: book });
});

export const deleteBook = asyncHandler(async (req, res) => {
  if (req.user?.role !== 'admin') {
    return res
      .status(403)
      .json({ success: false, error: 'Only admins can delete books' });
  }

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
