import asyncHandler from 'express-async-handler';
import Book from '../models/Book.js';
import Progress from '../models/Progress.js';
import {
  DEFAULT_BOOK_URL_TTL_SECONDS,
  getBookStorage,
  isStorageConfigured,
} from '../services/storage/bookStorage.js';
import mongoose from 'mongoose';
import Series from '../models/Series.js';

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

const shapeBookResponse = (book) => {
  if (!book) return book;

  const raw =
    typeof book.toObject === 'function' ? book.toObject() : { ...book };
  const populatedSeries =
    (raw.series && raw.series.name ? raw.series : undefined) ||
    (raw.seriesId &&
    typeof raw.seriesId === 'object' &&
    raw.seriesId !== null &&
    raw.seriesId.name
      ? raw.seriesId
      : undefined);

  const normalized = {
    ...raw,
    seriesId:
      raw.seriesId && raw.seriesId._id
        ? raw.seriesId._id
        : raw.seriesId || undefined,
  };

  if (populatedSeries && populatedSeries._id) {
    normalized.series = {
      _id: populatedSeries._id,
      name: populatedSeries.name,
      ...(populatedSeries.totalParts
        ? { totalParts: populatedSeries.totalParts }
        : {}),
    };
  } else {
    delete normalized.series;
  }

  return normalized;
};

const cleanupUploadedAssets = async ({ fileKey, coverKey }) => {
  if (!fileKey && !coverKey) return;
  try {
    const { errors = [] } = await bookStorage.deleteAssets({
      fileKey,
      coverKey,
    });
    if (errors.length) {
      console.error('Cleanup warnings after failed upload:', errors);
    }
  } catch (err) {
    console.error('Cleanup failed after upload error', err);
  }
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
    seriesId,
    part,
  } = req.body;
  const uploadedAssets = {
    fileKey: file?.key,
    coverKey: cover?.key,
  };

  const failWithCleanup = async (status, error) => {
    await cleanupUploadedAssets(uploadedAssets);
    return res.status(status).json({ success: false, error });
  };

  const partValue =
    part === undefined || part === null || part === ''
      ? undefined
      : Number(part);
  if (
    partValue !== undefined &&
    (!Number.isInteger(partValue) || partValue <= 0)
  ) {
    return failWithCleanup(400, 'part must be a positive integer');
  }

  let seriesRef = null;
  if (seriesId) {
    if (!mongoose.Types.ObjectId.isValid(seriesId)) {
      return failWithCleanup(400, 'Invalid seriesId');
    }
    seriesRef = await Series.findById(seriesId).select('_id name totalParts');
    if (!seriesRef) {
      return failWithCleanup(400, 'Series not found');
    }
    if (
      typeof seriesRef.totalParts === 'number' &&
      partValue !== undefined &&
      partValue > seriesRef.totalParts
    ) {
      return failWithCleanup(
        400,
        'part cannot exceed series totalParts'
      );
    }
    if (partValue !== undefined) {
      const existingPart = await Book.findOne({
        owner: req.user._id,
        seriesId: seriesRef._id,
        part: partValue,
      })
        .select('_id')
        .lean();
      if (existingPart) {
        return failWithCleanup(
          400,
          'Another book already uses this part in the selected series'
        );
      }
    }
  } else if (partValue !== undefined) {
    return failWithCleanup(
      400,
      'part cannot be set without a seriesId'
    );
  }

  let book;
  try {
    book = await Book.create({
      owner: req.user._id,
      title,
      author,
      description,
      tags,
      seriesId: seriesRef?._id,
      part: seriesRef ? partValue : undefined,
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
  } catch (err) {
    await cleanupUploadedAssets(uploadedAssets);
    throw err;
  }

  const populated = seriesRef
    ? await book.populate({ path: 'seriesId', select: 'name totalParts' })
    : book;
  res.status(201).json({ success: true, data: shapeBookResponse(populated) });
});

export const getAllBooks = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const searchTerm = typeof search === 'string' ? search.trim() : '';
  const partFilter =
    Number.isFinite(req.query.part) || Number.isFinite(Number(req.query.part))
      ? Number(req.query.part)
      : undefined;
  const seriesFilters = [
    ...parseArrayQuery(req.query.seriesId),
    ...parseArrayQuery(req.query.seriesIds),
  ].map((id) => id.trim());
  const seriesObjectIds = [
    ...new Set(
      seriesFilters.filter((id) => mongoose.Types.ObjectId.isValid(id))
    ),
  ].map((id) => new mongoose.Types.ObjectId(id));
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
  if (seriesObjectIds.length === 1) query.seriesId = seriesObjectIds[0];
  else if (seriesObjectIds.length > 1) query.seriesId = { $in: seriesObjectIds };
  if (Number.isFinite(partFilter) && partFilter > 0) query.part = partFilter;

  const matchStage = { $match: { ...query } };
  const seriesLookupStage = {
    $lookup: {
      from: 'series',
      localField: 'seriesId',
      foreignField: '_id',
      as: 'series',
      pipeline: [{ $project: { name: 1, totalParts: 1 } }],
    },
  };
  const seriesSetStage = {
    $set: {
      series: {
        $cond: [
          { $gt: [{ $size: '$series' }, 0] },
          { $arrayElemAt: ['$series', 0] },
          '$$REMOVE',
        ],
      },
    },
  };
  const searchStages =
    searchTerm && searchTerm.length > 0
      ? [
          {
            $match: {
              $or: [
                { title: { $regex: searchTerm, $options: 'i' } },
                { author: { $regex: searchTerm, $options: 'i' } },
                { 'series.name': { $regex: searchTerm, $options: 'i' } },
              ],
            },
          },
        ]
      : [];
  const withProgressPipeline = [
    matchStage,
    seriesLookupStage,
    seriesSetStage,
    ...searchStages,
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
      ...withProgressPipeline,
      ...statusPipeline,
      { $count: 'count' },
    ]),
    Book.aggregate([
      ...withProgressPipeline,
      ...statusPipeline,
      {
        $sort: {
          publicationYear: -1,
          seriesId: 1,
          part: 1,
          author: 1,
          title: 1,
        },
      },
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
  data = data.map(shapeBookResponse);

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
  const book = await Book.findOne({ _id: req.params.id }).populate({
    path: 'seriesId',
    select: 'name totalParts',
  });
  if (!book) {
    return res.status(404).json({ success: false, error: 'Book not found' });
  }
  const progress = (await Progress.findOne({
    owner: req.user._id,
    book: book._id,
  })
    .select('book status pagesRead')
    .lean()) || { book: book._id, status: 'not_started', pagesRead: 0 };
  res.json({ success: true, data: { ...shapeBookResponse(book), progress } });
});

export const updateBook = asyncHandler(async (req, res) => {
  if (req.user?.role !== 'admin') {
    return res
      .status(403)
      .json({ success: false, error: 'Only admins can update books' });
  }

  const { title, author, description, tags, publicationYear, seriesId, part } =
    req.body;
  const book = await Book.findOne({ _id: req.params.id, owner: req.user._id });

  if (!book) {
    return res.status(404).json({ success: false, error: 'Book not found' });
  }

  const updates = {};
  const unsets = {};

  // Clean up legacy data: ensure part is removed if no series is present.
  if (!book.seriesId && book.part !== undefined && book.part !== null) {
    unsets.part = '';
  }

  if (title !== undefined) {
    updates.title = title;
  }
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

  const hasSeriesId = Object.prototype.hasOwnProperty.call(
    req.body,
    'seriesId'
  );
  const hasPart = Object.prototype.hasOwnProperty.call(req.body, 'part');
  let seriesDoc = null;

  if (hasSeriesId) {
    if (seriesId === null || seriesId === undefined || seriesId === '') {
      unsets.seriesId = '';
      unsets.part = '';
    } else {
      if (!mongoose.Types.ObjectId.isValid(seriesId)) {
        return res
          .status(400)
          .json({ success: false, error: 'Invalid seriesId' });
      }
      const seriesRef = await Series.findById(seriesId).select('_id totalParts');
      if (!seriesRef) {
        return res
          .status(400)
          .json({ success: false, error: 'Series not found' });
      }
      updates.seriesId = seriesRef._id;
      seriesDoc = seriesRef;
    }
  }

  if (hasPart) {
    const partValue =
      part === undefined || part === null || part === ''
        ? undefined
        : Number(part);
    if (
      partValue !== undefined &&
      (!Number.isInteger(partValue) || partValue <= 0)
    ) {
      return res
        .status(400)
        .json({ success: false, error: 'part must be a positive integer' });
    }

    const seriesIsBeingRemoved = Object.prototype.hasOwnProperty.call(
      unsets,
      'seriesId'
    );
    const effectiveSeries = seriesIsBeingRemoved
      ? null
      : updates.seriesId ?? book.seriesId;
    if (!effectiveSeries && partValue !== undefined) {
      return res
        .status(400)
        .json({
          success: false,
          error: 'part cannot be set without a seriesId',
        });
    }

    if (partValue !== undefined && effectiveSeries) {
      if (!seriesDoc || String(seriesDoc._id) !== String(effectiveSeries)) {
        seriesDoc = await Series.findById(effectiveSeries).select(
          '_id totalParts'
        );
        if (!seriesDoc) {
          return res
            .status(400)
            .json({ success: false, error: 'Series not found' });
        }
      }
      if (
        typeof seriesDoc.totalParts === 'number' &&
        partValue > seriesDoc.totalParts
      ) {
        return res.status(400).json({
          success: false,
          error: 'part cannot exceed series totalParts',
        });
      }
      const existingPart = await Book.findOne({
        owner: req.user._id,
        seriesId: effectiveSeries,
        part: partValue,
        _id: { $ne: book._id },
      })
        .select('_id')
        .lean();
      if (existingPart) {
        return res.status(400).json({
          success: false,
          error: 'Another book already uses this part in the selected series',
        });
      }
    }

    if (partValue === undefined) {
      unsets.part = '';
    } else {
      updates.part = partValue;
      if (!updates.seriesId && !seriesIsBeingRemoved && book.seriesId) {
        updates.seriesId = book.seriesId;
      }
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

  const updatedBook = await Book.findOneAndUpdate(
    { _id: req.params.id, owner: req.user._id },
    updateDocument,
    { new: true, runValidators: true }
  );

  const populated = updatedBook
    ? await updatedBook.populate({
        path: 'seriesId',
        select: 'name totalParts',
      })
    : book;

  res.json({ success: true, data: shapeBookResponse(populated) });
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
